import User from "../models/User.js";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import { s3 } from "../../libs/s3Client.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

// S3 Delete Object
const s3DeleteObject = async (url) => {
	try {
		// Extract the key from the previous avatarUrl --> delete it from S3.
		const re = new RegExp(/(?<=\.com\/)(.*)/g);
		await s3.send(
			new DeleteObjectCommand({
				Bucket: "wetube-project-clone",
				Key: url.match(re)[0],
			})
		);
	} catch (err) {
		console.log(err);
	}
};

// Controllers
export const getJoin = (req, res) => {
	return res.render("join.ejs", { pageTitle: "Join", errorMsg: null });
};

export const postJoin = async (req, res) => {
	const { name, email, username, password, passwordConfirm, location } =
		req.body;

	const pageTitle = "Join";

	if (password !== passwordConfirm) {
		return res.status(400).render("join", {
			pageTitle,
			errorMsg: "Passwords do not match.",
		});
	}

	const userExists = await User.exists({ $or: [{ email }, { username }] });
	if (userExists) {
		return res.status(400).render("join", {
			pageTitle,
			errorMsg: "This email or username is already taken.",
		});
	}

	try {
		await User.create({
			name,
			email,
			username,
			password,
			location,
		});
		req.flash("info", "Account created successfully");
		return res.redirect("/login");
	} catch (err) {
		return res.status(400).render("join", {
			pageTitle,
			errorMsg: err,
		});
	}
};

export const getLogin = async (req, res) => {
	return res.render("login", { pageTitle: "Log In", errorMsg: null });
};

export const postLogin = async (req, res) => {
	const { username, password } = req.body;
	const pageTitle = "Log In";

	// Find user with password (socialOnly: false).
	const user = await User.findOne({ username, socialOnly: false });

	if (!user) {
		return res.status(400).render("login", {
			pageTitle,
			errorMsg: "Sorry, we don't recognize this username.",
		});
	}

	const isValidLogin = await bcrypt.compare(password, user.password);
	if (!isValidLogin) {
		return res.status(400).render("login", {
			pageTitle,
			errorMsg: "Username and password do not match.",
		});
	}

	// Point of Session Initialization (because of session configs).
	// Log user in (client to server). Now the session has this information.
	req.session.isLoggedIn = true;
	req.session.user = user;

	return res.redirect("/");
};

export const startGitHubLogin = (req, res) => {
	const baseUrl = "https://github.com/login/oauth/authorize";
	const config = {
		client_id: process.env.GITHUB_CLIENT_ID,
		allow_signup: false,
		scope: "read:user user:email",
	};
	const params = new URLSearchParams(config).toString();
	const url = `${baseUrl}?${params}`;
	// Send user to GitHub.
	return res.redirect(url);
};

export const finishGitHubLogin = async (req, res) => {
	const baseUrl = "https://github.com/login/oauth/access_token";
	const config = {
		client_id: process.env.GITHUB_CLIENT_ID,
		client_secret: process.env.GITHUB_CLIENT_SECRET,
		code: req.query.code,
	};
	const params = new URLSearchParams(config).toString();
	const url = `${baseUrl}?${params}`;

	// Exchange code for access token.
	const tokenResponse = await (
		await fetch(url, {
			method: "POST",
			headers: {
				Accept: "application/json",
			},
		})
	).json();

	// Use access token to access user's GitHub data.
	if ("access_token" in tokenResponse) {
		const { access_token } = tokenResponse;
		const apiUrl = "https://api.github.com";

		// Get user data.
		const userData = await (
			await fetch(`${apiUrl}/user`, {
				headers: {
					Authorization: `token ${access_token}`,
				},
			})
		).json();

		// Get user email entries in their GitHub.
		const userEmailsData = await (
			await fetch(`${apiUrl}/user/emails`, {
				headers: {
					Authorization: `token ${access_token}`,
				},
			})
		).json();

		// Find user's email that is primary and verified.
		const emailObj = userEmailsData.find(
			(email) => email.primary === true && email.verified === true
		);

		if (emailObj) {
			// Search for email in DB.
			let user = await User.findOne({ email: emailObj.email });
			// If no user by that email, create account.
			if (!user) {
				user = await User.create({
					name: userData.name,
					username: userData.login,
					email: emailObj.email,
					password: "",
					location: userData.location,
					socialOnly: true,
					avatarUrl: userData.avatar_url,
				});
			}
			// Log the user in.
			req.session.isLoggedIn = true;
			req.session.user = user;
			return res.redirect("/");
		} else {
			req.flash("error", "You have no verified email on GitHub");
			return res.redirect("/login");
		}
	} else {
		req.flash("error", "GitHub login failed");
		return res.redirect("/login");
	}
};

export const logout = (req, res) => {
	req.session.user = null;
	req.session.isLoggedIn = false;
	req.flash("info", "You're logged out");
	return res.redirect("/");
};

export const getEdit = (req, res) => {
	return res.render("edit-profile", {
		pageTitle: "Edit Profile",
		errorMsg: null,
	});
};

export const postEdit = async (req, res) => {
	const {
		body: { name, email, username, location },
		session: {
			user: { _id, avatarUrl },
		},
		file,
	} = req;

	const isHeroku = process.env.NODE_ENV === "production";

	// Find out if a different user already has the username or email.
	const alreadyExists = await User.exists({
		_id: { $ne: { _id } },
		$or: [{ username }, { email }],
	});

	if (alreadyExists) {
		return res.status(400).render("edit-profile", {
			pageTitle: "Edit Profile",
			errorMsg: "This username or email is already taken",
		});
	}

	try {
		// Update DB.
		const updatedContents = {
			avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
			name,
			email,
			username,
			location,
		};

		const userBeforeUpdate = await User.findByIdAndUpdate(
			_id,
			updatedContents,
			{
				new: false,
			}
		);

		// Update S3 - if there is a new file.
		if (file && isHeroku) {
			await s3DeleteObject(userBeforeUpdate.avatarUrl);
		}

		// Update session with updated user info.
		req.session.user = { ...req.session.user, ...updatedContents };
		req.flash("success", "Profile updated");
		return res.redirect("/users/edit");
	} catch (err) {
		return res.status(400).render("edit-profile", {
			pageTitle: "Edit Profile",
			errorMsg: err,
		});
	}
};

export const getChangePassword = (req, res) => {
	if (req.session.user.socialOnly === true) {
		req.flash("error", "You don't have a password registered");
	}
	return res.render("change-password", {
		pageTitle: "Change Password",
		errorMsg: res.locals.loggedInUser.socialOnly
			? "You don't have a password registered."
			: null,
	});
};

export const postChangePassword = async (req, res) => {
	const {
		body: { oldPassword, newPassword, confirmPassword },
		session: {
			user: { _id, password },
		},
	} = req;

	const isAuthorized = await bcrypt.compare(oldPassword, password);
	if (!isAuthorized) {
		return res.status(400).render("change-password", {
			pageTitle: "Change Password",
			errorMsg: "The old password is incorrect.",
		});
	}

	if (newPassword !== confirmPassword) {
		return res.status(400).render("change-password", {
			pageTitle: "Change Password",
			errorMsg: "Passwords do not match.",
		});
	}

	// Update the password.
	const user = await User.findById(_id);
	user.password = newPassword;
	await user.save();

	// Update session with new password hashed.
	req.session.user.password = user.password;

	req.flash("info", "Password changed");
	return res.redirect("/users/logout");
};

export const view = async (req, res) => {
	const { id } = req.params;
	const user = await User.findById(id).populate({
		path: "videos",
		populate: {
			path: "owner",
			model: "User",
		},
		options: {
			sort: {
				createdAt: "desc",
			},
		},
	});

	if (!user) {
		return res.status(404).render("404", { pageTitle: "User not found" });
	}

	return res.render("view-profile", {
		pageTitle: user.name,
		user,
	});
};

export const deleteAccount = (req, res) => res.send("delete account");

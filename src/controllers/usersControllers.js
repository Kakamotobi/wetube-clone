import User from "../models/User.js";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

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

	const user = await User.findOne({ username });

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

	console.log("Session object has been updated!");

	return res.redirect("/");
};

export const logout = (req, res) => res.send("logout");

export const view = (req, res) => res.send("view user");

export const edit = (req, res) => res.send("edit account");

export const deleteAccount = (req, res) => res.send("delete account");

export const startGitHubLogin = (req, res) => {
	const baseUrl = "https://github.com/login/oauth/authorize";
	const config = {
		client_id: process.env.GITHUB_CLIENT_ID,
		allow_signup: false,
		scope: "read:user user:email",
	};
	const params = new URLSearchParams(config).toString();
	const url = `${baseUrl}?${params}`;
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

	// Use access token to access user data.
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

		// Get user email entries in their GitHub
		const userEmailsData = await (
			await fetch(`${apiUrl}/user/emails`, {
				headers: {
					Authorization: `token ${access_token}`,
				},
			})
		).json();
		console.log(userEmailsData);

		// Find user's email that is primary and verified.
		const emailObj = userEmailsData.find(
			(email) => email.primary === true && email.verified === true
		);

		if (emailObj) {
			const existingUser = await User.findOne({ email: emailObj.email });
			// If the email is in the DB (for any OAuth provider), log the user in.
			if (existingUser) {
				req.session.isLoggedIn = true;
				req.session.user = existingUser;
				return res.redirect("/");
			} else {
				// If no user by that email, create account.
				const user = await User.create({
					name: userData.name,
					username: userData.login,
					email: emailObj.email,
					password: "",
					socialOnly: true,
					location: userData.location,
				});
				req.session.isLoggedIn = true;
				req.session.user = user;
				return res.redirect("/");
			}
		} else {
			return res.redirect("/login");
		}
	} else {
		return res.redirect("/login");
	}
};

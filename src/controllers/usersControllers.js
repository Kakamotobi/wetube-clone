import User from "../models/User.js";
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

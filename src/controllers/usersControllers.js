import User from "../models/User.js";

export const getJoin = (req, res) => {
	return res.render("join.ejs", { pageTitle: "Join", errorMsg: "" });
};

export const postJoin = async (req, res) => {
	const { name, email, username, password, passwordConfirm, location } =
		req.body;
	const pageTitle = "Join";

	if (password !== passwordConfirm) {
		return res.render("join", {
			pageTitle,
			errorMsg: "Passwords do not match.",
		});
	}

	const userExists = await User.exists({ $or: [{ email }, { username }] });
	if (userExists) {
		return res.render("join", {
			pageTitle,
			errorMsg: "This email or username is already taken.",
		});
	}

	await User.create({
		name,
		email,
		username,
		password,
		location,
	});
	return res.redirect("/login");
};

export const login = (req, res) => {
	return res.send("login");
};

export const logout = (req, res) => res.send("logout");

export const view = (req, res) => res.send("view user");

export const edit = (req, res) => res.send("edit account");

export const deleteAccount = (req, res) => res.send("delete account");

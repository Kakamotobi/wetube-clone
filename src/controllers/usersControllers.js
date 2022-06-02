import User from "../models/User.js";

export const getJoin = (req, res) => {
	return res.render("join.ejs", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
	const { name, email, username, password, location } = req.body;
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
  return res.send("login")
};

export const logout = (req, res) => res.send("logout");

export const view = (req, res) => res.send("view user");

export const edit = (req, res) => res.send("edit account");

export const deleteAccount = (req, res) => res.send("delete account");

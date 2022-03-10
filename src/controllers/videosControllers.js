import Video from "../models/Video.js";

export const home = async (req, res) => {
	const videos = await Video.find({});
	return res.render("home.ejs", { pageTitle: "Home", videos });
};

export const watch = (req, res) => {
	const { id } = req.params;
	return res.render("watch.ejs", { pageTitle: `Watching` });
};

export const getEdit = (req, res) => {
	const { id } = req.params;
	return res.render("edit.ejs", { pageTitle: `Editing` });
};

export const postEdit = (req, res) => {
	const { id } = req.params;
	const { title } = req.body;
	return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
	return res.render("upload.ejs", { pageTitle: "Upload Video" });
};

export const postUpload = (req, res) => {
	const { title } = req.body;
	return res.redirect("/");
};

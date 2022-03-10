import Video from "../models/Video.js";

export const home = async (req, res) => {
	const videos = await Video.find({});
	return res.render("home.ejs", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
	const { id } = req.params;
	const video = await Video.findById(id);
	return res.render("watch.ejs", { pageTitle: video.title, video });
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
	return res.render("upload.ejs", { pageTitle: "Upload Video", errMsg: null });
};

export const postUpload = async (req, res) => {
	const { title, description, hashtags } = req.body;
	try {
		await Video.create({
			title,
			description,
			hashtags: hashtags.split(",").map((tag) => `#${tag}`),
		});
		return res.redirect("/");
	} catch (err) {
		console.log(err);
		return res.render("upload.ejs", {
			pageTitle: "Upload Video",
			errMsg: err._message,
		});
	}
};

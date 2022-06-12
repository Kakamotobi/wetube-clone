import Video from "../models/Video.js";

export const home = async (req, res) => {
	const videos = await Video.find({}).sort({ createdAt: "desc" });
	return res.render("home.ejs", { pageTitle: "Home", videos });
};

export const search = async (req, res) => {
	const { keyword } = req.query;
	let videos = [];
	if (keyword) {
		videos = await Video.find({
			title: {
				$regex: new RegExp(keyword, "i"),
			},
		});
	}
	return res.render("search.ejs", { pageTitle: "Search", videos });
};

export const watch = async (req, res) => {
	const { id } = req.params;
	const video = await Video.findById(id);
	if (!video) {
		return res.status(404).render("404.ejs", { pageTitle: "Video not found" });
	}
	return res.render("watch.ejs", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
	const { id } = req.params;
	const video = await Video.findById(id);
	if (!video) {
		return res.status(404).render("404.ejs", { pageTitle: "Video not found" });
	}
	return res.render("edit-video.ejs", {
		pageTitle: `Edit: ${video.title}`,
		video,
	});
};

export const postEdit = async (req, res) => {
	const { id } = req.params;
	const { title, description, hashtags } = req.body;
	const videoExists = await Video.exists({ _id: id });
	if (!videoExists) {
		return res.status(404).render("404.ejs", { pageTitle: "Video not found" });
	}
	await Video.findByIdAndUpdate(id, {
		title,
		description,
		hashtags: Video.formatHashtags(hashtags),
	});
	return res.redirect(`/videos/${id}`);
};

export const deleteVideo = async (req, res) => {
	const { id } = req.params;
	await Video.findByIdAndDelete(id);
	return res.redirect("/");
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
			hashtags: Video.formatHashtags(hashtags),
		});
		return res.redirect("/");
	} catch (err) {
		console.log(err);
		return res.status(400).render("upload.ejs", {
			pageTitle: "Upload Video",
			errMsg: err._message,
		});
	}
};

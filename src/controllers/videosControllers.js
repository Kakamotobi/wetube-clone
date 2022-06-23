import Video from "../models/Video.js";
import User from "../models/User.js";

export const home = async (req, res) => {
	const videos = await Video.find({})
		.sort({ createdAt: "desc" })
		.populate("owner");
	return res.render("home", { pageTitle: "Home", videos });
};

export const search = async (req, res) => {
	const { keyword } = req.query;
	let videos = [];
	if (keyword) {
		videos = await Video.find({
			title: {
				$regex: new RegExp(keyword, "i"),
			},
		}).populate("owner");
	}
	return res.render("search", { pageTitle: "Search", videos });
};

export const watch = async (req, res) => {
	const { id } = req.params;
	// populate("owner") fills the "owner" property on the video object
	// with the actual user, since the User model was referenced.
	const video = await Video.findById(id).populate("owner");
	if (!video) {
		return res.status(404).render("404", { pageTitle: "Video not found" });
	}
	return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
	const {
		params: { id: videoId },
		session: {
			user: { _id: userId },
		},
	} = req;
	const video = await Video.findById(videoId);
	if (!video) {
		return res.status(404).render("404", { pageTitle: "Video not found" });
	}
	// Only allow owner of video to see edit page.
	if (String(video.owner) !== String(userId)) {
		return res.status(403).redirect("/");
	}
	return res.render("edit-video", {
		pageTitle: `Edit: ${video.title}`,
		video,
	});
};

export const postEdit = async (req, res) => {
	const {
		params: { id: videoId },
		body: { title, description, hashtags },
		session: {
			user: { _id: userId },
		},
	} = req;
	const video = await Video.findById(videoId);
	if (!video) {
		return res.status(404).render("404", { pageTitle: "Video not found" });
	}
	// Only allow owner of video to edit video.
	if (String(video.owner) !== String(userId)) {
		return res.status(403).redirect("/");
	}
	await Video.findByIdAndUpdate(videoId, {
		title,
		description,
		hashtags: Video.formatHashtags(hashtags),
	});
	return res.redirect(`/videos/${videoId}`);
};

export const deleteVideo = async (req, res) => {
	const {
		params: { id: videoId },
		session: {
			user: { _id: userId },
		},
	} = req;
	const video = await Video.findById(videoId);
	if (!video) {
		return res.status(404).render("404", { pageTitle: "Video not found" });
	}
	// Only allow owner of video to delete video.
	if (String(video.owner) !== String(userId)) {
		return res.status(403).redirect("/");
	}
	await Video.findByIdAndDelete(videoId);
	return res.redirect("/");
};

export const getUpload = (req, res) => {
	return res.render("upload-video", {
		pageTitle: "Upload Video",
		errMsg: null,
	});
};

export const postUpload = async (req, res) => {
	const {
		body: { title, description, hashtags },
		files: { video, thumbnail },
		session: {
			user: { _id: userId },
		},
	} = req;

	try {
		const newVideo = await Video.create({
			fileUrl: video[0].path,
			thumbnailUrl: thumbnail[0].path,
			title,
			description,
			hashtags: Video.formatHashtags(hashtags),
			owner: userId,
		});

		// Record video ID in User.
		const user = await User.findById(userId);
		user.videos.push(newVideo._id);
		await user.save();

		return res.redirect("/");
	} catch (err) {
		return res.status(400).render("upload-video", {
			pageTitle: "Upload Video",
			errMsg: err._message,
		});
	}
};

export const registerView = async (req, res) => {
	const { id } = req.params;
	const video = await Video.findById(id);
	if (video) {
		video.meta.views++;
		await video.save();
		return res.sendStatus(200);
	}
	return res.sendStatus(404);
};

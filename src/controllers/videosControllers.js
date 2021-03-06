import Video from "../models/Video.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { s3 } from "../../libs/s3Client.js";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

// S3 Delete Objects
const s3DeleteObjects = async (urls) => {
	try {
		// Extract the key from the previous url --> delete it from S3.
		const objects = [];
		const re = new RegExp(/(?<=\.com\/)(.*)/g);
		for (let url of urls) {
			const parsedKey = url.match(re)[0].replace(/\%2F/g, "/");
			objects.push({ Key: parsedKey });
		}

		await s3.send(
			new DeleteObjectsCommand({
				Bucket: "wetube-project-clone",
				Delete: {
					Objects: objects,
				},
			})
		);
	} catch (err) {
		console.log(err);
	}
};

// Controllers
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
	const video = await Video.findById(id).populate("owner").populate("comments");
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
		req.flash("error", "This is not your video");
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
		req.flash("error", "This is not your video");
		return res.status(403).redirect("/");
	}
	await Video.findByIdAndUpdate(videoId, {
		title,
		description,
		hashtags: Video.formatHashtags(hashtags),
	});
	req.flash("success", "Video updated");
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
		req.flash("error", "This is not your video");
		return res.status(403).redirect("/");
	}
	const isHeroku = process.env.NODE_ENV === "production";
	// Delete video and thumbnail from S3.
	if (isHeroku) {
		await s3DeleteObjects([video.fileUrl, video.thumbnailUrl]);
	}

	// Delete from DB.
	await Video.findByIdAndDelete(videoId);

	req.flash("success", "Video deleted");
	return res.status(200).redirect("/");
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

	const isHeroku = process.env.NODE_ENV === "production";

	try {
		const newVideo = await Video.create({
			fileUrl: isHeroku ? video[0].location : video[0].path,
			thumbnailUrl: isHeroku ? thumbnail[0].location : thumbnail[0].path,
			title,
			description,
			hashtags: Video.formatHashtags(hashtags),
			owner: userId,
		});

		// Record video ID in User.
		const user = await User.findById(userId);
		user.videos.push(newVideo._id);
		await user.save();
		req.flash("success", "Video uploaded");
		return res.status(200).redirect("/");
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

export const createComment = async (req, res) => {
	const {
		params: { id: videoId },
		body: { text },
		session: {
			user: { _id: userId },
		},
	} = req;

	const video = await Video.findById(videoId);
	if (!video) return res.sendStatus(404);

	// Create comment
	const comment = await Comment.create({
		text,
		owner: userId,
		video: videoId,
	});

	// Save comment to the list of video comments.
	video.comments.push(comment._id);
	video.save();
	return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
	const {
		params: { videoId, commentId },
		session: {
			user: { _id: userId },
		},
	} = req;

	const comment = await Comment.findById(commentId);
	// If the comment does not belong to the user.
	if (String(comment.owner) !== String(userId)) {
		return res.sendStatus(404);
	}
	// Delete comment.
	await Comment.findByIdAndDelete(commentId);

	// Delete comment from the video.
	const video = await Video.findById(String(videoId));
	const idx = video.comments.indexOf(commentId);
	video.comments.splice(idx, 1);
	video.save();
	return res.sendStatus(200);
};

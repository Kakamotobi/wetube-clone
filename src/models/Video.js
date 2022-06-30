import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
	fileUrl: { type: String, required: true },
	thumbnailUrl: { type: String, required: true },
	title: { type: String, trim: true, maxLength: 80, required: true },
	description: { type: String, trim: true, minLength: 5, required: true },
	createdAt: { type: Date, default: Date.now, required: true },
	hashtags: [{ type: String, trim: true }],
	meta: {
		views: { type: Number, default: 0, required: true },
		rating: { type: Number, default: 0, required: true },
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

videoSchema.static("formatHashtags", function (hashtags) {
	return hashtags
		.split(",")
		.map((tag) => (tag.startsWith("#") ? tag.trim() : `#${tag.trim()}`));
});

const Video = mongoose.model("Video", videoSchema);

export default Video;

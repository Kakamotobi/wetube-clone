import express from "express";
import { protectorMiddleware, videoUploadMiddleware } from "../middlewares.js";
import {
	watch,
	getEdit,
	postEdit,
	deleteVideo,
	getUpload,
	postUpload,
} from "../controllers/videosControllers.js";

const videosRouter = express.Router();

videosRouter.get("/:id([0-9a-f]{24})", watch);
videosRouter
	.route("/:id([0-9a-f]{24})/edit")
	.all(protectorMiddleware)
	.get(getEdit)
	.post(postEdit);
videosRouter
	.route("/:id([0-9a-f]{24})/delete")
	.all(protectorMiddleware)
	.get(deleteVideo);
videosRouter
	.route("/upload")
	.all(protectorMiddleware)
	.get(getUpload)
	.post(videoUploadMiddleware.single("video"), postUpload);

export default videosRouter;

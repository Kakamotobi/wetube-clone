import express from "express";
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
videosRouter.route("/:id([0-9a-f]{24})/edit").get(getEdit).post(postEdit);
videosRouter.route("/:id([0-9a-f]{24})/delete").get(deleteVideo);
videosRouter.route("/upload").get(getUpload).post(postUpload);

export default videosRouter;

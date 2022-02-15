import express from "express";
import {
	upload,
	watch,
	edit,
	deleteVideo,
} from "../controllers/videosControllers.js";

const videosRouter = express.Router();

videosRouter.get("/upload", upload);
videosRouter.get("/:id(\\d+)", watch);
videosRouter.get("/:id(\\d+)/edit", edit);
videosRouter.get("/:id(\\d+)/delete", deleteVideo);

export default videosRouter;

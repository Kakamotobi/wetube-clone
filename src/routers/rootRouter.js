import express from "express";
import { publicOnlyMiddleware } from "../middlewares.js";
import { home, search } from "../controllers/videosControllers.js";
import {
	getJoin,
	postJoin,
	getLogin,
	postLogin,
} from "../controllers/usersControllers.js";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);
rootRouter
	.route("/login")
	.all(publicOnlyMiddleware)
	.get(getLogin)
	.post(postLogin);
rootRouter.get("/search", search);

export default rootRouter;

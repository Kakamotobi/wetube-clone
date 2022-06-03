import express from "express";
import { home, search } from "../controllers/videosControllers.js";
import {
	getJoin,
	postJoin,
	getLogin,
	postLogin,
} from "../controllers/usersControllers.js";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").get(getJoin).post(postJoin);
rootRouter.route("/login").get(getLogin).post(postLogin);
rootRouter.get("/search", search);

export default rootRouter;

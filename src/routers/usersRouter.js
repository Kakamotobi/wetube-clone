import express from "express";
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares.js";
import {
	logout,
	view,
	getEdit,
	postEdit,
	deleteAccount,
	startGitHubLogin,
	finishGitHubLogin,
	getChangePassword,
	postChangePassword,
} from "../controllers/usersControllers.js";

const usersRouter = express.Router();

usersRouter.get("/github/start", publicOnlyMiddleware, startGitHubLogin);
usersRouter.get("/github/finish", publicOnlyMiddleware, finishGitHubLogin);
usersRouter.get("/logout", protectorMiddleware, logout);
usersRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
usersRouter
	.route("/change-password")
	.all(protectorMiddleware)
	.get(getChangePassword)
	.post(postChangePassword);
usersRouter.get("/:id", view);
usersRouter.get("/:id/delete", deleteAccount);

export default usersRouter;

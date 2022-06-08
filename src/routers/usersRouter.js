import express from "express";
import {
	logout,
	view,
	edit,
	deleteAccount,
	startGitHubLogin,
	finishGitHubLogin,
} from "../controllers/usersControllers.js";

const usersRouter = express.Router();

usersRouter.get("/logout", logout);
usersRouter.get("/github/start", startGitHubLogin);
usersRouter.get("/github/finish", finishGitHubLogin);
usersRouter.get("/:id", view);
usersRouter.get("/:id/edit", edit);
usersRouter.get("/:id/delete", deleteAccount);

export default usersRouter;

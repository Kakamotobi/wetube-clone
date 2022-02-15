import express from "express";
import {
	logout,
	view,
	edit,
	deleteAccount,
} from "../controllers/usersControllers.js";

const usersRouter = express.Router();

usersRouter.get("/logout", logout);
usersRouter.get("/:id", view);
usersRouter.get("/:id/edit", edit);
usersRouter.get("/:id/delete", deleteAccount);

export default usersRouter;

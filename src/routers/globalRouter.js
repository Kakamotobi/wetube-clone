import express from "express";
import { home } from "../controllers/videosControllers.js";
import { join, login } from "../controllers/usersControllers.js";

const globalRouter = express.Router();

globalRouter.get("/", home);
globalRouter.get("/join", join);
globalRouter.get("/login", login);

export default globalRouter;

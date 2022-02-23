import express from "express";
import { trending } from "../controllers/videosControllers.js";
import { join, login } from "../controllers/usersControllers.js";

const globalRouter = express.Router();

globalRouter.get("/", trending);
globalRouter.get("/join", join);
globalRouter.get("/login", login);

export default globalRouter;

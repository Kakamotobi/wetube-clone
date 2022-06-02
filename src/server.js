import express from "express";
import ejsMate from "ejs-mate";
import path from "path";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter.js";
import usersRouter from "./routers/usersRouter.js";
import videosRouter from "./routers/videosRouter.js";

const app = express();

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));

app.use("/", rootRouter);
app.use("/users", usersRouter);
app.use("/videos", videosRouter);

export default app;

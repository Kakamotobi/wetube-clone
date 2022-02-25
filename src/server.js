import express from "express";
import ejsMate from "ejs-mate";
import path from "path";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter.js";
import usersRouter from "./routers/usersRouter.js";
import videosRouter from "./routers/videosRouter.js";

const PORT = 4000;

const app = express();

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));

app.use("/", globalRouter);
app.use("/users", usersRouter);
app.use("/videos", videosRouter);

// Port
const handleListening = (req, res) => {
	console.log(`Server Listening on http://localhost:${PORT}`);
};
app.listen(PORT, handleListening);
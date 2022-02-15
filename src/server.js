import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter.js";
import usersRouter from "./routers/usersRouter.js";
import videosRouter from "./routers/videosRouter.js";

const PORT = 4000;

const app = express();

app.use(morgan("dev"));

app.use("/", globalRouter);
app.use("/users", usersRouter);
app.use("/videos", videosRouter);

// Port
const handleListening = (req, res) => {
	console.log(`Server Listening on http://localhost:${PORT}`);
};
app.listen(PORT, handleListening);

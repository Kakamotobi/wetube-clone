import express from "express";
import ejsMate from "ejs-mate";
import path from "path";
import session from "express-session";
import MongoStore from "connect-mongo";

import morgan from "morgan";

import { localsMiddleware } from "./middlewares.js";
import rootRouter from "./routers/rootRouter.js";
import usersRouter from "./routers/usersRouter.js";
import videosRouter from "./routers/videosRouter.js";

const app = express();

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));

// Create session, put session ID in cookie.
app.use(
	session({
		secret: process.env.COOKIE_SECRET,
		resave: false,
		saveUninitialized: false, // only issue cookie if Session is modified (log in).
		store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
	})
);

app.use(localsMiddleware);

app.use("/", rootRouter);
app.use("/users", usersRouter);
app.use("/videos", videosRouter);

export default app;

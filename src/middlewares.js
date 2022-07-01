import session from "express-session";
import MongoStore from "connect-mongo";
import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../libs/s3Client.js";

const isHeroku = process.env.NODE_ENV === "production";

const multerS3ImageUploader = multerS3({
	s3: s3,
	bucket: "wetube-project-clone",
	acl: "public-read",
	key: function (req, file, cb) {
		cb(null, "images/" + loggedInUser.username + "_" + file.originalname);
	},
});

const multerS3VideoUploader = multerS3({
	s3: s3,
	bucket: "wetube-project-clone",
	acl: "public-read",
	key: function (req, file, cb) {
		cb(null, "videos/" + file.originalname);
	},
});

// Create session, put session ID in cookie.
export const sessionMiddleware = session({
	secret: process.env.COOKIE_SECRET,
	resave: false,
	saveUninitialized: false, // only issue cookie if Session is modified (log in).
	store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
});

// Sync locals (on res object) with session (on req object).
export const localsMiddleware = (req, res, next) => {
	res.locals.siteName = "Wetube";
	res.locals.isLoggedIn = !!req.session.isLoggedIn;
	res.locals.loggedInUser = req.session.user ?? {};
	res.locals.isHeroku = isHeroku;
	next();
};

export const protectorMiddleware = (req, res, next) => {
	if (req.session.isLoggedIn) next();
	else {
		req.flash("error", "You are not logged in.");
		return res.redirect("/login");
	}
};

export const publicOnlyMiddleware = (req, res, next) => {
	if (!req.session.isLoggedIn) next();
	else {
		req.flash("error", "Not authorized");
		return res.redirect("/");
	}
};

export const avatarUploadMiddleware = multer({
	storage: isHeroku && multerS3ImageUploader,
	dest: "uploads/avatars/",
	limits: {
		fileSize: 3000000,
	},
});

export const videoUploadMiddleware = multer({
	storage: isHeroku && multerS3VideoUploader,
	dest: "uploads/videos/",
	limits: {
		fileSize: 50000000,
	},
});

export const ffmpegMiddleware = (req, res, next) => {
	res.set({
		"Cross-Origin-Embedder-Policy": "require-corp",
		"Cross-Origin-Opener-Policy": "same-origin",
	});
	next();
};

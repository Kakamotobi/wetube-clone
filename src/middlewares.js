import session from "express-session";
import MongoStore from "connect-mongo";
import multer from "multer";
import multerS3 from "multer-s3";
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
	region: process.env.AWS_S3_REGION,
});

const multerS3Uploader = multerS3({
	s3: s3,
	bucket: "wetube-project-clone",
	acl: "public-read",
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
	storage: multerS3Uploader,
	dest: "uploads/avatars/",
	limits: {
		fileSize: 3000000,
	},
});

export const videoUploadMiddleware = multer({
	storage: multerS3Uploader,
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

import session from "express-session";
import MongoStore from "connect-mongo";
import multer from "multer";

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
	dest: "uploads/avatars/",
	limits: {
		fileSize: 3000000,
	},
});

export const videoUploadMiddleware = multer({
	dest: "uploads/videos/",
	limits: {
		fileSize: 30000000,
	},
});

export const ffmpegMiddleware = (req, res, next) => {
	res.set({
		"Cross-Origin-Embedder-Policy": "require-corp",
		"Cross-Origin-Opener-Policy": "same-origin",
	});
	next();
};

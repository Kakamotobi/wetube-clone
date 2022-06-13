import multer from "multer";

export const localsMiddleware = (req, res, next) => {
	// Sync locals (on res object) with session (on req object).
	res.locals.siteName = "Wetube";
	res.locals.isLoggedIn = !!req.session.isLoggedIn;
	res.locals.loggedInUser = req.session.user ?? {};

	next();
};

export const protectorMiddleware = (req, res, next) => {
	if (req.session.isLoggedIn) next();
	else res.redirect("/login");
};

export const publicOnlyMiddleware = (req, res, next) => {
	if (!req.session.isLoggedIn) next();
	else res.redirect("/");
};

export const uploadFilesMiddleware = multer({ dest: "uploads/" });

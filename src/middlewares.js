export const localsMiddleware = (req, res, next) => {
	// Sync locals (on res object) with session (on req object).
	res.locals.siteName = "Wetube";
	res.locals.isLoggedIn = !!req.session.isLoggedIn;
	res.locals.loggedInUser = req.session.user;

	next();
};

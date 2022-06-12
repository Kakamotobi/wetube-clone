export const localsMiddleware = (req, res, next) => {
	// Sync locals (on res object) with session (on req object).
	res.locals.siteName = "Wetube";
	res.locals.isLoggedIn = !!req.session.isLoggedIn;
	res.locals.loggedInUser = req.session.user ?? {};

	console.log(res.locals.loggedInUser.socialOnly);

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

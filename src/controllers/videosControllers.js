export const trending = (req, res) => {
	const trendingVideos = [
		{
			title: "First Video",
			rating: 5,
			comments: 2,
			createdAt: "2 minutes ago",
			views: 59,
			id: 1,
		},
		{
			title: "Second Video",
			rating: 3,
			comments: 6,
			createdAt: "10 minutes ago",
			views: 88,
			id: 2,
		},
		{
			title: "Third Video",
			rating: 4.5,
			comments: 12,
			createdAt: "57 minutes ago",
			views: 115,
			id: 3,
		},
	];
	return res.render("home.ejs", { pageTitle: "Home", trendingVideos });
};
export const search = (req, res) => res.send("search");
export const upload = (req, res) => res.send("upload video");
export const watch = (req, res) =>
	res.render("watch.ejs", { pageTitle: "Watch Video" });
export const edit = (req, res) =>
	res.render("edit.ejs", { pageTitle: "Edit Video" });
export const deleteVideo = (req, res) => res.send("delete video");

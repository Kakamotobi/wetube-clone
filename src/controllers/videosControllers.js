let trendingVideos = [
	{
		title: "First Video!!!",
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
		views: 116,
		id: 2,
	},
	{
		title: "Third Video",
		rating: 4.5,
		comments: 12,
		createdAt: "57 minutes ago",
		views: 1,
		id: 3,
	},
];

export const trending = (req, res) => {
	return res.render("home.ejs", { pageTitle: "Home", trendingVideos });
};
export const watch = (req, res) => {
	const { id } = req.params;
	let video;
	for (let vid of trendingVideos) {
		if (vid.id == id) video = vid;
	}
	return res.render("watch.ejs", { pageTitle: video.title, video });
};
export const getEdit = (req, res) => {
	const { id } = req.params;
	let video;
	for (let vid of trendingVideos) {
		if (vid.id == id) video = vid;
	}
	return res.render("edit.ejs", { pageTitle: `Edit ${video.title}`, video });
};
export const postEdit = (req, res) => {
	const { id } = req.params;
	const { title } = req.body;
	let video;
	for (let vid of trendingVideos) {
		if (vid.id == id) video = vid;
	}
	video.title = title;
	return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
	return res.render("upload.ejs", { pageTitle: "Upload Video" });
};
export const postUpload = (req, res) => {
	const { title } = req.body;
	const newVideo = {
		title,
		rating: 0,
		comments: 0,
		createdAt: "just now",
		views: 0,
		id: trendingVideos.length + 1,
	};
	trendingVideos.push(newVideo);
	return res.redirect("/");
};

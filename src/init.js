import "regenerator-runtime";
import "dotenv/config.js";
import "./db.js";
import "./models/Video.js";
import "./models/User.js";
import "./models/Comment.js";
import app from "./server.js";

const PORT = process.env.PORT || 4000; // heroku port or localhost port

const handleListening = (req, res) => {
	console.log(`Server Listening on http://localhost:${PORT}`);
};
app.listen(PORT, handleListening);

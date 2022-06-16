import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	username: { type: String, required: true, unique: true },
	password: String,
	location: String,
	socialOnly: { type: Boolean, default: false },
	avatarUrl: { type: String, default: "uploads/avatars/default-avatar.png" },
	videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

userSchema.pre("save", async function () {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 5);
	}
});

const User = mongoose.model("User", userSchema);

export default User;

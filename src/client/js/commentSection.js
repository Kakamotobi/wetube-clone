const videoContainer = document.getElementById("video-container");
const form = document.getElementById("comment-form");
const comments = document.querySelectorAll(".video__comment");

const addPlaceholderComment = (text, commentId) => {
	const comments = document.querySelector(".video__comments ul");
	const newComment = document.createElement("li");
	newComment.className = "video__comment";
	newComment.dataset.commentId = commentId;
	const commentIcon = document.createElement("i");
	commentIcon.className = "fas fa-comment";
	const span = document.createElement("span");
	span.innerText = text;
	const deleteIcon = document.createElement("i");
	deleteIcon.className = "fas fa-trash video__comment-delete";
	newComment.appendChild(commentIcon);
	newComment.appendChild(span);
	newComment.appendChild(deleteIcon);
	newComment.addEventListener("click", handleDelete);
	comments.prepend(newComment);
};

// Submit Comment Handler
const handleSubmit = async (evt) => {
	evt.preventDefault();
	const textarea = form.querySelector("textarea");
	const text = textarea.value.trim();
	const videoId = videoContainer.dataset.videoId;

	if (text === "") return;

	const res = await fetch(`/api/videos/${videoId}/comment`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ text }),
	});

	// Placeholder comment for real-time effect.
	if (res.status === 201) {
		textarea.value = "";
		const { newCommentId } = await res.json();
		addPlaceholderComment(text, newCommentId);
	}
};

// Delete Comment Handler
const handleDelete = async (evt) => {
	if (evt.target.classList.contains("video__comment-delete")) {
		const videoId = videoContainer.dataset.videoId;
		const comment = evt.target.parentElement;
		const commentId = comment.dataset.commentId;
		// Send comment delete request.
		await fetch(`/api/videos/${videoId}/comment/${commentId}/delete`, {
			method: "DELETE",
		});
		// Delete placeholder comment from view
		comment.remove();
	}
};

// Event Listeners
form?.addEventListener("submit", handleSubmit);
for (let comment of comments) {
	comment.addEventListener("click", handleDelete);
}

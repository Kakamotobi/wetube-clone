const videoContainer = document.getElementById("video-container");
const video = document.querySelector("video");
const videoControls = document.getElementById("video-controls");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const currentTime = document.getElementById("current-time");
const totalTime = document.getElementById("total-time");
const volumeRange = document.getElementById("volume");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("full-screen");
const fullScreenBtnIcon = fullScreenBtn.querySelector("i");

// Globals
let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 1;

// Helpers
const formatTime = (seconds) => {
	const time = new Date(seconds * 1000).toISOString().substring(11, 19);
	return time.replace(/^0+\:0|^0+\:|^0/, "");
};

// Event Callbacks
// Video
const handleLoadedMetaData = () => {
	totalTime.innerText = formatTime(Math.floor(video.duration));
	timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
	currentTime.innerText = formatTime(Math.floor(video.currentTime));
	timeline.value = Math.floor(video.currentTime);
};

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
	if (controlsTimeout) {
		clearTimeout(controlsTimeout);
		controlsTimeout = null;
	}
	// Remove previous setTimeout.
	if (controlsMovementTimeout) {
		clearTimeout(controlsMovementTimeout);
		controlsMovementTimeout = null;
	}
	videoControls.classList.add("showing");
	controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
	controlsTimeout = setTimeout(hideControls, 3000);
};

const handleEnded = (evt) => {
	const { videoId } = videoContainer.dataset;

	fetch(`/api/videos/${videoId}/views`, { method: "POST" });
};

// Play Button
const handlePlay = (evt) => {
	if (video.paused === true) video.play();
	else video.pause();

	playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

// Mute Button
const handleMuteClick = (evt) => {
	if (video.muted === true) video.muted = false;
	else video.muted = true;

	muteBtnIcon.classList = video.muted
		? "fas fa-volume-mute"
		: "fas fa-volume-up";
	volumeRange.value = video.muted ? 0 : volumeValue;
};

// Volume Range
const handleVolumeChange = (evt) => {
	const {
		target: { value },
	} = evt;

	if (video.muted === true) {
		video.muted = false;
		muteBtnIcon.classList = "fas fa-volume-up";
	}

	if (Number(value) === 0) {
		video.muted = true;
		muteBtnIcon.classList = "fas fa-volume-mute";
	}

	volumeValue = value;
	video.volume = value;
};

// Full Screen Button
const handleFullScreen = () => {
	const fullScreenEl = document.fullscreenElement;
	if (fullScreenEl) {
		document.exitFullscreen();
		fullScreenBtnIcon.classList = "fas fa-expand";
	} else {
		videoContainer.requestFullscreen();
		fullScreenBtnIcon.classList = "fas fa-compress";
	}
};

// Timeline
const handleTimelineChange = (evt) => {
	const {
		target: { value },
	} = evt;

	video.currentTime = value;
};

document.addEventListener("keydown", (evt) => {
	if (evt.target.id === "comment-textarea") return;
	if (evt.code === "Space") handlePlay();
});
video.addEventListener("loadedmetadata", handleLoadedMetaData);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("click", handlePlay);
video.addEventListener("ended", handleEnded);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
timeline.addEventListener("input", handleTimelineChange);

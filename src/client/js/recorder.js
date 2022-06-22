const startBtn = document.getElementById("start-btn");
const video = document.getElementById("preview");

// Globals
let stream = null;
let recorder = null;
let videoFile = null;

const askPermission = async () => {
	try {
		stream = await navigator.mediaDevices.getUserMedia({
			audio: false,
			video: true,
		});
		video.srcObject = stream;
		video.play(); // live-stream
	} catch (err) {
		console.log(err);
	}
};

askPermission();

const handleStartRecording = () => {
	startBtn.innerText = "Stop Recording";
	startBtn.removeEventListener("click", handleStartRecording);
	startBtn.addEventListener("click", handleStopRecording);

	// Create new record.
	recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
	recorder.ondataavailable = (evt) => {
		videoFile = URL.createObjectURL(evt.data);
		// Replace live stream with recorded file.
		video.srcObject = null;
		video.src = videoFile;
		video.loop = true;
		video.play();
	};

	recorder.start();
};

const handleStopRecording = () => {
	startBtn.innerText = "Download Recording";
	startBtn.removeEventListener("click", handleStopRecording);
	startBtn.addEventListener("click", handleDownloadRecording);

	recorder.stop();
};

const handleDownloadRecording = () => {
	startBtn.innerText = "Start Recording";
	startBtn.removeEventListener("click", handleDownloadRecording);
	startBtn.addEventListener("click", handleStartRecording);

	// Download recorded video.
	const a = document.createElement("a");
	a.href = videoFile;
	a.download = "MyRecording.webm";
	document.body.appendChild(a);
	a.click();
};

startBtn.addEventListener("click", handleStartRecording);

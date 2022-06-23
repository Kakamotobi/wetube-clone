import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

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
		// evt.data: blob of the video.
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

const handleDownloadRecording = async () => {
	const ffmpeg = createFFmpeg({
		corePath: "/ffmpeg/ffmpeg-core.js",
		log: true,
	});
	await ffmpeg.load();
	ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile));
	// Convert webm to mp4.
	await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4");
	// Uint8Array represents the video file.
	const mp4File = ffmpeg.FS("readFile", "output.mp4");
	// ArrayBuffer represents the binary data of the video file.
	const mp4Blob = new Blob([mp4File.buffer], { type: "/video/mp4" });
	// Create way to access the video in the browser.
	const mp4Url = URL.createObjectURL(mp4Blob);

	// Download recorded video.
	const a = document.createElement("a");
	a.href = mp4Url;
	a.download = "MyRecording.mp4";
	document.body.appendChild(a);
	a.click();

	startBtn.innerText = "Start Recording";
	startBtn.removeEventListener("click", handleDownloadRecording);
	startBtn.addEventListener("click", handleStartRecording);
};

startBtn.addEventListener("click", handleStartRecording);

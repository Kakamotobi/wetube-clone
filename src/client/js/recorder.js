import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("action-btn");
const video = document.getElementById("preview");

// Globals
let stream = null;
let recorder = null;
let videoFile = null;

const files = {
	input: "recording.webm",
	output: "output.mp4",
	thumbnail: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
	const a = document.createElement("a");
	a.href = fileUrl;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
};

const init = async () => {
	try {
		stream = await navigator.mediaDevices.getUserMedia({
			audio: false,
			video: {
				width: 1024,
				height: 576,
			},
		});
		video.srcObject = stream;
		video.play(); // start live-stream
	} catch (err) {
		console.log(err);
	}
};

init();

const handleStartRecording = () => {
	actionBtn.innerText = "Stop Recording";
	actionBtn.disabled = true;
	actionBtn.removeEventListener("click", handleStartRecording);

	// Create new record.
	recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
	// When done recording.
	recorder.ondataavailable = (evt) => {
		// evt.data: blob of the video.
		videoFile = URL.createObjectURL(evt.data);
		// Replace live stream with recorded file.
		video.srcObject = null;
		video.src = videoFile;
		video.loop = true;
		video.play();

		actionBtn.innerText = "Download Recording";
		actionBtn.disabled = false;
		actionBtn.addEventListener("click", handleDownloadRecording);
	};

	recorder.start();
	setTimeout(() => {
		recorder.stop();
	}, 5000);
};

const handleDownloadRecording = async () => {
	actionBtn.innerText = "Transcoding...";
	actionBtn.disabled = true;
	actionBtn.removeEventListener("click", handleDownloadRecording);

	const ffmpeg = createFFmpeg({
		corePath: "/ffmpeg/ffmpeg-core.js",
		log: true,
	});
	await ffmpeg.load();
	ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
	// Transcode webm to mp4.
	await ffmpeg.run("-i", files.input, "-r", "60", files.output);
	// Screenshot for thumbnail.
	await ffmpeg.run(
		"-i",
		files.input,
		"-ss",
		"00:00:00.1",
		"-frames:v",
		"1",
		files.thumbnail
	);
	// Returns Uint8Array (8-bit unsigned integers) that represents the file.
	const mp4File = ffmpeg.FS("readFile", files.output);
	const thumbnailFile = ffmpeg.FS("readFile", files.thumbnail);
	// Create a blob object using ArrayBuffer (binary data of the file).
	const mp4Blob = new Blob([mp4File.buffer], { type: "/video/mp4" });
	const thumbnailBlob = new Blob([thumbnailFile.buffer], {
		type: "/image/jpg",
	});
	// Create way to access the file in the browser.
	const mp4Url = URL.createObjectURL(mp4Blob);
	const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

	// Download recorded video and thumbnail.
	downloadFile(mp4Url, "MyRecording.mp4");
	downloadFile(thumbnailUrl, "MyThumbnail.jpg");

	// Release from memory.
	ffmpeg.FS("unlink", files.input);
	ffmpeg.FS("unlink", files.output);
	ffmpeg.FS("unlink", files.thumbnail);
	URL.revokeObjectURL(mp4Url);
	URL.revokeObjectURL(thumbnailUrl);
	URL.revokeObjectURL(videoFile);

	actionBtn.innerText = "Start Recording";
	actionBtn.disabled = false;
	actionBtn.addEventListener("click", handleStartRecording);
	init();
};

actionBtn.addEventListener("click", handleStartRecording);

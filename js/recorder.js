let mediaRecorder;
let audioChunks = [];
let userAudioURL = null;

navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            userAudioURL = URL.createObjectURL(blob);
            audioChunks = [];
        };
    })
    .catch(err => {
        console.error("麦克风访问失败:", err);
        alert("无法访问麦克风，请检查浏览器权限。");
    });

function startRecording() {
    if (mediaRecorder && mediaRecorder.state === "inactive") {
        audioChunks = [];
        mediaRecorder.start();
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    }
}

function playOriginalAudio() {
    if (!userAudioURL) {
        alert("还没有录音可播放，请先录音回答。");
        return;
    }
    new Audio(userAudioURL).play();
}

let recognition = null;
let lastSpeechTime = null;
let silenceTimer = null;
let finalTranscript = "";

function initSpeechRecognition(onResultCallback) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('当前浏览器不支持 Web Speech API，请使用 Chrome 或 Edge 打开。');
        return null;
    }
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onstart = () => {
        document.getElementById('recognizedText').textContent = '🎤 正在聆听...';
        lastSpeechTime = Date.now();
        finalTranscript = "";
        startSilenceTimer();
    };

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        if (transcript) {
            finalTranscript = transcript;
            lastSpeechTime = Date.now();
        }
    };

    recognition.onerror = (event) => {
        document.getElementById('recognizedText').textContent = '语音识别出错: ' + event.error;
        stopSilenceTimer();
    };

    recognition.onend = () => {
        stopSilenceTimer();
    };

    return recognition;
}

function startSilenceTimer() {
    stopSilenceTimer();
    silenceTimer = setInterval(() => {
        if (lastSpeechTime && Date.now() - lastSpeechTime > 5000) {
            stopRecognition("⏹ 5 秒无讲话，自动停止录音");
        }
    }, 1000);
}

function stopSilenceTimer() {
    if (silenceTimer) {
        clearInterval(silenceTimer);
        silenceTimer = null;
    }
}

function stopRecognition(reason) {
    if (recognition) {
        recognition.stop();
    }
    stopSilenceTimer();
    if (reason) {
        document.getElementById('recognizedText').textContent = reason;
    }
    showFinalResult();
}

function getFinalTranscript() {
    return finalTranscript;
}

// ===== speech.js =====
let finalTranscript = "";
let recognitionInstance = null;

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('当前浏览器不支持 Web Speech API，请使用 Chrome 或 Edge 打开。');
        return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    // 识别到结果时更新全局变量
    recognition.onresult = (event) => {
        finalTranscript = event.results[event.results.length - 1][0].transcript.trim();
        console.log("识别结果更新:", finalTranscript);
    };

    recognition.onerror = (event) => {
        console.error("语音识别错误:", event.error);
    };

    // 识别完全结束时调用 showFinalResult
    recognition.onend = () => {
        console.log("语音识别结束");
        showFinalResult(); // 确保结果更新完成后再调用
    };

    recognitionInstance = recognition;
    return recognition;
}

// 获取识别结果
function getFinalTranscript() {
    return finalTranscript;
}

// 停止识别
function stopRecognition(reason) {
    if (recognitionInstance) {
        recognitionInstance.stop();
    }
    if (reason) {
        document.getElementById('recognizedText').textContent = reason;
    }
}

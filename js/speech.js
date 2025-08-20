// ===== speech.js =====
// 全局唯一的识别结果
let finalTranscript = "";

// 初始化语音识别
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('当前浏览器不支持 Web Speech API，请使用 Chrome 或 Edge 打开。');
        return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false; // 只取最终结果
    recognition.maxAlternatives = 1;
    recognition.continuous = true; // 连续模式

    // 识别到结果时更新全局变量
    recognition.onresult = (event) => {
        finalTranscript = event.results[event.results.length - 1][0].transcript.trim();
        console.log("speech.js 识别结果更新:", finalTranscript);
    };

    recognition.onerror = (event) => {
        console.error("语音识别错误:", event.error);
    };

    recognition.onend = () => {
        console.log("语音识别结束");
    };

    return recognition;
}

// 获取最终识别结果
function getFinalTranscript() {
    return finalTranscript;
}

// 停止识别并调用 showFinalResult
function stopRecognition(reason) {
    if (recognitionInstance) {
        recognitionInstance.stop();
    }
    if (reason) {
        document.getElementById('recognizedText').textContent = reason;
    }
    // 延迟调用，确保 onresult 已更新数据
    setTimeout(showFinalResult, 150);
}

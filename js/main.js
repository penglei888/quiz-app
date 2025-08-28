// ===== main.js =====
loadQuestionBank(currentQaFile);
initSpeechRecognition();

// 选择题库
document.getElementById('qaSelect').addEventListener('change', function () {
    currentQaFile = this.value;
    loadQuestionBank(currentQaFile);
    currentQA = null;
    document.getElementById('question').textContent = '';
    document.getElementById('result').textContent = '';
    document.getElementById('answerDetail').textContent = '';
    document.getElementById('recognizedText').textContent = '';
    document.getElementById('allQuestionsList').style.display = 'none';
});

// 随机出题
document.getElementById('newQuestionBtn').addEventListener('click', newQuestion);

// 朗读题目
document.getElementById('readQuestionBtn').addEventListener('click', () => {
    if (!currentQA) return alert("请先随机出题");
    readText(currentQA.q);
});

// 显示/隐藏题目
document.getElementById('toggleQuestionBtn').addEventListener('click', () => {
    if (!currentQA) return alert("请先随机出题");
    questionVisible = !questionVisible;
    document.getElementById('question').style.display = questionVisible ? 'block' : 'none';
    document.getElementById('toggleQuestionBtn').textContent = questionVisible ? "隐藏题目" : "显示题目";
});

// 显示全部题目
document.getElementById('showAllQuestionsBtn').addEventListener('click', () => {
    if (qaList.length === 0) return alert("题库未加载完成，请稍后再试");
    const listDiv = document.getElementById('allQuestionsList');
    if (listDiv.style.display === 'none') {
        listDiv.innerHTML = "<strong>全部题目：</strong><br>" +
            qaList.map((item, i) => (i + 1) + ". " + item.q).join("<br>");
        listDiv.style.display = 'block';
        document.getElementById('showAllQuestionsBtn').textContent = "隐藏全部题目";
    } else {
        listDiv.style.display = 'none';
        document.getElementById('showAllQuestionsBtn').textContent = "显示全部题目";
    }
});

// 显示答案
document.getElementById('showAnswerBtn').addEventListener('click', showAnswer);

// 开始录音
document.getElementById('startBtn').addEventListener('click', () => {
    if (!currentQA) return alert("请先随机出题");

    const recogText = document.getElementById('recognizedText');
    recogText.textContent = '🎤 正在录音，请开始回答...';
    recogText.classList.add('recording');
    document.getElementById('startBtn').classList.add('recording-btn');

    if (recognitionInstance) recognitionInstance.start();
    startRecording();
});

// 停止录音
document.getElementById('stopBtn').addEventListener('click', () => {
    stopRecognition("⏹ 录音已停止");
    stopRecording();
    document.getElementById('recognizedText').classList.remove('recording');
    document.getElementById('startBtn').classList.remove('recording-btn');
});

// 播放原声
document.getElementById('playOriginalBtn').addEventListener('click', playOriginalAudio);

// 朗读答案
document.getElementById('readAnswerBtn').addEventListener('click', () => {
    if (!currentQA) return alert("请先随机出题");
    readText(currentQA.a);
});

// 朗读用户回答
document.getElementById('readUserAnswerBtn').addEventListener('click', () => {
    const ans = getFinalTranscript();
    if (!ans) return alert("还没有检测到用户回答，请先录音回答。");
    readText(ans);
});

// 显示最终结果（由 speech.js 的 onend 调用）
function showFinalResult() {
    const answer = getFinalTranscript();
    console.log("最终回答:", answer);

    if (!answer || answer.trim() === "") {
        document.getElementById('result').textContent = '❌ 未检测到有效回答';
        document.getElementById('result').className = 'incorrect';
        document.getElementById('answerDetail').innerHTML = `
            <strong>你的回答：</strong>（无）<br>
            <strong>正确答案：</strong> ${currentQA ? currentQA.a : ""}
        `;
        return;
    }

    const useFuzzy = document.getElementById('fuzzyMatch')?.checked ?? true;
    const correct = useFuzzy
        ? isAnswerCorrect(answer, currentQA.a)
        : isAnswerStrict(answer, currentQA.a);

    document.getElementById('result').textContent = correct ? '✅ 正确' : '❌ 错误';
    document.getElementById('result').className = correct ? 'correct' : 'incorrect';

    document.getElementById('answerDetail').innerHTML = `
        <strong>你的回答：</strong> ${answer} 
        <button id="playUserAnswerBtn" style="padding:2px 6px; font-size:12px; margin-left:5px;">🔊TTS</button>
        <button id="playUserOriginalBtn" style="padding:2px 6px; font-size:12px; margin-left:5px;">🎤原声</button>
        <br>
        <strong>正确答案：</strong> ${currentQA.a}
    `;

    document.getElementById('playUserAnswerBtn').addEventListener('click', () => {
        readText(answer);
    });

    document.getElementById('playUserOriginalBtn').addEventListener('click', () => {
        playOriginalAudio();
    });
}

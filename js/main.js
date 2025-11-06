// ===== main.js =====

const feedbackMessages = {
    correct: ["🎉 Great job!", "🌟 Perfect!", "✅ Excellent!", "🔥 You nailed it!", "💯 Spot on!"],
    incorrect: ["🤔 Almost there!", "💡 Good try!", "🔧 Keep practicing!", "📈 Getting closer!", "🎧 Listen and try again!"]
};

function getRandomFeedback(isCorrect) {
    const pool = isCorrect ? feedbackMessages.correct : feedbackMessages.incorrect;
    return pool[Math.floor(Math.random() * pool.length)];
}

loadQuestionBank(currentQaFile);
initSpeechRecognition();

// 题库切换
document.getElementById('qaSelect').addEventListener('change', function () {
    currentQaFile = this.value;
    if (currentQaFile === 'qa.json' || currentQaFile === 'qa2.json') {
        loadQuestionBank(currentQaFile).then(() => {
            currentQA = null;
            resetUI();
        });
    } else {
        if (qaCache[currentQaFile]) {
            qaList = qaCache[currentQaFile].data;
            currentQA = null;
            resetUI();
        } else {
            alert("题库数据丢失，请重新上传");
        }
    }
});

// 上传题库
document.getElementById('uploadQaBtn').addEventListener('click', () => {
    const name = prompt("请输入题库名称（例如：我的面试题）：", "自定义题库");
    if (name === null) return;
    if (name.trim() === "") {
        alert("题库名称不能为空");
        return;
    }
    document.getElementById('customQaUpload').dataset.customName = name.trim();
    document.getElementById('customQaUpload').click();
});

document.getElementById('customQaUpload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const customName = this.dataset.customName || "自定义题库";
    if (!file) return;

    loadCustomQuestionBank(file, customName)
        .then((key) => {
            alert("题库 “" + customName + "” 加载成功！");
            currentQA = null;
            resetUI();

            const select = document.getElementById('qaSelect');
            const option = document.createElement('option');
            option.value = key;
            option.textContent = customName;
            option.dataset.isCustom = "true";
            select.appendChild(option);
            select.value = key;
        })
        .catch(err => {
            alert("题库上传失败：" + err.message);
            console.error(err);
        });
    this.value = '';
    delete this.dataset.customName;
});

function resetUI() {
    document.getElementById('question').textContent = '';
    document.getElementById('result').textContent = '';
    document.getElementById('answerDetail').textContent = '';
    document.getElementById('recognizedText').textContent = '';
    document.getElementById('allQuestionsList').style.display = 'none';
}

// 随机出题（并朗读）
document.getElementById('newQuestionBtn').addEventListener('click', () => {
    newQuestion();
    if (currentQA) readText(currentQA.q);
});

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
    document.getElementById('toggleQuestionBtn').textContent = questionVisible ? "❓ 隐藏题目" : "❓ 显示题目";
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

// 显示答案（始终可用，内部检查）
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

// 🚫 已移除：朗读用户回答按钮事件

// 显示最终结果
function showFinalResult() {
    const answer = getFinalTranscript();
    console.log("最终回答:", answer);

    if (!answer || answer.trim() === "") {
        const msg = "🔇 未检测到有效回答";
        document.getElementById('result').textContent = msg;
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

    const feedback = getRandomFeedback(correct);
    document.getElementById('result').textContent = feedback;
    document.getElementById('result').className = correct ? 'correct' : 'incorrect';

    // 仅保留“🎤原声”按钮，移除“🔊TTS”
    document.getElementById('answerDetail').innerHTML = `
        <strong>你的回答：</strong> ${answer} 
        <button id="playUserOriginalBtn" style="padding:2px 6px; font-size:12px; margin-left:5px;">🎤原声</button>
        <br>
        <strong>正确答案：</strong> ${currentQA.a}
    `;

    // 绑定原声播放
    document.getElementById('playUserOriginalBtn').onclick = () => playOriginalAudio();

    // 保存历史
    const historyItem = {
        timestamp: new Date().toISOString(),
        question: currentQA.q,
        userAnswer: answer,
        correctAnswer: currentQA.a,
        isCorrect: correct,
        qaFile: currentQaFile
    };
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    history.push(historyItem);
    if (history.length > 50) history.shift();
    localStorage.setItem('quizHistory', JSON.stringify(history));
}
let qaList = [];
let currentQA = null;
let questionVisible = false;

// ===== 加载题库 =====
fetch('qa.json')
    .then(res => res.json())
    .then(data => { 
        qaList = data; 
        console.log(`题库加载成功，共 ${qaList.length} 道题`);
    })
    .catch(err => {
        console.error(err);
        alert("加载题库失败，请检查 qa.json");
    });

// ===== 随机出题并朗读 =====
document.getElementById('newQuestionBtn').addEventListener('click', () => {
    if (qaList.length === 0) {
        alert("题库未加载完成，请稍后再试");
        return;
    }
    const randomIndex = Math.floor(Math.random() * qaList.length);
    currentQA = qaList[randomIndex];
    questionVisible = false;
    document.getElementById('question').style.display = 'none';
    document.getElementById('question').textContent = currentQA.q;
    document.getElementById('toggleQuestionBtn').textContent = "显示题目";
    document.getElementById('recognizedText').textContent = '';
    document.getElementById('result').textContent = '';
    document.getElementById('answerDetail').textContent = '';
    document.getElementById('allQuestionsList').style.display = 'none';
    readText(currentQA.q);
});

// ===== 显示/隐藏当前题目 =====
document.getElementById('toggleQuestionBtn').addEventListener('click', () => {
    if (!currentQA) {
        alert("请先随机出题");
        return;
    }
    questionVisible = !questionVisible;
    document.getElementById('question').style.display = questionVisible ? 'block' : 'none';
    document.getElementById('toggleQuestionBtn').textContent = questionVisible ? "隐藏题目" : "显示题目";
});

// ===== 显示全部题目 =====
document.getElementById('showAllQuestionsBtn').addEventListener('click', () => {
    if (qaList.length === 0) {
        alert("题库未加载完成，请稍后再试");
        return;
    }
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

// ===== 初始化语音识别 =====
const recognitionInstance = initSpeechRecognition();

// ===== 开始录音 =====
document.getElementById('startBtn').addEventListener('click', () => {
    if (!currentQA) {
        alert("请先随机出题");
        return;
    }
    if (recognitionInstance) {
        recognitionInstance.start();
    }
});

// ===== 停止录音 =====
document.getElementById('stopBtn').addEventListener('click', () => {
    stopRecognition("⏹ 手动停止录音");
});

// ===== 朗读答案按钮事件 =====
document.getElementById('readAnswerBtn').addEventListener('click', () => {
    if (!currentQA) {
        alert("请先随机出题");
        return;
    }
    readText(currentQA.a);
});

// ===== 显示最终结果 =====
function showFinalResult() {
    const answer = getFinalTranscript();
    
    if (!answer) {
        document.getElementById('result').textContent = '❌ 未检测到有效回答';
        document.getElementById('answerDetail').innerHTML = `
            <strong>你的回答：</strong>（无）<br>
            <strong>正确答案：</strong> ${currentQA ? currentQA.a : ""}
        `;
        return;
    }

    const correct = isAnswerCorrect(answer, currentQA.a);
    document.getElementById('result').textContent = correct ? '✅ 正确' : '❌ 错误';
    document.getElementById('answerDetail').innerHTML = `
        <strong>你的回答：</strong> ${answer} <br>
        <strong>正确答案：</strong> ${currentQA.a}
    `;
}

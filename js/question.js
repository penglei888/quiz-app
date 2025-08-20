let qaList = [];
let currentQA = null;
let questionVisible = false;
let currentQaFile = "qa.json";

function loadQuestionBank(file) {
    fetch(file)
        .then(res => res.json())
        .then(data => {
            qaList = data;
            console.log(`题库加载成功（${file}），共 ${qaList.length} 道题`);
        })
        .catch(err => {
            console.error(err);
            alert("加载题库失败：" + file);
        });
}

function newQuestion() {
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
}

function showAnswer() {
    if (!currentQA) {
        alert("请先随机出题");
        return;
    }
    document.getElementById('answerDetail').innerHTML = `
        <strong>正确答案：</strong> ${currentQA.a}
    `;
}

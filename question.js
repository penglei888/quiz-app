let qaList = [];
let currentQA = null;
let currentQuestionIndex = -1; // 🆕 记录题号
let questionVisible = false;
let currentQaFile = "qa.json";

// 缓存题库（支持自定义）
const qaCache = {
    "qa.json": { name: "题库 1", data: null },
    "qa2.json": { name: "题库 2", data: null }
};

function loadQuestionBank(file) {
    if (qaCache[file] && qaCache[file].data) {
        qaList = qaCache[file].data;
        console.log(`从缓存加载题库: ${file}`);
        return Promise.resolve();
    }

    return fetch(file)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            qaList = data;
            if (!qaCache[file]) {
                qaCache[file] = { name: file, data: data };
            } else {
                qaCache[file].data = data;
            }
            console.log(`题库加载成功（${file}），共 ${qaList.length} 道题`);
        })
        .catch(err => {
            console.error(err);
            alert("加载题库失败：" + file + "\n" + err.message);
        });
}

function loadCustomQuestionBank(file, customName) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!Array.isArray(data) || data.length === 0 || !data[0].q || !data[0].a) {
                    throw new Error("格式无效：需为 {q, a} 对象数组");
                }
                qaList = data;
                const key = "custom_" + Date.now();
                qaCache[key] = { name: customName, data: data };
                currentQaFile = key;
                resolve(key);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error("文件读取失败"));
        reader.readAsText(file);
    });
}

function newQuestion() {
    if (qaList.length === 0) {
        alert("题库未加载完成，请稍后再试");
        return;
    }
    const randomIndex = Math.floor(Math.random() * qaList.length);
    currentQA = qaList[randomIndex];
    currentQuestionIndex = randomIndex;

    questionVisible = true;
    const questionDiv = document.getElementById('question');
    questionDiv.textContent = `Q${currentQuestionIndex + 1}/${qaList.length}: ${currentQA.q}`;
    questionDiv.style.display = 'block';
    document.getElementById('toggleQuestionBtn').textContent = "❓ 隐藏题目";
    
    document.getElementById('recognizedText').textContent = '';
    document.getElementById('result').textContent = '';
    document.getElementById('answerDetail').textContent = '';
    document.getElementById('allQuestionsList').style.display = 'none';
    // 注意：不再在此处调用 readText，由 main.js 控制
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

// 暴露缓存供 main.js 使用
window.qaCache = qaCache;
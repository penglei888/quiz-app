function normalize(text) {
    return text.trim().toLowerCase().replace(/[^\w\s]/g, '');
}

function levenshtein(a, b) {
    const m = [];
    let i, j;
    if (!(a && b)) return (b ? b.length : 0) + (a ? a.length : 0);
    for (i = 0; i <= b.length; m[i] = [i++]);
    for (j = 0; j <= a.length; m[0][j] = j++);
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            m[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
                ? m[i - 1][j - 1]
                : Math.min(
                    m[i - 1][j - 1] + 1,
                    Math.min(m[i][j - 1] + 1, m[i - 1][j] + 1)
                );
        }
    }
    return m[b.length][a.length];
}

function isAnswerCorrect(userAnswer, correctAnswer) {
    const ua = normalize(userAnswer);
    const ca = normalize(correctAnswer);
    if (!ua || !ca) return false;
    if (ua === ca) return true;
    if (ua.includes(ca)) return true;
    const distance = levenshtein(ua, ca);
    return (1 - distance / Math.max(ua.length, ca.length)) >= 0.8;
}

function isAnswerStrict(userAnswer, correctAnswer) {
    return normalize(userAnswer) === normalize(correctAnswer);
}

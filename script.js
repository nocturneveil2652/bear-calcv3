const SPREADSHEET_API_URL = "https://script.google.com/macros/s/AKfycbwWEDwwO4vSFzdOkMY6NEbqIrd-DEREvKgUg5YZTFWPODvlVHsPChv5UtlMbM9u_mCD/exec";

// メンバーごとのデフォルト設定
let memberData = {
    ruby: { tr: 100000, fc: "4", t: "T10" },
    junk: { tr: 100000, fc: "5", t: "T10" }
};
let currentKey = "ruby"; 
let cur = {I:0, L:0, A:0};

async function it() {
    // セレクトボックス初期化
    const fcs = ["なし","1","2","3","4","5","6","7","8","9","10"];
    const tiers = ["T7","T8","T9","T10","T11"];
    document.querySelectorAll('[id^="fc"]').forEach(s => { fcs.forEach(f => s.add(new Option("FC "+f,f))); });
    document.querySelectorAll('select[id^="t"]').forEach(s => { tiers.forEach(t => s.add(new Option(t,t))); });
    
    // 最初はデフォルトで表示
    applyMemberSettings();

    // スプシから数値を取得
    try {
        const response = await fetch(SPREADSHEET_API_URL);
        const data = await response.json();
        if(data.ruby) memberData.ruby.tr = data.ruby;
        if(data.junk) memberData.junk.tr = data.junk;
        
        // 届いたら今の画面に反映
        document.getElementById('tr').value = memberData[currentKey].tr;
        sy(); 
    } catch (e) {
        console.error("スプシ取得失敗:", e);
    }
}

function applyMemberSettings() {
    const config = memberData[currentKey];
    const trInput = document.getElementById('tr');
    if(trInput) trInput.value = config.tr;
    
    document.querySelectorAll('[id^="fc"]').forEach(s => s.value = config.fc);
    document.querySelectorAll('select[id^="t"]').forEach(s => s.value = config.t);
    sy(); 
}

function toggleEdition() {
    currentKey = (currentKey === "ruby") ? "junk" : "ruby";
    document.body.classList.toggle('junk-theme', currentKey === "junk");
    document.getElementById('editionLabel').innerText = (currentKey === "ruby" ? "るびぃ" : "じゃんく") + "edition";
    applyMemberSettings();
}

function sy() {
    const trElem = document.getElementById('tr');
    if(!trElem) return;
    const tot = parseInt(trElem.value) || 0;
    
    const tDisp = document.getElementById('tDisp');
    if(tDisp) tDisp.innerText = tot.toLocaleString();
    
    ['I','L','A'].forEach(t => { 
        const inputElem = document.getElementById('i'+t);
        const pct = inputElem ? (parseFloat(inputElem.value) || 0) : 0;
        cur[t] = Math.floor(tot * (pct / 100));
        
        const sElem = document.getElementById('s'+t);
        if(sElem) sElem.innerText = `→ ${cur[t].toLocaleString()}`;
    });
    
    calc(); // ここで計算を呼び出す
}

function hi(t) { sy(); }

function calc() {
    // D(兵士データ)が読み込まれていないなら中止
    if (typeof D === 'undefined') return;
    
    const resDmgElem = document.getElementById('resDmg');
    if(!resDmgElem) return;

    const process = (row, key, atkId, kilId) => {
        const fc = document.getElementById('fc'+row).value;
        const t = document.getElementById('t'+row).value;
        const b = (D[key][fc] && D[key][fc][t]) ? D[key][fc][t] : D[key]["なし"][t];
        const a = parseFloat(document.getElementById(atkId).value)||0;
        const k = parseFloat(document.getElementById(kilId).value)||0;
        const base = b[0] * b[1];
        const coeff = base * (1 + a/100) * (1 + k/100);
        return {dmg: Math.sqrt(cur[row.toUpperCase()]) * coeff, m: coeff};
    };

    try {
        const rI = process('i','盾','bAi','bKi');
        const rL = process('l','槍','bAl','bKl');
        const rA = process('a','弓','bAa','bKa');
        
        const totalDmg = Math.floor(rI.dmg + rL.dmg + rA.dmg);
        resDmgElem.innerText = totalDmg.toLocaleString();

        const sQ = rI.m**2 + rL.m**2 + rA.m**2;
        const bT = document.getElementById('bT');
        if(sQ > 0 && bT) {
            const pI = Math.round(rI.m**2/sQ*100), pL = Math.round(rL.m**2/sQ*100), pA = 100 - pI - pL;
            bT.innerText = `推奨: 盾${pI}% 槍${pL}% 弓${pA}%`;
        }
    } catch(e) {
        console.error("計算中にエラー:", e);
    }
}

function rs() {
    ['bAi','bKi','bAl','bKl','bAa','bKa'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value="0.0";
    });
    document.getElementById('iI').value=33; document.getElementById('iL').value=33; document.getElementById('iA').value=34;
    applyMemberSettings();
}

// 実行開始
// 一番下の it(); をこれに書き換える
window.addEventListener('DOMContentLoaded', () => {
    it();
});


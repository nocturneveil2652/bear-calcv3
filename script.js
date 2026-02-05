// --- 冒頭に追加 ---
const SPREADSHEET_API_URL = "https://script.google.com/macros/s/AKfycbwWEDwwO4vSFzdOkMY6NEbqIrd-DEREvKgUg5YZTFWPODvlVHsPChv5UtlMbM9u_mCD/exec";

// メンバーごとのデフォルト設定（スプシから取得するまでの予備データ）
let memberData = {
    ruby: { tr: 100000, fc: "4", t: "T10" },
    junk: { tr: 100000, fc: "5", t: "T10" }
};
let currentMember = "ruby"; 

// --- 初期化関数を修正 ---
function it() {
    const fcs = ["なし","1","2","3","4","5","6","7","8","9","10"];
    const tiers = ["T7","T8","T9","T10","T11"];
    document.querySelectorAll('[id^="fc"]').forEach(s => { fcs.forEach(f => s.add(new Option("FC "+f,f))); });
    document.querySelectorAll('select[id^="t"]').forEach(s => { tiers.forEach(t => s.add(new Option(t,t))); });
    
    // 最初にスプシからデータを取得
    fetchData();
}

// スプシからデータを取得して反映する関数
async function fetchData() {
    try {
        const response = await fetch(SPREADSHEET_API_URL);
        const data = await response.json();
        
        // スプシにデータがあれば上書き
        if(data.ruby) memberData.ruby.tr = data.ruby;
        if(data.junk) memberData.junk.tr = data.junk;
        
        applyMemberSettings();
    } catch (e) {
        console.error("スプシ連携エラー:", e);
        applyMemberSettings(); // エラーでもデフォルト値で表示
    }
}

// 現在のメンバー設定を画面に反映
function applyMemberSettings() {
    const config = memberData[currentMember];
    document.getElementById('tr').value = config.tr;
    document.querySelectorAll('[id^="fc"]').forEach(s => s.value = config.fc);
    document.querySelectorAll('select[id^="t"]').forEach(s => s.value = config.t);
    sy();
}

// エディション切り替え関数を修正
function toggleEdition() {
    const b = document.body;
    b.classList.toggle('junk-theme');
    currentMember = b.classList.contains('junk-theme') ? "junk" : "ruby";
    document.getElementById('editionLabel').innerText = (currentMember === "junk" ? "じゃんく" : "るびぃ") + "edition";
    
    applyMemberSettings();
}

// --- 以下、sy() や calc() はオリジナルを維持 ---

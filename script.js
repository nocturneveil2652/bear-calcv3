// 【制御】iPhoneでの誤操作防止: ダブルタップによるズームをJavaScriptで無効化
document.addEventListener('touchstart', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
let lastTouch = 0;
document.addEventListener('touchend', (e) => {
    const now = new Date().getTime();
    if (now - lastTouch <= 300) {
        if (!['INPUT', 'SELECT', 'BUTTON'].includes(e.target.tagName)) e.preventDefault();
    }
    lastTouch = now;
}, false);

// 【連携】Googleスプレッドシート(GAS)のURL
const SPREADSHEET_API_URL = "https://script.google.com/macros/s/AKfycbwWEDwwO4vSFzdOkMY6NEbqIrd-DEREvKgUg5YZTFWPODvlVHsPChv5UtlMbM9u_mCD/exec";

// 【制御】兵士ステータスデータ
const D = { /* 盾・槍・弓のFC/Tier別データ */ };

// 状態管理変数
let isP = {I:1,L:1,A:1}; // 割合モードか人数モードかのフラグ
let cur = {I:33000,L:33000,A:34000}; // 現在の各兵数
let memberData = { ruby: { tr: 100000, fc: "4", t: "T10" }, junk: { tr: 100000, fc: "5", t: "T10" } };
let currentMember = "ruby";

// 【初期化】起動時に実行
async function it() {
    // セレクトボックスの中身を作成
    /* (コード略) */
    // スプレッドシートから最新の出征数を取得
    await fetchData();
}

// 【連携】スプレッドシートからデータを取得する関数
async function fetchData() {
    try {
        const response = await fetch(SPREADSHEET_API_URL);
        const data = await response.json();
        if(data.ruby) memberData.ruby.tr = data.ruby;
        if(data.junk) memberData.junk.tr = data.junk;
    } catch (e) { console.warn("スプシ連携失敗時はデフォルト値を使用"); }
    applyMemberSettings();
}

// 【制御】100%制御ロジック: 入力された割合が100%を超えないよう調整し、人数(cur)を計算
function sy() {
    const tot = parseInt(document.getElementById('tr').value);
    let sumP = 0;
    ['I','L','A'].forEach(t => { 
        let val = parseFloat(document.getElementById('i'+t).value)||0;
        // 合計が100%を超える場合、自動で上限（残りカス）に丸める
        if(isP[t] && (sumP + val > 100)) { val = 100 - sumP; document.getElementById('i'+t).value = val; }
        if(isP[t]) cur[t] = Math.floor(tot * val / 100);
        sumP += Math.round(cur[t]/tot*100);
        // スライダーのつまみ位置を連動
        document.getElementById('r'+t).value = isP[t] ? val : Math.round(cur[t]/tot*100);
    });
    calc(); // 計算実行
}

// 【制御】スライダー操作時の連動
function sl(t) {
    let val = parseInt(document.getElementById('r'+t).value);
    // 他の兵種の割合を考慮して最大値を制限
    if(isP[t]) {
        let others = ['I','L','A'].filter(x => x !== t).reduce((sum, x) => sum + (isP[x] ? (parseInt(document.getElementById('i'+x).value)||0) : 0), 0);
        if(others + val > 100) val = 100 - others;
    }
    document.getElementById('i'+t).value = val;
    hi(t); // 人数に変換して反映
}

// 【計算】オリジナル遵守のダメージ計算ロジック
function calc() {
    /* ステータス × バフ(攻撃/殺傷) × 兵数のルート でダメージ算出 */
    /* 推奨割合の計算 (係数の2乗比) */
}

// ページ読み込み完了時に初期化関数を呼ぶ
window.onload = it;

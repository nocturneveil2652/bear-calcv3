// ズーム防止（ダブルタップ無効）
document.addEventListener('touchstart', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
let lastTouch = 0;
document.addEventListener('touchend', (e) => {
    const now = new Date().getTime();
    if (now - lastTouch <= 300) e.preventDefault();
    lastTouch = now;
}, false);

const SPREADSHEET_API_URL = "https://script.google.com/macros/s/AKfycbwWEDwwO4vSFzdOkMY6NEbqIrd-DEREvKgUg5YZTFWPODvlVHsPChv5UtlMbM9u_mCD/exec";
const D = {
    盾: {"なし":{T7:[7,7],T8:[8,8],T9:[9,9],T10:[10,10],T11:[12,12]},"1":{T10:[11,10],T11:[13,12]},"2":{T10:[12,11],T11:[14,13]},"3":{T10:[13,12],T11:[15,14]},"4":{T10:[13,13],T11:[15,15]},"5":{T10:[14,13],T11:[16,15]},"6":{T10:[14,13],T11:[17,16]},"7":{T10:[15,14],T11:[17,16]},"8":{T10:[15,15],T11:[18,17]},"9":{T10:[15,14],T11:[18,17]},"10":{T10:[16,15],T11:[19,18]}},
    槍: {"なし":{T7:[9,10],T8:[10,11],T9:[12,12],T10:[13,14],T11:[15,16]},"1":{T10:[14,15],T11:[16,17]},"2":{T10:[16,16],T11:[18,18]},"3":{T10:[17,17],T11:[19,19]},"4":{T10:[18,18],T11:[20,20]},"5":{T10:[20,19],T11:[22,22]},"6":{T10:[21,20],T11:[23,22]},"7":{T10:[22,21],T11:[24,24]},"8":{T10:[23,22],T11:[25,24]},"9":{T10:[24,22],T11:[27,25]},"10":{T10:[25,23],T11:[28,26]}},
    弓: {"なし":{T7:[9,10],T8:[10,11],T9:[12,12],T10:[14,15],T11:[16,17]},"1":{T10:[15,16],T11:[17,18]},"2":{T10:[17,17],T11:[19,19]},"3":{T10:[18,18],T11:[20,20]},"4":{T10:[19,19],T11:[21,21]},"5":{T10:[21,20],T11:[23,22]},"6":{T10:[22,21],T11:[24,23]},"7":{T10:[23,22],T11:[25,24]},"8":{T10:[24,23],T11:[26,25]},"9":{T10:[25,23],T11:[28,26]},"10":{T10:[26,24],T11:[30,27]}}
};
let memberData = { ruby: { tr: 100000, fc: "4", t: "T10" }, junk: { tr: 100000, fc: "5", t: "T10" } };
let memberKeys = ["ruby", "junk"], curIdx = 0, isP = {I:1, L:1, A:1}, cur = {I:0, L:0, A:0};

function it() {
    const fcs = ["なし","1","2","3","4","5","6","7","8","9","10"], tiers = ["T7","T8","T9","T10","T11"];
    document.querySelectorAll('[id^="fc"]').forEach(s => fcs.forEach(f => s.add(new Option(f,f))));
    document.querySelectorAll('select[id^="t"]').forEach(s => tiers.forEach(t => s.add(new Option(t,t))));
    apply();
    fetch(SPREADSHEET_API_URL).then(r=>r.json()).then(d=>{ if(d.ruby)memberData.ruby.tr=d.ruby; if(d.junk)memberData.junk.tr=d.junk; apply(); });
}

function apply() {
    const k = memberKeys[curIdx], c = memberData[k];
    document.getElementById('editionLabel').innerText = (k === "ruby" ? "るびぃ" : "じゃんく") + "edition";
    document.body.classList.toggle('junk-theme', k === "junk");
    document.getElementById('tr').value = c.tr;
    document.querySelectorAll('[id^="fc"]').forEach(s => s.value = c.fc);
    document.querySelectorAll('select[id^="t"]').forEach(s => s.value = c.t);
    sy();
}

function cycleMember() { curIdx = (curIdx + 1) % memberKeys.length; apply(); }

function st(id, v) { 
    const el = document.getElementById(id);
    if(id.startsWith('i') && isP[id.slice(1)]) {
        const others = ['I','L','A'].filter(t => t !== id.slice(1)).reduce((sum, t) => sum + (isP[t] ? parseInt(document.getElementById('i'+t).value) : 0), 0);
        if(v > 0 && others + parseInt(el.value) >= 100) return;
    }
    el.value = Math.max(0, parseInt(el.value) + v); 
    if(id.startsWith('i')) document.getElementById('r'+id.slice(1)).value = el.value;
    sy(); 
}

function sl(t) { 
    const el = document.getElementById('r'+t);
    if(isP[t]) {
        const others = ['I','L','A'].filter(x => x !== t).reduce((sum, x) => sum + (isP[x] ? parseInt(document.getElementById('i'+x).value) : 0), 0);
        if(others + parseInt(el.value) > 100) el.value = 100 - others;
    }
    document.getElementById('i'+t).value = el.value; 
    sy(); 
}

function tg(t) {
    isP[t] = !isP[t];
    const b = document.getElementById('m'+t), tot = parseInt(document.getElementById('tr').value);
    b.innerText = isP[t] ? "割合" : "人数";
    document.getElementById('i'+t).value = isP[t] ? Math.round(cur[t]/tot*100) : cur[t];
    document.getElementById('r'+t).max = isP[t] ? 100 : tot;
    document.getElementById('r'+t).value = document.getElementById('i'+t).value;
    sy();
}

function sy() {
    const tot = parseInt(document.getElementById('tr').value) || 0;
    document.getElementById('tDisp').innerText = tot.toLocaleString();
    let sumP = 0;
    ['I','L','A'].forEach(t => {
        let v = parseFloat(document.getElementById('i'+t).value) || 0;
        if(isP[t] && sumP + v > 100) { v = 100 - sumP; document.getElementById('i'+t).value = v; }
        cur[t] = isP[t] ? Math.floor(tot * (v / 100)) : v;
        sumP += isP[t] ? v : 0;
        document.getElementById('s'+t).innerText = `→ ${cur[t].toLocaleString()}人`;
        document.getElementById('r'+t).value = v;
    });
    document.getElementById('remDisp').innerText = `残り：${Math.round(Math.max(0, 100-sumP))}%`;
    calc();
}

function hi(t) { sl(t); }

function calc() {
    let lb = "<span class='log-head'>1. 基礎ステータス</span>";
    let lc = "<span class='log-head'>2. バフ適用係数</span>";
    let ld = "<span class='log-head'>3. 各兵種ダメージ</span>";
    let tot = parseInt(document.getElementById('tr').value);

    const process = (row, key, atkId, kilId) => {
        const fc = document.getElementById('fc'+row).value, t = document.getElementById('t'+row).value,
              b = (D[key][fc] && D[key][fc][t]) ? D[key][fc][t] : D[key]["なし"][t],
              a = parseFloat(document.getElementById(atkId).value)||0, k = parseFloat(document.getElementById(kilId).value)||0,
              coeff = b[0] * b[1] * (1 + a/100) * (1 + k/100), dmg = Math.sqrt(cur[row.toUpperCase()]) * coeff;
        
        lb += `\n${key}(${t}/${fc}): 攻${b[0]}×守${b[1]}=${b[0]*b[1]}`;
        lc += `\n${key}: ${b[0]*b[1]}×攻${(1+a/100).toFixed(2)}×殺${(1+k/100).toFixed(2)}=係数:${coeff.toFixed(1)}`;
        ld += `\n${key}: √${cur[row.toUpperCase()].toLocaleString()}×${coeff.toFixed(1)}=${Math.floor(dmg).toLocaleString()}`;
        
        return {dmg: dmg, m: coeff};
    };

    const rI = process('i','盾','bAi','bKi'), rL = process('l','槍','bAl','bKl'), rA = process('a','弓','bAa','bKa');
    document.getElementById('resDmg').innerText = Math.floor(rI.dmg + rL.dmg + rA.dmg).toLocaleString();
    document.getElementById('log').innerHTML = lb + lc + ld;

    const sQ = rI.m**2 + rL.m**2 + rA.m**2;
    if(sQ > 0) {
        const pI = Math.round(rI.m**2/sQ*100), pL = Math.round(rL.m**2/sQ*100), pA = 100 - pI - pL;
        document.getElementById('bT').innerText = `推奨: 盾${pI}% 槍${pL}% 弓${pA}%`;
        const bDmg = (Math.sqrt(tot * pI/100) * rI.m) + (Math.sqrt(tot * pL/100) * rL.m) + (Math.sqrt(tot * pA/100) * rA.m);
        document.getElementById('bDMG').innerText = `推奨時の推定ダメ: ${Math.floor(bDmg).toLocaleString()}`;
    }
}

function rs() {
    ['bAi','bKi','bAl','bKl','bAa','bKa'].forEach(id => document.getElementById(id).value="0.0");
    document.getElementById('iI').value=33; document.getElementById('iL').value=33; document.getElementById('iA').value=34;
    apply();
}
window.onload = it;

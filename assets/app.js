(() => {
const C = window.GAME5_CONFIG;
const $ = s => document.querySelector(s);
const CH = C.chain, CHAIN_HEX = "0x" + CH.id.toString(16), CA = C.token.contract;
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem("g5_" + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("g5_" + k, JSON.stringify(v)); } catch {} }
};
let bals = store.get("bals", {});
let stats = store.get("stats", { rounds: 0, wagered: 0, won: 0, best: 0 });
let feed = store.get("feed", []);
let wallet = null;

const fmt = n => (Math.round(n * 100) / 100).toLocaleString("en-US");
const toast = t => { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on"), 2400); };
const bal = () => bals.rh ?? (bals.rh = 1000);
const setBal = v => { bals.rh = Math.max(0, v); store.set("bals", bals); renderBal(); };
const renderBal = () => { $("#bal").textContent = fmt(bal()); };

/* ---------- $GAME5 wallet balance ---------- */
const fmtUnits = (raw, dec) => { const d = 10n ** BigInt(dec), w = raw / d, f = (raw % d).toString().padStart(dec, "0").slice(0, 2); return Number(w).toLocaleString("en-US") + (dec && +f ? "." + f : ""); };
// reads balanceOf/decimals straight from Robinhood Chain RPC, whatever network the wallet is on
const rpc = (method, params) => fetch(CH.rpc, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) })
  .then(r => r.json()).then(r => { if (r.error) throw new Error(r.error.message); return r.result; });
async function tokBalance() {
  if (!wallet || !CA) return null;
  const q = [{ to: CA, data: "0x70a08231" + wallet.addr.slice(2).toLowerCase().padStart(64, "0") }, { to: CA, data: "0x313ce567" }];
  let out;
  try { out = await Promise.all(q.map(t => rpc("eth_call", [t, "latest"]))); }
  catch { // fallback: read through the wallet when it is on Robinhood Chain
    if ((await window.ethereum?.request({ method: "eth_chainId" }))?.toLowerCase() !== CHAIN_HEX) throw new Error("rpc");
    out = await Promise.all(q.map(t => window.ethereum.request({ method: "eth_call", params: [t, "latest"] })));
  }
  return fmtUnits(BigInt(out[0]), Number(BigInt(out[1])));
}
async function renderTok() {
  const el = $("#tokBal"); el.textContent = "…";
  try { el.textContent = (await tokBalance()) ?? "—"; } catch { el.textContent = "—"; }
}

/* ---------- provably fair ---------- */
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
const rand = n => hex(crypto.getRandomValues(new Uint8Array(n)));
let fair = store.get("fair", null);
if (!fair) { fair = { server: rand(32), client: rand(8), nonce: 0 }; store.set("fair", fair); }
async function sha256(t) { return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t))); }
async function roll() {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(fair.server), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${fair.client}:${fair.nonce}`)));
  fair.nonce++; store.set("fair", fair);
  return parseInt(sig.slice(0, 13), 16) / 2 ** 52; // [0,1)
}
async function showSeed() { $("#mSeed").textContent = `seed hash ${(await sha256(fair.server)).slice(0, 16)}… · nonce ${fair.nonce}`; }

/* ---------- contract & buy ---------- */
$("#caList").innerHTML = `<div class="ca"><span class="n"><i style="background:#ccff00"></i>Robinhood</span><code>${CA || "Coming soon"}</code>${CA ? `<button data-a="${CA}">Copy</button><a href="${CH.explorer}/token/${CA}" target="_blank" rel="noopener"><button>↗</button></a>` : ""}</div>`;
const heroCA = $("#heroCA");
if (CA) { heroCA.innerHTML = `CA: <code>${CA.slice(0, 6)}…${CA.slice(-4)}</code> <b>⧉ Copy</b>`; heroCA.onclick = () => navigator.clipboard.writeText(CA).then(() => toast("Contract address copied")); }
else heroCA.remove();
$("#caList").onclick = e => { const a = e.target.dataset.a; if (a) navigator.clipboard.writeText(a).then(() => toast("Contract address copied")); };
document.querySelectorAll("[data-buy]").forEach(b => {
  if (CA) b.href = C.buy.replace("{ca}", CA);
  else { b.removeAttribute("href"); b.textContent = "Launching soon"; b.style.opacity = .6; }
});

/* ---------- stats & feed ---------- */
function renderStats() {
  const s = stats;
  $("#stats").innerHTML = [["Rounds played", s.rounds], ["Total wagered", fmt(s.wagered)], ["Total won", fmt(s.won)], ["Best multiplier", s.best ? fmt(s.best) + "×" : "—"]]
    .map(([k, v]) => `<div class="card stat"><span>${k}</span><b>${v}</b></div>`).join("");
  if (feed.length) $("#feed").innerHTML = feed.map(f => `<span>${f.g} · ${f.c} · ${f.w ? `<b>+${fmt(f.p)} (${fmt(f.m)}×)</b>` : `<i class="l">−${fmt(f.b)}</i>`}</span>`).join("");
}
function settle(game, bet, mult) {
  const pay = bet * mult, win = mult > 0;
  setBal(bal() + pay);
  stats.rounds++; stats.wagered += bet; stats.won += pay; if (mult > stats.best) stats.best = mult;
  feed.unshift({ g: game, c: "RH", w: win, p: pay, m: mult, b: bet }); feed = feed.slice(0, 20);
  store.set("stats", stats); store.set("feed", feed); renderStats(); showSeed();
  const m = $("#mMsg"); m.className = "m-msg " + (win ? "w" : "l");
  m.textContent = win ? `WIN +${fmt(pay)} (${fmt(mult)}×)` : `LOSS −${fmt(bet)}`;
}

/* ---------- wallet ---------- */
const short = a => a.slice(0, 6) + "…" + a.slice(-4);
async function ensureChain() {
  const eth = window.ethereum; if (!eth) return;
  try { await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_HEX }] }); }
  catch (e) {
    if (e.code !== 4902 && e?.data?.originalError?.code !== 4902) return;
    await eth.request({ method: "wallet_addEthereumChain", params: [{ chainId: CHAIN_HEX, chainName: CH.name, nativeCurrency: CH.currency, rpcUrls: [CH.rpc], blockExplorerUrls: [CH.explorer] }] }).catch(() => {});
  }
}
$("#connectBtn").onclick = async () => {
  try {
    if (!window.ethereum) return window.open("https://metamask.io/download/", "_blank");
    const [a] = await window.ethereum.request({ method: "eth_requestAccounts" });
    wallet = { addr: a }; await ensureChain();
    $("#connectBtn").textContent = short(wallet.addr); toast("Wallet connected"); renderTok();
  } catch (e) { toast(e?.message?.slice(0, 80) || "Connection cancelled"); }
};
$("#addChainBtn").onclick = () => window.ethereum ? ensureChain().then(() => toast("Robinhood Chain ready")) : window.open("https://metamask.io/download/", "_blank");

/* ---------- games ---------- */
const GAMES = [
  { id: "dice",  name: "Dice",      ico: "🎲", c: "#ccff00", rtp: "99%", d: "Roll over or under your target." },
  { id: "flip",  name: "Coin Flip", ico: "🪙", c: "#f3ba2f", rtp: "99%", d: "Heads or tails, 1.98× payout." },
  { id: "crash", name: "Crash",     ico: "🚀", c: "#14f195", rtp: "99%", d: "Cash out before the rocket crashes." },
  { id: "mines", name: "Mines",     ico: "💎", c: "#3b7bff", rtp: "99%", d: "Find gems, dodge the mines." },
  { id: "wheel", name: "Wheel",     ico: "🎡", c: "#8a92ff", rtp: "98%", d: "Spin for up to 20×." },
  { id: "plinko",name: "Plinko",    ico: "🔻", c: "#ff4d6d", soon: 1, d: "Coming January 2027." },
  { id: "poker", name: "PvP Poker", ico: "🃏", c: "#14f195", soon: 1, d: "Coming February 2027." },
  { id: "race",  name: "Racing",    ico: "🏁", c: "#ccff00", soon: 1, d: "Coming February 2027." }
];
$("#gameGrid").innerHTML = GAMES.map(g => `<div class="card game${g.soon ? " soon" : ""}" data-g="${g.id}" style="--c:${g.c}">${g.rtp ? `<span class="rtp">RTP ${g.rtp}</span>` : `<span class="rtp">SOON</span>`}<div class="art">${g.ico}</div><div class="meta"><h3>${g.name}</h3><p>${g.d}</p></div></div>`).join("");
$("#gameGrid").onclick = e => { const g = e.target.closest(".game"); if (g && !g.classList.contains("soon")) open(g.dataset.g); };

let cur = null, busy = false;
const ctrl = $("#gCtrl"), stage = $("#gStage"), playBtn = $("#playBtn");
const seg = (name, opts, v) => `<div class="seg" data-s="${name}">${opts.map(o => `<button data-v="${o[0]}" class="${o[0] == v ? "on" : ""}">${o[1]}</button>`).join("")}</div>`;
ctrl.addEventListener("click", e => { const b = e.target.closest(".seg button"); if (!b) return; b.parentNode.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); cur?.onCtrl?.(); });
const segVal = n => ctrl.querySelector(`[data-s="${n}"] .on`)?.dataset.v;
document.querySelectorAll(".bet button").forEach(b => b.onclick = () => { const i = $("#betAmt"); i.value = Math.max(1, Math.floor(+i.value * +b.dataset.m)); });
function getBet() {
  const b = +$("#betAmt").value;
  if (!(b > 0)) { toast("Enter a bet amount"); return 0; }
  if (b > bal()) { toast("Insufficient balance"); return 0; }
  return b;
}

const G = {
  dice: {
    ui() {
      ctrl.innerHTML = `<label>Mode</label>${seg("mode", [["over", "Roll Over"], ["under", "Roll Under"]], "over")}<label>Target: <b id="tv">50</b></label><input type="range" id="tg" min="2" max="98" value="50"><label>Win chance / Payout</label><div id="dinfo" class="seed"></div>`;
      stage.innerHTML = `<div style="width:100%;max-width:460px;text-align:center"><div class="big-num" id="dn">00.00</div><div class="bar"><div class="w" id="dbar"></div><div class="m" id="dm" style="left:50%"></div></div></div>`;
      $("#tg").oninput = () => this.onCtrl(); this.onCtrl();
    },
    calc() { const t = +$("#tg").value, over = segVal("mode") === "over", ch = over ? 100 - t : t; return { t, over, ch, mult: 99 / ch }; },
    onCtrl() { const { t, over, ch, mult } = this.calc(); $("#tv").textContent = t; $("#dinfo").textContent = `${ch}% · ${mult.toFixed(4)}×`;
      $("#dbar").style.background = over ? `linear-gradient(90deg,#ff4d6d ${t}%,#14f195 ${t}%)` : `linear-gradient(90deg,#14f195 ${t}%,#ff4d6d ${t}%)`; },
    async play(bet) {
      const { t, over, mult } = this.calc(), r = Math.floor((await roll()) * 10000) / 100;
      $("#dn").textContent = r.toFixed(2).padStart(5, "0"); $("#dm").style.left = r + "%";
      const w = over ? r > t : r < t; $("#dn").style.color = w ? "var(--ac2)" : "var(--bad)";
      settle("Dice", bet, w ? mult : 0);
    }
  },
  flip: {
    ui() { ctrl.innerHTML = `<label>Pick a side</label>${seg("side", [["H", "Heads"], ["T", "Tails"]], "H")}`; stage.innerHTML = `<div class="coin" id="coin">5</div>`; this.rot = 0; },
    async play(bet) {
      const r = await roll(), res = r < .5 ? "H" : "T", c = $("#coin");
      this.rot += 1800 + (res === "T" ? 180 : 0) - (this.rot % 360);
      c.style.transform = `rotateY(${this.rot}deg)`;
      await new Promise(z => setTimeout(z, 1000)); c.textContent = res;
      c.style.transform = "rotateY(0)"; this.rot = 0;
      settle("Coin Flip", bet, res === segVal("side") ? 1.98 : 0);
    }
  },
  crash: {
    ui() { ctrl.innerHTML = `<label>Auto cash-out at (×)</label><input type="number" id="co" min="1.01" step="0.01" value="2.00">`; stage.innerHTML = `<canvas class="crash-c" id="cc"></canvas><div class="big-num" id="cx" style="position:absolute">1.00×</div>`; },
    async play(bet) {
      const target = Math.max(1.01, +$("#co").value || 2), r = await roll();
      const crash = Math.max(1, Math.floor(99 / (1 - r)) / 100);
      const cv = $("#cc"), ctx = cv.getContext("2d"); cv.width = cv.clientWidth * 2; cv.height = cv.clientHeight * 2;
      const stop = Math.min(crash, target), pts = []; let t0 = performance.now();
      await new Promise(done => {
        const step = now => {
          const s = (now - t0) / 1000, m = Math.min(stop, Math.pow(Math.E, .25 * s));
          pts.push(m); const max = Math.max(2, m * 1.15);
          ctx.clearRect(0, 0, cv.width, cv.height); ctx.lineWidth = 6; ctx.strokeStyle = "#14f195"; ctx.beginPath();
          pts.forEach((p, i) => { const x = (i / Math.max(60, pts.length)) * cv.width, y = cv.height - ((p - 1) / (max - 1)) * cv.height * .9; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
          $("#cx").textContent = m.toFixed(2) + "×";
          m >= stop ? done() : requestAnimationFrame(step);
        }; requestAnimationFrame(step);
      });
      const w = target <= crash;
      $("#cx").textContent = w ? `Cashed ${target.toFixed(2)}×` : `Crashed ${crash.toFixed(2)}×`; $("#cx").style.color = w ? "var(--ac2)" : "var(--bad)"; $("#cx").style.fontSize = "2.6rem";
      settle("Crash", bet, w ? target : 0);
    }
  },
  mines: {
    ui() {
      ctrl.innerHTML = `<label>Mines</label><select id="mc">${[1, 3, 5, 10, 24].map(n => `<option ${n === 3 ? "selected" : ""}>${n}</option>`).join("")}</select><label>Current multiplier</label><div class="seed" id="mmult">1.00×</div>`;
      stage.innerHTML = `<div class="mines" id="mg">${Array.from({ length: 25 }, (_, i) => `<button data-i="${i}" disabled></button>`).join("")}</div>`;
      this.live = false; playBtn.textContent = "Start";
      $("#mg").onclick = e => { const b = e.target.closest("button"); if (b && this.live && !b.disabled) this.pick(+b.dataset.i, b); };
    },
    async play(bet) {
      if (this.live) return this.cash();
      const n = +$("#mc").value, set = new Set();
      while (set.size < n) set.add(Math.floor((await roll()) * 25));
      Object.assign(this, { live: true, bet, n, set, k: 0, mult: 1 });
      stage.querySelectorAll(".mines button").forEach(b => { b.disabled = false; b.className = ""; b.textContent = ""; });
      $("#mmult").textContent = "1.00×"; $("#mMsg").textContent = ""; playBtn.textContent = "Cash out"; playBtn.disabled = true; busy = false;
    },
    pick(i, b) {
      b.disabled = true;
      if (this.set.has(i)) { b.className = "b"; b.textContent = "💣"; this.end(0); return; }
      b.className = "g"; b.textContent = "💎"; this.k++;
      this.mult *= (25 - this.k + 1) / (25 - this.n - this.k + 1); const m = this.mult * .99;
      $("#mmult").textContent = m.toFixed(2) + "×"; playBtn.disabled = false;
      if (this.k === 25 - this.n) this.cash();
    },
    cash() { this.end(this.mult * .99); },
    end(m) {
      this.live = false;
      stage.querySelectorAll(".mines button").forEach((b, i) => { if (this.set.has(i)) { b.textContent = "💣"; if (!b.className) b.style.opacity = .5; } b.disabled = true; });
      settle("Mines", this.bet, m);
      playBtn.textContent = "Start"; playBtn.disabled = false;
    }
  },
  wheel: {
    SEG: { low: [1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.5, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.5, 1.2, 0, 1.2, 1.2],
           mid: [0, 1.5, 0, 2, 0, 1.5, 0, 3, 0, 1.5, 0, 2, 0, 1.5, 0, 1.7, 0, 2, 0, 4],
           high:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19.6] },
    ui() { ctrl.innerHTML = `<label>Risk</label>${seg("risk", [["low", "Low"], ["mid", "Medium"], ["high", "High"]], "mid")}`; this.rot = 0; this.draw(); },
    onCtrl() { this.draw(); },
    col: m => m === 0 ? "#1f2636" : m < 1.5 ? "#3b7bff" : m < 2 ? "#14f195" : m < 4 ? "#f3ba2f" : "#ccff00",
    draw() {
      const s = this.SEG[segVal("risk") || "mid"], a = 360 / s.length;
      stage.innerHTML = `<div class="pointer"></div><div class="wheel" id="wh" style="background:conic-gradient(${s.map((m, i) => `${this.col(m)} ${i * a}deg ${(i + 1) * a - .6}deg,#07080c ${(i + 1) * a - .6}deg ${(i + 1) * a}deg`).join(",")})"></div><div class="big-num" id="wx" style="position:absolute;font-size:2.2rem">—</div>`;
    },
    async play(bet) {
      const s = this.SEG[segVal("risk")], a = 360 / s.length, idx = Math.floor((await roll()) * s.length);
      this.rot += 360 * 5 + (360 - (idx * a + a / 2)) - (this.rot % 360);
      $("#wh").style.transform = `rotate(${this.rot}deg)`; $("#wx").textContent = "";
      await new Promise(z => setTimeout(z, 4000));
      $("#wx").textContent = s[idx] + "×"; $("#wx").style.color = s[idx] ? "var(--ac2)" : "var(--bad)";
      settle("Wheel", bet, s[idx]);
    }
  }
};

function open(id) {
  cur = G[id]; $("#mTitle").textContent = GAMES.find(g => g.id === id).name + " · Robinhood Chain";
  $("#mMsg").textContent = ""; playBtn.textContent = "Play"; playBtn.disabled = false;
  cur.ui(); showSeed(); $("#modal").hidden = false;
}
playBtn.onclick = async () => {
  if (busy) return;
  if (cur === G.mines && cur.live) return cur.cash();
  const bet = getBet(); if (!bet) return;
  setBal(bal() - bet); // stake deducted; settle() adds payout
  busy = true; playBtn.disabled = true;
  try { await cur.play(bet); }
  finally { busy = false; if (!(cur === G.mines && cur.live)) playBtn.disabled = false; }
};
$("#closeModal").onclick = () => { if (G.mines.live) G.mines.cash(); $("#modal").hidden = true; };
$("#modal").onclick = e => { if (e.target.id === "modal") $("#closeModal").onclick(); };

window.ethereum?.on?.("chainChanged", renderTok);
window.ethereum?.on?.("accountsChanged", a => { if (wallet) { if (!a[0]) { wallet = null; $("#connectBtn").textContent = "Connect Wallet"; } else { wallet.addr = a[0]; $("#connectBtn").textContent = short(a[0]); } renderTok(); } });
renderBal(); renderStats(); renderTok();
})();

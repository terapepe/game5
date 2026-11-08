/* Game5 shared helpers: formatting, wallet, on-chain $GAME5 balance, native prices, CA widgets */
window.G5 = (() => {
  const C = window.GAME5_CONFIG;
  /* ---------- single / multi chain mode ---------- */
  const one = C.mode === "single" && C.chains.find(c => c.id === C.singleChain);
  if (one) C.chains = [one];
  const single = !!one;
  const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  // "on Robinhood" (single) · "across five chains" (multi)
  const across = () => single ? `on ${C.chains[0].name}` : `across ${WORDS[C.chains.length] || C.chains.length} chains`;
  const hasEvm = C.chains.some(c => c.id !== "sol"), hasSol = C.chains.some(c => c.id === "sol");
  function applyMode() {
    document.body.dataset.mode = single ? "single" : "multi";
    if (!single) return;
    const fill = s => s.replaceAll("{chain}", C.chains[0].name);
    document.querySelectorAll("[data-single]").forEach(el => el.textContent = fill(el.dataset.single));
    document.querySelectorAll("[data-single-html]").forEach(el => el.innerHTML = fill(el.dataset.singleHtml));
    document.querySelectorAll('[data-w="sol"]').forEach(el => el.hidden = !hasSol);
    document.querySelectorAll('[data-w="evm"]').forEach(el => el.hidden = !hasEvm);
  }
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const chain = id => C.chains.find(c => c.id === id);
  const active = t => !!chain(t.chain); // token is on an active chain
  const caOf = id => C.token.contracts[id === "sol" ? "sol" : "evm"];
  const short = a => a ? a.slice(0, 6) + "…" + a.slice(-4) : "";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const usd = (n, d = 2) => {
    if (n == null || isNaN(n)) return "—";
    const a = Math.abs(n);
    if (a >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (a >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (a >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
    if (a > 0 && a < 0.01) return "$" + n.toPrecision(3);
    return "$" + n.toFixed(d);
  };
  const num = n => n >= 1e9 ? (n / 1e9).toFixed(2) + "B" : n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : Math.round(n).toLocaleString("en-US");
  const pct = n => (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
  const ago = ts => { const s = (Date.now() - ts) / 1000; return s < 3600 ? Math.max(1, Math.floor(s / 60)) + "m" : s < 86400 ? Math.floor(s / 3600) + "h" : Math.floor(s / 86400) + "d"; };

  function toast(t) {
    let el = $("#toast"); if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
    el.textContent = t; el.classList.add("on"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on"), 2400);
  }
  const copy = (t, msg = "Copied") => navigator.clipboard.writeText(t).then(() => toast(msg));

  /* chain badge & token logo (SVG, generated from name) */
  const chainDot = id => { const c = chain(id); return `<span class="cdot" style="--c:${c.color}" title="${c.name}">${c.short}</span>`; };
  function hash(s) { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }
  function logo(t, size = 40) {
    const h = hash(t.ticker), h1 = h % 360, h2 = (h1 + 40 + (h >> 9) % 80) % 360;
    return `<span class="tlogo" style="width:${size}px;height:${size}px;background:linear-gradient(135deg,hsl(${h1} 85% 55%),hsl(${h2} 80% 40%));font-size:${size * .42}px">${t.icon || esc(t.ticker[0])}</span>`;
  }

  /* ---------- wallet ---------- */
  let wallet = null; const subs = [];
  const onWallet = f => { subs.push(f); f(wallet); };
  const setWallet = w => { wallet = w; try { sessionStorage.setItem("g5_w", JSON.stringify(w)); } catch {} subs.forEach(f => f(w)); };
  async function connect(kind = "evm") {
    try {
      if (kind === "sol") {
        const p = window.phantom?.solana || window.solana;
        if (!p) { window.open("https://phantom.app/", "_blank"); return null; }
        const r = await p.connect(); setWallet({ type: "sol", addr: r.publicKey.toString() });
      } else {
        if (!window.ethereum) { window.open("https://metamask.io/download/", "_blank"); return null; }
        const [a] = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWallet({ type: "evm", addr: a });
      }
      toast("Wallet connected"); return wallet;
    } catch (e) { toast(e?.message?.slice(0, 80) || "Connection cancelled"); return null; }
  }
  function disconnect() { setWallet(null); try { sessionStorage.removeItem("g5_w"); } catch {} }
  window.ethereum?.on?.("accountsChanged", a => { if (wallet?.type === "evm") a[0] ? setWallet({ type: "evm", addr: a[0] }) : disconnect(); });
  try { const w = JSON.parse(sessionStorage.getItem("g5_w")); if (w) wallet = w; } catch {}

  /* ---------- $GAME5 balance (read from public RPCs) ---------- */
  const rpcCall = (url, method, params) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) })
    .then(r => r.json()).then(r => { if (r.error) throw new Error(r.error.message); return r.result; });
  const units = (raw, dec) => Number(raw) / 10 ** dec;
  async function evmBalance(chainId, addr) {
    const ca = C.token.contracts.evm, url = C.rpc[chainId]; if (!ca || !url) return null;
    const [raw, dec] = await Promise.all([
      rpcCall(url, "eth_call", [{ to: ca, data: "0x70a08231" + addr.slice(2).toLowerCase().padStart(64, "0") }, "latest"]),
      rpcCall(url, "eth_call", [{ to: ca, data: "0x313ce567" }, "latest"])
    ]);
    if (!raw || raw === "0x") return 0;
    return units(BigInt(raw), Number(BigInt(dec)));
  }
  async function solBalance(addr) {
    const ca = C.token.contracts.sol; if (!ca) return null;
    const r = await rpcCall(C.rpc.sol, "getTokenAccountsByOwner", [addr, { mint: ca }, { encoding: "jsonParsed" }]);
    return (r?.value || []).reduce((s, a) => s + (a.account.data.parsed.info.tokenAmount.uiAmount || 0), 0);
  }
  // returns { total, perChain: {id: amount|null} } for the connected wallet
  async function game5Holdings(w = wallet) {
    if (!w) return null;
    const ids = w.type === "sol" ? ["sol"] : C.chains.filter(c => c.id !== "sol").map(c => c.id);
    const res = await Promise.all(ids.map(id => (id === "sol" ? solBalance(w.addr) : evmBalance(id, w.addr)).catch(() => null)));
    const perChain = Object.fromEntries(ids.map((id, i) => [id, res[i]]));
    return { total: res.reduce((s, v) => s + (v || 0), 0), perChain, ok: res.some(v => v != null) };
  }

  /* ---------- native coin prices (CoinGecko) ---------- */
  let pricesP = null;
  const prices = () => pricesP ??= fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin,solana&vs_currencies=usd")
    .then(r => r.json()).catch(() => ({}));

  /* ---------- $GAME5 CA widget ---------- */
  function caBlock(el, compact) {
    const { evm, sol } = C.token.contracts;
    const row = (label, a) => `<div class="ca-row"><span>${label}</span><code>${a ? (compact ? short(a) : a) : "Coming soon"}</code>${a ? `<button class="icon-btn" data-copy="${a}" title="Copy">⧉</button>` : ""}</div>`;
    el.innerHTML = (hasEvm ? row("EVM", evm) : "") + (hasSol ? row("SOL", sol) : "");
    el.onclick = e => { const b = e.target.closest("[data-copy]"); if (b) copy(b.dataset.copy, "Contract address copied"); };
  }
  const buyUrl = () => C.links.buy.replace("{ca}", C.token.contracts.evm);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyMode); else applyMode();

  return { C, single, across, hasEvm, hasSol, active, $, $$, chain, caOf, short, esc, usd, num, pct, ago, toast, copy, chainDot, logo, hash,
    connect, disconnect, onWallet, get wallet() { return wallet; }, game5Holdings, prices, caBlock, buyUrl };
})();

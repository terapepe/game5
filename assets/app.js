/* Game5 app: router + pages (Explore, Token, Create, Live Data, Docs) */
(() => {
const { C, $, $$, chain, short, esc, usd, num, pct, ago, toast, copy, chainDot, logo, caBlock, buyUrl } = G5;
const T = G5_TOKENS.filter(G5.active);
const page = $("#page");

/* ---------- shell ---------- */
caBlock($("#sideCA"), true);
$("#sideBuy").href = buyUrl();
$("#sideX").href = $("#topX").href = C.links.x;
$("#menuBtn").onclick = () => $("#app").classList.toggle("nav-open");
$("#side").addEventListener("click", e => { if (e.target.closest("a")) $("#app").classList.remove("nav-open"); });
$("#app").addEventListener("click", e => { if (e.target.id === "app" ) $("#app").classList.remove("nav-open"); });

const wModal = $("#wModal");
$("#evmChains").textContent = "MetaMask, Rabby, Coinbase · " + C.chains.filter(c => c.id !== "sol").map(c => c.short).join(", ");
$("#walletBtn").onclick = () => G5.wallet ? (G5.disconnect(), toast("Disconnected")) : (wModal.hidden = false);
wModal.onclick = async e => {
  const b = e.target.closest("[data-w]"); if (!b && e.target !== wModal) return;
  wModal.hidden = true;
  if (b && b.dataset.w !== "close") await G5.connect(b.dataset.w);
};
G5.onWallet(w => { $("#walletBtn").textContent = w ? (w.type === "sol" ? "◎ " : "") + short(w.addr) : "Connect Wallet"; $("#walletBtn").title = w ? "Click to disconnect" : ""; });

$("#q").addEventListener("input", () => { if (!location.hash.startsWith("#/explore")) location.hash = "#/explore"; else render(); });

/* ---------- router ---------- */
const routes = { explore: Explore, token: TokenPage, create: Create, live: Live, docs: Docs };
function render() {
  const [, r = "explore", arg] = location.hash.split("/");
  $$("#nav a").forEach(a => a.classList.toggle("on", a.dataset.r === r || (r === "token" && a.dataset.r === "explore")));
  (routes[r] || Explore)(arg);
  if (!render.keepScroll) window.scrollTo(0, 0);
  render.keepScroll = false;
}
window.addEventListener("hashchange", render);

/* ---------- shared bits ---------- */
const chg = n => `<span class="${n >= 0 ? "up" : "dn"}">${pct(n)}</span>`;
const price = p => p < 0.0001 ? "$" + p.toFixed(10).replace(/^0\.(0+)/, (m, z) => `0.0<sub>${z.length}</sub>`) : usd(p, 6);
const prog = t => `<span class="prog" title="${t.progress}% to graduation"><i style="width:${t.progress}%"></i></span>`;
function spark(series, w = 600, h = 300, fill = true) {
  const mn = Math.min(...series), mx = Math.max(...series), up = series.at(-1) >= series[0], col = up ? "#22d68a" : "#ff4d6d";
  const pts = series.map((v, i) => [i / (series.length - 1) * w, h - 8 - (v - mn) / (mx - mn || 1) * (h - 16)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("");
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" class="chart">${fill ? `<defs><linearGradient id="sg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".25"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs><path d="${d}L${w} ${h}L0 ${h}Z" fill="url(#sg)"/>` : ""}<path d="${d}" fill="none" stroke="${col}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}

/* ================= EXPLORE ================= */
const TABS = [
  ["liquidity", "Liquidity", t => t.liquidity],
  ["trending", "Trending", t => t.volume / (1 + (Date.now() - t.createdAt) / 864e5) * (1 + Math.max(t.change, -50) / 100)],
  ["mcap", "Market cap", t => t.mcap],
  ["new", "New", t => t.createdAt],
  ["volume", "Volume", t => t.volume],
  ["gainers", "Gainers", t => t.change]
];
const ex = { tab: "trending", chain: "all", view: "table" };
try { Object.assign(ex, JSON.parse(localStorage.getItem("g5_ex")) || {}); } catch {}
function Explore() {
  const q = $("#q").value.trim().toLowerCase();
  const key = TABS.find(t => t[0] === ex.tab)[2];
  let list = T.filter(t => (ex.chain === "all" || t.chain === ex.chain) && (!q || (t.name + " " + t.ticker + " " + t.ca + " " + t.genre).toLowerCase().includes(q)));
  list.sort((a, b) => key(b) - key(a));
  page.innerHTML = `
  <div class="ph"><div><h1>Explore <span class="badge">Testnet</span></h1><p>Game tokens launched on Game5 ${G5.across()}.</p></div><a class="btn ac" href="#/create">+ Launch a token</a></div>
  <div class="filters">
    <div class="tabs" id="tabs">${TABS.map(([k, l]) => `<button data-t="${k}" class="${k === ex.tab ? "on" : ""}">${l}</button>`).join("")}</div>
    <div class="vt"><div class="tabs">${[["table", "☰ List"], ["grid", "▦ Grid"]].map(([k, l]) => `<button data-v="${k}" class="${k === ex.view ? "on" : ""}">${l}</button>`).join("")}</div></div>
  </div>
  <div class="filters"><div class="chips" id="chips" ${G5.single ? "hidden" : ""}><button data-c="all" class="${ex.chain === "all" ? "on" : ""}">All chains</button>${C.chains.map(c => `<button data-c="${c.id}" class="${ex.chain === c.id ? "on" : ""}" style="--c:${c.color}"><i></i>${c.name}</button>`).join("")}</div>
  <span class="mut" style="font-size:.85rem">${list.length} tokens</span></div>
  ${!list.length ? `<div class="card empty">No tokens match “${esc(q)}”.</div>` : ex.view === "grid" ? grid(list) : table(list)}`;
  page.onclick = e => {
    const b = e.target.closest("[data-t],[data-c],[data-v]");
    if (b) { if (b.dataset.t) ex.tab = b.dataset.t; if (b.dataset.c) ex.chain = b.dataset.c; if (b.dataset.v) ex.view = b.dataset.v;
      try { localStorage.setItem("g5_ex", JSON.stringify(ex)); } catch {} render.keepScroll = true; return render(); }
    const r = e.target.closest("[data-id]"); if (r) location.hash = "#/token/" + r.dataset.id;
  };
}
const table = list => `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>Token</th><th>Chain</th><th>Price</th><th>24h</th><th>Market cap</th><th>Liquidity</th><th>Volume 24h</th><th>Holders</th><th>Age</th><th>Bonding</th></tr></thead><tbody>
  ${list.map((t, i) => `<tr data-id="${t.id}"><td class="mut">${i + 1}</td><td><div class="tk">${logo(t, 34)}<div><b>${esc(t.name)}</b><small>$${t.ticker} · ${t.genre}</small></div></div></td>
  <td>${chainDot(t.chain)}</td><td>${price(t.price)}</td><td>${chg(t.change)}</td><td>${usd(t.mcap)}</td><td>${usd(t.liquidity)}</td><td>${usd(t.volume)}</td><td>${num(t.holders)}</td><td class="mut">${ago(t.createdAt)}</td><td>${t.graduated ? `<span class="badge" style="color:var(--up);border-color:#22d68a55">DEX</span>` : prog(t)}</td></tr>`).join("")}</tbody></table></div>`;
const grid = list => `<div class="grid-cards">${list.map(t => `<a class="tcard" data-id="${t.id}">
  <div class="top">${logo(t, 46)}<div><b>${esc(t.name)}</b><small>$${t.ticker} · ${t.genre} · ${t.platform}</small></div></div>
  <div style="height:54px">${spark(t.series, 300, 54, false)}</div>
  <div class="row"><span>${chainDot(t.chain)}</span>${chg(t.change)}</div>
  <div class="row"><span>MC <b>${usd(t.mcap)}</b></span><span>Liq <b>${usd(t.liquidity)}</b></span></div>
  <div class="row"><span>Vol <b>${usd(t.volume)}</b></span><span>${t.graduated ? `<span class="badge" style="color:var(--up);border-color:#22d68a55">DEX</span>` : prog(t)}</span></div></a>`).join("")}</div>`;

/* ================= TOKEN ================= */
const ICONS = {
  website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13 1.4 11.5c-1-.3-1-1 .2-1.5L20.5 2.8c.9-.3 1.6.2 1.4 1.5z"/></svg>',
  discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 5.3A17 17 0 0 0 15.8 4l-.5 1a15.7 15.7 0 0 0-6.6 0L8.2 4A17 17 0 0 0 4 5.3C1.4 9.2.7 13 1 16.8A17 17 0 0 0 6.2 19.4l1.1-1.8a11 11 0 0 1-1.7-.8l.4-.3a12 12 0 0 0 12 0l.4.3-1.7.8 1.1 1.8A17 17 0 0 0 23 16.8c.4-4.4-.7-8.2-3-11.5zM8.5 14.5c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1zm7 0c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15V9l5.8 3z"/></svg>',
  apple: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.7 2.2-4 2.3-4.1-1.3-1.8-3.2-2.1-3.9-2.1-1.7-.2-3.2 1-4.1 1s-2.2-1-3.6-.9c-1.8 0-3.5 1.1-4.5 2.7-1.9 3.3-.5 8.3 1.4 11 .9 1.3 2 2.8 3.4 2.8 1.4-.1 1.9-.9 3.5-.9s2.1.9 3.6.9 2.4-1.4 3.3-2.7c1-1.5 1.5-3 1.5-3.1-.1 0-2.9-1.1-2.9-4.6zM13.7 4.5c.8-.9 1.3-2.2 1.1-3.5-1.1 0-2.4.7-3.2 1.7-.7.8-1.3 2.1-1.2 3.3 1.3.1 2.5-.6 3.3-1.5z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path fill="#34a853" d="M3.6 1.8 13.8 12 3.6 22.2c-.4-.2-.6-.7-.6-1.2V3c0-.5.2-1 .6-1.2z"/><path fill="#fbbc04" d="m17.2 15.4-3.4-3.4 3.4-3.4 4 2.3c1.1.6 1.1 1.6 0 2.2z"/><path fill="#ea4335" d="M17.2 15.4 13.8 12 3.6 22.2c.4.2.9.2 1.5-.1z"/><path fill="#4285f4" d="M17.2 8.6 5.1 1.9c-.6-.3-1.1-.3-1.5-.1L13.8 12z"/></svg>'
};
const SOC = [["website", "Website"], ["x", "X"], ["telegram", "Telegram"], ["discord", "Discord"], ["youtube", "YouTube"]];
const storeBtns = l => (l.appStore ? `<a href="${esc(l.appStore)}" target="_blank" rel="noopener">${ICONS.apple}<span><small>Download on the</small><b>App Store</b></span></a>` : "")
  + (l.googlePlay ? `<a href="${esc(l.googlePlay)}" target="_blank" rel="noopener">${ICONS.play}<span><small>GET IT ON</small><b>Google Play</b></span></a>` : "");
function TokenPage(id) {
  const t = T.find(x => x.id === id);
  if (!t) { page.innerHTML = `<div class="card empty">Token not found. <a class="btn ghost" href="#/explore" style="margin-left:10px">Back to Explore</a></div>`; return; }
  const c = chain(t.chain), ex = c.explorer + (t.chain === "sol" ? "/token/" : "/token/") + t.ca;
  page.innerHTML = `
  <a href="#/explore" class="mut" style="font-size:.88rem">← Explore</a>
  <div class="tok-head" style="margin-top:14px">${logo(t, 64)}<div><h1>${esc(t.name)} <span class="mut" style="font-weight:400">$${t.ticker}</span></h1>
    <div class="meta">${chainDot(t.chain)}<span>${t.genre}</span>·<span>${t.platform}</span>·<span>Launched ${ago(t.createdAt)} ago</span><span class="badge">Testnet</span></div></div>
    <div style="margin-left:auto;text-align:right"><div style="font-size:1.8rem;font-weight:600;letter-spacing:-.02em">${price(t.price)}</div>${chg(t.change)} <span class="mut" style="font-size:.85rem">24h</span></div></div>
  <div class="tok-grid">
    <div>
      <div class="card" style="padding:16px 16px 8px"><h3>Price <small>last 24h</small></h3>${spark(t.series)}</div>
      <div class="kv"><div><span>Market cap</span><b>${usd(t.mcap)}</b></div><div><span>Liquidity</span><b>${usd(t.liquidity)}</b></div><div><span>Volume 24h</span><b>${usd(t.volume)}</b></div><div><span>Holders</span><b>${num(t.holders)}</b></div>
        <div><span>Transactions 24h</span><b>${num(t.txns)}</b></div><div><span>Total supply</span><b>1B</b></div><div><span>FDV</span><b>${usd(t.mcap)}</b></div><div><span>Bonding</span><b>${t.graduated ? "Graduated" : t.progress + "%"}</b></div></div>
      <div class="card" style="margin-top:14px"><h3>About ${esc(t.name)}</h3><p class="mut">${esc(t.description)}</p>
        ${storeBtns(t.links) ? `<h3 style="margin-top:20px">Play the game</h3><div class="store">${storeBtns(t.links)}</div>` : ""}
        <h3 style="margin-top:20px">Links</h3><div class="links-row">${SOC.filter(([k]) => t.links[k]).map(([k, l]) => `<a href="${esc(t.links[k])}" target="_blank" rel="noopener">${ICONS[k]}${l}</a>`).join("")}</div></div>
    </div>
    <div style="display:grid;gap:14px;align-content:start">
      <div class="card trade">
        <div class="seg"><button class="b on" data-s="buy">Buy</button><button class="s" data-s="sell">Sell</button></div>
        <div class="field"><label>Amount <em id="balLbl">${c.native}</em></label><div class="inp-g"><input class="inp" id="amt" type="number" min="0" placeholder="0.0"><span id="unit">${c.native}</span></div></div>
        <div class="quick" id="quick">${["0.01", "0.05", "0.1", "0.5"].map(v => `<button data-q="${v}">${v}</button>`).join("")}</div>
        <div class="row-sb"><span>You receive</span><b id="recv">0 ${t.ticker}</b></div>
        <div class="row-sb"><span>Slippage</span><b>2%</b></div>
        <button class="btn ac" style="width:100%;margin-top:12px" id="tradeBtn">${G5.wallet ? "Buy $" + t.ticker : "Connect Wallet"}</button>
      </div>
      <div class="card"><h3>Bonding curve <small>${t.graduated ? "graduated to DEX" : t.progress + "%"}</small></h3>
        <div class="prog" style="width:100%;height:10px"><i style="width:${t.progress}%"></i></div>
        <p class="mut" style="font-size:.84rem;margin-top:10px">${t.graduated ? "Liquidity migrated to the DEX and is locked." : `When market cap reaches $69K, liquidity migrates to the DEX. ${usd(Math.max(0, 69000 - t.mcap))} to go.`}</p></div>
      <div class="card"><h3>Contract</h3>
        <div class="ca-row"><span>CA</span><code>${t.ca}</code><button class="icon-btn" data-copy="${t.ca}">⧉</button></div>
        <div class="ca-row"><span>DEV</span><code>${t.creator}</code><button class="icon-btn" data-copy="${t.creator}">⧉</button></div>
        <div class="row-sb" style="margin-top:6px"><span>Network</span><b>${c.name} testnet</b></div></div>
    </div>
  </div>`;
  let side = "buy";
  let natPx = null; G5.prices().then(p => { natPx = p[c.cg]?.usd; upd(); });
  const upd = () => { const a = +$("#amt")?.value || 0; if (!$("#recv")) return;
    $("#recv").textContent = side === "buy" ? (natPx ? num(a * natPx / t.price) + " " + t.ticker : "—") : (natPx ? (a * t.price / natPx).toPrecision(3) + " " + c.native : "—"); };
  $("#amt").oninput = upd;
  page.onclick = e => {
    const cp = e.target.closest("[data-copy]"); if (cp) return copy(cp.dataset.copy, "Address copied");
    const q = e.target.closest("[data-q]"); if (q) { $("#amt").value = q.dataset.q; return upd(); }
    const s = e.target.closest("[data-s]");
    if (s) { side = s.dataset.s; $$(".trade .seg button").forEach(b => b.classList.toggle("on", b === s));
      $("#unit").textContent = side === "buy" ? c.native : t.ticker; $("#quick").style.display = side === "buy" ? "" : "none";
      $("#tradeBtn").textContent = G5.wallet ? (side === "buy" ? "Buy $" : "Sell $") + t.ticker : "Connect Wallet"; upd(); }
    if (e.target.id === "tradeBtn") {
      if (!G5.wallet) return (wModal.hidden = false);
      if (!(+$("#amt").value > 0)) return toast("Enter an amount");
      toast("Trading on " + c.name + " opens at mainnet launch");
    }
  };
}

/* ================= CREATE ================= */
const GENRES = ["Action", "Adventure", "Arcade", "Card", "Casual", "Fighting", "Horror", "Idle", "Puzzle", "Racing", "RPG", "Sandbox", "Shooter", "Simulation", "Sports", "Strategy", "Other"];
const PLATFORMS = ["Mobile", "PC", "Web", "Console"];
const draft = { chain: C.chains.some(c => c.id === "base") ? "base" : C.chains[0].id };
function Create() {
  const L = C.launch;
  page.innerHTML = `
  <div class="ph"><div><h1>Create a token</h1><p>Launch your game token in under a minute. Fixed 1,000,000,000 supply, fair bonding curve, no presale.</p></div></div>
  <div class="create-grid">
    <form id="cf" autocomplete="off" novalidate>
      <div class="card form-sec"><h3><i>01</i>Chain</h3>
        <div class="chain-pick" id="cpick">${C.chains.map(c => `<button type="button" data-ch="${c.id}" style="--c:${c.color}" class="${draft.chain === c.id ? "on" : ""}"><i>${c.short}</i>${c.name}</button>`).join("")}</div></div>

      <div class="card form-sec"><h3><i>02</i>Token details</h3>
        <div class="field"><label>Logo <em>PNG, JPG, GIF or WEBP · max 4MB · square</em></label>
          <div class="upload"><label class="pv" id="logoPv">Upload<br>logo<input type="file" id="logo" accept="image/png,image/jpeg,image/gif,image/webp" hidden></label>
          <div class="mut" style="font-size:.84rem">Your logo is shown on Explore, your token page and in wallets. 512×512 or larger recommended.</div></div></div>
        <div class="two"><div class="field"><label>Token name *</label><input class="inp" name="name" maxlength="32" placeholder="Pixel Raiders"></div>
        <div class="field"><label>Ticker *<em>2–10 letters</em></label><div class="inp-g"><span style="padding-left:12px">$</span><input class="inp" name="ticker" maxlength="10" placeholder="PXR" style="text-transform:uppercase"></div></div></div>
        <div class="field"><label>Description *<em><span id="dc">0</span>/500</em></label><textarea class="inp" name="description" maxlength="500" placeholder="What is the game, and what does the token do in it?"></textarea></div>
        <div class="field"><label>Banner <em>optional · 1500×500</em></label><label class="banner-up" id="banPv">Upload banner<input type="file" id="banner" accept="image/*" hidden></label></div></div>

      <div class="card form-sec"><h3><i>03</i>Game info</h3>
        <div class="two"><div class="field"><label>Genre *</label><select class="inp" name="genre"><option value="">Select genre</option>${GENRES.map(g => `<option>${g}</option>`).join("")}</select></div>
        <div class="field"><label>Game status *</label><select class="inp" name="status"><option>Live</option><option>Beta / Early access</option><option>In development</option></select></div></div>
        <div class="field"><label>Platforms *</label><div class="chips" id="plats">${PLATFORMS.map(p => `<button type="button" data-p="${p}">${p}</button>`).join("")}</div></div>
        <div class="field"><label>Gameplay trailer <em>optional · YouTube link</em></label><input class="inp" name="trailer" placeholder="https://youtube.com/watch?v=…"></div></div>

      <div class="card form-sec"><h3><i>04</i>Links</h3>
        <div class="two">
          <div class="field"><label>App Store</label><input class="inp" name="appStore" placeholder="https://apps.apple.com/app/…"></div>
          <div class="field"><label>Google Play</label><input class="inp" name="googlePlay" placeholder="https://play.google.com/store/apps/details?id=…"></div>
          <div class="field"><label>Website</label><input class="inp" name="website" placeholder="https://yourgame.com"></div>
          <div class="field"><label>X (Twitter)</label><input class="inp" name="x" placeholder="https://x.com/yourgame"></div>
          <div class="field"><label>Telegram</label><input class="inp" name="telegram" placeholder="https://t.me/yourgame"></div>
          <div class="field"><label>Discord</label><input class="inp" name="discord" placeholder="https://discord.gg/…"></div>
          <div class="field"><label>YouTube</label><input class="inp" name="youtube" placeholder="https://youtube.com/@yourgame"></div>
          <div class="field"><label>Steam / Epic / other store</label><input class="inp" name="otherStore" placeholder="https://store.steampowered.com/app/…"></div>
        </div></div>

      <div class="card form-sec"><h3><i>05</i>Launch settings</h3>
        <div class="field"><label>Initial buy <em>optional · be the first holder</em></label><div class="inp-g"><input class="inp" name="initialBuy" type="number" min="0" step="any" placeholder="0"><span id="ibUnit"></span></div></div>
        <div class="row-sb"><span>Total supply</span><b>${L.totalSupply.toLocaleString("en-US")}</b></div>
        <div class="row-sb"><span>Bonding curve</span><b>Graduates at $69K market cap</b></div>
        <div class="row-sb"><span>LP after graduation</span><b>Burned & locked</b></div>
        <div class="row-sb"><span>Mint / freeze authority</span><b>Revoked</b></div></div>
    </form>

    <div class="preview-card">
      <div class="card">
        <h3>Launch fee</h3>
        <div id="feeBox"></div>
        <h3 style="margin-top:6px">Preview</h3>
        <div class="tcard" style="margin-bottom:14px" id="pv"></div>
        <div class="row-sb"><span>Network</span><b id="sumChain"></b></div>
        <div class="row-sb"><span>Launch fee</span><b id="sumFee">—</b></div>
        <div class="row-sb"><span>Initial buy</span><b id="sumIb">0</b></div>
        <label class="chk"><input type="checkbox" id="agree">I confirm this token is for a real game I own or represent, and I accept the Game5 terms.</label>
        <button class="btn ac" style="width:100%" id="launchBtn">Launch token</button>
      </div>
    </div>
  </div>`;
  const f = $("#cf"), el = n => f.elements[n];
  const plats = new Set(draft.plats || []);
  for (const k in draft) if (el(k) && typeof draft[k] === "string") el(k).value = draft[k];
  $$("#plats button").forEach(b => b.classList.toggle("on", plats.has(b.dataset.p)));
  const imgs = { logo: draft.logoUrl, banner: draft.bannerUrl };
  const setPv = () => {
    if (imgs.logo) { $("#logoPv").style.backgroundImage = `url(${imgs.logo})`; $("#logoPv").firstChild.textContent = ""; }
    if (imgs.banner) { $("#banPv").style.backgroundImage = `url(${imgs.banner})`; $("#banPv").firstChild.textContent = ""; }
  };
  setPv();
  const preview = () => {
    const c = chain(draft.chain), name = el("name").value.trim() || "Your game", tk = el("ticker").value.trim().toUpperCase() || "TICKER";
    const lg = imgs.logo ? `<span class="tlogo" style="width:46px;height:46px;background:center/cover url(${imgs.logo})"></span>` : logo({ ticker: tk, icon: esc(tk[0]) }, 46);
    $("#pv").innerHTML = `<div class="top">${lg}<div><b>${esc(name)}</b><small>$${esc(tk)} · ${esc(el("genre").value || "Genre")} · ${[...plats].join(", ") || "Platform"}</small></div></div>
      <div class="row"><span>${chainDot(c.id)}</span><span class="badge">New</span></div>
      <div class="mut" style="font-size:.82rem">${esc(el("description").value.slice(0, 120)) || "Your description appears here."}</div>
      <div class="store" style="transform:scale(.8);transform-origin:left">${storeBtns({ appStore: el("appStore").value, googlePlay: el("googlePlay").value })}</div>`;
    $("#sumChain").textContent = c.name; $("#ibUnit").textContent = c.native;
    $("#sumIb").textContent = (+el("initialBuy").value || 0) + " " + c.native;
    $("#dc").textContent = el("description").value.length;
  };
  f.addEventListener("input", e => { if (e.target.name) draft[e.target.name] = e.target.value; preview(); });
  f.addEventListener("click", e => {
    const ch = e.target.closest("[data-ch]");
    if (ch) { draft.chain = ch.dataset.ch; $$("#cpick button").forEach(b => b.classList.toggle("on", b === ch)); preview(); fee(); }
    const p = e.target.closest("[data-p]");
    if (p) { plats.has(p.dataset.p) ? plats.delete(p.dataset.p) : plats.add(p.dataset.p); p.classList.toggle("on"); draft.plats = [...plats]; preview(); }
  });
  for (const k of ["logo", "banner"]) $("#" + k).onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 4 * 1024 * 1024) return toast("Max file size is 4MB");
    const rd = new FileReader(); rd.onload = () => { imgs[k] = draft[k + "Url"] = rd.result; setPv(); preview(); }; rd.readAsDataURL(file);
  };
  preview(); fee();

  $("#launchBtn").onclick = () => {
    const err = [];
    if (!G5.wallet) return (wModal.hidden = false);
    const needSol = draft.chain === "sol";
    if (needSol !== (G5.wallet.type === "sol")) err.push(`Connect a ${needSol ? "Solana" : "EVM"} wallet to launch on ${chain(draft.chain).name}`);
    if (!imgs.logo) err.push("Upload a logo");
    if (el("name").value.trim().length < 2) err.push("Enter a token name");
    if (!/^[A-Za-z0-9]{2,10}$/.test(el("ticker").value.trim())) err.push("Ticker must be 2–10 letters or numbers");
    if (T.some(t => t.ticker === el("ticker").value.trim().toUpperCase() && t.chain === draft.chain)) err.push("Ticker already exists on this chain");
    if (el("description").value.trim().length < 20) err.push("Description needs at least 20 characters");
    if (!el("genre").value) err.push("Choose a genre");
    if (!plats.size) err.push("Choose at least one platform");
    for (const n of ["appStore", "googlePlay", "website", "x", "telegram", "discord", "youtube", "otherStore", "trailer"]) { const v = el(n).value.trim(); if (v && !/^https:\/\/\S+\.\S+/.test(v)) err.push(`${el(n).closest(".field").querySelector("label").firstChild.textContent.trim()} must be an https:// link`); }
    if (!$("#agree").checked) err.push("Accept the terms");
    if (err.length) return toast(err[0]);
    toast(`$${el("ticker").value.trim().toUpperCase()} is ready — contract deployment opens at mainnet launch`);
  };
}
let feeSeq = 0;
const FEE_USD = +(C.launch.feeUsdMin + Math.random() * (C.launch.feeUsdMax - C.launch.feeUsdMin)).toFixed(2);
async function fee() {
  const box = $("#feeBox"); if (!box) return;
  const L = C.launch, c = chain(draft.chain), seq = ++feeSeq, w = G5.wallet;
  const pr = await G5.prices(), p = pr[c.cg]?.usd;
  const nat = p ? (FEE_USD / p).toPrecision(2) + " " + c.native : "";
  const paidLine = `<div class="amt">${nat || "$" + FEE_USD.toFixed(2)}</div><p>≈ $${FEE_USD.toFixed(2)} paid in ${c.native} on ${c.name}${p ? ` · 1 ${c.native} = ${usd(p)}` : ""}</p>`;
  if (!w) {
    box.innerHTML = `<div class="fee-box"><h4>🔌 Connect wallet to check your $GAME5</h4><p>Hold ${num(L.holdForFree)} $GAME5 and launching is free.</p>${paidLine}<button class="btn ghost" style="margin-top:12px;width:100%" id="feeConnect">Connect Wallet</button></div>`;
    $("#feeConnect").onclick = () => wModal.hidden = false;
    $("#sumFee").textContent = nat || "$" + FEE_USD.toFixed(2); return;
  }
  box.innerHTML = `<div class="fee-box"><h4>Checking your $GAME5 balance…</h4><p>${short(w.addr)}</p></div>`;
  const h = await G5.game5Holdings(w).catch(() => null);
  if (seq !== feeSeq || !$("#feeBox")) return;
  const per = h ? Object.entries(h.perChain).map(([id, v]) => `<div class="row-sb"><span>${chain(id).name}</span><b>${v == null ? "—" : num(v)}</b></div>`).join("") : "";
  if (h && h.total >= L.holdForFree) {
    box.innerHTML = `<div class="fee-box free"><h4>✅ You are holding ${num(h.total)} $GAME5</h4><p>You hold at least ${num(L.holdForFree)} $GAME5 — creating tokens is <b style="color:var(--up)">free</b>.</p><div class="amt up">Free</div>${per}</div>`;
    $("#sumFee").innerHTML = `<span class="up">Free</span>`;
  } else {
    const msg = !h || !h.ok ? "Couldn't read your $GAME5 balance right now." : `You hold ${num(h.total)} $GAME5 — ${num(L.holdForFree - h.total)} more for free launches.`;
    box.innerHTML = `<div class="fee-box paid"><h4>💳 Launch fee applies</h4><p>${msg}</p>${paidLine}${per}<a class="btn ghost" style="margin-top:12px;width:100%" href="${buyUrl()}" target="_blank" rel="noopener">Buy $GAME5 to launch free</a></div>`;
    $("#sumFee").textContent = nat || "$" + FEE_USD.toFixed(2);
  }
}
G5.onWallet(() => { if (location.hash.startsWith("#/create")) fee(); if (location.hash.startsWith("#/token")) render.keepScroll = true, render(); });

/* ================= LIVE DATA ================= */
function Live() {
  const sum = (k, l = T) => l.reduce((s, t) => s + t[k], 0);
  const grad = T.filter(t => t.graduated).length;
  const byChain = C.chains.map(c => { const l = T.filter(t => t.chain === c.id); return { c, n: l.length, vol: sum("volume", l), liq: sum("liquidity", l), mc: sum("mcap", l) }; });
  const genres = Object.entries(T.reduce((m, t) => (m[t.genre] = (m[t.genre] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const B = 3 * 36e5, days = Array.from({ length: 24 }, (_, i) => { const end = Date.now() - (23 - i) * B, st = end - B; return { d: new Date(end), n: T.filter(t => t.createdAt > st && t.createdAt <= end).length }; });
  const maxD = Math.max(1, ...days.map(d => d.n));
  const top = (k, dir = 1) => [...T].sort((a, b) => dir * (b[k] - a[k])).slice(0, 5);
  const bars = (rows, val, fmt) => { const mx = Math.max(...rows.map(val)); return `<div class="bars">${rows.map(r => `<div class="b"><span>${r.label}</span><span class="t"><i style="width:${val(r) / mx * 100}%;--c:${r.color || "var(--ac)"}"></i></span><span>${fmt(val(r))}</span></div>`).join("")}</div>`; };
  const li = t => `<li data-id="${t.id}" style="cursor:pointer">${logo(t, 28)}<b>${esc(t.name)}</b>${chainDot(t.chain)}`;
  page.innerHTML = `
  <div class="ph"><div><h1>Live Data <span class="badge">Testnet</span></h1><p>Platform statistics ${G5.across()}.</p></div><span class="mut" style="font-size:.85rem" id="upd"></span></div>
  <div class="kpis">
    ${[["Tokens launched", T.length, `${T.filter(t => Date.now() - t.createdAt < 864e5).length} in 24h`], ["Volume 24h", usd(sum("volume")), `${num(sum("txns"))} txns`], ["Total liquidity", usd(sum("liquidity")), G5.across()], ["Total market cap", usd(sum("mcap")), "all tokens"],
       ["Holders", num(sum("holders")), "unique wallets"], ["Graduated", grad, `${(grad / T.length * 100).toFixed(0)}% of tokens`], ["Avg. bonding progress", (sum("progress") / T.length).toFixed(0) + "%", "non-graduated incl."], ["Top gainer 24h", pct(top("change")[0].change), "$" + top("change")[0].ticker]]
      .map(([k, v, s]) => `<div class="card kpi"><span>${k}</span><b>${v}</b><small class="mut">${s}</small></div>`).join("")}
  </div>
  <div class="ld-grid">
    <div class="card"><h3>Tokens launched <small>last 72h · 3h intervals</small></h3>
      <div class="cols">${days.map(d => `<div style="height:${d.n / maxD * 100}%" title="${d.d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric" })}: ${d.n} tokens"></div>`).join("")}</div>
      <div class="cols-x"><span>72h ago</span><span>48h</span><span>24h</span><span>Now</span></div></div>
    <div class="card"><h3>Volume by chain <small>24h</small></h3>${bars(byChain.map(b => ({ ...b, label: b.c.name, color: b.c.color })), r => r.vol, usd)}
      <h3 style="margin-top:22px">Liquidity by chain</h3>${bars(byChain.map(b => ({ ...b, label: b.c.name, color: b.c.color })), r => r.liq, usd)}</div>
  </div>
  <div class="ld-grid">
    <div class="card"><h3>Tokens by chain</h3>
      <div class="tbl-wrap" style="border:0"><table class="tbl"><thead><tr><th>Chain</th><th>Tokens</th><th>Market cap</th><th>Liquidity</th><th>Volume 24h</th><th>Native price</th></tr></thead><tbody id="chainTbl">
      ${byChain.map(b => `<tr style="cursor:default"><td>${chainDot(b.c.id)} ${b.c.name}</td><td>${b.n}</td><td>${usd(b.mc)}</td><td>${usd(b.liq)}</td><td>${usd(b.vol)}</td><td data-cg="${b.c.cg}" class="mut">…</td></tr>`).join("")}</tbody></table></div></div>
    <div class="card"><h3>Top genres</h3>${bars(genres.map(([g, n]) => ({ label: g, n })), r => r.n, n => n + " tokens")}</div>
  </div>
  <div class="ld-grid" style="grid-template-columns:1fr 1fr 1fr">
    <div class="card"><h3>Top gainers</h3><ul class="feed">${top("change").map(t => li(t) + `<span class="t">${chg(t.change)}</span></li>`).join("")}</ul></div>
    <div class="card"><h3>Top volume</h3><ul class="feed">${top("volume").map(t => li(t) + `<span class="t">${usd(t.volume)}</span></li>`).join("")}</ul></div>
    <div class="card"><h3>Latest launches</h3><ul class="feed">${top("createdAt").map(t => li(t) + `<span class="t">${ago(t.createdAt)} ago</span></li>`).join("")}</ul></div>
  </div>`;
  page.onclick = e => { const r = e.target.closest("[data-id]"); if (r) location.hash = "#/token/" + r.dataset.id; };
  G5.prices().then(p => { $$("#chainTbl [data-cg]").forEach(td => { const v = p[td.dataset.cg]?.usd; td.textContent = v ? usd(v) : "—"; }); if ($("#upd")) $("#upd").textContent = "Native prices: CoinGecko · " + new Date().toLocaleTimeString(); });
  if (window.innerWidth < 1100) $$(".ld-grid").forEach(g => g.style.gridTemplateColumns = "");
}

/* ================= DOCS ================= */
function Docs() {
  const L = C.launch, { evm, sol } = C.token.contracts;
  const S = [
    ["intro", "Introduction", `<p>Game5 is a token launchpad built only for games. Studios and indie developers launch a token for their game in under a minute on <b>Ethereum, Base, Robinhood Chain, BNB Chain or Solana</b>, with the game's genre, platforms and App Store / Google Play links attached to the token from day one.</p>
      <p>Players discover games on <a href="#/explore" style="color:var(--ac)">Explore</a>, trade tokens on a fair bonding curve, and follow each game through to DEX listing.</p>
      <div class="callout"><p>Game5 is currently running on <b>testnet</b>. Tokens shown in the app are testnet launches.</p></div>`],
    ["start", "Getting started", `<ol><li>Install an EVM wallet (MetaMask, Rabby, Coinbase Wallet) for Ethereum, Base, Robinhood and BNB Chain, or Phantom / Solflare for Solana.</li>
      <li>Fund it with the chain's native coin (ETH, BNB or SOL) for gas and the launch fee.</li><li>Open the app and click <b>Connect Wallet</b> in the top right.</li>
      <li>Go to <a href="#/create" style="color:var(--ac)">Create Token</a>.</li></ol>`],
    ["create", "Creating a token", `<p>Every token on Game5 has the same fair setup: fixed supply, no presale, no team allocation.</p>
      <table><tr><th>Field</th><th>Required</th><th>Notes</th></tr>
      <tr><td>Chain</td><td>Yes</td><td>Ethereum, Base, Robinhood, BNB Chain or Solana</td></tr>
      <tr><td>Logo</td><td>Yes</td><td>PNG/JPG/GIF/WEBP, square, max 4MB</td></tr>
      <tr><td>Name / Ticker</td><td>Yes</td><td>Ticker 2–10 letters or numbers, unique per chain</td></tr>
      <tr><td>Description</td><td>Yes</td><td>20–500 characters</td></tr>
      <tr><td>Genre, status, platforms</td><td>Yes</td><td>Shown on Explore and the token page</td></tr>
      <tr><td>App Store / Google Play</td><td>No</td><td>Shown as download buttons on the token page</td></tr>
      <tr><td>Website, X, Telegram, Discord, YouTube, other store</td><td>No</td><td>Must be https:// links</td></tr>
      <tr><td>Banner, trailer</td><td>No</td><td>Banner 1500×500, YouTube trailer link</td></tr>
      <tr><td>Initial buy</td><td>No</td><td>Buy your own token in the same transaction</td></tr></table>`],
    ["fees", "Fees & $GAME5 benefit", `<div class="callout"><p>Hold <b>${num(L.holdForFree)} $GAME5</b> or more in the connected wallet and creating tokens is <b>free</b>.</p></div>
      <p>The Create page reads your $GAME5 balance directly from the blockchain when you connect. An EVM wallet is checked on Ethereum, Base, Robinhood and BNB Chain combined; a Solana wallet is checked on Solana.</p>
      <table><tr><th>Item</th><th>Fee</th></tr><tr><td>Launch (≥ 10M $GAME5)</td><td>Free</td></tr><tr><td>Launch (everyone else)</td><td>$${L.feeUsdRange}, paid in ETH, BNB or SOL</td></tr>
      <tr><td>Trading on the bonding curve</td><td>1% per trade</td></tr><tr><td>Graduation to DEX</td><td>No fee for the creator</td></tr></table>
      <p>The launch fee in native coin is calculated from the live market price at the time you launch.</p>`],
    ["curve", "Bonding curve & graduation", `<p>Every token starts on a bonding curve: price rises as people buy and falls as they sell. There is no presale and no team allocation — the creator buys like everyone else (optional initial buy).</p>
      <ul><li>Total supply: <b>1,000,000,000</b> tokens.</li><li>Graduation: at <b>$69K market cap</b> the token graduates.</li><li>On graduation, liquidity migrates to a DEX on the same chain; LP tokens are burned and locked.</li><li>Mint and freeze authority are revoked at launch.</li></ul>`],
    ["chains", "Supported chains", `<table><tr><th>Chain</th><th>Native coin</th><th>Wallet</th><th>Explorer</th></tr>${C.chains.map(c => `<tr><td>${c.name}</td><td>${c.native}</td><td>${c.id === "sol" ? "Phantom, Solflare" : "MetaMask, Rabby, Coinbase"}</td><td><a href="${c.explorer}" target="_blank" rel="noopener" style="color:var(--ac)">${c.explorer.replace("https://", "")}</a></td></tr>`).join("")}</table>`],
    ["explore", "Explore & trading", `<p>Explore lists every game token with six sort tabs:</p>
      <table><tr><th>Tab</th><th>Sorted by</th></tr><tr><td>Liquidity</td><td>Liquidity in the pool</td></tr><tr><td>Trending</td><td>24h volume weighted by recency and price momentum</td></tr><tr><td>Market cap</td><td>Price × circulating supply</td></tr><tr><td>New</td><td>Launch time, newest first</td></tr><tr><td>Volume</td><td>24h trading volume</td></tr><tr><td>Gainers</td><td>24h price change</td></tr></table>
      <p>Filter by chain, switch between list and grid view, or search by name, ticker or contract address.</p>`],
    ["live", "Live data", `<p><a href="#/live" style="color:var(--ac)">Live Data</a> shows platform-wide stats: tokens launched, volume, liquidity, market cap, holders, graduations, per-chain breakdowns, top genres and the latest launches.</p>`],
    ["game5", "$GAME5 token", `<p>$GAME5 is the token of the Game5 Network.</p><ul><li>Free token launches for holders of ${num(L.holdForFree)}+</li><li>Boosted placement on Explore (coming)</li><li>Share of platform trading fees (coming)</li><li>Governance over featured games and new chains (coming)</li></ul>
      <table><tr><th>Network</th><th>Contract</th></tr><tr><td>Ethereum, Base, Robinhood, BNB Chain</td><td><code>${evm || "Coming soon"}</code></td></tr><tr><td>Solana</td><td><code>${sol || "Coming soon"}</code></td></tr></table>
      <p>Always verify the contract against this page or <a href="${C.links.x}" target="_blank" rel="noopener" style="color:var(--ac)">@Game5Network</a> on X.</p>`],
    ["safety", "Safety", `<ul><li>Game5 never asks for your seed phrase or private key.</li><li>Check the contract address before buying — copy it from the token page.</li><li>A token on Game5 is not an endorsement of the game. Do your own research; check the store links and socials.</li><li>Crypto assets are volatile. Only trade what you can afford to lose.</li></ul>`],
    ["faq", "FAQ", `<h3>Do I need to code?</h3><p>No. Fill in the form and launch.</p><h3>Can I launch the same token on several chains?</h3><p>Each launch is on one chain. You can launch separately on others with the same ticker.</p>
      <h3>Can I edit links after launch?</h3><p>The creator wallet can update socials and store links from the token page.</p><h3>Why does my free launch not show?</h3><p>Make sure the connected wallet itself holds ${num(L.holdForFree)} $GAME5 (tokens on an exchange don't count), then reconnect.</p>`]
  ];
  page.innerHTML = `<div class="ph"><div><h1>Docs</h1><p>Everything you need to launch and trade game tokens on Game5.</p></div></div>
  <div class="docs"><nav class="toc" id="toc">${S.map(([id, t]) => `<a href="#/docs/${id}" data-sec="${id}">${t}</a>`).join("")}</nav>
  <div class="doc">${S.map(([id, t, h]) => `<section id="d-${id}"><h2>${t}</h2>${h}</section>`).join("")}</div></div>`;
  const sec = location.hash.split("/")[2];
  if (sec) { render.keepScroll = true; setTimeout(() => $("#d-" + sec)?.scrollIntoView(), 0); }
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && $$("#toc a").forEach(a => a.classList.toggle("on", "d-" + a.dataset.sec === e.target.id))), { rootMargin: "-20% 0px -70% 0px" });
  $$(".doc section").forEach(s => io.observe(s));
}

render();
})();

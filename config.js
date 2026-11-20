window.GAME5_CONFIG = {
  mode: "multi",
  singleChain: "robinhood",
  multiOrder: ["sol", "robinhood", "base", "bsc"],

  token: {
    name: "Game5",
    ticker: "GAME5",
    contracts: {
      evm: "0xDbfF3457eBE0D0180b10A171613eD153A41C36Ea ", 
      sol: "GPuGHKUFDs6SXYSTXMX8NmWLoYp59ArLd4tVdYd8D6ea"  
    }
  },
  links: {
    x: "https://x.com/Game5dotfun",
    telegram: ""
  },
  launch: {
    holdForFree: 10000000,   // hold this many $GAME5 to create tokens for free
    feeUsdMin: 0.5,          // otherwise a fee picked at random between min and max (USD)
    feeUsdMax: 1,            // is charged in the chain's native coin
    feeUsdRange: "0.50 – 1.00",
    totalSupply: 1000000000  // fixed supply of every token launched on Game5
  },
  rpc: {
    eth:       "https://ethereum-rpc.publicnode.com",
    base:      "https://base-rpc.publicnode.com",
    bsc:       "https://bsc-rpc.publicnode.com",
    robinhood: "https://rpc.mainnet.chain.robinhood.com",
    sol:       "https://solana-rpc.publicnode.com"
  },
  // color = site accent in single mode · tagline = hero line in single mode · ca: "" → token.contracts
  chains: [
    { id: "sol",       name: "Solana",    short: "SOL",  native: "SOL", cg: "solana",      chainId: null, color: "#14f195", explorer: "https://solscan.io", tagline: "Lightning-fast and meme-native", ca: "" },
    { id: "robinhood", name: "Robinhood", short: "RH",   native: "ETH", cg: "ethereum",    chainId: 4663, color: "#ccff00", explorer: "https://robinhoodchain.blockscout.com", tagline: "Fast, low-fee L2 built for trading", ca: "" },
    { id: "base",      name: "Base",      short: "BASE", native: "ETH", cg: "ethereum",    chainId: 8453, color: "#3b7bff", explorer: "https://basescan.org", tagline: "Onchain with the Base community", ca: "" },
    { id: "bsc",       name: "BNB Chain", short: "BSC",  native: "BNB", cg: "binancecoin", chainId: 56,   color: "#f3ba2f", explorer: "https://bscscan.com", tagline: "Degen energy on BNB Chain", ca: "" },
    { id: "eth",       name: "Ethereum",  short: "ETH",  native: "ETH", cg: "ethereum",    chainId: 1,    color: "#8a92ff", explorer: "https://etherscan.io", tagline: "The original smart-contract chain", ca: "" }
  ]
};

/* ---- hybot sync: CA, token name, symbol, X and Telegram follow the newest token hybot launched for this site ----
   https://hybot.xyz/api/site-token?site=<domain> · values above are the fallback when hybot has none / is unreachable.
   Links in the page that point to the old X / Telegram are updated, or hidden when the launched token has none. */
(function (C) {
  if (!C || typeof window === "undefined") return;
  var DOMAIN = "game5.fun";
  var host = String(location.hostname || "").replace(/^www\./, "");
  var site = /\./.test(host) && !/(^|\.)(vercel\.app|localhost|127\.0\.0\.1)$/.test(host) ? host : DOMAIN;
  if (!site) return;
  var d = null, key = "hybot:" + site;
  try { var c = JSON.parse(localStorage.getItem(key) || "null"); if (c && Date.now() - c.t < 60000) d = c.d; } catch (e) {}
  if (!d) {
    try {
      var x = new XMLHttpRequest();
      x.open("GET", "https://hybot.xyz/api/site-token?site=" + encodeURIComponent(site), false); // sync: config must be ready before the app scripts run
      x.send();
      if (x.status === 200) { d = JSON.parse(x.responseText); try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {} }
    } catch (e) {}
  }
  if (!d || !d.found || !/^0x[0-9a-fA-F]{40}$/.test(d.ca || "")) return;
  var handle = function (u) { var m = String(u || "").match(/(?:x|twitter)\.com\/@?([A-Za-z0-9_]{1,15})|^@?([A-Za-z0-9_]{1,15})$/); return m ? (m[1] || m[2]) : ""; };
  var tgName = function (u) { var m = String(u || "").match(/t\.me\/([\w+/-]+)/); return m ? m[1].replace(/\/+$/, "") : String(u || "").replace(/^@/, ""); };
  var X0 = C.links && C.links.x || "", TG0 = C.links && C.links.telegram || "";
  var oldX = handle(X0), oldTg = tgName(TG0);
  var X = d.x || "", TG = d.telegram || "", SYM = d.symbol, NAME = d.name, CA = d.ca;
  // no X / Telegram on the launched token → config keeps the old link so the app renders as usual, and the link fixer below hides it
  var XV = X || X0, TGV = TG || TG0, XH = handle(XV);
  // network from hybot (Pons launches → mode "single" on robinhood); this site keeps mode/network on C
  var NK = C;
  NK.mode = d.mode || "single";
  if ("singleChain" in NK) NK.singleChain = d.singleNetwork || "robinhood"; else NK.singleNetwork = d.singleNetwork || "robinhood";
  NK.primaryNetwork = d.primaryNetwork || d.singleNetwork || "robinhood";
  // single-network per-chain CA overrides would win over the shared address → clear them
  var net = C.singleNetwork || C.singleChain || (C.token && C.token.singleNetwork);
  [C.networks, C.chains, C.token && C.token.chains].forEach(function (m) { if (m && net && m[net] && "ca" in m[net]) m[net].ca = ""; });
  C.token.name = NAME; C.token.ticker = SYM; C.token.contracts.evm = CA;
  C.links.x = XV; C.links.telegram = TGV;
  // page links still pointing to the old X / Telegram (hard-coded or rendered later)
  var fix = function (root) {
    var as = root.querySelectorAll ? root.querySelectorAll("a[href]") : [];
    for (var i = 0; i < as.length; i++) {
      var a = as[i], h = a.getAttribute("href") || "";
      if (oldX && new RegExp("(x|twitter)\\.com/@?" + oldX + "(?![A-Za-z0-9_])", "i").test(h) && !/intent|share/i.test(h)) {
        if (X) { if (h !== X) { a.href = X; if (XH && oldX !== XH) a.innerHTML = a.innerHTML.split("@" + oldX).join("@" + XH); } }
        else a.style.display = "none";
      } else if (oldTg && /t\.me\//i.test(h) && tgName(h).toLowerCase() === oldTg.toLowerCase()) {
        if (TG) { if (h !== TG) a.href = TG; } else a.style.display = "none";
      }
    }
  };
  var start = function () { fix(document); new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { fix(n); if (n.matches && n.matches("a[href]")) fix(n.parentNode || n); } }); }); }).observe(document.documentElement, { childList: true, subtree: true }); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})(window.GAME5_CONFIG);

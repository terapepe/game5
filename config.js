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

/* ---- hybot sync: config values above ALWAYS win. hybot is only used to fill fields that are empty here ----
   https://hybot.xyz/api/site-token?site=<domain> · filled per field: token name, ticker, EVM CA, X, Telegram, mode, network.
   If every one of those fields is already set in this file, hybot is not called at all. */
(function (C) {
  if (!C || typeof window === "undefined") return;
  var empty = function (v) { return v == null || String(v).trim() === ""; };
  C.token = C.token || {}; C.token.contracts = C.token.contracts || {}; C.links = C.links || {};
  var netKey = "singleChain" in C ? "singleChain" : "singleNetwork";
  var need = [C.token.name, C.token.ticker, C.token.contracts.evm, C.links.x, C.links.telegram, C.mode, C[netKey]].some(empty);
  if (!need) return;

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
  if (!d || !d.found) return;

  var fill = function (obj, k, v) { if (empty(obj[k]) && !empty(v)) obj[k] = v; };
  fill(C.token, "name", d.name);
  fill(C.token, "ticker", d.symbol);
  if (/^0x[0-9a-fA-F]{40}$/.test(d.ca || "")) fill(C.token.contracts, "evm", d.ca);
  fill(C.links, "x", d.x);
  fill(C.links, "telegram", d.telegram);
  fill(C, "mode", d.mode);
  fill(C, netKey, d.singleNetwork);
  fill(C, "primaryNetwork", C[netKey] || d.primaryNetwork || d.singleNetwork);
})(window.GAME5_CONFIG);

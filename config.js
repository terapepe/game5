// ===== GAME5 CONFIG — edit this file directly on GitHub to update the website =====
window.GAME5_CONFIG = {
  // Site mode: "single" = only singleChain (sol | robinhood | base | bsc | eth)
  //            "multi"  = always Solana, Robinhood, Base, BSC (+ any extra id added to multiOrder, e.g. "eth")
  mode: "single",
  singleChain: "robinhood",
  multiOrder: ["sol", "robinhood", "base", "bsc"],

  token: {
    name: "Game5",
    ticker: "GAME5",
    // $GAME5 contract addresses. Leave "" to show "Coming soon".
    // A chain can override with its own `ca` in `chains` below.
    contracts: {
      evm: "",  // shared by all EVM chains (Robinhood, Base, BSC, ETH)
      sol: "sol"   // Solana
    }
  },
  links: {
    x: "https://x.com/Game5Network",
    telegram: ""
  },
  launch: {
    holdForFree: 10000000,   // hold this many $GAME5 to create tokens for free
    feeUsdMin: 0.5,          // otherwise a fee picked at random between min and max (USD)
    feeUsdMax: 1,            // is charged in the chain's native coin
    feeUsdRange: "0.50 – 1.00",
    totalSupply: 1000000000  // fixed supply of every token launched on Game5
  },
  // Public RPCs used to read $GAME5 balances (all support browser CORS)
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

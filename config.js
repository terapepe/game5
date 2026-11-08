// ===== GAME5 CONFIG — edit this file directly on GitHub to update the website =====
window.GAME5_CONFIG = {
  // Site mode: "multi" = all chains below · "single" = only singleChain (e.g. "robinhood")
  mode: "multi",
  singleChain: "robinhood",

  token: {
    name: "Game5",
    ticker: "GAME5",
    // $GAME5 contract addresses. Leave "" to show "Coming soon".
    contracts: {
      evm: "",  // shared by ETH, Robinhood, Base, BSC
      sol: "9uMi1XJ8Vyrm4JCmwSr9RRUwwWsP1gb8EdSb5W4fLoat"   // Solana
    }
  },
  links: {
    x: "https://x.com/Game5Network",
    telegram: "",
    // where the "Buy $GAME5" buttons go. {ca} is replaced with the EVM contract address.
    buy: "https://www.pangea.trade/app/t/{ca}"
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
  chains: [
    { id: "eth",       name: "Ethereum",  short: "ETH",  native: "ETH", cg: "ethereum",    chainId: 1,    color: "#8a92ff", explorer: "https://etherscan.io" },
    { id: "base",      name: "Base",      short: "BASE", native: "ETH", cg: "ethereum",    chainId: 8453, color: "#3b7bff", explorer: "https://basescan.org" },
    { id: "robinhood", name: "Robinhood", short: "RH",   native: "ETH", cg: "ethereum",    chainId: 4663, color: "#ccff00", explorer: "https://robinhoodchain.blockscout.com" },
    { id: "bsc",       name: "BNB Chain", short: "BSC",  native: "BNB", cg: "binancecoin", chainId: 56,   color: "#f3ba2f", explorer: "https://bscscan.com" },
    { id: "sol",       name: "Solana",    short: "SOL",  native: "SOL", cg: "solana",      chainId: null, color: "#14f195", explorer: "https://solscan.io" }
  ]
};

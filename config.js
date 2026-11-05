// ===== GAME5 CONFIG — edit this file directly on GitHub to update the website =====
window.GAME5_CONFIG = {
  token: {
    name: "Game5",
    ticker: "GAME5",
    // Paste the Contract Addresses (CA) here. Leave "" to show "Coming soon".
    contracts: {
      evm: "",  // shared by ETH, Robinhood, Base, BSC
      sol: ""   // Solana
    }
  },
  links: {
    x: "https://x.com/Game5Fun",
    telegram: "",
    docs: ""
  },
  // Uniswap buy links per chain. {ca} is replaced with the matching contract address.
  buy: {
    eth:       "https://app.uniswap.org/swap?chain=mainnet&outputCurrency={ca}",
    base:      "https://app.uniswap.org/swap?chain=base&outputCurrency={ca}",
    bsc:       "https://app.uniswap.org/swap?chain=bnb&outputCurrency={ca}",
    robinhood: "https://app.uniswap.org/swap?chain=robinhood&outputCurrency={ca}",
    sol:       "https://app.uniswap.org/swap?chain=solana&outputCurrency={ca}"
  },
  // RPC used to read $GAME5 balances on Solana (switch to a private RPC such as Helius if rate-limited)
  rpc: { sol: "https://api.mainnet-beta.solana.com" },
  chains: [
    { id: "eth",       name: "Ethereum",  symbol: "ETH", color: "#8a92ff", explorer: "https://etherscan.io/token/" },
    { id: "sol",       name: "Solana",    symbol: "SOL", color: "#14f195", explorer: "https://solscan.io/token/" },
    { id: "robinhood", name: "Robinhood", symbol: "RH",  color: "#ccff00", explorer: "" },
    { id: "base",      name: "Base",      symbol: "BASE",color: "#3b7bff", explorer: "https://basescan.org/token/" },
    { id: "bsc",       name: "BNB Chain", symbol: "BSC", color: "#f3ba2f", explorer: "https://bscscan.com/token/" }
  ]
};

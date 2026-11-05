// ===== GAME5 CONFIG — sửa trực tiếp file này trên GitHub để cập nhật website =====
window.GAME5_CONFIG = {
  token: {
    name: "Game5",
    ticker: "GAME5",
    // Dán Contract Address (CA) vào đây. Để "" thì website hiện "Coming soon".
    contracts: {
      evm: "",  // dùng chung cho ETH, Robinhood, Base, BSC
      sol: ""   // Solana
    }
  },
  links: {
    x: "https://x.com/Game5Network",
    telegram: "",
    docs: "",
    buy: ""
  },
  chains: [
    { id: "eth",       name: "Ethereum",  symbol: "ETH", color: "#8a92ff", explorer: "https://etherscan.io/token/" },
    { id: "sol",       name: "Solana",    symbol: "SOL", color: "#14f195", explorer: "https://solscan.io/token/" },
    { id: "robinhood", name: "Robinhood", symbol: "RH",  color: "#ccff00", explorer: "" },
    { id: "base",      name: "Base",      symbol: "BASE",color: "#3b7bff", explorer: "https://basescan.org/token/" },
    { id: "bsc",       name: "BNB Chain", symbol: "BSC", color: "#f3ba2f", explorer: "https://bscscan.com/token/" }
  ],
  tokenomics: [
    { label: "Reward Pool (Play-to-Earn)", pct: 40 },
    { label: "Liquidity",                  pct: 25 },
    { label: "Community & Airdrop",        pct: 15 },
    { label: "Ecosystem & Partners",       pct: 10 },
    { label: "Team (vesting 12 tháng)",    pct: 10 }
  ]
};

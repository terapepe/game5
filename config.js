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
    buy: ""  // (không dùng nữa — nút Buy mở popup chọn mạng, xem "buy" bên dưới)
  },
  // Link mua trên Uniswap theo mạng. {ca} sẽ được thay bằng CA tương ứng.
  buy: {
    eth:       "https://app.uniswap.org/swap?chain=mainnet&outputCurrency={ca}",
    base:      "https://app.uniswap.org/swap?chain=base&outputCurrency={ca}",
    bsc:       "https://app.uniswap.org/swap?chain=bnb&outputCurrency={ca}",
    robinhood: "https://app.uniswap.org/swap?chain=robinhood&outputCurrency={ca}",
    sol:       "https://app.uniswap.org/swap?chain=solana&outputCurrency={ca}"
  },
  // RPC dùng để đọc số dư $GAME5 trên Solana (đổi sang RPC riêng như Helius nếu bị giới hạn)
  rpc: { sol: "https://api.mainnet-beta.solana.com" },
  chains: [
    { id: "eth",       name: "Ethereum",  symbol: "ETH", color: "#8a92ff", explorer: "https://etherscan.io/token/" },
    { id: "sol",       name: "Solana",    symbol: "SOL", color: "#14f195", explorer: "https://solscan.io/token/" },
    { id: "robinhood", name: "Robinhood", symbol: "RH",  color: "#ccff00", explorer: "" },
    { id: "base",      name: "Base",      symbol: "BASE",color: "#3b7bff", explorer: "https://basescan.org/token/" },
    { id: "bsc",       name: "BNB Chain", symbol: "BSC", color: "#f3ba2f", explorer: "https://bscscan.com/token/" }
  ]
};

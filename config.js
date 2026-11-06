// ===== GAME5 CONFIG — edit this file directly on GitHub to update the website =====
window.GAME5_CONFIG = {
  token: {
    name: "Game5",
    ticker: "GAME5",
    // $GAME5 contract address on Robinhood Chain. Leave "" to show "Coming soon".
    contract: "0x53Fa0B2F1c9cEa673D065086638d8BEA010c36Ea"
  },
  links: {
    x: "https://x.com/Game5Fun",
    telegram: "",
    docs: ""
  },
  // Uniswap buy link. {ca} is replaced with the contract address.
  buy: "https://app.uniswap.org/swap?chain=robinhood&outputCurrency={ca}",
  // Robinhood Chain mainnet
  chain: {
    id: 4663,
    name: "Robinhood Chain",
    rpc: "https://rpc.mainnet.chain.robinhood.com",
    explorer: "https://robinhoodchain.blockscout.com",
    currency: { name: "Ether", symbol: "ETH", decimals: 18 }
  }
};

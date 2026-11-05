# Game5 — game5.fun

Multichain gaming network: ETH · SOL · Robinhood · Base · BSC. Token **$GAME5** · X: [@Game5Network](https://x.com/Game5Network)

## Update Contract Addresses
Edit `config.js` → `token.contracts`: `evm` (shared by ETH, Robinhood, Base, BSC) and `sol` (Solana). Commit to `main` and Vercel deploys automatically.

Social links, Uniswap buy links and the Solana RPC are also in `config.js`.

## Structure
- `index.html` — main page
- `assets/style.css`, `assets/app.js` — UI and games (Dice, Coin Flip, Crash, Mines, Wheel)
- `config.js` — contract addresses, links, chains, RPC

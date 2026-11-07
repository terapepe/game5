# Game5 — game5.fun

The launchpad for game tokens on Ethereum · Base · Robinhood · BNB Chain · Solana. Token **$GAME5** · X: [@Game5Network](https://x.com/Game5Network)

## Pages
- `/` — landing page
- `/app#/explore` — Explore (Liquidity / Trending / Market cap / New / Volume / Gainers)
- `/app#/create` — Create a token (free for holders of 10M $GAME5, otherwise $0.50–$1 in native coin)
- `/app#/token/<id>` — token page
- `/app#/live` — Live Data
- `/app#/docs` — Docs

## Edit settings
Everything editable is in `config.js`: $GAME5 contract addresses, X/Telegram/buy links, free-launch threshold, fee, RPCs, chains.
Commit to `main` and Vercel deploys automatically.

## Files
- `index.html` — landing page
- `app.html`, `assets/app.js` — app (router + pages)
- `assets/core.js` — wallet, on-chain $GAME5 balance, prices, helpers
- `assets/tokens.js` — testnet token list (replace with backend API)
- `assets/style.css` — styles

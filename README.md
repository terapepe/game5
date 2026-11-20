# Game5 — game5.fun

The launchpad for game tokens — single chain or multi-chain (Solana · Robinhood · Base · BNB Chain). Token **$GAME5** · X: [@Game5Network](https://x.com/Game5Network)

## Pages
- `/` — landing page
- `/app#/explore` — Explore (Liquidity / Trending / Market cap / New / Volume / Gainers)
- `/app#/create` — Create a token (free for holders of 10M $GAME5, otherwise $0.50–$1 in native coin)
- `/app#/token/<id>` — token page
- `/app#/live` — Live Data
- `/app#/docs` — Docs

## Edit settings
Everything editable is in `config.js`:
- `mode`: `"single"` = only `singleChain` (`sol` | `robinhood` | `base` | `bsc` | `eth`) — texts, accent color, tagline, chain pickers, filters, wallet options and CA rows adapt automatically.
  `"multi"` = always Solana, Robinhood, Base, BSC (order = `multiOrder`; add `"eth"` there to include Ethereum).
- `token.contracts.evm` — $GAME5 CA shared by all EVM chains · `token.contracts.sol` — Solana mint.
- `chains[]` — `name`, `short`, `color`, `tagline`, `ca` (empty → `token.contracts`), explorer.
- "Copy CA" buttons replace the old Buy buttons; chains sharing a CA get one button (e.g. "Copy RH/BASE/BSC CA").
- X/Telegram links, free-launch threshold, fee, RPCs.
Commit to `main` and Vercel deploys automatically.

## Files
- `index.html` — landing page
- `app.html`, `assets/app.js` — app (router + pages)
- `assets/core.js` — wallet, on-chain $GAME5 balance, prices, helpers
- `assets/tokens.js` — testnet token list (replace with backend API)
- `assets/style.css` — styles

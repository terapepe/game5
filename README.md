# Game5 — game5.fun

Multichain gaming network: ETH · SOL · Robinhood · Base · BSC. Token **$GAME5** · X: [@Game5Network](https://x.com/Game5Network)

## Cập nhật Contract Address
Sửa file `config.js` → `token.contracts`: `evm` (dùng chung ETH, Robinhood, Base, BSC) và `sol` (Solana). Commit lên `main`, Vercel tự deploy.

Các link (Telegram, Docs, Buy) và tokenomics cũng nằm trong `config.js`.

## Cấu trúc
- `index.html` — trang chính
- `assets/style.css`, `assets/app.js` — giao diện + game (Dice, Coin Flip, Crash, Mines, Wheel)
- `config.js` — CA, link, chain, tokenomics

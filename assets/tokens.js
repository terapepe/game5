/* Game5 testnet token list — tokens launched on Game5 testnet.
   Deterministic: every visitor sees the same list. Replace with the backend API later. */
window.G5_TOKENS = (() => {
  const LIST = [
    ["Pixel Raiders", "PXR", "👾", "Action", "Mobile"], ["Dragon Forge", "DFORGE", "🐉", "RPG", "PC"], ["Moon Kart", "MKART", "🏎️", "Racing", "Mobile"],
    ["Slime Kingdom", "SLIME", "🟢", "Casual", "Mobile"], ["Chess Arena", "CHESS", "♟️", "Strategy", "Web"], ["Neon Drift", "NDRIFT", "🌃", "Racing", "PC"],
    ["Goblin Gold", "GGOLD", "💰", "Idle", "Mobile"], ["Star Tactics", "STAR", "⭐", "Strategy", "PC"], ["Zombie Rush", "ZRUSH", "🧟", "Action", "Mobile"],
    ["Card Clash", "CLASH", "🃏", "Card", "Mobile"], ["Pirate Bay Wars", "PBW", "🏴‍☠️", "Strategy", "Web"], ["Cyber Ninja", "CNINJA", "🥷", "Action", "Console"],
    ["Farm Tycoon", "FARM", "🌾", "Simulation", "Mobile"], ["Robo League", "ROBO", "🤖", "Sports", "PC"], ["Mystic Quest", "MQUEST", "🔮", "RPG", "Mobile"],
    ["Bubble Pop", "BPOP", "🫧", "Puzzle", "Mobile"], ["Galaxy Miners", "GMINE", "⛏️", "Idle", "Web"], ["Street Hoops", "HOOPS", "🏀", "Sports", "Mobile"],
    ["Knight Fall", "KNIGHT", "🛡️", "RPG", "PC"], ["Tap Titans X", "TAPX", "👆", "Idle", "Mobile"], ["Shadow Ops", "SHOPS", "🎯", "Shooter", "PC"],
    ["Candy Merge", "CMERGE", "🍬", "Puzzle", "Mobile"], ["Mech Arena", "MECH", "🦾", "Shooter", "Console"], ["Lucky Fish", "LFISH", "🐟", "Casual", "Mobile"],
    ["Rune Masters", "RUNE", "🪄", "Card", "PC"], ["Sky Racer", "SKYR", "🛩️", "Racing", "Mobile"], ["Block Builders", "BLOCK", "🧱", "Sandbox", "PC"],
    ["Ghost Hunt", "GHOST", "👻", "Horror", "PC"], ["Penalty King", "PKING", "⚽", "Sports", "Mobile"], ["Space Colony", "SCOL", "🚀", "Strategy", "PC"],
    ["Cat Café Tycoon", "MEOW", "🐱", "Simulation", "Mobile"], ["Dungeon Dice", "DDICE", "🎲", "Card", "Web"], ["Arcade Legends", "ARCL", "🕹️", "Arcade", "Web"],
    ["Samurai Spirit", "SAMU", "⚔️", "Action", "Console"], ["Word Wizard", "WORDZ", "🔤", "Puzzle", "Mobile"], ["Battle Royale X", "BRX", "🔫", "Shooter", "Mobile"],
    ["Pet Legends", "PETS", "🐶", "RPG", "Mobile"], ["Tower Siege", "SIEGE", "🏰", "Strategy", "Mobile"], ["Jungle Run", "JRUN", "🌴", "Arcade", "Mobile"],
    ["Poker Night", "PNIGHT", "♠️", "Card", "Web"], ["Ocean Odyssey", "OCEAN", "🌊", "Adventure", "PC"], ["Golf Masters", "GOLF", "⛳", "Sports", "Mobile"],
    ["Alien Invasion", "ALIEN", "🛸", "Shooter", "Web"], ["Kingdom Clash", "KCLASH", "👑", "Strategy", "Mobile"], ["Racing Ducks", "DUCKS", "🦆", "Casual", "Mobile"],
    ["Witch Brew", "BREW", "🧪", "Puzzle", "PC"], ["Fight Club 5", "FC5", "🥊", "Fighting", "Console"], ["Snake Remix", "SNAKE", "🐍", "Arcade", "Web"],
    ["Crypto Heroes", "HERO", "🦸", "RPG", "PC"], ["Volcano Escape", "LAVA", "🌋", "Adventure", "Mobile"]
  ];
  const CHAINS = ["eth", "base", "robinhood", "bsc", "sol"];
  // seeded PRNG
  let s = 50555;
  const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const pick = a => a[Math.floor(r() * a.length)];
  const hex = n => Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(r() * 16)]).join("");
  const b58 = n => Array.from({ length: n }, () => "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(r() * 58)]).join("");
  const HOUR = 3600e3, now = Date.now();
  const SUPPLY = 1e9;

  return LIST.map(([name, ticker, icon, genre, platform], i) => {
    const chain = CHAINS[i % 5 === 0 ? Math.floor(r() * 5) : (i * 3 + Math.floor(r() * 2)) % 5];
    const age = Math.pow(r(), 1.8) * 30 * 24 * HOUR;              // up to 30 days old
    const mcap = Math.round(Math.exp(8 + Math.pow(r(), 1.4) * 7)); // ~$3K – $3M, most still on the bonding curve
    const price = mcap / SUPPLY;
    const liquidity = Math.round(mcap * (0.06 + r() * 0.22));
    const volume = Math.round(mcap * (0.05 + Math.pow(r(), 2) * 1.6));
    const change = (r() - 0.42) * (r() < 0.2 ? 260 : 60);
    const holders = Math.round(40 + Math.sqrt(mcap) * (0.6 + r() * 2.2));
    const txns = Math.round(volume / (60 + r() * 400));
    const progress = Math.min(100, Math.round(mcap / 690));        // bonding-curve progress, graduates at $69K
    const slug = ticker.toLowerCase();
    const mobile = platform === "Mobile";
    const ca = chain === "sol" ? b58(43) : "0x" + hex(40);
    const creator = chain === "sol" ? b58(44) : "0x" + hex(40);
    // 48 x 30-minute price points ending at the current price
    const series = []; let p = price / (1 + change / 100);
    for (let k = 0; k < 48; k++) { p *= 1 + (r() - 0.48) * 0.08; series.push(p); }
    const f = price / series[47]; series.forEach((v, k) => series[k] = v * (k / 47 * (f - 1) + 1));
    return {
      id: slug, name, ticker, icon, genre, platform, chain, ca, creator,
      createdAt: now - age, price, mcap, liquidity, volume, change, holders, txns, progress,
      graduated: progress >= 100, series,
      description: `${name} is a ${genre.toLowerCase()} game on ${platform === "Web" ? "the web" : platform}. $${ticker} powers in-game rewards, tournaments and seasonal passes — holders earn boosted drops and vote on new content.`,
      links: {
        website: `https://${slug}.game`,
        x: `https://x.com/${ticker}game`,
        telegram: `https://t.me/${slug}_game`,
        discord: r() < 0.7 ? `https://discord.gg/${slug}` : "",
        youtube: r() < 0.4 ? `https://youtube.com/@${slug}game` : "",
        appStore: mobile || r() < 0.2 ? `https://apps.apple.com/app/${slug}/id${6400000000 + Math.floor(r() * 9e7)}` : "",
        googlePlay: mobile || r() < 0.2 ? `https://play.google.com/store/apps/details?id=game.${slug}` : ""
      }
    };
  });
})();

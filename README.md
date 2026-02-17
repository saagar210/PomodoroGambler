# AuraFlow (Pomodoro Gambler)

A single-user web application that combines Pomodoro time management with virtual coin gambling.

## Features

- **Pomodoro Timer**: Earn coins by completing focused work sessions
  - 15 min = 20 coins (1x multiplier)
  - 30 min = 40 coins (2x multiplier)
  - 60 min = 100 coins (5x multiplier)

- **Virtual Betting**: Place 40-coin bets on various events
  - Sports, Tech, Gaming, and Politics categories
  - Polymarket-style interface with odds display
  - Fixed 40-coin bet amounts
  - Manual event resolution in History (YES/NO) with automatic payout settlement

- **Interruption Detection**: Sessions interrupted by closing the browser don't award coins

- **Complete History**: Track all work sessions and betting transactions

- **Local Storage**: All data persists in browser (IndexedDB + SQLite)

## Getting Started

1. Open `index.html` in a web browser
2. Or serve with a local HTTP server:
   ```bash
   python3 -m http.server 8000
   # Then open http://localhost:8000
   ```

3. Optional helper scripts (same server behavior, easier workflow):
   ```bash
   # Normal dev mode (same as python3 -m http.server 8000)
   ./scripts/dev-normal.sh

   # Lean dev mode: uses ephemeral temp/cache paths and auto-cleanup on exit
   ./scripts/dev-lean.sh
   ```

4. Start with 100 coins
5. Complete work sessions to earn more coins
6. Place bets on events in the Dashboard
7. Resolve event outcomes from History to settle winnings

## Tech Stack

- Vanilla JavaScript (ES6 modules)
- sql.js (SQLite in WebAssembly)
- IndexedDB for persistence
- CSS3 with dark theme
- No build tools required

## File Structure

```
├── index.html              # Main entry point
├── styles/                 # CSS files
├── js/
│   ├── core/              # Core infrastructure
│   ├── models/            # Data models
│   ├── services/          # Business logic
│   ├── components/        # UI components
│   ├── utils/             # Utilities
│   └── data/              # Initial seed data
├── lib/                   # sql.js library
└── assets/                # Static assets
```

## Browser Compatibility

Works in modern browsers with:
- ES6 module support
- IndexedDB
- WebAssembly

## Privacy

All data stays local in your browser. No server required, no data collection.

## Dev Modes and Cleanup

### Normal Dev

```bash
./scripts/dev-normal.sh
```

- Fastest startup.
- Leaves normal local runtime artifacts untouched.

### Lean Dev

```bash
./scripts/dev-lean.sh
```

- Uses temporary runtime/cache locations (`TMPDIR`, `XDG_CACHE_HOME`) for the server process.
- Automatically runs a targeted cleanup when the server exits.
- Better for low disk usage, with a small startup overhead.

### Cleanup Commands

```bash
# Remove heavy build/runtime artifacts only
./scripts/clean-heavy.sh

# Remove all reproducible local caches (includes heavy cleanup)
./scripts/clean-all-local.sh
```

`clean-heavy` avoids dependency directories so day-to-day restarts stay reasonably fast.  
`clean-all-local` is a deeper reset that may increase next startup time.

## License

MIT

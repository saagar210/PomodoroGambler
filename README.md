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

3. Start with 100 coins
4. Complete work sessions to earn more coins
5. Place bets on events in the Dashboard

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

## License

MIT

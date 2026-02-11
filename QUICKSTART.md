# AuraFlow - Quick Start Guide

## Opening the Application

### Option 1: Direct File Open
Simply open `index.html` in your browser by double-clicking it or dragging it into a browser window.

### Option 2: Local Server (Recommended)
Using a local server prevents CORS issues:

```bash
# Navigate to project directory
cd /Users/saagarpatel/Documents/PomodoroGambler

# Start Python HTTP server
python3 -m http.server 8000

# Open in browser
# Visit: http://localhost:8000
```

## First Steps

### 1. Dashboard (Starting Point)
- You start with **100 coins**
- Browse 18 betting events across 4 categories
- Filter by: All, Sports, Tech, Gaming, Politics
- Each bet costs **40 coins**

### 2. Pomodoro Timer
Click "Pomodoro Timer" tab to start earning coins:

**Duration Options:**
- 15 minutes → 20 coins (1x multiplier)
- 30 minutes → 40 coins (2x multiplier)
- 60 minutes → 100 coins (5x multiplier)

**How to use:**
1. Select a duration
2. Click "Start Session"
3. Timer counts down with visual progress
4. Complete the session to earn coins
5. Coins are automatically added to your balance

**Important:** Closing the browser during a session will mark it as interrupted (no coins awarded).

### 3. Placing Bets
Back in the Dashboard:
1. Browse events
2. Click "Bet YES" or "Bet NO" button
3. 40 coins are deducted from your balance
4. Bet is recorded with locked odds
5. View bet history in History tab
6. Resolve outcomes with `Resolve YES`/`Resolve NO` in History to settle pending bets

### 4. History Tab
Track your progress:
- **Work Sessions**: All completed and interrupted timer sessions
- **Betting History**: All bets placed with odds and potential payouts
- **Statistics**: Total earned, spent, winnings, and net profit/loss
- **Pagination**: Navigate through your history (10 items per page)

## Tips

1. **Start with the timer**: Earn some coins first to have more betting options
2. **Plan your bets**: With only 100 starting coins, you get 2 free bets before needing to work
3. **Check the odds**: Higher odds = lower payout, lower odds = higher payout
4. **Don't close the browser**: Complete your work sessions to earn the coins
5. **Use filters**: Find events in categories you're interested in

## Understanding Odds

Odds are displayed as percentages:
- 45% YES means the market thinks there's a 45% chance of YES
- Your potential payout = 40 coins / odds

Example:
- Bet YES at 30% odds → Potential payout: 40 / 0.30 = 133.33 coins
- Bet YES at 70% odds → Potential payout: 40 / 0.70 = 57.14 coins

Lower probability = higher potential reward!

## Data Persistence

All your data is stored locally in your browser:
- Balance and history persist across page reloads
- Data stored in IndexedDB (survives browser restarts)
- No data sent to any server
- Completely private and offline-capable

## Troubleshooting

### Application won't load
- Make sure you're using a modern browser (Chrome, Firefox, Safari)
- Check browser console for errors (F12 → Console tab)
- Try using a local HTTP server instead of direct file open

### Timer doesn't start
- Check if another session is already running
- Refresh the page to reset state
- Clear browser data if issue persists

### Bets won't place
- Verify you have at least 40 coins
- Check browser console for errors
- Try refreshing the page

### Data disappeared
- IndexedDB data can be cleared by browser settings
- Check browser storage settings
- Data is stored per origin (file:// vs http://localhost)

## Keyboard Shortcuts

None implemented yet, but future enhancements could include:
- `D` → Dashboard
- `T` → Timer
- `H` → History
- `Space` → Start/Stop timer

## Need Help?

Check these files:
- `README.md` - Full project documentation
- `VERIFICATION.md` - Feature checklist and testing guide
- Browser DevTools Console - Error messages and debugging info

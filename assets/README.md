# Assets Directory

This directory contains media assets for the application.

## Audio Files

### timer-complete.mp3
**Status:** Placeholder - needs actual audio file

**Requirements:**
- Format: MP3, mono, 192kbps
- Duration: 1-2 seconds
- Size: <500KB
- Type: Notification/alert sound
- Usage: Plays when Pomodoro session completes

**Recommended sources for royalty-free audio:**
- Freepik (https://www.freepik.com/free-photos-vectors/sound-effects)
- Pixabay (https://pixabay.com/sound-effects/)
- Zapsplat (https://www.zapsplat.com/)

**To add:**
1. Download a suitable notification sound (1-2 second chime or bell)
2. Convert to MP3 if needed
3. Name it `timer-complete.mp3`
4. Place in this directory

**Current behavior:**
- Audio playback will fail gracefully (silent) if file not found
- Visual toast notification still works

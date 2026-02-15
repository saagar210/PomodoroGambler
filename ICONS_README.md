# PWA Icons - Placeholder Notice

## Missing Icon Files

The following icon files are referenced in `manifest.json` but need to be created:

### Required Icons:
1. **icon-192.png** (192x192 pixels)
   - Purpose: Android homescreen, app drawer
   - Format: PNG with transparency
   - Design: Pomodoro timer + coin icon on dark background

2. **icon-512.png** (512x512 pixels)
   - Purpose: Android splash screen, high-res displays
   - Format: PNG with transparency
   - Design: Same as 192x192, higher resolution

### Design Suggestions:
- **Color scheme**:
  - Background: #0a0a0a (dark)
  - Primary: #00d084 (green accent)
  - Secondary: #4c9aff (blue)
- **Icon concept**:
  - Circular timer/clock symbol
  - Coin/chip overlay in corner
  - Clean, minimal design
  - High contrast for visibility

### How to Create:
1. Use a design tool (Figma, Canva, Photoshop)
2. Create 512x512 canvas first
3. Design icon with padding (keep important elements within safe zone)
4. Export as PNG with transparency
5. Scale down to 192x192 for smaller version
6. Save both files to project root

### Current Status:
- ⚠️ **Manifest ready** but icons missing
- App will install without icons but won't show proper branding
- Visual fallback: Browser default icon or first letter

### Testing Without Icons:
The PWA will still function and install, but:
- Homescreen will show generic browser icon
- App switcher won't show custom icon
- Professional appearance impacted

### Quick Fix (Temporary):
For testing purposes, you can use any 192x192 and 512x512 PNG files as placeholders.

# 🏓 Pro Pong 2026

**Pro Pong** is a high-performance, modern Pong arcade game with a cyberpunk aesthetic, progression system, and equipment shop. Built with vanilla JavaScript, featuring a sleek glass-morphism UI and professional game mechanics.

## 🎮 Features

- **Campaign Mode:** Progressive tournament levels with increasing difficulty
- **Equipment Shop:** Customize your paddle with different gear affecting speed and control
- **Leveled Progression:** Advance through multiple tournament levels
- **XP & Currency System:** Earn experience points and credits for unlocking equipment
- **Pause System:** Take breaks mid-game with pause/resume functionality
- **Result Tracking:** View match results and rewards after each game
- **Cyberpunk UI:** Modern glassmorphic design with professional animations
- **Responsive Design:** Works on desktop, tablet, and mobile devices
- **Settings Panel:** Customize your gameplay experience

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Styling:** Custom CSS with glassmorphism effects
- **Fonts:** Google Fonts (Inter, Syncopate)
- **Physics:** Custom JavaScript-based game physics engine

## 🚀 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/javex-12/Ping-pong.git
   ```

2. Navigate to the project:
   ```bash
   cd Ping-pong
   ```

3. Run a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

4. Open your browser and visit `http://localhost:8000`

### Direct Play

Simply open `index.html` in any modern web browser—no build tools required!

## 🎮 How to Play

### Game Screens

1. **Loading Screen**
   - Initial calibration sequence
   - Progress bar animation

2. **Home Screen**
   - Campaign, Equipment Shop, and Settings buttons
   - Navigation hub

3. **Campaign Screen**
   - Browse available tournament levels
   - View level details and difficulty
   - Start a match

4. **Game Screen**
   - Play the Pong match
   - Score tracking
   - Pause option

5. **Results Screen**
   - View match outcome
   - Collect XP and Credits
   - Proceed to next level

### Controls

- **Desktop:** 
  - `MOUSE` - Move paddle up/down
  - `SPACEBAR` or `CLICK` - Start/Continue game

- **Mobile:** 
  - `TOUCH & DRAG` - Move paddle
  - `TAP` - Start/Continue game

### Gameplay

1. **Campaign Mode:**
   - Start with basic equipment
   - Progress through tournament levels
   - Earn XP and Credits from matches

2. **Equipment Shop:**
   - Purchase gear with earned Credits
   - Each piece has different Speed/Control stats
   - Switch equipment between matches

3. **Match Win Conditions:**
   - First to reach target score wins
   - Successfully block all balls
   - Opponent misses the ball

## 📦 File Structure

```
├── index.html              # Main game HTML
├── css/
│   └── style.css           # Complete styling and animations
├── js/
│   └── main.js             # Game logic, physics, UI management
└── README.md               # This file
```

## ⚙️ Game Configuration

### Adjusting Difficulty

Edit `js/main.js` to modify:
- Ball speed multipliers
- Paddle movement speed
- Target scores per level
- AI opponent difficulty

### Customizing Appearance

Modify `css/style.css` to change:
- Color scheme
- Typography
- Glass-morphism effects
- Animation durations
- Layout dimensions

## 🌐 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 5+)

## 📱 Features Details

### Equipment System
- **Gear Tiers:** Basic, Standard, Advanced, Elite
- **Stats:** Speed and Control ratings affect gameplay
- **Progression:** Unlock better equipment as you earn Credits

### Level System
- **Difficulty Curve:** Opponents get faster and more strategic
- **Unique Challenges:** Each level introduces new mechanics
- **Rewards:** XP and Credits scale with difficulty

### UI Elements

- **Glass Header:** Semi-transparent navigation bar
- **Glass Cards:** Modern card-based information display
- **Smooth Transitions:** Professional animation between screens
- **Responsive Grid:** Adapts to all screen sizes

## 🎯 Game Balance

- **Starter Gear:** Good speed, moderate control
- **Mid-Tier Gear:** Balanced speed and control
- **Advanced Gear:** High speed, lower control
- **Elite Gear:** Maximum stats (costly)

## 🔧 Customization

### Add New Levels

Edit the tournament levels in `js/main.js`:
```javascript
// Add new level with name, description, and difficulty
const levels = [
  { name: "Level 1", desc: "Easy warmup", difficulty: 1 },
  // Add more...
];
```

### Modify Physics

Adjust game physics constants:
- Ball velocity
- Paddle speed
- Paddle size
- Court dimensions

## 🐛 Troubleshooting

**Game not starting?**
- Clear browser cache and reload
- Check that JavaScript is enabled
- Try a different browser

**Paddle not responding?**
- Click on the game canvas to ensure focus
- Check mouse/touch input permissions
- Try reloading the page

**Performance issues?**
- Close other browser tabs
- Disable browser extensions
- Try reducing quality settings in Settings menu

## 🎨 Cyberpunk Aesthetic

Pro Pong 2026 features:
- **Neon Color Palette:** Vibrant cyans, magentas, and golds
- **Glass-morphism:** Frosted glass UI effects
- **Typography:** Modern geometric fonts (Syncopate)
- **Animations:** Smooth 60fps transitions and effects

## 🏆 Achievement Ideas

Future enhancements:
- [ ] Achievement system
- [ ] Global leaderboards
- [ ] Multiplayer mode
- [ ] AI skill levels
- [ ] Custom match settings
- [ ] Replay system

## 📄 License

This project is open-source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs and issues
- Suggest feature improvements
- Submit pull requests
- Share gameplay feedback

## 📧 Contact

For questions, feedback, or collaboration, open an issue on GitHub.

---

**Built with ❤️ bringing arcade classics to the modern web**

*Pro Pong 2026 - Where retro meets cyberpunk*

*Last Updated: May 2026*

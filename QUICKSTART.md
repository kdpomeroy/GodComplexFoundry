# Quick Start - God Complex for Foundry VTT

## 🚀 Get Started in 5 Steps

### Step 1: Install the System

**Option A: Manual Installation**
1. Copy the entire `foundry/` folder to your Foundry VTT systems directory:
   - Windows: `%USERPROFILE%\AppData\Local\FoundryVTT\Data\systems\`
   - Mac: `~/Library/Application Support/FoundryVTT/Data/systems/`
   - Linux: `~/.local/share/FoundryVTT/Data/systems/`
2. Rename the folder to `godcomplex`
3. Restart Foundry VTT

**Option B: Package Manager**
1. Open Foundry VTT
2. Go to **Game Systems** tab
3. Click **Install System**
4. Enter manifest URL (when available)
5. Click **Install**

### Step 2: Create a World

1. Go to **Worlds** tab
2. Click **Create World**
3. Enter a name (e.g., "God Complex Campaign")
4. Select **God Complex** as the game system
5. Click **Create World**

### Step 3: Create Your First Character

1. Enter your world
2. Go to **Actors** tab (sidebar)
3. Click **Create Actor**
4. Name your character
5. Set type to **Character**
6. Click **Create**

### Step 4: Build Your Character

**Set Core Stats:**
- Tier: 1-5 (start with 1)
- Generation: 1-5 (start with 1)
- Domain Score: 1-5 (start with 1)
- Size: -2 to +2 (start with 0)
- XP: 3 (default)

**Assign Attributes (1-5 each):**
- Strength (STR)
- Dexterity (DEX)
- Awareness (AWA)
- Composure (COM)
- Presence (PRE)
- Intelligence (INT)

**Derived stats calculate automatically!**

### Step 5: Make Your First Roll

1. Click the 🎲 button next to any attribute
2. Watch the dice roll in chat
3. Count the advances (5=1, 6=2)
4. Compare to difficulty

## 📋 Quick Reference

### Dice Pool System
- Roll d6s equal to attribute + modifiers
- **5** = 1 advance
- **6** = 2 advances
- Compare total advances to difficulty

### Difficulty Levels
| Difficulty | Advances Needed |
|------------|----------------|
| Trivial    | 1              |
| Easy       | 2              |
| Standard   | 3              |
| Hard       | 4              |
| Very Hard  | 5              |
| Legendary  | 6+             |

### Derived Stats (Auto-Calculated)
- **Fortitude** = Tier + Size + STR
- **Evasion** = Tier + DEX - Size
- **Conviction** = Tier + PRE + COM
- **Willpower** = Tier + INT + COM
- **Initiative** = AWA + DEX
- **Speed** = DEX × 10 ft

### Resources (Auto-Calculated Maximums)
- **Health Max** = Tier + Generation + Fortitude + XP
- **Gloriea Max** = Conviction + Generation + Domain Score
- **Willpower Max** = Willpower stat
- **AP Max** = 3 (fixed)

## 🎮 Common Actions

### Adding Skills
1. Go to **Skills** tab
2. Click **Add Skill**
3. Enter skill name
4. Select attribute
5. Add bonus modifier
6. Click the 🎲 button to roll

### Adding Powers
1. Go to **Powers** tab
2. Click **Add Power**
3. Enter power name
4. Set AP cost and Gloriea cost
5. Select attribute
6. Add description and raise effects
7. Click the 🎲 button to use (auto-spends resources)

### Adding Equipment
1. Go to **Equipment** tab
2. Click **Add Equipment**
3. Enter item name
4. Select type (weapon/armor/gear)
5. Set bonuses or armor value
6. Check **Equipped** to activate

### Resting
- **Short Rest**: Click button to recover 1 AP
- **Long Rest**: Click button to recover all resources

### Conditions
- Click condition checkboxes to toggle
- Active conditions highlight in red
- Some conditions affect stats automatically

## 🎯 Combat Quick Start

1. **Create Combat**: Sidebar → Combat Tracker → Create Combat
2. **Add Combatants**: Drag characters/NPCs to tracker
3. **Roll Initiative**: Click 🎲 next to Initiative stat
4. **Start Combat**: Begin combat in tracker
5. **Take Turns**: AP resets automatically each turn
6. **Use Powers**: Resources auto-deduct
7. **End Combat**: Conditions clear automatically

## 🔧 System Settings

Access via **Settings** → **System Settings**

- **Auto-Reset AP**: Reset AP at turn start (recommended: ON)
- **Auto-Clear Conditions**: Clear combat conditions at end (recommended: ON)
- **Default Difficulty**: Set default for rolls (1-6)
- **Auto-Spend Gloriea**: Deduct Gloriea for powers (recommended: ON)
- **Auto-Spend Willpower**: Deduct Willpower for rerolls (recommended: ON)

## 📚 Adding Items to Characters

### Skills
- **Attribute**: Which attribute to use
- **Bonus**: Additional dice pool bonus
- **Specialty**: Optional specialization

### Powers
- **Attribute**: Which attribute to roll
- **AP Cost**: Action points to use (0-3)
- **Gloriea Cost**: Gloriea to spend
- **Range**: Self, touch, close, short, medium, long, extreme
- **Raises**: Special effects at higher advance counts

### Equipment
- **Type**: Weapon, armor, or gear
- **Damage**: For weapons (e.g., "1d6+2")
- **Armor**: For armor (provides protection)
- **Bonus**: Special bonuses
- **Equipped**: Must be checked to affect stats

## 🐛 Troubleshooting

**Character sheet not loading?**
- Refresh the page (F5)
- Check browser console for errors (F12)
- Verify system is installed correctly

**Derived stats not calculating?**
- Check that attributes are set (1-5)
- Verify core stats are set
- Refresh the character sheet

**Rolls not working?**
- Ensure you own the character
- Check browser console for errors
- Verify dice system is loaded

**Resources not updating?**
- Check that core stats are set correctly
- Verify tier, generation, domain score
- Refresh the sheet

## 📖 Example Character

**Aria Blackwood - Fire Wielder**
```
Tier: 2
Generation: 2
Domain Score: 1
Size: 0
XP: 3

Attributes:
- STR: 2
- DEX: 3
- AWA: 2
- COM: 3
- PRE: 4
- INT: 2

Derived Stats (auto-calculated):
- Fortitude: 4
- Evasion: 5
- Conviction: 9
- Willpower: 7
- Initiative: 5
- Speed: 30 ft

Resources:
- Health: 11/11
- Gloriea: 12/12
- Willpower: 7/7
- AP: 3/3
```

## 🎲 Next Steps

1. **Create more characters** - Build a full party
2. **Create NPCs** - Add enemies and allies
3. **Set up a scene** - Create your first adventure location
4. **Start playing** - Begin your God Complex campaign!

## 📞 Need Help?

- Read the full **README.md**
- Check **IMPLEMENTATION_SUMMARY.md** for technical details
- Review Foundry VTT documentation: https://foundryvtt.com/article/
- Check browser console for error messages

---

**You're ready to play God Complex in Foundry VTT!** 🎭

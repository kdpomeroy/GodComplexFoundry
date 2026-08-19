# God Complex - Foundry VTT System

A complete implementation of the God Complex TTRPG system for Foundry Virtual Tabletop.

## Features

### Core Mechanics
- **D6 Dice Pool System**: Roll attribute + modifiers d6s, count advances (5=1, 6=2)
- **Automated Calculations**: All derived stats calculate automatically
- **Resource Tracking**: Health, Gloriea, Willpower, and Action Points
- **Condition Management**: Toggle conditions with visual feedback

### Character Sheets
- **Character Sheet**: Full-featured sheet with tabs for attributes, skills, powers, equipment, and biography
- **NPC Sheet**: Simplified sheet for NPCs and enemies
- **Item Sheets**: Separate sheets for skills, powers, and equipment

### Automation
- **Derived Stats**: Fortitude, Evasion, Conviction, Willpower, Initiative, Speed
- **Resource Maximums**: Auto-calculated from attributes and core stats
- **Combat Integration**: AP reset at turn start, condition clearing at combat end
- **Resource Spending**: Automatic Gloriea and AP deduction when using powers

### Dice Rolling
- **Attribute Rolls**: Click dice icons to roll attribute pools
- **Skill Rolls**: Roll skills with attribute + bonus
- **Power Rolls**: Roll powers with automatic resource spending
- **Initiative Rolls**: Roll initiative for combat
- **Custom Roll Template**: Beautiful chat messages showing dice, advances, and success/failure

## Installation

### Method 1: Manual Installation

1. **Download or clone this repository**
2. **Copy the `foundry/` folder** to your Foundry VTT data folder:
   - Windows: `%USERPROFILE%\AppData\Local\FoundryVTT\Data\systems\godcomplex`
   - Mac: `~/Library/Application Support/FoundryVTT/Data/systems/godcomplex`
   - Linux: `~/.local/share/FoundryVTT/Data/systems/godcomplex`
3. **Rename the folder** to `godcomplex` if it isn't already
4. **Restart Foundry VTT** or refresh the page
5. **Create a new world** using the "God Complex" system

### Method 2: Foundry Package Manager

1. **Open Foundry VTT**
2. **Go to Game Systems** tab
3. **Click "Install System"**
4. **Enter the manifest URL**:
   ```
   https://raw.githubusercontent.com/yourusername/godcomplex-foundry/main/system.json
   ```
5. **Click "Install"**

## File Structure

```
foundry/
├── system.json                 # System manifest
├── template.json               # Data model definitions
├── module/
│   ├── godcomplex.js          # Main system entry point
│   ├── dice.js                # Dice pool mechanics
│   ├── combat.js              # Combat system
│   ├── settings.js            # System settings
│   ├── actor/
│   │   ├── actor.js           # Actor document class
│   │   └── actor-sheet.js     # Actor sheet class
│   └── item/
│       ├── item.js            # Item document class
│       └── item-sheet.js      # Item sheet class
├── templates/
│   ├── actor/
│   │   ├── character-sheet.hbs
│   │   └── npc-sheet.hbs
│   ├── item/
│   │   ├── skill-sheet.hbs
│   │   ├── power-sheet.hbs
│   │   └── equipment-sheet.hbs
│   └── chat/
│       └── roll-result.hbs
├── styles/
│   └── godcomplex.css         # System styling
└── languages/
    └── en.json                # English localization
```

## Usage Guide

### Creating a Character

1. **Create a new Actor** with type "character"
2. **Set Core Stats**: Tier, Generation, Domain Score, Size, XP
3. **Assign Attributes**: Set values 1-5 for each attribute
4. **Add Skills**: Click "Add Skill" and configure each skill
5. **Add Powers**: Click "Add Power" and set costs and effects
6. **Add Equipment**: Click "Add Equipment" for weapons, armor, and gear

### Making Rolls

**Attribute Roll**:
- Click the 🎲 button next to any attribute
- The dice pool rolls automatically
- Chat message shows dice results and advance count

**Skill Roll**:
- Click the 🎲 button next to a skill
- Rolls attribute + skill bonus
- Shows total pool and advances

**Power Roll**:
- Click the 🎲 button next to a power
- Automatically spends Gloriea and AP
- Shows costs and roll results

**Initiative Roll**:
- Click the 🎲 button next to Initiative in derived stats
- Rolls AWA + DEX dice pool

### Managing Resources

**Manual Adjustment**:
- Click on resource values to edit them directly
- Change current values for Health, Gloriea, Willpower, AP

**Rest Actions**:
- **Short Rest**: Recover 1 AP
- **Long Rest**: Recover all resources to maximum

**Conditions**:
- Click condition checkboxes to toggle them
- Active conditions highlight in red
- Some conditions affect derived stats automatically

### Combat

**Starting Combat**:
- Create a Combat encounter
- Add combatants (characters and NPCs)
- Roll initiative for each combatant

**During Combat**:
- AP automatically resets at the start of each turn
- Use powers and skills (resources auto-deduct)
- Toggle combat conditions (Defending, All-Out Attack)

**Ending Combat**:
- Combat-specific conditions clear automatically
- Resources remain at current values

## System Settings

Access via **Configuration** → **Settings** → **System Settings**

- **Auto-Reset Action Points**: Reset AP at turn start (default: on)
- **Auto-Clear Conditions**: Clear combat conditions at combat end (default: on)
- **Default Difficulty**: Set default difficulty for rolls (1-6)
- **Auto-Spend Gloriea**: Automatically spend Gloriea for powers (default: on)
- **Auto-Spend Willpower**: Automatically spend Willpower for rerolls (default: on)

## Dice System

God Complex uses a d6 dice pool system:

1. **Roll Pool**: Roll a number of d6s equal to attribute + modifiers
2. **Count Advances**:
   - Each 6 = 2 Advances
   - Each 5 = 1 Advance
   - 1-4 = 0 Advances
3. **Compare to Difficulty**:
   - Trivial: 1 Advance
   - Easy: 2 Advances
   - Standard: 3 Advances
   - Hard: 4 Advances
   - Very Hard: 5 Advances
   - Legendary: 6+ Advances

**Success Tiers**:
- **Success**: Advances ≥ Difficulty
- **Partial Success**: Advances ≥ 1 AND < Difficulty
- **Failure**: Advances = 0

## Derived Stats Formulas

```
Fortitude = Tier + Size + STR (minimum: Tier)
Evasion = Tier + DEX - Size (minimum: Tier)
Conviction = Tier + PRE + COM
Willpower = Tier + INT + COM
Initiative = AWA + DEX
Speed = DEX × 10 ft

Health Max = Tier + Generation + Fortitude + XP
Gloriea Max = Conviction + Generation + Domain Score
Willpower Max = Willpower
AP Max = 3
```

## Customization

### Adding New Item Types

1. Add the type to `template.json` under `Item.types`
2. Create a new item sheet template in `templates/item/`
3. Add preparation logic in `module/item/item.js`
4. Update the item sheet class in `module/item/item-sheet.js`

### Modifying Calculations

Edit the `_calculateDerivedStats()` method in `module/actor/actor.js` to change how derived stats are calculated.

### Custom Roll Templates

Edit `templates/chat/roll-result.hbs` and corresponding CSS in `styles/godcomplex.css`.

## Troubleshooting

**Sheet not loading**:
- Check browser console for errors (F12)
- Verify all files are in the correct locations
- Ensure Foundry VTT is updated to version 10 or higher

**Calculations not updating**:
- Refresh the character sheet
- Check that attributes are set correctly
- Verify template.json structure

**Rolls not working**:
- Ensure the actor owns the character
- Check browser console for JavaScript errors
- Verify dice.js is loading correctly

## Development

### Local Testing

1. Make changes to the system files
2. Restart Foundry VTT or reload the world
3. Test changes in the UI

### Debugging

Enable debug mode in Foundry VTT settings to see detailed console logs.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Compatibility

- **Foundry VTT**: Version 10+ (verified on 11)
- **Browsers**: Chrome, Firefox, Safari, Edge (latest versions)

## Credits

System designed for the God Complex TTRPG.

Implementation follows Foundry VTT system development best practices.

## License

This system is provided for use with the God Complex TTRPG.

## Support

For issues or questions:
- Check the documentation in this repository
- Review Foundry VTT system development docs: https://foundryvtt.com/article/system-development/
- Submit issues to the project repository

---

**Ready to play God Complex in Foundry VTT!** 🎲

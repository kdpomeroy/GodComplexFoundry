# God Complex Character Creator

A guided wizard-style character creation tool for the God Complex system in Foundry VTT.

## Features

- **Step-by-step wizard**: 7 easy steps to create a complete character
- **Attribute point distribution**: Visual interface for distributing attribute points
- **Skills management**: Add and configure skills with attribute associations
- **Powers creation**: Define supernatural powers with costs and effects
- **Equipment setup**: Add starting weapons, armor, and gear
- **Portrait upload**: Set character portrait during creation
- **Review step**: Review all character details before final creation
- **Validation**: Ensures all required fields are completed

## How to Use

### Method 1: Macro (Recommended)

1. Go to the **Macros** tab in Foundry
2. Click **Create Macro**
3. Name it "Character Creator"
4. Set the type to **Script**
5. Paste this code:
   ```javascript
   game.godcomplex.openCharacterCreator();
   ```
6. Save the macro
7. Drag it to your hotbar for quick access

### Method 2: Console Command

Open the browser console (F12) and type:
```javascript
game.godcomplex.openCharacterCreator();
```

### Method 3: Script Macro

Create a macro with the command:
```javascript
game.godcomplex.openCharacterCreator();
```

## Character Creation Steps

### Step 1: Basic Information
- **Character Name**: Required field
- **Concept**: Brief description of your character
- **Player**: Your name (auto-filled)
- **Portrait**: Upload a character image

### Step 2: Core Statistics
Set your character's core stats:
- **Tier**: Power level (1-5) - Determines overall capability
- **Generation**: Elysian age (1-5) - Older Elysians are more powerful
- **Domain**: Territory control (1-5) - Influence over mortal realm
- **Size**: Physical size modifier (-2 to +2)
- **XP**: Starting experience points (default: 3)

### Step 3: Attributes
Distribute **6 points** among your 6 attributes:
- **Strength (STR)**: Physical power, melee attacks
- **Dexterity (DEX)**: Agility, ranged attacks, speed
- **Awareness (AWA)**: Perception, initiative
- **Composure (COM)**: Mental resilience, social defense
- **Presence (PRE)**: Charisma, supernatural power
- **Intelligence (INT)**: Knowledge, investigation

Each attribute starts at 1, maximum is 5. You must distribute all 6 points before continuing.

### Step 4: Skills
Add skills representing your character's training:
- **Name**: Skill name (e.g., "Firearms", "Persuasion")
- **Attribute**: Which attribute the skill uses
- **Bonus**: Additional dice pool bonus

Click "Add Skill" to add more skills.

### Step 5: Powers
Create supernatural powers and abilities:
- **Name**: Power name (e.g., "Fireball", "Healing Touch")
- **Attribute**: Which attribute to roll
- **AP Cost**: Action Points required (0-3)
- **Gloriae Cost**: Gloriae points required
- **Description**: What the power does

### Step 6: Equipment
Add starting equipment:
- **Name**: Item name
- **Type**: Weapon, Armor, or Gear
- **Bonus**: Special bonuses or effects

### Step 7: Review
Review all your character details:
- Basic information
- Core statistics
- Attributes
- Skills list
- Powers list
- Equipment list

Click "Create Character" to finalize. The character sheet will open automatically.

## Validation

The creator validates your input at each step:
- **Name required**: Must enter a character name
- **Attribute points**: Must distribute all 6 points
- Other fields are optional but recommended

## Canceling

You can cancel at any time by clicking the "Cancel" button. You'll be asked to confirm since all progress will be lost.

## Tips

### Starting Character Recommendations

**Tier 1-2**: Beginning characters, lower power level
**Tier 3**: Standard starting point for most campaigns
**Tier 4-5**: Veteran characters, high power level

**Attribute Distribution Examples**:
- **Balanced**: All attributes at 2 (uses all 6 points)
- **Specialized**: One attribute at 4, others at 1-2
- **Focused**: Two attributes at 3, rest at 1

**Skills**: Start with 3-5 skills that match your character concept

**Powers**: Begin with 1-2 signature powers, you can add more later

**Equipment**: Don't forget at least one weapon and some armor!

## Technical Details

### Files Created
- `module/apps/character-creator.js` - Main creator logic
- `templates/apps/character-creator.hbs` - UI template
- `styles/godcomplex.css` - Styling (added to existing file)
- `languages/en.json` - Localization strings (added to existing file)
- `macros/open-character-creator.js` - Example macro

### Integration
The character creator is integrated into the God Complex system and accessible via:
```javascript
game.godcomplex.openCharacterCreator();
```

### Customization
To customize the character creator:
1. Edit `character-creator.js` for logic changes
2. Edit `character-creator.hbs` for UI changes
3. Edit CSS in `godcomplex.css` for styling changes
4. Edit `en.json` for text changes

## Troubleshooting

**Character creator won't open**:
- Check browser console for errors (F12)
- Ensure the system is properly installed
- Try reloading Foundry

**Can't proceed past attributes**:
- Make sure you've distributed all 6 points
- Points remaining should show "0" in green

**Skills/Powers not saving**:
- Ensure you've clicked "Create Character" on the review step
- Check that item names are not empty

**Portrait not uploading**:
- Use common image formats (PNG, JPG, WEBP)
- Check file size (keep under 1MB for best performance)

## Future Enhancements

Potential additions:
- Pre-built character templates
- Powerset presets (Fire, Healing, Invisibility, etc.)
- Equipment packages
- Import/export character data
- Integration with compendium items
- Automatic characteristic calculation preview

## Support

For issues or questions:
- Check the main God Complex README
- Review Foundry VTT documentation
- Check browser console for error messages

---

**Create your myth. Shape your legend.** 🎭

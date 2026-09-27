# God Complex Card System

## Overview

The Card System is a **premium feature** that allows players to generate beautiful, printable cards for their characters. Cards include equipment, abilities, and backgrounds with detailed stats and descriptions.

## Subscription Tiers

### Free Tier
- No access to card generation
- Basic character sheet functionality

### Mid Tier
- ✅ Equipment cards
- ✅ Background cards
- ✅ Print to PDF/HTML
- ❌ Ability cards

### High Tier
- ✅ All Mid Tier features
- ✅ Ability cards
- ✅ Custom card designs (future)
- ✅ Batch export (future)

## Implementation

### Checking User Tier

The card system checks the user's subscription tier before allowing access:

```javascript
// In card-system.js
static getUserTier() {
  return game.user.getFlag('godcomplex', 'subscriptionTier') || 'free';
}

static canAccessCards(cardType = 'equipment') {
  const userTier = this.getUserTier();
  
  if (userTier === 'high') return true; // All cards
  if (userTier === 'mid' && (cardType === 'equipment' || cardType === 'background')) return true;
  return false;
}
```

### Integration with Your Platform

To integrate with your subscription system, update the `getUserTier()` method:

**Option 1: Using User Flags**
```javascript
static getUserTier() {
  return game.user.getFlag('godcomplex', 'subscriptionTier') || 'free';
}

// Set tier when user subscribes:
await game.user.setFlag('godcomplex', 'subscriptionTier', 'mid');
```

**Option 2: Using a Server API**
```javascript
static async getUserTier() {
  const response = await fetch('/api/user/subscription', {
    headers: { 'Authorization': `Bearer ${game.user.token}` }
  });
  const data = await response.json();
  return data.tier || 'free';
}
```

**Option 3: Integration with Forge VTT**
```javascript
static getUserTier() {
  // Check Forge subscription status
  if (game.user.isGM && game.settings.get('core', 'subscriptionTier')) {
    return game.settings.get('core', 'subscriptionTier');
  }
  return 'free';
}
```

## Usage

### Viewing Cards

Players can view their cards through a dialog:

```javascript
// From a macro or button
const actor = game.user.character;
game.godcomplex.GodComplexCardSystem.openCardViewer(actor);
```

### Exporting Cards

Players can export cards as printable HTML:

```javascript
const actor = game.user.character;
game.godcomplex.GodComplexCardSystem.exportCardsAsHTML(actor);
```

### Adding Card Buttons to Character Sheet

Add buttons to the character sheet template:

```handlebars
{{!-- In character-sheet.hbs --}}
{{#if canUseCards}}
<div class="card-actions">
  <button type="button" class="view-cards">
    <i class="fas fa-id-card"></i> View Cards
  </button>
  <button type="button" class="export-cards">
    <i class="fas fa-print"></i> Export Cards
  </button>
</div>
{{else}}
<div class="card-upgrade-prompt">
  <p><i class="fas fa-lock"></i> Card printing requires Mid or High tier subscription</p>
  <button type="button" class="upgrade-button">Upgrade Now</button>
</div>
{{/if}}
```

## Card Types

### Equipment Cards
- **Color**: Purple (#8b5cf6)
- **Shows**: Name, type, damage/armor, range, value, description
- **Available**: Mid and High tiers

### Background Cards
- **Color**: Green (#10b981)
- **Shows**: Name, attribute bonus, specialty, proficiency, feature, ability, allies, rivals
- **Available**: Mid and High tiers

### Ability Cards
- **Color**: Orange (#f59e0b)
- **Shows**: Name, powerset, tier, AP cost, Gloriae cost, range, duration, description, progression
- **Available**: High tier only

## Printing

Cards are exported as HTML with print-optimized CSS:
- Cards avoid page breaks
- Optimized for standard paper sizes
- Can be printed directly or saved as PDF
- Professional card-style layout

## Future Enhancements

### Planned Features
- Custom card backs and designs
- Batch export for entire parties
- Card templates for GM-created items
- Integration with Foundry's item compendiums
- Export to PDF with card borders
- Double-sided cards (front/back)

### High Tier Exclusive Features
- Custom color schemes
- Custom card templates
- Bulk export (all characters at once)
- Priority support for card issues

## Technical Details

### File Structure
```
foundry/
├── module/
│   └── cards/
│       └── card-system.js      # Card generation logic
└── styles/
    └── cards.css                # Card styling
```

### Dependencies
- Font Awesome icons (included in Foundry)
- Modern browser with CSS Grid support
- Subscription tier system (to be implemented)

## Support

For issues or questions about the card system:
- Check the main God Complex documentation
- Review Foundry VTT module development docs
- Submit issues to the GitHub repository

---

**Card System - Premium Feature for God Complex on Foundry VTT**

/**
 * God Complex Card System
 * Generates visual cards for equipment, abilities, and backgrounds
 * 
 * PREMIUM FEATURE: Card generation and printing is available based on account tier
 * - Mid Tier: Access to equipment and background cards
 * - High Tier: Access to all card types including abilities
 */

export class GodComplexCardSystem {
  constructor() {
    this.cardTypes = {
      equipment: {
        icon: 'fas fa-shield-alt',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
      },
      ability: {
        icon: 'fas fa-bolt',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      },
      background: {
        icon: 'fas fa-user-circle',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      }
    };
  }

  /**
   * Check if user's account tier allows card access
   * This should be integrated with your subscription/payment system
   * 
   * @param {string} cardType - 'equipment', 'background', or 'ability'
   * @returns {boolean}
   */
  static canAccessCards(cardType = 'equipment') {
    // TODO: Integrate with your account/subscription system
    // Example implementation:
    // const userTier = game.user.getFlag('godcomplex', 'subscriptionTier') || 'free';
    // 
    // if (userTier === 'high') return true; // All cards
    // if (userTier === 'mid' && (cardType === 'equipment' || cardType === 'background')) return true;
    // return false;
    
    // For now, allow all users (remove this when implementing actual tier checking)
    return true;
  }

  /**
   * Get the user's subscription tier
   * TODO: Replace with actual subscription checking logic
   */
  static getUserTier() {
    // TODO: Implement actual tier checking
    // This could check:
    // - game.user.getFlag('godcomplex', 'subscriptionTier')
    // - A server-side API call
    // - Integration with Forge VTT subscription system
    // - Your own Loom platform subscription
    
    return game.user.getFlag('godcomplex', 'subscriptionTier') || 'free';
  }

  /**
   * Generate HTML for an equipment card
   */
  static generateEquipmentCard(item) {
    const flags = item.flags?.godcomplex || {};
    const system = item.system;
    
    let statsHtml = '';
    if (system.equipmentType === 'weapon') {
      statsHtml = `
        <div class="card-stat">
          <span class="stat-label">Damage:</span>
          <span class="stat-value">${system.damage || '0'}</span>
        </div>
        <div class="card-stat">
          <span class="stat-label">Range:</span>
          <span class="stat-value">${flags.weapon_range || 'melee'}</span>
        </div>
        <div class="card-stat">
          <span class="stat-label">Type:</span>
          <span class="stat-value">${flags.weapon_tag || 'Unknown'}</span>
        </div>
        ${flags.damage_type ? `<div class="card-stat">
          <span class="stat-label">Damage Type:</span>
          <span class="stat-value">${flags.damage_type}</span>
        </div>` : ''}
      `;
    } else if (system.equipmentType === 'armor') {
      statsHtml = `
        <div class="card-stat">
          <span class="stat-label">Armor:</span>
          <span class="stat-value">+${system.armor || 0}</span>
        </div>
        <div class="card-stat">
          <span class="stat-label">Type:</span>
          <span class="stat-value">${flags.armor_type || 'Unknown'}</span>
        </div>
      `;
    } else {
      statsHtml = `
        <div class="card-stat">
          <span class="stat-label">Type:</span>
          <span class="stat-value">Gear</span>
        </div>
      `;
    }

    return `
      <div class="gc-card equipment-card">
        <div class="card-header">
          <div class="card-icon"><i class="fas fa-shield-alt"></i></div>
          <div class="card-title">${item.name}</div>
          <div class="card-type">${system.equipmentType}</div>
        </div>
        <div class="card-body">
          ${statsHtml}
          ${flags.item_value ? `<div class="card-stat">
            <span class="stat-label">Value:</span>
            <span class="stat-value">${flags.item_value}</span>
          </div>` : ''}
          ${system.description ? `<div class="card-description">${system.description}</div>` : ''}
        </div>
        <div class="card-footer">
          <span class="card-slot">Slots: ${flags.slot_value || 0}</span>
        </div>
      </div>
    `;
  }

  /**
   * Generate HTML for an ability card
   */
  static generateAbilityCard(item) {
    const flags = item.flags?.godcomplex || {};
    const system = item.system;
    
    return `
      <div class="gc-card ability-card">
        <div class="card-header">
          <div class="card-icon"><i class="fas fa-bolt"></i></div>
          <div class="card-title">${item.name}</div>
          <div class="card-type">${flags.powerset || 'Ability'}</div>
        </div>
        <div class="card-body">
          <div class="card-stat">
            <span class="stat-label">Tier:</span>
            <span class="stat-value">${flags.tier || 1}</span>
          </div>
          <div class="card-stat">
            <span class="stat-label">AP Cost:</span>
            <span class="stat-value">${system.apCost || 0}</span>
          </div>
          <div class="card-stat">
            <span class="stat-label">Gloriae Cost:</span>
            <span class="stat-value">${system.glorieaCost || 0}</span>
          </div>
          <div class="card-stat">
            <span class="stat-label">Range:</span>
            <span class="stat-value">${system.range || 'self'}</span>
          </div>
          <div class="card-stat">
            <span class="stat-label">Duration:</span>
            <span class="stat-value">${flags.duration || 'Instantaneous'}</span>
          </div>
          ${system.description ? `<div class="card-description">${system.description}</div>` : ''}
          ${flags.progression ? `<div class="card-progression">
            <span class="stat-label">Progression:</span>
            <div class="progression-text">${flags.progression}</div>
          </div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Generate HTML for a background card
   */
  static generateBackgroundCard(background) {
    return `
      <div class="gc-card background-card">
        <div class="card-header">
          <div class="card-icon"><i class="fas fa-user-circle"></i></div>
          <div class="card-title">${background.name}</div>
          <div class="card-type">Background</div>
        </div>
        <div class="card-body">
          <div class="card-stat">
            <span class="stat-label">Attribute Bonus:</span>
            <span class="stat-value">+1 ${background.attribute_bonus}</span>
          </div>
          <div class="card-stat">
            <span class="stat-label">Free Specialty:</span>
            <span class="stat-value">${background.free_specialty}</span>
          </div>
          <div class="card-stat">
            <span class="stat-label">Free Proficiency:</span>
            <span class="stat-value">${background.free_proficiency}</span>
          </div>
          <div class="card-stat">
            <span class="stat-label">Wealth Level:</span>
            <span class="stat-value">${background.wealth_level}</span>
          </div>
          ${background.feature ? `<div class="card-feature">
            <span class="stat-label">Feature:</span>
            <div class="feature-text">${background.feature}</div>
          </div>` : ''}
          ${background.ability ? `<div class="card-ability">
            <span class="stat-label">Ability:</span>
            <div class="ability-text">${background.ability}</div>
          </div>` : ''}
          ${background.allies ? `<div class="card-allies">
            <span class="stat-label">Allies:</span>
            <div class="allies-text">${background.allies}</div>
          </div>` : ''}
          ${background.rivals ? `<div class="card-rivals">
            <span class="stat-label">Rivals:</span>
            <div class="rivals-text">${background.rivals}</div>
          </div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Open card viewer dialog for an actor
   * Premium feature - requires mid or high tier subscription
   */
  static async openCardViewer(actor) {
    // Check if user has access to card system
    if (!this.canAccessCards('equipment')) {
      ui.notifications.warn("Card system requires a Mid or High tier subscription!");
      this._showUpgradePrompt();
      return;
    }

    const equipment = actor.items.filter(i => i.type === 'equipment');
    const abilities = actor.items.filter(i => i.type === 'power');
    const background = game.godcomplex.backgrounds.find(b => b.id === actor.system.background);

    let content = '<div class="gc-card-viewer">';
    
    // Background card (available to mid and high tier)
    if (background && this.canAccessCards('background')) {
      content += '<h2><i class="fas fa-user-circle"></i> Background</h2>';
      content += this.generateBackgroundCard(background);
    }

    // Equipment cards (available to mid and high tier)
    if (equipment.length > 0 && this.canAccessCards('equipment')) {
      content += '<h2><i class="fas fa-shield-alt"></i> Equipment</h2>';
      content += '<div class="card-grid">';
      for (const item of equipment) {
        content += this.generateEquipmentCard(item);
      }
      content += '</div>';
    }

    // Ability cards (high tier only)
    if (abilities.length > 0 && this.canAccessCards('ability')) {
      content += '<h2><i class="fas fa-bolt"></i> Abilities</h2>';
      content += '<div class="card-grid">';
      for (const item of abilities) {
        content += this.generateAbilityCard(item);
      }
      content += '</div>';
    } else if (abilities.length > 0 && !this.canAccessCards('ability')) {
      content += '<div class="upgrade-prompt">';
      content += '<i class="fas fa-lock"></i>';
      content += '<p>Ability cards are available with a High tier subscription</p>';
      content += '<button class="upgrade-button">Upgrade Now</button>';
      content += '</div>';
    }

    content += '</div>';

    new Dialog({
      title: `${actor.name} - Cards`,
      content: content,
      buttons: {
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: "Close"
        }
      },
      width: 900
    }).render(true);
  }

  /**
   * Export cards as printable HTML
   * Premium feature - requires mid or high tier subscription
   */
  static async exportCardsAsHTML(actor) {
    // Check if user has access to card system
    if (!this.canAccessCards('equipment')) {
      ui.notifications.warn("Card export requires a Mid or High tier subscription!");
      this._showUpgradePrompt();
      return;
    }

    const equipment = actor.items.filter(i => i.type === 'equipment');
    const abilities = actor.items.filter(i => i.type === 'power');
    const background = game.godcomplex.backgrounds.find(b => b.id === actor.system.background);

    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>${actor.name} - Cards</title>
  <link rel="stylesheet" href="systems/godcomplex/styles/cards.css">
  <style>
    @media print {
      body { margin: 0; }
      .gc-card { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="card-print-container">
`;

    // Background card (mid and high tier)
    if (background && this.canAccessCards('background')) {
      html += '<h1>Background</h1>';
      html += this.generateBackgroundCard(background);
    }

    // Equipment cards (mid and high tier)
    if (equipment.length > 0 && this.canAccessCards('equipment')) {
      html += '<h1>Equipment</h1>';
      for (const item of equipment) {
        html += this.generateEquipmentCard(item);
      }
    }

    // Ability cards (high tier only)
    if (abilities.length > 0 && this.canAccessCards('ability')) {
      html += '<h1>Abilities</h1>';
      for (const item of abilities) {
        html += this.generateAbilityCard(item);
      }
    }

    html += '</div></body></html>';

    // Create downloadable file
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${actor.name.replace(/\s+/g, '_')}_cards.html`;
    a.click();
    URL.revokeObjectURL(url);

    ui.notifications.info("Cards exported as HTML!");
  }

  /**
   * Show upgrade prompt dialog
   */
  static _showUpgradePrompt() {
    const userTier = this.getUserTier();
    
    let content = `
      <div class="upgrade-prompt-dialog">
        <div class="upgrade-icon">
          <i class="fas fa-crown"></i>
        </div>
        <h2>Unlock Card Printing</h2>
        <p>Generate beautiful, printable cards for your characters!</p>
        
        <div class="tier-comparison">
          <div class="tier-card ${userTier === 'mid' ? 'current-tier' : ''}">
            <h3>Mid Tier</h3>
            <ul>
              <li><i class="fas fa-check"></i> Equipment cards</li>
              <li><i class="fas fa-check"></i> Background cards</li>
              <li><i class="fas fa-check"></i> Print to PDF</li>
            </ul>
          </div>
          
          <div class="tier-card ${userTier === 'high' ? 'current-tier' : ''}">
            <h3>High Tier</h3>
            <ul>
              <li><i class="fas fa-check"></i> All Mid Tier features</li>
              <li><i class="fas fa-check"></i> Ability cards</li>
              <li><i class="fas fa-check"></i> Custom card designs</li>
              <li><i class="fas fa-check"></i> Batch export</li>
            </ul>
          </div>
        </div>
        
        <p class="upgrade-note">
          <i class="fas fa-info-circle"></i>
          Upgrade your account to unlock premium features!
        </p>
      </div>
    `;

    new Dialog({
      title: "Upgrade Your Account",
      content: content,
      buttons: {
        upgrade: {
          icon: '<i class="fas fa-crown"></i>',
          label: "Upgrade Now",
          callback: () => {
            // TODO: Link to your upgrade page
            // window.open('https://your-platform.com/upgrade', '_blank');
            ui.notifications.info("Upgrade functionality coming soon!");
          }
        },
        close: {
          icon: '<i class="fas fa-times"></i>',
          label: "Maybe Later"
        }
      },
      default: "upgrade"
    }).render(true);
  }
}

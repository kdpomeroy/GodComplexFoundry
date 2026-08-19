/**
 * God Complex Actor Document
 * Extends the base Actor class with God Complex specific logic
 */

export class GodComplexActor extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();
    const actorData = this;
    const systemData = actorData.system;
    
    // Calculate derived stats
    this._calculateDerivedStats(systemData);
  }

  /**
   * Calculate all derived stats from attributes and core values
   * @param {object} systemData - The actor's system data
   */
  _calculateDerivedStats(systemData) {
    const a = systemData.attributes;
    const core = systemData.core;
    const derived = systemData.derived;
    const conditions = systemData.conditions;

    const str = a.strength.value;
    const dex = a.dexterity.value;
    const awa = a.awareness.value;
    const com = a.composure.value;
    const pre = a.presence.value;
    const int = a.intelligence.value;
    const tier = core.tier.value;
    const gen = core.generation.value;
    const dom = core.domain.value;
    const size = core.size.value;
    const xp = core.xp.value;

    // Fortitude = Tier + Size + STR (minimum: Tier)
    const fortRaw = tier + size + str;
    derived.fortitude.value = fortRaw >= 1 ? fortRaw : tier;

    // Evasion = Tier + DEX - Size (minimum: Tier)
    const evasRaw = tier + dex - size;
    let evasion = evasRaw >= 1 ? evasRaw : tier;

    // Apply defending condition
    if (conditions.defending) {
      evasion += awa;
    }

    // Apply all-out attack condition
    if (conditions.allOutAttack) {
      evasion = Math.floor(evasion / 2);
    }

    // Apply prone condition (to ranged attackers)
    if (conditions.prone) {
      evasion += 1;
    }

    derived.evasion.value = evasion;

    // Conviction = Tier + PRE + COM
    derived.conviction.value = tier + pre + com;

    // Willpower = Tier + INT + COM
    derived.willpower.value = tier + int + com;

    // Initiative = AWA + DEX
    derived.initiative.value = awa + dex;

    // Speed = DEX × 10 ft
    let speed = dex * 10;
    if (conditions.encumbered) {
      speed = Math.floor(speed / 2);
    }
    derived.speed.value = speed;

    // Calculate resource maximums
    systemData.resources.health.max = tier + gen + derived.fortitude.value + xp;
    systemData.resources.gloriea.max = derived.conviction.value + gen + dom;
    systemData.resources.willpower.max = derived.willpower.value;
    systemData.resources.ap.max = 3;
  }

  /**
   * Get the total armor value from equipped items
   * @returns {number} Total armor value
   */
  _getEquippedArmor() {
    let armor = 0;
    for (const item of this.items) {
      if (item.type === "equipment" && 
          item.system.equipmentType === "armor" && 
          item.system.equipped) {
        armor = Math.max(armor, item.system.armor);
      }
    }
    return armor;
  }

  /**
   * Calculate derived stats (public method for manual recalculation)
   */
  calculateDerivedStats() {
    this._calculateDerivedStats(this.system);
    this.render(false);
  }

  /**
   * Roll an attribute check
   * @param {string} attributeName - Name of the attribute to roll
   * @param {object} options - Roll options
   */
  async rollAttribute(attributeName, options = {}) {
    return game.godcomplex.GodComplexDice.rollAttribute(this, attributeName, options);
  }

  /**
   * Roll initiative
   */
  async rollInitiative(options = {}) {
    return game.godcomplex.GodComplexDice.rollInitiative(this);
  }

  /**
   * Spend Gloriae
   * @param {number} amount - Amount to spend
   */
  async spendGloriae(amount) {
    const current = this.system.resources.gloriea.value;
    if (current < amount) {
      ui.notifications.warn(game.i18n.localize("GODCOMPLEX.NotEnoughGloriae"));
      return false;
    }
    await this.update({ "system.resources.gloriea.value": current - amount });
    return true;
  }

  /**
   * Spend Willpower
   * @param {number} amount - Amount to spend
   */
  async spendWillpower(amount) {
    const current = this.system.resources.willpower.value;
    if (current < amount) {
      ui.notifications.warn(game.i18n.localize("GODCOMPLEX.NotEnoughWillpower"));
      return false;
    }
    await this.update({ "system.resources.willpower.value": current - amount });
    return true;
  }

  /**
   * Take damage
   * @param {number} amount - Damage amount
   * @param {string} type - Damage type
   */
  async takeDamage(amount, type = "normal") {
    const current = this.system.resources.health.value;
    const armor = this._getEquippedArmor();
    const effectiveDamage = Math.max(0, amount - armor);
    const newHealth = Math.max(0, current - effectiveDamage);
    
    await this.update({ "system.resources.health.value": newHealth });
    
    if (newHealth === 0) {
      ui.notifications.error(game.i18n.format("GODCOMPLEX.CharacterUnconscious", { name: this.name }));
    }
    
    return effectiveDamage;
  }

  /**
   * Heal damage
   * @param {number} amount - Amount to heal
   */
  async heal(amount) {
    const current = this.system.resources.health.value;
    const max = this.system.resources.health.max;
    const newHealth = Math.min(max, current + amount);
    await this.update({ "system.resources.health.value": newHealth });
    return amount;
  }

  /**
   * Rest to recover resources
   * @param {string} restType - "short" or "long"
   */
  async rest(restType = "long") {
    const updates = {};
    
    if (restType === "long") {
      // Long rest: recover all resources
      updates["system.resources.health.value"] = this.system.resources.health.max;
      updates["system.resources.gloriea.value"] = this.system.resources.gloriea.max;
      updates["system.resources.willpower.value"] = this.system.resources.willpower.max;
      updates["system.resources.ap.value"] = this.system.resources.ap.max;
      
      // Clear conditions
      updates["system.conditions.stunned"] = false;
      updates["system.conditions.prone"] = false;
      updates["system.conditions.blinded"] = false;
      updates["system.conditions.restrained"] = false;
      updates["system.conditions.poisoned"] = false;
      updates["system.conditions.defending"] = false;
      updates["system.conditions.allOutAttack"] = false;
    } else {
      // Short rest: recover 1 AP
      updates["system.resources.ap.value"] = Math.min(
        this.system.resources.ap.max,
        this.system.resources.ap.value + 1
      );
    }
    
    await this.update(updates);
    
    const message = restType === "long" 
      ? game.i18n.format("GODCOMPLEX.LongRest", { name: this.name })
      : game.i18n.format("GODCOMPLEX.ShortRest", { name: this.name });
    
    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: message
    });
  }

  /**
   * Toggle a condition
   * @param {string} conditionName - Name of the condition to toggle
   */
  async toggleCondition(conditionName) {
    const current = this.system.conditions[conditionName];
    if (current === undefined) {
      ui.notifications.error(`Invalid condition: ${conditionName}`);
      return;
    }
    
    await this.update({ [`system.conditions.${conditionName}`]: !current });
    
    const status = !current ? "gained" : "lost";
    const conditionLabel = game.i18n.localize(`GODCOMPLEX.Conditions.${conditionName}`);
    
    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: game.i18n.format("GODCOMPLEX.ConditionChanged", {
        name: this.name,
        condition: conditionLabel,
        status: status
      })
    });
  }
}

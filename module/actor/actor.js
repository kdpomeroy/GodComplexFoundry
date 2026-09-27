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
   * Get all equipped weapons
   * @returns {Array} Array of equipped weapon items
   */
  _getEquippedWeapons() {
    const weapons = [];
    for (const item of this.items) {
      if (item.type === "equipment" && 
          item.system.equipmentType === "weapon" && 
          item.system.equipped) {
        weapons.push(item);
      }
    }
    return weapons;
  }

  /**
   * Calculate effective armor including all equipped armor items
   * @returns {object} Object with base armor, equipped armor, and total
   */
  getEffectiveArmor() {
    const baseArmor = this.system.armor || 0;
    const equippedArmor = this._getEquippedArmor();
    return {
      base: baseArmor,
      equipped: equippedArmor,
      total: baseArmor + equippedArmor
    };
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
      ui.notifications.warn(game.i18n.localize("NotEnoughGloriae"));
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
      ui.notifications.warn(game.i18n.localize("NotEnoughWillpower"));
      return false;
    }
    await this.update({ "system.resources.willpower.value": current - amount });
    return true;
  }

  /**
   * Take damage with armor calculation
   * @param {number} amount - Damage amount
   * @param {string} type - Damage type
   * @returns {object} Object with effective damage and armor info
   */
  async takeDamage(amount, type = "normal") {
    const current = this.system.resources.health.value;
    const armor = this.getEffectiveArmor();
    const effectiveDamage = Math.max(0, amount - armor.total);
    const newHealth = Math.max(0, current - effectiveDamage);
    
    await this.update({ "system.resources.health.value": newHealth });
    
    if (newHealth === 0) {
      ui.notifications.error(game.i18n.format("CharacterUnconscious", { name: this.name }));
    }
    
    return { 
      effectiveDamage, 
      armorReduced: armor.total,
      originalDamage: amount
    };
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
   * Perform a weapon attack with an equipped weapon
   * @param {Item} weapon - The weapon item to attack with
   * @param {object} options - Additional options
   * @returns {Promise<object>} The roll result
   */
  async attackWithWeapon(weapon, options = {}) {
    if (!weapon || weapon.type !== "equipment" || weapon.system.equipmentType !== "weapon") {
      ui.notifications.error("Invalid weapon");
      return null;
    }

    if (!weapon.system.equipped) {
      ui.notifications.warn("Weapon must be equipped to attack");
      return null;
    }

    // Check if actor has enough AP
    const apCost = options.apCost || 1;
    if (this.system.resources.ap.value < apCost) {
      ui.notifications.warn(game.i18n.localize("NotEnoughAP"));
      return null;
    }

    // Determine attribute based on weapon
    let attributeName = options.attribute || "strength";
    if (weapon.system.attribute) {
      attributeName = weapon.system.attribute.toLowerCase().replace(" ", "");
    }

    const attribute = this.system.attributes[attributeName];
    if (!attribute) {
      ui.notifications.error(`Invalid attribute: ${attributeName}`);
      return null;
    }

    // Calculate dice pool: attribute value + weapon bonus
    const poolSize = attribute.value + (weapon.system.bonus || 0);

    // Roll the dice pool
    const result = await game.godcomplex.GodComplexDice.rollDicePool(poolSize, {
      label: `Attack with ${weapon.name}`,
      actorId: this.id,
      weaponId: weapon.id
    });

    // Add weapon damage to result
    result.weaponDamage = weapon.system.damage || "0";
    result.weaponName = weapon.name;
    result.weaponBonus = weapon.system.bonus || 0;

    // Display the roll result
    await game.godcomplex.GodComplexDice._displayRollResult(this, result, {
      ...options,
      weaponName: weapon.name,
      weaponDamage: weapon.system.damage,
      weaponBonus: weapon.system.bonus,
      apCost: apCost
    });

    // Spend AP
    await this.update({ "system.resources.ap.value": this.system.resources.ap.value - apCost });

    return result;
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
      ? game.i18n.format("LongRestAction", { name: this.name })
      : game.i18n.format("ShortRestAction", { name: this.name });
    
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
    const conditionLabel = game.i18n.localize(`Conditions.${conditionName}`);
    
    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: game.i18n.format("ConditionChanged", {
        name: this.name,
        condition: conditionLabel,
        status: status
      })
    });
  }

  /**
   * Perform a combat action
   * @param {string} action - The action to perform (attack, defend, recover, aid, allOutAttack)
   */
  async performCombatAction(action) {
    const currentAP = this.system.resources.ap.value;
    
    // Check if actor has enough AP
    if (currentAP < 1) {
      throw new Error("Not enough Action Points!");
    }

    switch (action) {
      case "attack":
        await this._performAttack();
        break;
      case "defend":
        await this._performDefend();
        break;
      case "recover":
        await this._performRecover();
        break;
      case "aid":
        await this._performAid();
        break;
      case "allOutAttack":
        await this._performAllOutAttack();
        break;
      default:
        throw new Error(`Unknown combat action: ${action}`);
    }

    // Spend 1 AP
    await this.update({
      "system.resources.ap.value": currentAP - 1
    });
  }

  /**
   * Perform an attack action
   */
  async _performAttack() {
    // Attack uses the actor's primary attribute (Strength for melee, Dexterity for ranged)
    // For now, we'll use Strength as default
    const attributeName = "strength";
    const attribute = this.system.attributes[attributeName];
    const poolSize = attribute.value;
    
    const result = await game.godcomplex.GodComplexDice.rollDicePool(poolSize, {
      label: "Attack",
      actorId: this.id
    });

    await game.godcomplex.GodComplexDice._displayRollResult(this, result, {
      actionType: "attack"
    });

    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `${this.name} makes an attack! (1 AP spent)`
    });
  }

  /**
   * Perform a defend action
   */
  async _performDefend() {
    // Add Awareness to Evasion for the round
    const awareness = this.system.attributes.awareness.value;
    const currentEvasion = this.system.derived.evasion.value;
    
    // Set the defending condition
    await this.update({
      "system.conditions.defending": true
    });

    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `${this.name} takes a Defend action! +${awareness} to Evasion this round. (1 AP spent)`
    });
  }

  /**
   * Perform a recover action
   */
  async _performRecover() {
    const currentHealth = this.system.resources.health.value;
    const maxHealth = this.system.resources.health.max;
    const newHealth = Math.min(maxHealth, currentHealth + 1);
    
    await this.update({
      "system.resources.health.value": newHealth
    });

    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `${this.name} recovers 1 Health! (1 AP spent)`
    });
  }

  /**
   * Perform an aid action
   */
  async _performAid() {
    // Aid grants +1 to an ally's next roll
    // For now, we'll just post a message - full implementation would require target selection
    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `${this.name} prepares to Aid an ally! (+1 to their next roll) (1 AP spent)`
    });
  }

  /**
   * Perform an all-out attack action
   */
  async _performAllOutAttack() {
    // Add half Evasion to attack pool, halve Evasion
    const currentEvasion = this.system.derived.evasion.value;
    const bonus = Math.floor(currentEvasion / 2);
    
    // Set the allOutAttack condition
    await this.update({
      "system.conditions.allOutAttack": true
    });

    // Attack with bonus
    const attributeName = "strength";
    const attribute = this.system.attributes[attributeName];
    const poolSize = attribute.value + bonus;
    
    const result = await game.godcomplex.GodComplexDice.rollDicePool(poolSize, {
      label: "All-Out Attack",
      actorId: this.id
    });

    await game.godcomplex.GodComplexDice._displayRollResult(this, result, {
      actionType: "allOutAttack",
      bonus: bonus
    });

    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `${this.name} makes an All-Out Attack! +${bonus} to attack pool, Evasion halved. (1 AP spent)`
    });
  }
}

/**
 * God Complex Dice System
 * Implements the d6 dice pool with advance counting
 */

export class GodComplexDice {
  /**
   * Roll a d6 dice pool and count advances
   * @param {number} poolSize - Number of d6 to roll
   * @param {object} options - Additional options
   * @returns {object} Roll result with dice and advances
   */
  static rollDicePool(poolSize, options = {}) {
    console.log("God Complex Dice | rollDicePool called with pool size:", poolSize);
    const effectivePool = Math.max(1, Math.floor(poolSize));
    const roll = new Roll(`${effectivePool}d6`);
    roll.evaluateSync();
    
    const dice = roll.dice[0].results.map(r => r.result);
    console.log("God Complex Dice | Rolled dice:", dice);
    let advances = 0;
    let fives = 0;
    let sixes = 0;
    
    for (const face of dice) {
      if (face === 6) {
        sixes++;
        advances += 2;
      } else if (face === 5) {
        fives++;
        advances += 1;
      }
    }
    
    console.log("God Complex Dice | Advances:", advances, "Fives:", fives, "Sixes:", sixes);
    
    return {
      roll,
      dice,
      advances,
      fives,
      sixes,
      poolSize: effectivePool,
      ...options
    };
  }

  /**
   * Create a dice pool roll with flavor text
   * @param {Actor} actor - The actor making the roll
   * @param {string} attributeName - Name of the attribute to roll
   * @param {object} options - Additional options
   */
  static async rollAttribute(actor, attributeName, options = {}) {
    console.log("God Complex Dice | rollAttribute called for:", attributeName);
    const attribute = actor.system.attributes[attributeName];
    if (!attribute) {
      ui.notifications.error(`Invalid attribute: ${attributeName}`);
      return;
    }

    const poolSize = attribute.value + (options.modifier || 0);
    console.log("God Complex Dice | Pool size:", poolSize);
    const result = this.rollDicePool(poolSize, {
      label: options.label || attributeName.charAt(0).toUpperCase() + attributeName.slice(1),
      actorId: actor.id,
      attributeName
    });

    await this._displayRollResult(actor, result, options);
    return result;
  }

  /**
   * Roll a skill check
   * @param {Actor} actor - The actor making the roll
   * @param {Item} skill - The skill item
   * @param {object} options - Additional options
   */
  static async rollSkill(actor, skill, options = {}) {
    const attribute = actor.system.attributes[skill.system.attribute];
    const poolSize = attribute.value + skill.system.bonus + (options.modifier || 0);
    
    const result = this.rollDicePool(poolSize, {
      label: skill.name,
      actorId: actor.id,
      skillId: skill.id,
      attributeName: skill.system.attribute
    });

    await this._displayRollResult(actor, result, {
      ...options,
      skillName: skill.name,
      specialty: skill.system.specialty
    });
    
    return result;
  }

  /**
   * Roll a power/ability check
   * @param {Actor} actor - The actor using the power
   * @param {Item} power - The power item
   * @param {object} options - Additional options
   */
  static async rollPower(actor, power, options = {}) {
    // Check if actor has enough Gloriae
    if (actor.system.resources.gloriea.value < power.system.glorieaCost) {
      ui.notifications.warn(game.i18n.localize("NotEnoughGloriae"));
      return;
    }

    // Check if actor has enough AP
    if (actor.system.resources.ap.value < power.system.apCost) {
      ui.notifications.warn(game.i18n.localize("NotEnoughAP"));
      return;
    }

    const attribute = actor.system.attributes[power.system.attribute];
    const poolSize = attribute.value + (options.modifier || 0);
    
    const result = this.rollDicePool(poolSize, {
      label: power.name,
      actorId: actor.id,
      powerId: power.id,
      attributeName: power.system.attribute,
      glorieaCost: power.system.glorieaCost,
      apCost: power.system.apCost
    });

    // Spend resources
    await actor.update({
      "system.resources.gloriea.value": actor.system.resources.gloriea.value - power.system.glorieaCost,
      "system.resources.ap.value": actor.system.resources.ap.value - power.system.apCost
    });

    await this._displayRollResult(actor, result, {
      ...options,
      powerName: power.name,
      glorieaCost: power.system.glorieaCost,
      apCost: power.system.apCost
    });
    
    return result;
  }

  /**
   * Roll initiative for combat
   * @param {Actor} actor - The actor rolling initiative
   */
  static async rollInitiative(actor) {
    const poolSize = actor.system.attributes.awareness.value + actor.system.attributes.dexterity.value;
    const result = this.rollDicePool(poolSize, {
      label: game.i18n.localize("Initiative"),
      actorId: actor.id,
      isInitiative: true
    });

    await this._displayRollResult(actor, result, {
      isInitiative: true
    });
    
    return result;
  }

  /**
   * Display roll result in chat
   * @param {Actor} actor - The actor who made the roll
   * @param {object} result - The roll result
   * @param {object} options - Display options
   */
  static async _displayRollResult(actor, result, options = {}) {
    console.log("God Complex Dice | Displaying roll result for:", actor.name);
    const templateData = {
      actor,
      result,
      options,
      difficulty: options.difficulty,
      success: options.difficulty ? result.advances >= options.difficulty : null,
      partial: options.difficulty ? result.advances >= 1 && result.advances < options.difficulty : null
    };

    const content = await renderTemplate("systems/godcomplex/templates/chat/roll-result.hbs", templateData);
    console.log("God Complex Dice | Template rendered, creating chat message");
    
    const messageData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content,
      rolls: [result.roll],
      sound: CONFIG.sounds.dice,
      flags: {
        "godcomplex": {
          actorId: actor.id,
          rollType: options.rollType || "attribute",
          advances: result.advances
        }
      }
    };

    await ChatMessage.create(messageData);
    console.log("God Complex Dice | Chat message created");
  }

  /**
   * Handle roll button clicks from chat messages
   * @param {string} action - The action to perform
   * @param {Actor} actor - The actor performing the action
   */
  static async handleRollButton(action, actor) {
    const [actionType, ...params] = action.split("|");
    
    switch (actionType) {
      case "attribute":
        await this.rollAttribute(actor, params[0]);
        break;
      case "skill":
        const skill = actor.items.get(params[0]);
        if (skill) await this.rollSkill(actor, skill);
        break;
      case "power":
        const power = actor.items.get(params[0]);
        if (power) await this.rollPower(actor, power);
        break;
      case "initiative":
        await this.rollInitiative(actor);
        break;
    }
  }

  /**
   * Parse difficulty from text
   * @param {string} difficultyText - Text representation of difficulty
   * @returns {number} Numeric difficulty value
   */
  static parseDifficulty(difficultyText) {
    const difficulties = {
      "trivial": 1,
      "easy": 2,
      "moderate": 3,
      "standard": 3,
      "challenging": 4,
      "hard": 5,
      "veryhard": 6,
      "extreme": 7,
      "legendary": 8
    };
    
    return difficulties[difficultyText.toLowerCase()] || parseInt(difficultyText) || 0;
  }
}

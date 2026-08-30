/**
 * God Complex Combat System
 * Handles combat-specific mechanics
 */

export class GodComplexCombat {
  /**
   * Called when combat starts
   * @param {Combat} combat - The combat encounter
   */
  static onCombatStart(combat) {
    console.log("God Complex | Combat started");
    
    // Reset AP for all combatants
    for (const combatant of combat.combatants) {
      const actor = combatant.actor;
      if (actor) {
        actor.update({ "system.resources.ap.value": actor.system.resources.ap.max });
      }
    }
  }

  /**
   * Called when combat updates (new round or turn)
   * @param {Combat} combat - The combat encounter
   * @param {object} data - The update data
   */
  static async onCombatUpdate(combat, data) {
    // Reset AP at the start of each turn
    if (data.turn !== undefined) {
      const combatant = combat.combatant;
      if (combatant && combatant.actor) {
        await combatant.actor.update({ 
          "system.resources.ap.value": combatant.actor.system.resources.ap.max,
          "system.conditions.defending": false,
          "system.conditions.allOutAttack": false
        });
      }
    }
  }

  /**
   * Called when combat ends
   * @param {Combat} combat - The combat encounter
   */
  static onCombatEnd(combat) {
    console.log("God Complex | Combat ended");
    
    // Clear combat-specific conditions
    for (const combatant of combat.combatants) {
      const actor = combatant.actor;
      if (actor) {
        actor.update({
          "system.conditions.defending": false,
          "system.conditions.allOutAttack": false
        });
      }
    }
  }

  /**
   * Spend AP for a combatant
   * @param {Combatant} combatant - The combatant
   * @param {number} amount - AP to spend
   */
  static async spendAP(combatant, amount) {
    const actor = combatant.actor;
    if (!actor) return;

    const current = actor.system.resources.ap.value;
    if (current < amount) {
      ui.notifications.warn(game.i18n.localize("NotEnoughAP"));
      return false;
    }

    await actor.update({ "system.resources.ap.value": current - amount });
    return true;
  }

  /**
   * Perform a defend action
   * @param {Combatant} combatant - The combatant defending
   */
  static async defendAction(combatant) {
    const actor = combatant.actor;
    if (!actor) return;

    // Spend 1 AP
    const success = await this.spendAP(combatant, 1);
    if (!success) return;

    // Set defending condition
    await actor.update({ "system.conditions.defending": true });

    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: game.i18n.format("DefendAction", { name: actor.name })
    });
  }

  /**
   * Perform an all-out attack action
   * @param {Combatant} combatant - The combatant attacking
   */
  static async allOutAttackAction(combatant) {
    const actor = combatant.actor;
    if (!actor) return;

    // Spend 1 AP
    const success = await this.spendAP(combatant, 1);
    if (!success) return;

    // Set all-out attack condition
    await actor.update({ "system.conditions.allOutAttack": true });

    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: game.i18n.format("AllOutAttackAction", { name: actor.name })
    });
  }

  /**
   * Perform a recover action
   * @param {Combatant} combatant - The combatant recovering
   */
  static async recoverAction(combatant) {
    const actor = combatant.actor;
    if (!actor) return;

    // Spend 1 AP
    const success = await this.spendAP(combatant, 1);
    if (!success) return;

    // Recover 1 HP
    await actor.heal(1);

    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: game.i18n.format("RecoverAction", { name: actor.name })
    });
  }

  /**
   * Perform an aid action
   * @param {Combatant} combatant - The combatant aiding
   * @param {Combatant} target - The combatant being aided
   */
  static async aidAction(combatant, target) {
    const actor = combatant.actor;
    if (!actor) return;

    // Spend 1 AP
    const success = await this.spendAP(combatant, 1);
    if (!success) return;

    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content: game.i18n.format("AidAction", {
        name: actor.name,
        target: target.actor.name
      })
    });
  }
}

/**
 * God Complex Combat Document
 * Extends the base Combat class with God Complex specific logic
 */

import { GodComplexDice } from "./dice.js";

export class GodComplexCombatDocument extends Combat {
  /**
   * Roll initiative for one or more Combatants within the Combat entity
   * @param {string|string[]} ids     A Combatant id or Array of ids for which to roll
   * @param {object} [options={}]     Additional options which modify this request
   * @returns {Promise<Combat>}       A promise which resolves to the updated Combat instance
   */
  async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
    // Structure input data
    ids = typeof ids === "string" ? [ids] : ids;
    if (ids.length === 0) return this;

    // Iterate over Combatants and roll initiative for each
    const updates = [];
    const messages = [];
    
    for (const id of ids) {
      const combatant = this.combatants.get(id);
      if (!combatant?.actor) continue;

      const actor = combatant.actor;
      const awareness = actor.system.attributes.awareness.value;
      const dexterity = actor.system.attributes.dexterity.value;
      const poolSize = awareness + dexterity;

      // Roll the dice pool
      const result = await GodComplexDice.rollDicePool(poolSize, {
        label: "Initiative",
        actorId: actor.id,
        skipDialog: true
      });

      // Add to updates
      updates.push({
        _id: id,
        initiative: result.advances
      });

      // Create chat message data
      const messageData = await this._createInitiativeMessage(actor, result);
      messages.push(messageData);
    }

    // Update combatant initiative values
    if (updates.length > 0) {
      await this.updateEmbeddedDocuments("Combatant", updates);
    }

    // Create chat messages
    if (messages.length > 0) {
      await ChatMessage.create(messages);
    }

    // Update the turn
    if (updateTurn && this.turn !== null) {
      await this.update({ turn: this.turn });
    }

    return this;
  }

  /**
   * Create a chat message for an initiative roll
   * @param {Actor} actor - The actor who rolled initiative
   * @param {object} result - The roll result
   * @returns {object} Chat message data
   */
  async _createInitiativeMessage(actor, result) {
    const templateData = {
      actor,
      result,
      options: { isInitiative: true }
    };

    const content = await renderTemplate(
      "systems/godcomplex/templates/chat/roll-result.hbs",
      templateData
    );

    return {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      content,
      rolls: [result.roll],
      sound: CONFIG.sounds.dice,
      flags: {
        "godcomplex": {
          actorId: actor.id,
          rollType: "initiative",
          advances: result.advances
        }
      }
    };
  }
}

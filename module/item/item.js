/**
 * God Complex Item Document
 * Extends the base Item class with God Complex specific logic
 */

export class GodComplexItem extends Item {
  /** @override */
  prepareData() {
    super.prepareData();
    const itemData = this;
    
    // Prepare specific item types
    switch (itemData.type) {
      case "skill":
        this._prepareSkillData(itemData);
        break;
      case "power":
        this._preparePowerData(itemData);
        break;
      case "equipment":
        this._prepareEquipmentData(itemData);
        break;
    }
  }

  /**
   * Prepare skill-specific data
   * @param {object} itemData - The item data
   */
  _prepareSkillData(itemData) {
    // Calculate total bonus from attribute + skill bonus
    const actor = this.actor;
    if (actor) {
      const attributeValue = actor.system.attributes[itemData.system.attribute]?.value || 0;
      itemData.system.totalBonus = attributeValue + itemData.system.bonus;
    }
  }

  /**
   * Prepare power-specific data
   * @param {object} itemData - The item data
   */
  _preparePowerData(itemData) {
    // Validate power costs
    if (itemData.system.glorieaCost < 0) {
      itemData.system.glorieaCost = 0;
    }
    if (itemData.system.apCost < 0) {
      itemData.system.apCost = 0;
    }
  }

  /**
   * Prepare equipment-specific data
   * @param {object} itemData - The item data
   */
  _prepareEquipmentData(itemData) {
    // Validate equipment values
    if (itemData.system.armor < 0) {
      itemData.system.armor = 0;
    }
    if (itemData.system.quantity < 0) {
      itemData.system.quantity = 0;
    }
  }

  /**
   * Roll this item
   * @param {object} options - Roll options
   */
  async roll(options = {}) {
    if (!this.actor) {
      ui.notifications.warn(game.i18n.localize("GODCOMPLEX.ItemNotOwned"));
      return;
    }

    switch (this.type) {
      case "skill":
        await game.godcomplex.GodComplexDice.rollSkill(this.actor, this, options);
        break;
      case "power":
        await game.godcomplex.GodComplexDice.rollPower(this.actor, this, options);
        break;
      default:
        ui.notifications.warn(game.i18n.localize("GODCOMPLEX.ItemNotRollable"));
    }
  }
}

/**
 * God Complex Actor Sheet
 * The character sheet interface for God Complex
 */

export class GodComplexActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["godcomplex", "sheet", "actor"],
      template: "systems/godcomplex/templates/actor/actor-sheet.hbs",
      width: 720,
      height: 800,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  /** @override */
  get template() {
    const type = this.actor.type;
    return `systems/godcomplex/templates/actor/${type}-sheet.hbs`;
  }

  /** @override */
  async getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);

    context.system = actorData.system;
    context.flags = actorData.flags;
    context.config = CONFIG.godcomplex || {};

    // Prepare items
    context.skills = this.actor.items.filter(i => i.type === "skill");
    context.powers = this.actor.items.filter(i => i.type === "power");
    context.equipment = this.actor.items.filter(i => i.type === "equipment");

    // Prepare attributes for display
    context.attributes = actorData.system.attributes;
    context.core = actorData.system.core;
    context.derived = actorData.system.derived;
    context.resources = actorData.system.resources;
    context.conditions = actorData.system.conditions;

    // Enrich biography
    context.biography = await TextEditor.enrichHTML(actorData.biography || "", {
      async: true,
      secrets: this.actor.isOwner,
      rollData: this.actor.getRollData()
    });

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Attribute roll buttons
    html.find(".attribute-roll").click(this._onAttributeRoll.bind(this));

    // Skill roll buttons
    html.find(".skill-roll").click(this._onSkillRoll.bind(this));

    // Power roll buttons
    html.find(".power-roll").click(this._onPowerRoll.bind(this));

    // Initiative roll button
    html.find(".initiative-roll").click(this._onInitiativeRoll.bind(this));

    // Rest buttons
    html.find(".rest-button").click(this._onRest.bind(this));

    // Condition toggles
    html.find(".condition-toggle").click(this._onConditionToggle.bind(this));

    // Resource controls
    html.find(".resource-value").change(this._onResourceChange.bind(this));

    // Item management
    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));
    html.find(".item-roll").click(this._onItemRoll.bind(this));
    html.find(".item-toggle").click(this._onItemToggle.bind(this));

    // Inline editing
    html.find(".inline-edit").change(this._onInlineEdit.bind(this));

    // Rollable derived stats
    html.find(".derived-roll").click(this._onDerivedRoll.bind(this));
  }

  /**
   * Handle attribute roll button clicks
   * @param {Event} event - The click event
   */
  async _onAttributeRoll(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const attributeName = button.dataset.attribute;
    await this.actor.rollAttribute(attributeName);
  }

  /**
   * Handle skill roll button clicks
   * @param {Event} event - The click event
   */
  async _onSkillRoll(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const itemId = button.dataset.itemId;
    const skill = this.actor.items.get(itemId);
    if (skill) {
      await game.godcomplex.GodComplexDice.rollSkill(this.actor, skill);
    }
  }

  /**
   * Handle power roll button clicks
   * @param {Event} event - The click event
   */
  async _onPowerRoll(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const itemId = button.dataset.itemId;
    const power = this.actor.items.get(itemId);
    if (power) {
      await game.godcomplex.GodComplexDice.rollPower(this.actor, power);
    }
  }

  /**
   * Handle initiative roll button clicks
   * @param {Event} event - The click event
   */
  async _onInitiativeRoll(event) {
    event.preventDefault();
    await this.actor.rollInitiative();
  }

  /**
   * Handle rest button clicks
   * @param {Event} event - The click event
   */
  async _onRest(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const restType = button.dataset.restType;
    await this.actor.rest(restType);
  }

  /**
   * Handle condition toggle clicks
   * @param {Event} event - The click event
   */
  async _onConditionToggle(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const conditionName = button.dataset.condition;
    await this.actor.toggleCondition(conditionName);
  }

  /**
   * Handle resource value changes
   * @param {Event} event - The change event
   */
  async _onResourceChange(event) {
    const input = event.currentTarget;
    const resource = input.dataset.resource;
    const value = parseInt(input.value) || 0;
    await this.actor.update({ [`system.resources.${resource}.value`]: value });
  }

  /**
   * Handle item creation
   * @param {Event} event - The click event
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const type = button.dataset.type;
    
    const itemData = {
      name: game.i18n.format("NewItem", { type: type }),
      type: type,
      system: {}
    };
    
    return await this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Handle item editing
   * @param {Event} event - The click event
   */
  _onItemEdit(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const itemId = button.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) {
      item.sheet.render(true);
    }
  }

  /**
   * Handle item deletion
   * @param {Event} event - The click event
   */
  async _onItemDelete(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const itemId = button.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) {
      await item.delete();
    }
  }

  /**
   * Handle item rolling
   * @param {Event} event - The click event
   */
  async _onItemRoll(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const itemId = button.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (!item) return;

    switch (item.type) {
      case "skill":
        await game.godcomplex.GodComplexDice.rollSkill(this.actor, item);
        break;
      case "power":
        await game.godcomplex.GodComplexDice.rollPower(this.actor, item);
        break;
    }
  }

  /**
   * Handle item toggle (equipped state)
   * @param {Event} event - The click event
   */
  async _onItemToggle(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const itemId = button.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item && item.type === "equipment") {
      await item.update({ "system.equipped": !item.system.equipped });
    }
  }

  /**
   * Handle inline editing
   * @param {Event} event - The change event
   */
  async _onInlineEdit(event) {
    const input = event.currentTarget;
    const itemId = input.closest(".item").dataset.itemId;
    const field = input.dataset.field;
    const value = input.value;
    
    const item = this.actor.items.get(itemId);
    if (item) {
      await item.update({ [field]: value });
    }
  }

  /**
   * Handle derived stat rolls
   * @param {Event} event - The click event
   */
  async _onDerivedRoll(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const stat = button.dataset.stat;
    
    if (stat === "initiative") {
      await this.actor.rollInitiative();
    }
  }
}

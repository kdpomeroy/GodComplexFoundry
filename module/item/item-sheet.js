/**
 * God Complex Item Sheet
 * The item sheet interface for God Complex
 */

export class GodComplexItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["godcomplex", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const type = this.item.type;
    return `systems/godcomplex/templates/item/${type}-sheet.hbs`;
  }

  /** @override */
  async getData() {
    const context = super.getData();
    const itemData = this.item.toObject(false);

    context.system = itemData.system;
    context.flags = itemData.flags;
    context.config = CONFIG.godcomplex || {};

    // Enrich description
    context.description = await TextEditor.enrichHTML(itemData.system.description || "", {
      async: true,
      secrets: this.item.isOwner,
      rollData: this.item.getRollData()
    });

    // Prepare attribute options
    context.attributeOptions = {
      strength: "GODCOMPLEX.Attributes.strength",
      dexterity: "GODCOMPLEX.Attributes.dexterity",
      awareness: "GODCOMPLEX.Attributes.awareness",
      composure: "GODCOMPLEX.Attributes.composure",
      presence: "GODCOMPLEX.Attributes.presence",
      intelligence: "GODCOMPLEX.Attributes.intelligence"
    };

    // Prepare equipment type options
    context.equipmentTypeOptions = {
      weapon: "GODCOMPLEX.EquipmentTypes.weapon",
      armor: "GODCOMPLEX.EquipmentTypes.armor",
      gear: "GODCOMPLEX.EquipmentTypes.gear"
    };

    // Prepare range options for powers
    context.rangeOptions = {
      self: "GODCOMPLEX.Ranges.self",
      touch: "GODCOMPLEX.Ranges.touch",
      close: "GODCOMPLEX.Ranges.close",
      short: "GODCOMPLEX.Ranges.short",
      medium: "GODCOMPLEX.Ranges.medium",
      long: "GODCOMPLEX.Ranges.long",
      extreme: "GODCOMPLEX.Ranges.extreme"
    };

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Raise management
    html.find(".raise-add").click(this._onRaiseAdd.bind(this));
    html.find(".raise-delete").click(this._onRaiseDelete.bind(this));
    html.find(".raise-edit").change(this._onRaiseEdit.bind(this));
  }

  /**
   * Handle adding a new raise effect
   * @param {Event} event - The click event
   */
  async _onRaiseAdd(event) {
    event.preventDefault();
    const raises = this.item.system.raises || [];
    const newRaise = {
      level: raises.length + 1,
      effect: "",
      cost: 0
    };
    raises.push(newRaise);
    await this.item.update({ "system.raises": raises });
  }

  /**
   * Handle deleting a raise effect
   * @param {Event} event - The click event
   */
  async _onRaiseDelete(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const index = parseInt(button.dataset.index);
    const raises = [...this.item.system.raises];
    raises.splice(index, 1);
    await this.item.update({ "system.raises": raises });
  }

  /**
   * Handle editing a raise effect
   * @param {Event} event - The change event
   */
  async _onRaiseEdit(event) {
    const input = event.currentTarget;
    const index = parseInt(input.closest(".raise").dataset.index);
    const field = input.dataset.field;
    const value = input.value;
    
    const raises = [...this.item.system.raises];
    raises[index][field] = field === "level" || field === "cost" ? parseInt(value) || 0 : value;
    await this.item.update({ "system.raises": raises });
  }
}

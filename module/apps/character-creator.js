/**
 * God Complex Character Creator
 * A guided wizard for creating new characters
 */

export class GodComplexCharacterCreator extends Application {
  constructor(options = {}) {
    super(options);
    
    this.currentStep = 0;
    this.characterData = {
      name: "",
      type: "character",
      img: "icons/svg/mystery-man.svg",
      system: {
        concept: "",
        player: game.user.name,
        core: {
          tier: { value: 1 },
          generation: { value: 1 },
          domain: { value: 1 },
          size: { value: 0 },
          xp: { value: 3 }
        },
        attributes: {
          strength: { value: 1 },
          dexterity: { value: 1 },
          awareness: { value: 1 },
          composure: { value: 1 },
          presence: { value: 1 },
          intelligence: { value: 1 }
        }
      },
      skills: [],
      powers: [],
      equipment: []
    };
    
    this.steps = [
      "basic-info",
      "core-stats",
      "attributes",
      "skills",
      "powers",
      "equipment",
      "review"
    ];
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "godcomplex-character-creator",
      title: game.i18n.localize("GODCOMPLEX.CharacterCreator"),
      template: "systems/godcomplex/templates/apps/character-creator.hbs",
      classes: ["godcomplex", "character-creator"],
      width: 800,
      height: 700,
      resizable: true
    });
  }

  getData() {
    return {
      step: this.currentStep,
      stepName: this.steps[this.currentStep],
      totalSteps: this.steps.length,
      character: this.characterData,
      isFirstStep: this.currentStep === 0,
      isLastStep: this.currentStep === this.steps.length - 1,
      attributePoints: this._calculateAttributePoints(),
      skillsList: this.characterData.skills,
      powersList: this.characterData.powers,
      equipmentList: this.characterData.equipment
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Navigation buttons
    html.find(".creator-next").click(this._onNext.bind(this));
    html.find(".creator-prev").click(this._onPrevious.bind(this));
    html.find(".creator-finish").click(this._onFinish.bind(this));
    html.find(".creator-cancel").click(this._onCancel.bind(this));

    // Step-specific listeners
    html.find(".creator-input").change(this._onInputChange.bind(this));
    
    // Attribute controls
    html.find(".attribute-increase").click(this._onAttributeIncrease.bind(this));
    html.find(".attribute-decrease").click(this._onAttributeDecrease.bind(this));

    // Skill management
    html.find(".add-skill").click(this._onAddSkill.bind(this));
    html.find(".remove-skill").click(this._onRemoveSkill.bind(this));

    // Power management
    html.find(".add-power").click(this._onAddPower.bind(this));
    html.find(".remove-power").click(this._onRemovePower.bind(this));

    // Equipment management
    html.find(".add-equipment").click(this._onAddEquipment.bind(this));
    html.find(".remove-equipment").click(this._onRemoveEquipment.bind(this));

    // Portrait upload
    html.find(".portrait-upload").click(this._onPortraitUpload.bind(this));
  }

  _calculateAttributePoints() {
    const baseValue = 1;
    const totalPoints = 6; // Starting points to distribute
    const currentTotal = Object.values(this.characterData.system.attributes)
      .reduce((sum, attr) => sum + (attr.value - baseValue), 0);
    return totalPoints - currentTotal;
  }

  _onInputChange(event) {
    const input = event.currentTarget;
    const field = input.dataset.field;
    const value = input.value;

    // Handle nested fields (e.g., "system.core.tier.value")
    const keys = field.split(".");
    let target = this.characterData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]];
    }
    
    const lastKey = keys[keys.length - 1];
    
    // Convert to number if needed
    if (input.type === "number") {
      target[lastKey] = parseInt(value) || 0;
    } else {
      target[lastKey] = value;
    }

    this.render(false);
  }

  _onAttributeIncrease(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const attribute = button.dataset.attribute;
    
    if (this._calculateAttributePoints() <= 0) {
      ui.notifications.warn(game.i18n.localize("GODCOMPLEX.NoAttributePoints"));
      return;
    }
    
    if (this.characterData.system.attributes[attribute].value < 5) {
      this.characterData.system.attributes[attribute].value++;
      this.render(false);
    }
  }

  _onAttributeDecrease(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const attribute = button.dataset.attribute;
    
    if (this.characterData.system.attributes[attribute].value > 1) {
      this.characterData.system.attributes[attribute].value--;
      this.render(false);
    }
  }

  _onAddSkill(event) {
    event.preventDefault();
    this.characterData.skills.push({
      name: "",
      attribute: "strength",
      bonus: 0,
      specialty: ""
    });
    this.render(false);
  }

  _onRemoveSkill(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const index = parseInt(button.dataset.index);
    this.characterData.skills.splice(index, 1);
    this.render(false);
  }

  _onAddPower(event) {
    event.preventDefault();
    this.characterData.powers.push({
      name: "",
      attribute: "presence",
      apCost: 1,
      glorieaCost: 0,
      range: "self",
      description: ""
    });
    this.render(false);
  }

  _onRemovePower(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const index = parseInt(button.dataset.index);
    this.characterData.powers.splice(index, 1);
    this.render(false);
  }

  _onAddEquipment(event) {
    event.preventDefault();
    this.characterData.equipment.push({
      name: "",
      equipmentType: "gear",
      bonus: "",
      armor: 0,
      equipped: false
    });
    this.render(false);
  }

  _onRemoveEquipment(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const index = parseInt(button.dataset.index);
    this.characterData.equipment.splice(index, 1);
    this.render(false);
  }

  _onPortraitUpload(event) {
    event.preventDefault();
    const fp = new FilePicker({
      type: "image",
      callback: path => {
        this.characterData.img = path;
        this.render(false);
      }
    });
    fp.browse();
  }

  async _onNext(event) {
    event.preventDefault();
    
    // Validate current step
    if (!this._validateStep()) {
      return;
    }
    
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.render(false);
    }
  }

  _onPrevious(event) {
    event.preventDefault();
    if (this.currentStep > 0) {
      this.currentStep--;
      this.render(false);
    }
  }

  async _onFinish(event) {
    event.preventDefault();
    
    if (!this._validateStep()) {
      return;
    }
    
    try {
      // Create the actor
      const actorData = {
        name: this.characterData.name,
        type: "character",
        img: this.characterData.img,
        system: this.characterData.system
      };
      
      const actor = await Actor.create(actorData);
      
      // Create skills
      for (const skill of this.characterData.skills) {
        if (skill.name) {
          await actor.createEmbeddedDocuments("Item", [{
            name: skill.name,
            type: "skill",
            system: {
              attribute: skill.attribute,
              bonus: skill.bonus,
              specialty: skill.specialty
            }
          }]);
        }
      }
      
      // Create powers
      for (const power of this.characterData.powers) {
        if (power.name) {
          await actor.createEmbeddedDocuments("Item", [{
            name: power.name,
            type: "power",
            system: {
              attribute: power.attribute,
              apCost: power.apCost,
              glorieaCost: power.glorieaCost,
              range: power.range,
              description: power.description
            }
          }]);
        }
      }
      
      // Create equipment
      for (const equipment of this.characterData.equipment) {
        if (equipment.name) {
          await actor.createEmbeddedDocuments("Item", [{
            name: equipment.name,
            type: "equipment",
            system: {
              equipmentType: equipment.equipmentType,
              bonus: equipment.bonus,
              armor: equipment.armor,
              equipped: equipment.equipped
            }
          }]);
        }
      }
      
      ui.notifications.info(game.i18n.format("GODCOMPLEX.CharacterCreated", { name: actor.name }));
      
      // Open the character sheet
      actor.sheet.render(true);
      
      // Close the creator
      this.close();
      
    } catch (error) {
      ui.notifications.error(game.i18n.localize("GODCOMPLEX.CharacterCreationFailed"));
      console.error(error);
    }
  }

  _onCancel(event) {
    event.preventDefault();
    
    Dialog.confirm({
      title: game.i18n.localize("GODCOMPLEX.CancelCreation"),
      content: `<p>${game.i18n.localize("GODCOMPLEX.CancelCreationConfirm")}</p>`,
      yes: () => this.close(),
      no: () => {},
      defaultYes: false
    });
  }

  _validateStep() {
    const stepName = this.steps[this.currentStep];
    
    switch (stepName) {
      case "basic-info":
        if (!this.characterData.name || this.characterData.name.trim() === "") {
          ui.notifications.warn(game.i18n.localize("GODCOMPLEX.NameRequired"));
          return false;
        }
        break;
        
      case "attributes":
        if (this._calculateAttributePoints() !== 0) {
          ui.notifications.warn(game.i18n.localize("GODCOMPLEX.AttributePointsRemaining"));
          return false;
        }
        break;
    }
    
    return true;
  }
}

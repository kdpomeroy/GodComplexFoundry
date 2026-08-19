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
        background: "",
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
    
    this.backgrounds = [
      { id: "street", name: "Street Rat", description: "Grew up on the streets, learned to survive by your wits.", attribute: "dexterity", bonus: 1 },
      { id: "scholar", name: "Scholar", description: "Spent years in study and research, gaining knowledge.", attribute: "intelligence", bonus: 1 },
      { id: "socialite", name: "Socialite", description: "Moved in high society, mastering the art of persuasion.", attribute: "presence", bonus: 1 },
      { id: "athlete", name: "Athlete", description: "Trained your body to peak performance.", attribute: "strength", bonus: 1 },
      { id: "watchful", name: "Watchful", description: "Always observant, missing nothing around you.", attribute: "awareness", bonus: 1 },
      { id: "stoic", name: "Stoic", description: "Endured hardship with unshakeable composure.", attribute: "composure", bonus: 1 }
    ];
    
    this.steps = [
      "basic-info",
      "background",
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
      title: "Character Creator",
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
      skillsList: [...this.characterData.skills],
      powersList: [...this.characterData.powers],
      equipmentList: [...this.characterData.equipment],
      backgrounds: this.backgrounds,
      selectedBackground: this.backgrounds.find(b => b.id === this.characterData.system.background)
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Navigation buttons - use event delegation
    html.on("click", ".creator-next", this._onNext.bind(this));
    html.on("click", ".creator-prev", this._onPrevious.bind(this));
    html.on("click", ".creator-finish", this._onFinish.bind(this));
    html.on("click", ".creator-cancel", this._onCancel.bind(this));

    // Input changes - use event delegation
    html.on("change", ".creator-input", this._onInputChange.bind(this));
    html.on("input", ".creator-input", this._onInputField.bind(this));
    
    // Attribute controls
    html.on("click", ".attribute-increase", this._onAttributeIncrease.bind(this));
    html.on("click", ".attribute-decrease", this._onAttributeDecrease.bind(this));

    // Background selection
    html.on("click", ".background-option", this._onBackgroundSelect.bind(this));

    // Skill management
    html.on("click", ".add-skill", this._onAddSkill.bind(this));
    html.on("click", ".remove-skill", this._onRemoveSkill.bind(this));

    // Power management
    html.on("click", ".add-power", this._onAddPower.bind(this));
    html.on("click", ".remove-power", this._onRemovePower.bind(this));

    // Equipment management
    html.on("click", ".add-equipment", this._onAddEquipment.bind(this));
    html.on("click", ".remove-equipment", this._onRemoveEquipment.bind(this));

    // Portrait upload
    html.on("click", ".portrait-upload", this._onPortraitUpload.bind(this));
  }

  _calculateAttributePoints() {
    const baseValue = 1;
    const totalPoints = 6;
    const backgroundBonus = this._getBackgroundBonus();
    const currentTotal = Object.values(this.characterData.system.attributes)
      .reduce((sum, attr) => sum + (attr.value - baseValue), 0);
    return totalPoints - currentTotal + backgroundBonus;
  }

  _getBackgroundBonus() {
    const background = this.backgrounds.find(b => b.id === this.characterData.system.background);
    return background ? background.bonus : 0;
  }

  _onInputField(event) {
    const input = event.currentTarget;
    const field = input.dataset.field;
    if (!field) return;
    
    const value = input.value;
    const keys = field.split(".");
    let target = this.characterData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      // Handle array indices
      if (Array.isArray(target)) {
        const index = parseInt(key);
        if (isNaN(index) || index >= target.length) return;
        target = target[index];
      } else {
        if (target[key] === undefined) return;
        target = target[key];
      }
    }
    
    const lastKey = keys[keys.length - 1];
    // Handle array final key
    if (Array.isArray(target)) {
      const index = parseInt(lastKey);
      if (!isNaN(index)) {
        if (input.type === "number") {
          target[index] = parseInt(value) || 0;
        } else {
          target[index] = value;
        }
      }
    } else {
      if (input.type === "number") {
        target[lastKey] = parseInt(value) || 0;
      } else {
        target[lastKey] = value;
      }
    }
  }

  _onInputChange(event) {
    const input = event.currentTarget;
    const field = input.dataset.field;
    if (!field) return;
    
    this._onInputField(event);
    this.render(false);
  }

  _onAttributeIncrease(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const attribute = button.dataset.attribute;
    
    if (this._calculateAttributePoints() <= 0) {
      ui.notifications.warn("No attribute points remaining!");
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
    
    const minValue = 1;
    if (this.characterData.system.attributes[attribute].value > minValue) {
      this.characterData.system.attributes[attribute].value--;
      this.render(false);
    }
  }

  _onBackgroundSelect(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const backgroundId = button.dataset.background;
    
    // Remove old background bonus
    const oldBackground = this.backgrounds.find(b => b.id === this.characterData.system.background);
    if (oldBackground) {
      const attr = this.characterData.system.attributes[oldBackground.attribute];
      attr.value = Math.max(1, attr.value - oldBackground.bonus);
    }
    
    // Set new background
    this.characterData.system.background = backgroundId;
    
    // Apply new background bonus
    const newBackground = this.backgrounds.find(b => b.id === backgroundId);
    if (newBackground) {
      this.characterData.system.attributes[newBackground.attribute].value += newBackground.bonus;
    }
    
    this.render(false);
  }

  _onAddSkill(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log("Adding skill...");
    console.log("Current skills:", this.characterData.skills);
    
    this.characterData.skills.push({
      name: "",
      attribute: "strength",
      bonus: 0,
      specialty: ""
    });
    
    console.log("Skills after add:", this.characterData.skills);
    this.render(false);
  }

  _onRemoveSkill(event) {
    event.preventDefault();
    event.stopPropagation();
    const button = event.currentTarget;
    const index = parseInt(button.dataset.index);
    this.characterData.skills.splice(index, 1);
    this.render(false);
  }

  _onAddPower(event) {
    event.preventDefault();
    event.stopPropagation();
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
    event.stopPropagation();
    const button = event.currentTarget;
    const index = parseInt(button.dataset.index);
    this.characterData.powers.splice(index, 1);
    this.render(false);
  }

  _onAddEquipment(event) {
    event.preventDefault();
    event.stopPropagation();
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
    event.stopPropagation();
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
      const actorData = {
        name: this.characterData.name,
        type: "character",
        img: this.characterData.img,
        system: this.characterData.system
      };
      
      const actor = await Actor.create(actorData);
      
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
      
      ui.notifications.info(`Character ${actor.name} created successfully!`);
      actor.sheet.render(true);
      this.close();
      
    } catch (error) {
      ui.notifications.error("Failed to create character. Check console for details.");
      console.error(error);
    }
  }

  _onCancel(event) {
    event.preventDefault();
    
    Dialog.confirm({
      title: "Cancel Character Creation?",
      content: "<p>Are you sure you want to cancel? All progress will be lost.</p>",
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
          ui.notifications.warn("Character name is required!");
          return false;
        }
        break;
        
      case "background":
        if (!this.characterData.system.background) {
          ui.notifications.warn("Please select a background!");
          return false;
        }
        break;
        
      case "attributes":
        if (this._calculateAttributePoints() !== 0) {
          ui.notifications.warn("You must distribute all attribute points before continuing.");
          return false;
        }
        break;
    }
    
    return true;
  }
}

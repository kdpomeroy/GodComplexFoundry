/**
 * God Complex Character Creator
 * A guided wizard for creating new characters using actual game data
 */

export class GodComplexCharacterCreator extends Application {
  constructor(options = {}) {
    super(options);
    
    this.currentStep = 0;
    this.catalogData = {
      backgrounds: [],
      equipment: [],
      powers: []
    };
    
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
      equipment: [],
      selectedSpecialties: [],
      selectedProficiencies: []
    };
    
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
    
    this._loadCatalogData();
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "godcomplex-character-creator",
      title: "Character Creator",
      template: "systems/godcomplex/templates/apps/character-creator.hbs",
      classes: ["godcomplex", "character-creator"],
      width: 850,
      height: 750,
      resizable: true
    });
  }

  async _loadCatalogData() {
    try {
      const [bgRes, eqRes, pwRes] = await Promise.all([
        fetch("systems/godcomplex/data/backgrounds.json"),
        fetch("systems/godcomplex/data/equipment-catalogue.json"),
        fetch("systems/godcomplex/data/powerset-abilities.json")
      ]);
      
      this.catalogData.backgrounds = await bgRes.json();
      this.catalogData.equipment = await eqRes.json();
      this.catalogData.powers = await pwRes.json();
      
      console.log("God Complex | Catalog data loaded");
    } catch (error) {
      console.error("God Complex | Failed to load catalog data:", error);
      ui.notifications.error("Failed to load character creation data.");
    }
  }

  getData() {
    const tier = this.characterData.system.core.tier.value;
    
    // Group equipment by type
    const equipmentByType = {
      armor: this.catalogData.equipment.filter(e => e.system.equipmentType === "armor"),
      weapon: this.catalogData.equipment.filter(e => e.system.equipmentType === "weapon"),
      gear: this.catalogData.equipment.filter(e => e.system.equipmentType === "gear")
    };
    
    // Group powers by powerset, filtered by tier
    const powersByPowerset = {};
    const powers = this.catalogData.powers;
    for (const power of powers) {
      const powerset = power.flags?.godcomplex?.powerset || "Unknown";
      const powerTier = power.flags?.godcomplex?.tier || 1;
      if (powerTier <= tier) {
        if (!powersByPowerset[powerset]) powersByPowerset[powerset] = [];
        powersByPowerset[powerset].push(power);
      }
    }
    
    const selectedBackground = this.catalogData.backgrounds.find(
      b => b.id === this.characterData.system.background
    );
    
    return {
      step: this.currentStep,
      stepName: this.steps[this.currentStep],
      totalSteps: this.steps.length,
      character: this.characterData,
      isFirstStep: this.currentStep === 0,
      isLastStep: this.currentStep === this.steps.length - 1,
      attributePoints: this._calculateAttributePoints(),
      backgrounds: this.catalogData.backgrounds,
      selectedBackground: selectedBackground,
      equipmentByType: equipmentByType,
      powersByPowerset: powersByPowerset,
      powersetNames: Object.keys(powersByPowerset).sort(),
      skillsList: [...this.characterData.skills],
      powersList: [...this.characterData.powers],
      equipmentList: [...this.characterData.equipment],
      selectedSpecialties: [...this.characterData.selectedSpecialties],
      selectedProficiencies: [...this.characterData.selectedProficiencies]
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Navigation
    html.on("click", ".creator-next", this._onNext.bind(this));
    html.on("click", ".creator-prev", this._onPrevious.bind(this));
    html.on("click", ".creator-finish", this._onFinish.bind(this));
    html.on("click", ".creator-cancel", this._onCancel.bind(this));

    // Input changes
    html.on("change", ".creator-input", this._onInputChange.bind(this));
    html.on("input", ".creator-input", this._onInputField.bind(this));
    
    // Attribute controls
    html.on("click", ".attribute-increase", this._onAttributeIncrease.bind(this));
    html.on("click", ".attribute-decrease", this._onAttributeDecrease.bind(this));

    // Background selection
    html.on("click", ".background-option", this._onBackgroundSelect.bind(this));

    // Specialty/Proficiency selection
    html.on("click", ".specialty-choice", this._onSpecialtyToggle.bind(this));
    html.on("click", ".proficiency-choice", this._onProficiencyToggle.bind(this));

    // Skill management
    html.on("click", ".add-skill", this._onAddSkill.bind(this));
    html.on("click", ".remove-skill", this._onRemoveSkill.bind(this));

    // Power selection from catalog
    html.on("click", ".add-power", this._onAddPower.bind(this));
    html.on("click", ".remove-power", this._onRemovePower.bind(this));
    html.on("click", ".power-catalog-item", this._onPowerCatalogSelect.bind(this));

    // Equipment selection from catalog
    html.on("click", ".add-equipment", this._onAddEquipment.bind(this));
    html.on("click", ".remove-equipment", this._onRemoveEquipment.bind(this));
    html.on("click", ".equipment-catalog-item", this._onEquipmentCatalogSelect.bind(this));

    // Portrait upload
    html.on("click", ".portrait-upload", this._onPortraitUpload.bind(this));
    
    // Equipment tab switching
    html.on("click", ".equip-tab", this._onEquipmentTabSwitch.bind(this));
    
    // Powerset tab switching
    html.on("click", ".powerset-tab", this._onPowersetTabSwitch.bind(this));
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
    const bg = this.catalogData.backgrounds.find(b => b.id === this.characterData.system.background);
    return bg ? 1 : 0;
  }

  _getAttributeKey(attributeName) {
    const map = {
      "Strength": "strength",
      "Dexterity": "dexterity",
      "Awareness": "awareness",
      "Composure": "composure",
      "Presence": "presence",
      "Intelligence": "intelligence"
    };
    return map[attributeName] || attributeName.toLowerCase();
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
    if (Array.isArray(target)) {
      const index = parseInt(lastKey);
      if (!isNaN(index)) {
        target[index] = input.type === "number" ? (parseInt(value) || 0) : value;
      }
    } else {
      target[lastKey] = input.type === "number" ? (parseInt(value) || 0) : value;
    }
  }

  _onInputChange(event) {
    this._onInputField(event);
    this.render(false);
  }

  _onAttributeIncrease(event) {
    event.preventDefault();
    const attribute = event.currentTarget.dataset.attribute;
    
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
    const attribute = event.currentTarget.dataset.attribute;
    
    if (this.characterData.system.attributes[attribute].value > 1) {
      this.characterData.system.attributes[attribute].value--;
      this.render(false);
    }
  }

  _onBackgroundSelect(event) {
    event.preventDefault();
    const backgroundId = event.currentTarget.dataset.background;
    
    // Remove old background bonus
    const oldBg = this.catalogData.backgrounds.find(b => b.id === this.characterData.system.background);
    if (oldBg) {
      const attrKey = this._getAttributeKey(oldBg.attribute_bonus);
      const attr = this.characterData.system.attributes[attrKey];
      attr.value = Math.max(1, attr.value - 1);
    }
    
    // Set new background
    this.characterData.system.background = backgroundId;
    
    // Reset specialty/proficiency selections
    this.characterData.selectedSpecialties = [];
    this.characterData.selectedProficiencies = [];
    
    // Apply new background bonus
    const newBg = this.catalogData.backgrounds.find(b => b.id === backgroundId);
    if (newBg) {
      const attrKey = this._getAttributeKey(newBg.attribute_bonus);
      this.characterData.system.attributes[attrKey].value += 1;
      
      // Auto-add free specialty
      if (newBg.free_specialty) {
        this.characterData.selectedSpecialties.push(newBg.free_specialty);
      }
      
      // Auto-add free proficiency
      if (newBg.free_proficiency) {
        this.characterData.selectedProficiencies.push(newBg.free_proficiency);
      }
    }
    
    this.render(false);
  }

  _onSpecialtyToggle(event) {
    event.preventDefault();
    const specialty = event.currentTarget.dataset.specialty;
    const bg = this.catalogData.backgrounds.find(b => b.id === this.characterData.system.background);
    if (!bg) return;
    
    const maxSpecialties = bg.num_specialties;
    const idx = this.characterData.selectedSpecialties.indexOf(specialty);
    
    if (idx >= 0) {
      // Don't allow removing free specialty
      if (specialty === bg.free_specialty) {
        ui.notifications.warn("This is a free specialty from your background!");
        return;
      }
      this.characterData.selectedSpecialties.splice(idx, 1);
    } else {
      if (this.characterData.selectedSpecialties.length >= maxSpecialties) {
        ui.notifications.warn(`You can only select ${maxSpecialties} specialties!`);
        return;
      }
      this.characterData.selectedSpecialties.push(specialty);
    }
    
    this.render(false);
  }

  _onProficiencyToggle(event) {
    event.preventDefault();
    const proficiency = event.currentTarget.dataset.proficiency;
    const bg = this.catalogData.backgrounds.find(b => b.id === this.characterData.system.background);
    if (!bg) return;
    
    const maxProficiencies = bg.num_proficiencies;
    const idx = this.characterData.selectedProficiencies.indexOf(proficiency);
    
    if (idx >= 0) {
      if (proficiency === bg.free_proficiency) {
        ui.notifications.warn("This is a free proficiency from your background!");
        return;
      }
      this.characterData.selectedProficiencies.splice(idx, 1);
    } else {
      if (this.characterData.selectedProficiencies.length >= maxProficiencies) {
        ui.notifications.warn(`You can only select ${maxProficiencies} proficiencies!`);
        return;
      }
      this.characterData.selectedProficiencies.push(proficiency);
    }
    
    this.render(false);
  }

  _onAddSkill(event) {
    event.preventDefault();
    event.stopPropagation();
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
    event.stopPropagation();
    const index = parseInt(event.currentTarget.dataset.index);
    this.characterData.skills.splice(index, 1);
    this.render(false);
  }

  _onPowerCatalogSelect(event) {
    event.preventDefault();
    event.stopPropagation();
    const powerName = event.currentTarget.dataset.power;
    const power = this.catalogData.powers.find(p => p.name === powerName);
    if (!power) return;
    
    // Check if already added
    if (this.characterData.powers.some(p => p.name === powerName)) {
      ui.notifications.warn("You already have this power!");
      return;
    }
    
    this.characterData.powers.push({
      name: power.name,
      type: "power",
      system: foundry.utils.deepClone(power.system),
      flags: power.flags ? foundry.utils.deepClone(power.flags) : {}
    });
    
    this.render(false);
  }

  _onRemovePower(event) {
    event.preventDefault();
    event.stopPropagation();
    const index = parseInt(event.currentTarget.dataset.index);
    this.characterData.powers.splice(index, 1);
    this.render(false);
  }

  _onAddPower(event) {
    event.preventDefault();
    // This is now handled by catalog selection
  }

  _onEquipmentCatalogSelect(event) {
    event.preventDefault();
    event.stopPropagation();
    const itemName = event.currentTarget.dataset.item;
    const item = this.catalogData.equipment.find(e => e.name === itemName);
    if (!item) return;
    
    // Check if already added
    if (this.characterData.equipment.some(e => e.name === itemName)) {
      ui.notifications.warn("You already have this item!");
      return;
    }
    
    this.characterData.equipment.push({
      name: item.name,
      type: "equipment",
      system: foundry.utils.deepClone(item.system),
      flags: item.flags ? foundry.utils.deepClone(item.flags) : {}
    });
    
    this.render(false);
  }

  _onRemoveEquipment(event) {
    event.preventDefault();
    event.stopPropagation();
    const index = parseInt(event.currentTarget.dataset.index);
    this.characterData.equipment.splice(index, 1);
    this.render(false);
  }

  _onAddEquipment(event) {
    event.preventDefault();
    // This is now handled by catalog selection
  }

  _onEquipmentTabSwitch(event) {
    event.preventDefault();
    const tab = event.currentTarget.dataset.tab;
    const html = $(event.currentTarget).closest(".character-creator");
    html.find(".equip-tab").removeClass("active");
    html.find(".equipment-catalog-panel").removeClass("active");
    event.currentTarget.classList.add("active");
    html.find(`.equipment-catalog-panel[data-tab="${tab}"]`).addClass("active");
  }

  _onPowersetTabSwitch(event) {
    event.preventDefault();
    const tab = event.currentTarget.dataset.tab;
    const html = $(event.currentTarget).closest(".character-creator");
    html.find(".powerset-tab").removeClass("active");
    html.find(".powerset-catalog-panel").removeClass("active");
    event.currentTarget.classList.add("active");
    html.find(`.powerset-catalog-panel[data-tab="${tab}"]`).addClass("active");
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
    
    if (!this._validateStep()) return;
    
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
    
    if (!this._validateStep()) return;
    
    try {
      const actorData = {
        name: this.characterData.name,
        type: "character",
        img: this.characterData.img,
        system: this.characterData.system
      };
      
      const actor = await Actor.create(actorData);
      
      // Create skills from specialties
      for (const specialty of this.characterData.selectedSpecialties) {
        await actor.createEmbeddedDocuments("Item", [{
          name: specialty,
          type: "skill",
          system: {
            attribute: "strength",
            bonus: 0,
            specialty: specialty
          }
        }]);
      }
      
      // Create additional custom skills
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
        await actor.createEmbeddedDocuments("Item", [{
          name: power.name,
          type: "power",
          system: power.system,
          flags: power.flags
        }]);
      }
      
      // Create equipment
      for (const equipment of this.characterData.equipment) {
        await actor.createEmbeddedDocuments("Item", [{
          name: equipment.name,
          type: "equipment",
          system: equipment.system,
          flags: equipment.flags
        }]);
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

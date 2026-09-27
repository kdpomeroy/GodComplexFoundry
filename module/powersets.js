/**
 * God Complex Powersets
 * Loads and manages powerset data from the data files
 */

export class GodComplexPowersets {
  /**
   * Initialize the powerset data by loading from JSON files
   */
  static async initialize() {
    try {
      // Load powerset abilities data
      const response = await fetch("systems/godcomplex/data/powerset-abilities.json");
      const abilities = await response.json();
      
      // Organize by powerset
      this.abilities = {};
      this.powersets = {};
      
      for (const ability of abilities) {
        const powerset = ability.flags.godcomplex.powerset;
        if (!this.abilities[powerset]) {
          this.abilities[powerset] = [];
        }
        this.abilities[powerset].push(ability);
      }
      
      // Create powerset metadata
      this.powersets = {
        "Darkness": {
          name: "Darkness",
          description: "Manipulate shadow and absence of light.",
          color: "#2c3e50"
        },
        "Fire": {
          name: "Fire",
          description: "Conjure, shape, and command flame.",
          color: "#e74c3c"
        },
        "Healing": {
          name: "Healing",
          description: "Mend wounds and stave off death.",
          color: "#27ae60"
        },
        "Heightened Senses": {
          name: "Heightened Senses",
          description: "Perception sharpened far beyond mortal limits.",
          color: "#f39c12"
        },
        "Illusion": {
          name: "Illusion",
          description: "Bend perception and weave false realities.",
          color: "#9b59b6"
        },
        "Invisibility": {
          name: "Invisibility",
          description: "Slip from sight and beyond detection.",
          color: "#3498db"
        },
        "Light": {
          name: "Light",
          description: "Summon and bend radiant energy.",
          color: "#f1c40f"
        },
        "Lightning": {
          name: "Lightning",
          description: "Channel storm and electrical fury.",
          color: "#e67e22"
        },
        "Magnetism": {
          name: "Magnetism",
          description: "Pull, push, and bind ferrous matter.",
          color: "#34495e"
        },
        "Supernatural Strength": {
          name: "Supernatural Strength",
          description: "Feats of myth-level physical power.",
          color: "#c0392b"
        }
      };
      
      console.log(`God Complex | Loaded ${Object.keys(this.powersets).length} powersets`);
    } catch (error) {
      console.error("God Complex | Failed to load powerset data:", error);
      this.abilities = {};
      this.powersets = {};
    }
  }

  /**
   * Get all powersets
   * @returns {object} Object of powerset data
   */
  static getAllPowersets() {
    return this.powersets || {};
  }

  /**
   * Get abilities for a specific powerset
   * @param {string} powersetName - Name of the powerset
   * @returns {Array} Array of abilities
   */
  static getAbilities(powersetName) {
    return this.abilities?.[powersetName] || [];
  }

  /**
   * Get abilities available at a specific tier
   * @param {string} powersetName - Name of the powerset
   * @param {number} tier - Character tier
   * @returns {Array} Array of abilities at or below the tier
   */
  static getAbilitiesByTier(powersetName, tier) {
    const abilities = this.getAbilities(powersetName);
    return abilities.filter(ab => ab.flags.godcomplex.tier <= tier);
  }

  /**
   * Find an ability by name across all powersets
   * @param {string} abilityName - Name of the ability
   * @returns {object|null} Ability data or null
   */
  static findAbility(abilityName) {
    if (!this.abilities) return null;
    
    for (const [powerset, abilities] of Object.entries(this.abilities)) {
      const found = abilities.find(ab => ab.name.toLowerCase() === abilityName.toLowerCase());
      if (found) return found;
    }
    return null;
  }
}
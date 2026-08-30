/**
 * God Complex System Settings
 * Register system-specific settings
 */

export function registerSystemSettings() {
  /**
   * Track automatic AP reset
   */
  game.settings.register("godcomplex", "autoResetAP", {
    name: "Settings.AutoResetAP",
    hint: "Settings.AutoResetAPHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  /**
   * Track automatic condition clearing
   */
  game.settings.register("godcomplex", "autoClearConditions", {
    name: "Settings.AutoClearConditions",
    hint: "Settings.AutoClearConditionsHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  /**
   * Default difficulty for rolls
   */
  game.settings.register("godcomplex", "defaultDifficulty", {
    name: "Settings.DefaultDifficulty",
    hint: "Settings.DefaultDifficultyHint",
    scope: "world",
    config: true,
    type: Number,
    default: 3,
    choices: {
      1: "Difficulties.Trivial",
      2: "Difficulties.Easy",
      3: "Difficulties.Standard",
      4: "Difficulties.Hard",
      5: "Difficulties.VeryHard",
      6: "Difficulties.Legendary"
    }
  });

  /**
   * Enable Gloriae spending automation
   */
  game.settings.register("godcomplex", "autoSpendGloriae", {
    name: "Settings.AutoSpendGloriae",
    hint: "Settings.AutoSpendGloriaeHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  /**
   * Enable Willpower spending automation
   */
  game.settings.register("godcomplex", "autoSpendWillpower", {
    name: "Settings.AutoSpendWillpower",
    hint: "Settings.AutoSpendWillpowerHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
}

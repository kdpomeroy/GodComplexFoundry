/**
 * God Complex System Settings
 * Register system-specific settings
 */

export function registerSystemSettings() {
  /**
   * Track automatic AP reset
   */
  game.settings.register("godcomplex", "autoResetAP", {
    name: "GODCOMPLEX.Settings.AutoResetAP",
    hint: "GODCOMPLEX.Settings.AutoResetAPHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  /**
   * Track automatic condition clearing
   */
  game.settings.register("godcomplex", "autoClearConditions", {
    name: "GODCOMPLEX.Settings.AutoClearConditions",
    hint: "GODCOMPLEX.Settings.AutoClearConditionsHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  /**
   * Default difficulty for rolls
   */
  game.settings.register("godcomplex", "defaultDifficulty", {
    name: "GODCOMPLEX.Settings.DefaultDifficulty",
    hint: "GODCOMPLEX.Settings.DefaultDifficultyHint",
    scope: "world",
    config: true,
    type: Number,
    default: 3,
    choices: {
      1: "GODCOMPLEX.Difficulties.Trivial",
      2: "GODCOMPLEX.Difficulties.Easy",
      3: "GODCOMPLEX.Difficulties.Standard",
      4: "GODCOMPLEX.Difficulties.Hard",
      5: "GODCOMPLEX.Difficulties.VeryHard",
      6: "GODCOMPLEX.Difficulties.Legendary"
    }
  });

  /**
   * Enable Gloriae spending automation
   */
  game.settings.register("godcomplex", "autoSpendGloriae", {
    name: "GODCOMPLEX.Settings.AutoSpendGloriae",
    hint: "GODCOMPLEX.Settings.AutoSpendGloriaeHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  /**
   * Enable Willpower spending automation
   */
  game.settings.register("godcomplex", "autoSpendWillpower", {
    name: "GODCOMPLEX.Settings.AutoSpendWillpower",
    hint: "GODCOMPLEX.Settings.AutoSpendWillpowerHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
}

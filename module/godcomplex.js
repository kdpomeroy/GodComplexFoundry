/**
 * God Complex - Foundry VTT System
 * A modern myth TTRPG of immortal ambition and mortal consequence
 */

import { GodComplexActor } from "./actor/actor.js";
import { GodComplexActorSheet } from "./actor/actor-sheet.js";
import { GodComplexItem } from "./item/item.js";
import { GodComplexItemSheet } from "./item/item-sheet.js";
import { GodComplexDice } from "./dice.js";
import { GodComplexCombat } from "./combat.js";
import { GodComplexCharacterCreator } from "./apps/character-creator.js";
import { registerSystemSettings } from "./settings.js";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log("God Complex | Initializing God Complex System");

  game.godcomplex = {
    GodComplexActor,
    GodComplexItem,
    GodComplexDice,
    GodComplexCharacterCreator,
    rollDicePool: GodComplexDice.rollDicePool,
    openCharacterCreator: () => new GodComplexCharacterCreator().render(true),
    macros: {
      ...game.godcomplex?.macros
    }
  };

  /**
   * Set an initiative formula for the system
   */
  CONFIG.Combat.initiative = {
    formula: "1d6 + @attributes.awareness.value + @attributes.dexterity.value",
    decimals: 0
  };

  /**
   * Define custom Document classes
   */
  CONFIG.Actor.documentClass = GodComplexActor;
  CONFIG.Item.documentClass = GodComplexItem;

  /**
   * Register sheet application classes
   */
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("godcomplex", GodComplexActorSheet, {
    types: ["character", "npc"],
    makeDefault: true
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("godcomplex", GodComplexItemSheet, {
    types: ["skill", "power", "equipment"],
    makeDefault: true
  });

  /**
   * Register system settings
   */
  registerSystemSettings();

  /**
   * Register Handlebars helpers
   */
  Handlebars.registerHelper("concat", function() {
    return Array.prototype.slice.call(arguments, 0, -1).join("");
  });

  Handlebars.registerHelper("add", function(a, b) {
    return a + b;
  });

  Handlebars.registerHelper("eq", function(a, b) {
    return a === b;
  });

  Handlebars.registerHelper("lte", function(a, b) {
    return a <= b;
  });

  Handlebars.registerHelper("gte", function(a, b) {
    return a >= b;
  });
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  console.log("God Complex | System Ready");

  /**
   * Wait for the combat encounter to be ready
   */
  if (game.combat) {
    GodComplexCombat.onCombatStart(game.combat);
  }
});

/* -------------------------------------------- */
/*  Combat Hooks                                */
/* -------------------------------------------- */

Hooks.on("createCombat", (combat) => {
  GodComplexCombat.onCombatStart(combat);
});

Hooks.on("updateCombat", (combat, data, options, userId) => {
  if (data.round !== undefined || data.turn !== undefined) {
    GodComplexCombat.onCombatUpdate(combat, data);
  }
});

Hooks.on("deleteCombat", (combat) => {
  GodComplexCombat.onCombatEnd(combat);
});

/* -------------------------------------------- */
/*  Chat Message Hooks                          */
/* -------------------------------------------- */

Hooks.on("renderChatMessage", (message, html, data) => {
  // Add roll buttons to chat messages
  const rollButtons = html.find(".godcomplex-roll-button");
  rollButtons.click((event) => {
    event.preventDefault();
    const button = event.currentTarget;
    const action = button.dataset.action;
    const actorId = button.dataset.actorId;
    const actor = game.actors.get(actorId);
    if (actor) {
      GodComplexDice.handleRollButton(action, actor);
    }
  });
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

Hooks.on("hotbarDrop", (bar, data, slot) => {
  if (data.type === "Item") {
    createGodComplexMacro(data, slot);
    return false;
  }
});

async function createGodComplexMacro(data, slot) {
  const item = fromUuidSync(data.uuid);
  if (!item) return;

  const command = `game.godcomplex.macros.rollItem("${item.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "godcomplex.itemMacro": true }
    });
  }
  
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/* -------------------------------------------- */
/*  Actor Update Hook                           */
/* -------------------------------------------- */

Hooks.on("updateActor", (actor, data, options, userId) => {
  // Recalculate derived stats when attributes change
  if (data.system?.attributes || data.system?.core) {
    actor.calculateDerivedStats();
  }
});

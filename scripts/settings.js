import { COLORS, MODULE_ID } from "./misc.js";

export function registerSettings() {
  const settings = [
    {
      key: "target.share-flash",
      default: true,
      type: Boolean,
    },
    {
      key: "target.player-color",
      default: false,
      type: Boolean,
    },
    {
      key: "damage-heal.scale-on-%-hp",
      default: true,
      type: Boolean,
    },
    {
      key: "duration",
      default: 500,
      type: Number,
      range: { min: 100, step: 10, max: 2000 },
    },
    {
      key: "colors.damage",
      default: COLORS.RED,
      type: new foundry.data.fields.ColorField(),
    },
    {
      key: "colors.healing",
      default: COLORS.GREEN,
      type: new foundry.data.fields.ColorField(),
    },
    {
      key: "colors.target",
      default: COLORS.DEEPSKYBLUE,
      type: new foundry.data.fields.ColorField(),
    },
    {
      key: "colors.status.positive",
      default: COLORS.PINK,
      type: new foundry.data.fields.ColorField(),
      config: game.system.id === "pf2e",
    },
    {
      key: "colors.status.negative",
      default: COLORS.ORANGE,
      type: new foundry.data.fields.ColorField(),
      config: game.system.id === "pf2e",
    },
    {
      key: "auto-coloring.percent-color",
      default: "0.75",
      type: Number,
      range: { min: 0, max: 1, step: 0.05 },
      requiresReload: true,
    },
  ];

  settings.forEach(
    ({ key, default: def, type, range, config = true, requiresReload }) => {
      game.settings.register(MODULE_ID, key, {
        name: game.i18n.localize(`${MODULE_ID}.module-settings.${key}.name`),
        hint: game.i18n.localize(`${MODULE_ID}.module-settings.${key}.hint`),
        scope: "world",
        config,
        default: def,
        type,
        range,
        requiresReload,
      });
    }
  );

  const autoColoringChoices = {
    unchanged: localize("auto-coloring.choices.unchanged"),
    custom: localize("auto-coloring.choices.custom"),
    health: localize("auto-coloring.choices.health"),
    disposition: localize("auto-coloring.choices.disposition"),
    ...(game.system.id === "pf2e" && {
      levelDiff: localize("auto-coloring.choices.levelDiff"),
    }),
  };

  const playerAutoColoringChoices = autoColoringChoices;
  playerAutoColoringChoices.default = localize("auto-coloring.choices.default");

  const actorTypes = [
    "hostile",
    "neutral",
    "friendly",
    ...(game.system.id === "pf2e" ? ["party"] : []),
  ];

  ["world", "player"].forEach((level) => {
    const isPlayer = level === "player";
    autoColoringChoices.default = actorTypes.forEach((type) => {
      ["ring", "background"].forEach((part) => {
        ["type", "custom-color"].forEach((setting) => {
          const path = `auto-coloring.${part}.${setting}`;
          const def = getDefault(isPlayer, setting, type);
          const ty =
            setting === "type" ? String : new foundry.data.fields.ColorField();
          const config = {
            name: localize(`${path}.${level}.${type}.name`),
            hint: localize(`${path}.hint`),
            scope: level,
            config: true,
            default: def,
            type: ty,
            requiresReload: true,
          };

          if (setting === "type")
            config.choices = !isPlayer
              ? autoColoringChoices
              : playerAutoColoringChoices;

          game.settings.register(MODULE_ID, `${path}.${type}.${level}`, config);
        });
      });
    });
  });
}

function localize(key) {
  return game.i18n.localize(`${MODULE_ID}.module-settings.${key}`);
}

function getDefault(isPlayer, setting, type) {
  if (setting === "type") return isPlayer ? "default" : "unchanged";
  if (isPlayer) return COLORS.PLAYER_DEFAULT;
  if (type === "party") return COLORS.DEEPSKYBLUE;
  if (type === "friendly") return COLORS.GREEN;
  if (type === "hostile") return COLORS.RED;
  if (type === "neutral") return COLORS.YELLOW;
  return null;
}

function getPrefix(prefix) {
  const path = `${MODULE_ID}.module-settings.auto-coloring.prefixes.`;
  return game.i18n.localize(`${path}${prefix}`);
}

export function resolvePlayerWorldSetting(settingPath) {
  const world = game.settings.get(MODULE_ID, `${settingPath}.world`);
  const player = game.settings.get(MODULE_ID, `${settingPath}.player`);
  return player === "default" || player === COLORS.PLAYER_DEFAULT
    ? world
    : player;
}

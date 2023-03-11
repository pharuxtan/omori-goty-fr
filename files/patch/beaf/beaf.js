globalThis.beaf = function (sunny_name = "SUNNY") {
  let FORMAT_DICT, CHARACTERS, FOES, ARMORS, CHARACTERISTICS, ITEMS, WEAPONS, EMOTIONS, SKILLS, BATTLE_TEXT, VERBS, LOCATIONS, BLACKLETTERS, BATTLE_TEXT_FORMAT_EXCEPTIONS;

  const GENDER = {
      MASCULINE: "MASCULINE",
      FEMININE: "FEMININE",
  };

  const NUMBER = {
      SINGULAR: "SINGULAR",
      PLURAL: "PLURAL",
  };

  const ITEMS_EXCEPTIONS = {
      // COLD STEAK
      2: "_1",
      138: "_2",

      // COFFEE
      91: "_1",
      124: "_2",

      // CANDY
      14: "_1",
      102: "_2",

      // BREAD
      17: "_1",
      104: "_2",

      // PIZZA SLICE
      23: "_1",
      106: "_2",

      // CHOCOLATE
      26: "_1",
      105: "_2",

      // DONUT
      27: "_1",
      101: "_2",

      // WHOLE PIZZA
      34: "_1",
      109: "_2",

      // MARI'S COOKIE
      41: "_1",
      42: "_2",

      // APPLE JUICE
      47: "_1",
      122: "_2",

      // TASTY SODA
      51: "_1",
      120: "_2",

      // ORANGE JUICE
      55: "_1",
      123: "_2",

      // SHEET MUSIC
      157: "_1",
      247: "_2",
  };

  const ARMORS_EXCEPTIONS = {
      // "GOLD" WATCH
      2: "_1",
      101: "_2",

      // GOLD WATCH
      36: "_1",
      100: "_2",

      // COOL GLASSES
      24: "_1",
      98: "_2",

      // FEDORA
      30: "_1",
      102: "_2",

      // FLOWER CLIP
      32: "_1",
      95: "_2",

      // RABBIT FOOT
      53: "_1",
      103: "_2",

      // SEASHELL NECKLACE
      58: "_1",
      99: "_2",
  };

  const SKILLS_EXCEPTIONS = {
      // "ATTACK"
      21: "_1", // OMORI
      64: "_2", // AUBREY
      103: "_3", // KEL
      143: "_4", // HERO

      // FOCUS
      197: "_1", // SUNNY
      1446: "_2", // OMORI

      // OVERCOME
      199: "_1", // OMORI
      203: "_2", // SUNNY
  };

  const WEAPONS_EXCEPTIONS = {
      // VIOLON
      10: "_1",
      11: "_2",
      12: "_3",

      // BASKETBALL
      37: "_1",
      42: "_2",

      // STEAK KNIFE
      61: "_1",
      110: "_2",
  };

  // --------------------------------------------------------------------------------------

  // À modifier selon les préférences
  // --------------------------------------------------------------------------------------

  // Le masculin l'emporte sur le féminin
  const STRONGER_NOUN_CLASS = GENDER.MASCULINE;

  function get_plural_gender(character_names) {
      if (character_names.length === 0) throw new Error("Empty array!");
      let gender = character_names[0].GENDER;
      let i = 1;
      while (gender !== STRONGER_NOUN_CLASS || i !== character_names.length) {
          gender = character_names[i].GENDER;
          ++i;
      }
      return gender;
  }

  // Regexes
  const REGEX_FORMAT = /{[^}]+}/g;
  const REGEX_CAPITALIZE = /([^:]+)\^(.*)/g;
  const REGEX_UPPER_CASE = /([^:]+)\$(.*)/g;

  function capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function get_determiner(type, item) {
      if (type.startsWith("P"))
          return get_determiner(type.slice(1), { "GENDER": item.GENDER, "NUMBER": "PLURAL", "SILENT_H_OR_VOWEL": item.SILENT_H_OR_VOWEL });
      else if (!item.NUMBER)
          item.NUMBER = "SINGULAR";
      switch (type) {
          case "TO": {
              if (item["NUMBER"] === "SINGULAR") {
                  if (item["SILENT_H_OR_VOWEL"])
                      return "à l'";
                  else if (item["GENDER"] === "FEMININE")
                      return "à la ";
                  else
                      return "au ";
              }
              else
                  return "aux ";
          }
          case "AD": {
              if (item["NUMBER"] === "SINGULAR") {
                  if (item["SILENT_H_OR_VOWEL"])
                      return "l'";
                  else if (item["GENDER"] === "MASCULINE")
                      return "le ";
                  else
                      return "la ";
              }
              else
                  return "les ";
          }
          case "AI": {
              if (item["UNCOUNTABLE"]) {
                  if (item["SILENT_H_OR_VOWEL"])
                      return "de l'";
                  else if (item["GENDER"] === "MASCULINE")
                      return "du ";
                  else
                      return "de la "
              }
              else if (item["NUMBER"] === "SINGULAR") {
                  if (item["GENDER"] === "MASCULINE")
                      return "un ";
                  else
                      return "une ";
              }
              else
                  return "des ";
          }
          case "AP": {
              if (item["SHOW_BATTLE_DETERMINER"]) {
                  if (item["NUMBER"] === "SINGULAR") {
                      if (item["SILENT_H_OR_VOWEL"])
                          return "de l'";
                      else if (item["GENDER"] === "MASCULINE")
                          return "du ";
                      else
                          return "de la ";
                  }
                  else
                      return "des ";
              }
              else {
                  if (item["SILENT_H_OR_VOWEL"])
                      return "d'";
                  else
                      return "de ";
              }
          }
          case "AX": {
              if (item["NUMBER"] === "SINGULAR") {
                  if (item["SILENT_H_OR_VOWEL"])
                      return "de l'";
                  else if (item["GENDER"] === "MASCULINE")
                      return "du ";
                  else
                      return "de la ";
              }
              else
                  return "des ";
          }
          case "DD": {
              if (item["GENDER"] === "MASCULINE") {
                  if (item["NUMBER"] === "SINGULAR") {
                      if (item["SILENT_H_OR_VOWEL"])
                          return "cet ";
                      else
                          return "ce ";
                  }
                  else
                      return "ces ";
              }
              else {
                  if (item["NUMBER"] === "SINGULAR")
                      return "cette ";
                  else
                      return "cettes ";
              }
          }
          case "DP": {
              if (item["NUMBER"] === "SINGULAR") {
                  if (item["GENDER"] === "MASCULINE")
                      return "mon ";
                  else
                      return "ma ";
              }
              else
                  return "mes ";
          }
          case "DPY": {
              if (item["NUMBER"] === "SINGULAR") {
                  if (item["GENDER"] === "MASCULINE")
                      return "ton ";
                  else
                      return "ta ";
              }
              else
                  return "tes ";
          }
          case "DPO": {
              if (item["NUMBER"] === "SINGULAR") {
                  if (item["GENDER"] === "MASCULINE")
                      return "son ";
                  else
                      return "sa ";
              }
              else
                  return "ses ";
          }
          case "DQ": {
              if (item["SILENT_H_OR_VOWEL"])
                  return "qu'";
              else
                  return "que ";
          }
          case "DI": {
              if (item["NUMBER"] === "SINGULAR") {
                  if (item["GENDER"] === "MASCULINE")
                      return "quel ";
                  else
                      return "quelle ";
              }
              else {
                  if (item["GENDER"] === "MASCULINE")
                      return "quels ";
                  else
                      return "quelles ";
              }
          }
          case "DR": {
              if (item["NUMBER"] === "SINGULAR") {
                  if (item["GENDER"] === "MASCULINE")
                      return "lequel ";
                  else
                      return "laquelle ";
              }
              else {
                  if (item["GENDER"] === "MASCULINE")
                      return "lesquels ";
                  else
                      return "lesquelles ";
              }
          }
          case "DRA": {
              if (item["NUMBER"] === "SINGULAR") {
                  if (item["GENDER"] === "MASCULINE")
                      return "tout ";
                  else
                      return "toute ";
              }
              else {
                  if (item["GENDER"] === "MASCULINE")
                      return "tous ";
                  else
                      return "toutes ";
              }
          }
      }
  }

  function parse_json_file(location) {
      return JSON.parse(chowjs.loadFile("patch/beaf/data/"+location));
  }

  function init(sunny_name) {
      init_dict(sunny_name);
      load_adjectives();
      load_blackletters();
      load_locations();
      load_verbs();
      load_characters(sunny_name);
      load_characteristics();
      load_emotions();
      load_foes();
      load_items();
      load_armors();
      load_weapons();
      load_skills();
      load_battle_text();
  }


  function init_dict(sunny_name) {
      FORMAT_DICT = {};
      ADJECTIVES = {};
      CHARACTERS = {};
      FOES = {};
      ARMORS = {};
      CHARACTERISTICS = {};
      ITEMS = {};
      WEAPONS = {};
      SKILLS = {};
      BATTLE_TEXT = {};
      VERBS = {};
      LOCATIONS = {};
      BLACKLETTERS = {};
      BATTLE_TEXT_FORMAT_EXCEPTIONS = [];
      const vowel = ['A', 'E', 'I', 'O', 'U', 'Y'].includes(sunny_name[0].toUpperCase());
      FORMAT_DICT["SUNNY"] = sunny_name;
      FORMAT_DICT["AP:SUNNY"] = vowel ? "d'" : "de ";
      FORMAT_DICT["DP:SUNNY"] = "mon ";
      FORMAT_DICT["DI:SUNNY"] = "son ";
  }


  function format_singular(key, value) {
      FORMAT_DICT["AD:" + key] = get_determiner("AD", value);
      FORMAT_DICT["AI:" + key] = get_determiner("AI", value);
      FORMAT_DICT["AP:" + key] = get_determiner("AP", value);
      FORMAT_DICT["AX:" + key] = get_determiner("AX", value);
      FORMAT_DICT["DD:" + key] = get_determiner("DD", value);
      FORMAT_DICT["DP:" + key] = get_determiner("DP", value);
      FORMAT_DICT["DI:" + key] = get_determiner("DI", value);
      FORMAT_DICT["DR:" + key] = get_determiner("DR", value);
      FORMAT_DICT["DQ:" + key] = get_determiner("DQ", value);
      FORMAT_DICT["DPO:" + key] = get_determiner("DPO", value);
      FORMAT_DICT["DRA:" + key] = get_determiner("DRA", value);
      FORMAT_DICT["DPY:" + key] = get_determiner("DPY", value);
  }

  function format_plural(key, value) {
      FORMAT_DICT["PAD:" + key] = get_determiner("PAD", value);
      FORMAT_DICT["PAI:" + key] = get_determiner("PAI", value);
      FORMAT_DICT["PAP:" + key] = get_determiner("PAP", value);
      FORMAT_DICT["PAX:" + key] = get_determiner("PAX", value);
      FORMAT_DICT["PDD:" + key] = get_determiner("PDD", value);
      FORMAT_DICT["PDP:" + key] = get_determiner("PDP", value);
      FORMAT_DICT["PDI:" + key] = get_determiner("PDI", value);
      FORMAT_DICT["PDR:" + key] = get_determiner("PDR", value);
      FORMAT_DICT["PDRA:" + key] = get_determiner("PDRA", value);
  }

  function load_adjectives() {
      ADJECTIVES = parse_json_file("adjectives.json");

      for (const [key, value] of Object.entries(ADJECTIVES)) {
          FORMAT_DICT["MS:" + key] = value["MASCULINE"]["SINGULAR"];
          FORMAT_DICT["FS:" + key] = value["FEMININE"]["SINGULAR"];
          FORMAT_DICT["MP:" + key] = value["MASCULINE"]["PLURAL"];
          FORMAT_DICT["FP:" + key] = value["FEMININE"]["PLURAL"];
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("target:" + key.toLowerCase());
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("user:" + key.toLowerCase());
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("entity:" + key.toLowerCase());
      }
  }

  function load_blackletters() {
      BLACKLETTERS = parse_json_file("blackletters.json");
  }

  function load_locations() {
      LOCATIONS = parse_json_file("locations.json");
      for (const [key, value] of Object.entries(LOCATIONS)) {
          FORMAT_DICT[key] = value["TRANSLATION"];
          format_singular(key, value);
          format_plural(key, value);
      }
  }

  function load_verbs() {
      VERBS = parse_json_file("verbs.json");
      for (const [key, value] of Object.entries(VERBS)) {
          FORMAT_DICT["S:" + key] = value["SINGULAR"];
          FORMAT_DICT["P:" + key] = value["PLURAL"];
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("target:" + key.toLowerCase());
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("user:" + key.toLowerCase());
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("entity:" + key.toLowerCase());
      }
  }

  function load_characters(sunny_name) {
      CHARACTERS = parse_json_file("characters.json");
      for (const [key, value] of Object.entries(CHARACTERS)) {
          FORMAT_DICT[key] = value["TRANSLATION"];
          format_singular(key, value);
          format_plural(key, value);

      }
      const vowel = ['A', 'E', 'I', 'O', 'U', 'Y'].includes(sunny_name[0].toUpperCase());
      CHARACTERS[sunny_name] = {
          "GENDER": "MASCULINE",
          "NUMBER": "SINGULAR",
          "TRANSLATION": sunny_name,
          "SILENT_H_OR_VOWEL": vowel
      };
      CHARACTERS["SUNNY"] = {
          "GENDER": "MASCULINE",
          "NUMBER": "SINGULAR",
          "TRANSLATION": sunny_name,
          "SILENT_H_OR_VOWEL": vowel
      };
  }

  function load_characteristics() {
      const d = parse_json_file("characteristics.json");
      for (const [key, value] of Object.entries(d)) {
          FORMAT_DICT[key] = value["DIMINUTIVE"];
          FORMAT_DICT[key + "_LONG"] = value["TRANSLATION"];
          FORMAT_DICT["P:" + key] = value["PLURAL"];
          format_singular(key, value);
          format_plural(key, value);
          CHARACTERISTICS[key] = {
              "TRANSLATION": value.TRANSLATION,
              "DIMINUTIVE": value.DIMINUTIVE
          };
          if (value.SILENT_H_OR_VOWEL !== undefined)
              CHARACTERISTICS[key]["SILENT_H_OR_VOWEL"] = true;
      }
  }

  function load_emotions() {
      EMOTIONS = parse_json_file("emotions.json");
      for (const [key, value] of Object.entries(EMOTIONS)) {
          FORMAT_DICT["MS:" + key] = value["MASCULINE"]["SINGULAR"];
          FORMAT_DICT["MP:" + key] = value["MASCULINE"]["PLURAL"];
          FORMAT_DICT["FS:" + key] = value["FEMININE"]["SINGULAR"];
          FORMAT_DICT["FP:" + key] = value["FEMININE"]["PLURAL"];
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("target_" + key.toLocaleLowerCase());
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("user_" + key.toLocaleLowerCase());
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("entity:" + key.toLocaleLowerCase());
      }
  }

  function load_foes() {
      const d = parse_json_file("foes.json");
      for (const [key, value] of Object.entries(d)) {
          FORMAT_DICT[key] = value["TRANSLATION"];
          FOES[key] = {};
          FORMAT_DICT[key] = value.TRANSLATION;
          if (value.PLURAL) {
              FORMAT_DICT["P:" + key] = value.PLURAL;
              format_plural(key, value);
          }
          format_singular(key, value);
          FOES[key]["TRANSLATION"] = value.TRANSLATION;
          FOES[key]["GENDER"] = value.GENDER;
          FOES[key]["NUMBER"] = value.NUMBER;
          FOES[key]["DESCRIPTION"] = format_if_possible(value.DESCRIPTION);
          if (value.SHOW_BATTLE_DETERMINER)
              FOES[key]["SHOW_BATTLE_DETERMINER"] = value.SHOW_BATTLE_DETERMINER;
          if (value.SILENT_H_OR_VOWEL)
              FOES[key]["SILENT_H_OR_VOWEL"] = value.SILENT_H_OR_VOWEL;
      }
  }

  function load_items() {
      const d = parse_json_file("items.json");
      let name;
      for ([key, value] of Object.entries(d)) {
          ITEMS[key] = {};
          name = format_if_possible(value.TRANSLATION);
          if (value.UNCOUNTABLE || value.NUMBER === "PLURAL")
              FORMAT_DICT["P:" + key] = format_if_possible(value.TRANSLATION);
          else
              FORMAT_DICT["P:" + key] = format_if_possible(value.PLURAL);

          format_singular(key, value);
          format_plural(key, value);

          FORMAT_DICT[key] = name;
          ITEMS[key].TRANSLATION = name;
          ITEMS[key].NUMBER = value.NUMBER;
          ITEMS[key].SILENT_H_OR_VOWEL = value.SILENT_H_OR_VOWEL;
          ITEMS[key].GENDER = value.GENDER;
          if (value.UNCOUNTABLE)
              ITEMS[key].UNCOUNTABLE = true;
          ITEMS[key].DESCRIPTION = format_if_possible(value.DESCRIPTION);
          if (value.PLURAL)
              ITEMS[key].PLURAL = value.PLURAL;
      }

      for ([key, value] of Object.entries(d)) {
          if (need_formatting(ITEMS[key].TRANSLATION)) {
              name = format(value.TRANSLATION);
              ITEMS[key].TRANSLATION = name;
              FORMAT_DICT[key] = name;
              if (value.UNCOUNTABLE || value.NUMBER === "PLURAL")
                  FORMAT_DICT["P:" + key] = name;
          }
          if (need_formatting(FORMAT_DICT["P:" + key]))
              FORMAT_DICT["P:" + key] = format(value.PLURAL);
          if (need_formatting(ITEMS[key].DESCRIPTION))
              ITEMS[key].DESCRIPTION = format(value.DESCRIPTION);
      }

      for (const [key, value] of Object.entries(FOES))
          if (need_formatting(FOES[key]["DESCRIPTION"]))
              FOES[key]["DESCRIPTION"] = format(value.DESCRIPTION);
  }

  function load_armors() {
      const d = parse_json_file("armors.json");
      for ([key, value] of Object.entries(d)) {
          const name = format_if_possible(value.TRANSLATION);
          const description = format_if_possible(value.DESCRIPTION);
          ARMORS[key] = {
              "TRANSLATION": name,
              "DESCRIPTION": description,
              "NUMBER": value.NUMBER,
              "GENDER": value.GENDER
          };
          FORMAT_DICT[key] = name;
          format_singular(key, value);
      }
      for ([key, value] of Object.entries(d)) {
          if (need_formatting(ARMORS[key].TRANSLATION)) {
              const name = format(value.TRANSLATION);
              ARMORS[key].TRANSLATION = name;
              FORMAT_DICT[key] = name;
          }
          if (need_formatting(ARMORS[key].DESCRIPTION))
              ARMORS[key].DESCRIPTION = format(value.DESCRIPTION);
      }
  }

  function load_weapons() {
      const d = parse_json_file("weapons.json");
      let name;
      for ([key, value] of Object.entries(d)) {
          name = format_if_possible(value.TRANSLATION);

          WEAPONS[key] = {
              "DESCRIPTION": format_if_possible(value.DESCRIPTION)
          };

          format_singular(key, value);
          FORMAT_DICT[key] = name;
          WEAPONS[key]["TRANSLATION"] = name;
          WEAPONS[key]["GENDER"] = value.GENDER;
          WEAPONS[key]["NUMBER"] = value.NUMBER;
      }

      for ([key, value] of Object.entries(d)) {
          if (need_formatting(WEAPONS[key].DESCRIPTION))
              WEAPONS[key].DESCRIPTION = format(value.DESCRIPTION)

          if (need_formatting(FORMAT_DICT[key])) {
              name = format(value.TRANSLATION);
              FORMAT_DICT[key] = name;
              WEAPONS[key]["TRANSLATION"] = name;
          }
      }
  }

  function load_skills() {
      const d = parse_json_file("skills.json");
      let skipped_items = [];
      for (const [key, value] of Object.entries(d)) {
          if (key in FORMAT_DICT) {
              skipped_items.push(key);
              continue;
          }
          FORMAT_DICT[key] = value["TRANSLATION"];
          SKILLS[key] = {
              "TRANSLATION": value.TRANSLATION,
              "DESCRIPTION": format_if_possible(value.DESCRIPTION)
          };
      }
      for (const [key, value] of Object.entries(d))
          if (!skipped_items.includes(key) && need_formatting(SKILLS[key].DESCRIPTION))
              SKILLS[key].DESCRIPTION = format(value.DESCRIPTION);
  }

  function load_battle_text() {
      const air_horn = ITEMS["AIR HORN"];
      FORMAT_DICT["AIR HORN:giant"] = ADJECTIVES["GIANT"][air_horn.GENDER][air_horn.NUMBER];

      BATTLE_TEXT_FORMAT_EXCEPTIONS.push(
          "user",
          "target",
          "entity",
          "em",
          "em:suffix",
          "AD:stat",
          "stat",
          "AP:target",
          "AP:user",
          "DQ:target",
          "hl",
          "hp",
          "mp",
          "damage",
          "hp_damage_text",
          "mp_damage_text",
          "target:himself",
          "user:himself",
          "determiner",
          "to_target",
          "to_user",
          "sa_target",
          "sa_user",
          "son_target",
          "son_user",
          "ses_target",
          "ses_user",
          "target_AP",
          "user_AP"
      );
      const emotions = ["sadder", "happier", "angrier"];
      const stats = ["speed", "attack", "defense"]
      for (const em of emotions) {
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("user_" + em);
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("target_" + em);
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("user_" + em + "_max");
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("target_" + em + "_max");
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("user_" + em + "_max_check");
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("target_" + em + "_max_check");
      }
      for (const stat of stats) {
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("user_" + stat + "_lower");
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("user_" + stat + "_higher");
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("target_" + stat + "_lower");
          BATTLE_TEXT_FORMAT_EXCEPTIONS.push("target_" + stat + "_higher");
      }

      const d = parse_json_file("battle_text.json");
      for (const [key, value] of Object.entries(d))
          BATTLE_TEXT[key] = format(value);
  }

  function need_formatting(str) {
      return REGEX_FORMAT.test(str);
  }

  function format_if_possible(str) {
      try {
          return format(str);
      }
      catch (_) {
          return str;
      }
  }

  function format(str, d = FORMAT_DICT) {
      return str.replace(REGEX_FORMAT, (r) => {
          let key = r.substring(1, r.length - 1);
          let cap = false;
          let upper_case = false;
          key = key.replace(REGEX_CAPITALIZE, (_, k, param) => {
              cap = true;
              return k + param;
          });
          key = key.replace(REGEX_UPPER_CASE, (_, k, param) => {
              upper_case = true;
              return k + param;
          });

          if (!(key in d)) {
              if (d !== FORMAT_DICT || !BATTLE_TEXT_FORMAT_EXCEPTIONS.includes(key))
                  throw "No key \"" + key + "\" in initial \"" + str + "\"";
              else
                  return r;
          }


          let result = d[key];
          if (cap)
              result = capitalize(result);
          else if (upper_case)
              result = result.toUpperCase();
          return result;
      })
  }

  const EMOTIONS_STATES_IDS = {
      6: "HAPPY",
      7: "ECSTATIC",
      8: "MANIC",
      10: "SAD",
      11: "DEPRESSED",
      12: "MISERABLE",
      14: "ANGRY",
      15: "ENRAGED",
      16: "FURIOUS",
      18: "AFRAID",
      197: "HAPPY",
  };

  function get_item(item) {
      let name = item.name;
      if (item.id in ITEMS_EXCEPTIONS)
          name += ITEMS_EXCEPTIONS[item.id];

      return ITEMS[name];
  }

  function get_enemy(enemy) {
      return FOES[enemy.name];
  }

  function get_enemy_from_name(enemy_name) {
      return FOES[enemy_name];
  }

  function get_character(character) {
      return CHARACTERS[character.name];
  }

  function get_armor(item) {
      let name = item.name;

      if (item.id in ARMORS_EXCEPTIONS) name += ARMORS_EXCEPTIONS[item.id];
      return ARMORS[name];
  }

  function get_entity(entity_name) {
      if (entity_name in CHARACTERS) return CHARACTERS[entity_name];
      else return FOES[entity_name];
  }

  function get_skill(skill) {
      let name = skill.name;
      if (skill.id in SKILLS_EXCEPTIONS) name += SKILLS_EXCEPTIONS[skill.id];
      return SKILLS[name];
  }

  function get_weapon(weapon) {
      let name = weapon.name;
      if (weapon.id in WEAPONS_EXCEPTIONS) name += WEAPONS_EXCEPTIONS[weapon.id];
      return WEAPONS[name];
  }

  function get_data(data) {
      // Items
      if ("itypeId" in data) {
          return get_item(data);
      }
      // Armors
      else if ("atypeId" in data) {
          return get_armor(data);
      }
      // Skills
      else if ("stypeId" in data) {
          return get_skill(data);
      }
      // Weapons
      else if ("wtypeId" in data) {
          return get_weapon(data);
      }
  }

  function get_battle_text(id) {
      return BATTLE_TEXT[id];
  }

  function get_characteristic(name) {
      return CHARACTERISTICS[name];
  }

  function get_battle_multiline(text, bitmap, max_width) {
      let lines = text.split("\r\n");
      let final_lines = [];
      for (let i = 0; i < lines.length; ++i) {
          if (bitmap.measureTextWidth(lines[i]) > max_width) {
              let words = lines[i].split(" ");
              while (bitmap.measureTextWidth(words.join(" ")) > max_width) {
                  let nb = 10;
                  let tmp = words.slice(0, nb).join(" ");
                  while (bitmap.measureTextWidth(tmp) > max_width) {
                      --nb;
                      tmp = words.slice(0, nb).join(" ");
                  }
                  check = words.slice(nb);
                  if (check.length === 1 && (check[0] === "!" || check[0] === "?"))
                      --nb;
                  tmp = words.slice(0, nb).join(" ");
                  words = words.splice(nb);
                  final_lines.push(tmp)
              }
              final_lines.push(words.join(" "));
          }
          else
              final_lines.push(lines[i]);
      }
      return final_lines;
  }

  init(sunny_name);

  return {
      ADJECTIVES: ADJECTIVES,
      EMOTIONS: EMOTIONS,
      FOES: FOES,
      GENDER: GENDER,
      NUMBER: NUMBER,
      ARMORS: ARMORS,
      ITEMS: ITEMS,
      CHARACTERISTICS: CHARACTERISTICS,
      CHARACTERS: CHARACTERS,
      WEAPONS: WEAPONS,
      BATTLE_TEXT: BATTLE_TEXT,
      LOCATIONS: LOCATIONS,
      BLACKLETTERS: BLACKLETTERS,
      VERBS: VERBS,
      FORMAT_DICT: FORMAT_DICT,
      BATTLE_MAX_WIDTH: 370,
      EMOTIONS_STATES_IDS: EMOTIONS_STATES_IDS,
      capitalize: capitalize,
      format: format,
      get_item: get_item,
      get_armor: get_armor,
      get_entity: get_entity,
      get_data: get_data,
      get_enemy: get_enemy,
      get_character: get_character,
      get_enemy_from_name: get_enemy_from_name,
      get_skill: get_skill,
      get_weapon: get_weapon,
      get_battle_text: get_battle_text,
      get_characteristic: get_characteristic,
      get_determiner: get_determiner,
      get_plural_gender: get_plural_gender,
      get_battle_multiline: get_battle_multiline
  };
};

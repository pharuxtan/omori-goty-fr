return { name: "Global Fixes", priority: 0, patch() {
  globalThis.BEAF = beaf();
  globalThis.BEAF_BITMAP = new Bitmap();

  // patch Windows_Selectable and his childs

  const _Window_Selectable_initialize = Window_Selectable.prototype.initialize;
  Window_Selectable.prototype.initialize = function(...args) {
    try {
      _Window_Selectable_initialize.call(this, ...args);

      Object.defineProperty(this, "total_width", {
        value: 0,
        writable: true,
        configurable: true
      });
      Object.defineProperty(this, "x_offset", {
        value: 0,
        writable: true,
        configurable: true
      });
      Object.defineProperty(this, "widths", {
        value: [],
        writable: true,
        configurable: true
      });
      Object.defineProperty(this, "cursor_x", {
        value: [],
        writable: true,
        configurable: true
      });
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_Selectable.prototype.updateCustomCursorRectSprite = function(sprite, index) {
    try {
      if (sprite) {
        if (index === undefined) {
          index = this.index();
        }
        var rect = this.itemRect(index);
        sprite.visible = this.isCustomCursorRectSpriteVisible();
        if (this.cursor_x && this.cursor_x[index] !== undefined) sprite.x = this.cursor_x[index];
        else sprite.x = rect.x + this.customCursorRectXOffset();
        sprite.y = ((rect.y + this.standardPadding()) + Math.floor(rect.height / 2)) + this.customCursorRectYOffset();
        sprite._active = this.active;
        if (this.active) {
          sprite.setColorTone([0, 0, 0, 0]);
        } else {
          sprite.setColorTone([-80, -80, -80, 255]);
        };
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  function patchWindowSelectable(clazzName, clazz, dontPatchInit = false) {
    if (!dontPatchInit) {
      const _initialize = clazz.prototype.initialize;
      clazz.prototype.initialize = function(...args) {
        try {
          Object.defineProperty(this, "total_width", {
            value: 0,
            writable: true,
            configurable: true
          });
          Object.defineProperty(this, "x_offset", {
            value: 0,
            writable: true,
            configurable: true
          });
          Object.defineProperty(this, "widths", {
            value: [],
            writable: true,
            configurable: true
          });
          Object.defineProperty(this, "cursor_x", {
            value: [],
            writable: true,
            configurable: true
          });

          _initialize.call(this, ...args);
        } catch (e) {
          chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes|${clazzName}]: ${e.message}\n${e.stack}\n\n`);
        }
      }
    }

    clazz.prototype.updateCustomCursorRectSprite = function(sprite, index) {
      try {
        if (sprite) {
          if (index === undefined) {
            index = this.index();
          }
          var rect = this.itemRect(index);
          sprite.visible = this.isCustomCursorRectSpriteVisible();
          if (this.cursor_x && this.cursor_x[index] !== undefined) sprite.x = this.cursor_x[index];
          else sprite.x = rect.x + this.customCursorRectXOffset();
          sprite.y = ((rect.y + this.standardPadding()) + Math.floor(rect.height / 2)) + this.customCursorRectYOffset();
          sprite._active = this.active;
          if (this.active) {
            sprite.setColorTone([0, 0, 0, 0]);
          } else {
            sprite.setColorTone([-80, -80, -80, 255]);
          };
        };
      } catch (e) {
        chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes|${clazzName}]: ${e.message}\n${e.stack}\n\n`);
      }
    };
  }

  // patch initialize
  patchWindowSelectable("Window_Command", Window_Command);
  patchWindowSelectable("Window_OmoTitleScreenBox", Window_OmoTitleScreenBox);
  patchWindowSelectable("Window_ActorCommand", Window_ActorCommand);
  patchWindowSelectable("Window_BattleItem", Window_BattleItem);
  patchWindowSelectable("Window_BattleSkill", Window_BattleSkill);
  patchWindowSelectable("Window_SlotCommand", Window_SlotCommand);
  patchWindowSelectable("Window_ReplayCommand", Window_ReplayCommand);
  patchWindowSelectable("Window_OmoMenuActorEquip", Window_OmoMenuActorEquip);
  patchWindowSelectable("Window_OmoMenuItemConfirmation", Window_OmoMenuItemConfirmation);
  patchWindowSelectable("Window_OmoMenuItemTrashPromptWindow", Window_OmoMenuItemTrashPromptWindow);
  patchWindowSelectable("Window_OmoMenuOptionsGeneral", Window_OmoMenuOptionsGeneral);
  patchWindowSelectable("Window_OmoMenuOptionsAudio", Window_OmoMenuOptionsAudio);
  patchWindowSelectable("Window_OmoMenuOptionsControls", Window_OmoMenuOptionsControls);
  patchWindowSelectable("Window_OmoMenuActorSkillEquip", Window_OmoMenuActorSkillEquip);
  patchWindowSelectable("Window_OmoMenuSkillEquipControl", Window_OmoMenuSkillEquipControl);
  patchWindowSelectable("Window_OmoMenuActorSkillList", Window_OmoMenuActorSkillList);
  patchWindowSelectable("Window_OmoriQuestTypes", Window_OmoriQuestTypes);

  // do not patch initialize
  patchWindowSelectable("Window_OmoBestiaryEnemyList", Window_OmoBestiaryEnemyList, true);
  patchWindowSelectable("Window_OmoriShopItemList", Window_OmoriShopItemList, true);
  patchWindowSelectable("Window_OmoMenuActorEquipItem", Window_OmoMenuActorEquipItem, true);
  patchWindowSelectable("Window_OmoMenuItemCategory", Window_OmoMenuItemCategory, true);
  patchWindowSelectable("Window_OmoMenuItemList", Window_OmoMenuItemList, true);
  patchWindowSelectable("Window_OmoMenuOptionsCategory", Window_OmoMenuOptionsCategory, true);
  patchWindowSelectable("Window_MenuCommand", Window_MenuCommand, true);
  patchWindowSelectable("Window_OmoriPictureList", Window_OmoriPictureList, true);
  patchWindowSelectable("Window_OmoriQuestList", Window_OmoriQuestList, true);
  patchWindowSelectable("Window_OmoMenuOptionsSystem", Window_OmoMenuOptionsSystem, true);
  patchWindowSelectable("Window_OmoMenuOptionsExitPromptWindow", Window_OmoMenuOptionsExitPromptWindow, true);
  patchWindowSelectable("Window_PartyCommand", Window_PartyCommand, true);
  patchWindowSelectable("Window_OmoriInputLetters", Window_OmoriInputLetters, true);

  // Patch Windows_Base and his childs
  Window_Base.prototype.processDrawInputIcon = function(input, textState) {
    try {
      var key = Input.inputKeyCode(input);
      var rect = this.contents.keyIconRects(key).up;
      textState.x += 4;
      this.contents.drawAlginedKeyIcon(key, textState.x, textState.y, rect.width, textState.height);
      textState.x += rect.width + 4;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_Base.prototype.convertEscapeCharacters = function(text) {
    try {
      // Get Text
      text = text.replace(/\\V\[(\d+)\]/gi, function() {
        let v = $gameVariables.value(parseInt(arguments[1]));
        const location = BEAF.LOCATIONS[v];
        if (location)
          v = BEAF.get_determiner("TO", location) + location.TRANSLATION;
        return v;
      }.bind(this));
      text = text.replace(/\\V\[(\d+)\]/gi, function() {
        return $gameVariables.value(parseInt(arguments[1]));
      }.bind(this));
      text = text.replace(/\\N\[(\d+)\]/gi, function() {
        return this.actorName(parseInt(arguments[1]));
      }.bind(this));
      text = text.replace(/\\P\[(\d+)\]/gi, function() {
        return this.partyMemberName(parseInt(arguments[1]));
      }.bind(this));
      text = this.convertMacroText(text);
      text = this.setWordWrap(text);
      text = text.replace(/\\/g, '\x1b');
      text = text.replace(/\x1b\x1b/g, '\\');
      text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
        return $gameVariables.value(parseInt(arguments[1]));
      }.bind(this));
      text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
        return $gameVariables.value(parseInt(arguments[1]));
      }.bind(this));
      text = text.replace(/\x1bSV\[(\d+)\]/gi, function() {
        return $gameMap.selfVariableValue(parseInt(arguments[1]));
      }.bind(this));
      text = text.replace(/\x1bN\[(\d+)\]/gi, function() {
        return this.actorName(parseInt(arguments[1]));
      }.bind(this));
      text = text.replace(/\x1bP\[(\d+)\]/gi, function() {
        return this.partyMemberName(parseInt(arguments[1]));
      }.bind(this));
      text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
      text = this.convertExtraEscapeCharacters(text);
      // Get Last Gained Item
      var item = $gameParty.lastGainedItem();
      // If Item Exists
      if (item) {
        // Get Amount
        var amount = $gameParty._lastItemData.amount;

        text = text.replace(/(\x1bc\[[0-9]+\])?(\x1bitemget)(\x1bc\[[0-9]+\])?/ig, function(_, a, __, c) {
          let determiner;
          let suffix = "";
          let name;
          if (a === undefined)
            a = "";
          if (c === undefined)
            c = "";
          const it = BEAF.get_data(item);

          if (amount > 0) {
            if (amount === 1) {
              determiner = BEAF.get_determiner("AI", it);
              name = it.TRANSLATION;
            } else {
              determiner = BEAF.get_determiner("PAI", it);
              name = it.PLURAL;
              suffix = ' (' + $gameParty._lastItemData.amount + ' exemplaires)';
            }
          } else {
            if (amount < -1) {
              determiner = BEAF.get_determiner("PAI", it);
              name = it.PLURAL;
              suffix = ' (' + Math.abs($gameParty._lastItemData.amount) + ' exemplaires)';
            } else {
              determiner = BEAF.get_determiner("AI", it);
              name = it.TRANSLATION;
            }
          }
          return determiner + a + name + c + suffix;
        })
      } else {
        text = text.replace(/\x1bitemget/ig, 'NULL ID #');
      };
      // Return Text
      return text;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_Base.prototype.drawShortActorHP = function(actor, x, y) {
    try {
      var icon = ImageManager.loadSystem('hp_icon');
      this.contents.blt(icon, 0, 0, icon.width, icon.height, x, y)
      this.contents.fontSize = 20;
      this.changeTextColor(this.hpColor(actor));
      this.drawText(actor.hp, x + icon.width + 4, y - 12, 100);
      this.resetFontSettings();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_Base.prototype.worldCurrencyUnit = function() {
    try {
      chowjs.writeFile("save/worldindex.txt", String(SceneManager.currentWorldIndex()));
      switch (SceneManager.currentWorldIndex()) {
        case 1:
          return 'P';
        case 2:
          return '$';
      };
      return 'P';
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  function patchWindowBase(clazzName, clazz, drawAddition = 0, patchEscape = true) {
    if (patchEscape) clazz.prototype.convertEscapeCharacters = function(text) {
      try {
        // Get Text
        text = text.replace(/\\V\[(\d+)\]/gi, function() {
          let v = $gameVariables.value(parseInt(arguments[1]));
          const location = BEAF.LOCATIONS[v];
          if (location)
            v = BEAF.get_determiner("TO", location) + location.TRANSLATION;
          return v;
        }.bind(this));
        text = text.replace(/\\V\[(\d+)\]/gi, function() {
          return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\\N\[(\d+)\]/gi, function() {
          return this.actorName(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\\P\[(\d+)\]/gi, function() {
          return this.partyMemberName(parseInt(arguments[1]));
        }.bind(this));
        text = this.convertMacroText(text);
        text = this.setWordWrap(text);
        text = text.replace(/\\/g, '\x1b');
        text = text.replace(/\x1b\x1b/g, '\\');
        text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
          return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
          return $gameVariables.value(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\x1bSV\[(\d+)\]/gi, function() {
          return $gameMap.selfVariableValue(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\x1bN\[(\d+)\]/gi, function() {
          return this.actorName(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\x1bP\[(\d+)\]/gi, function() {
          return this.partyMemberName(parseInt(arguments[1]));
        }.bind(this));
        text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
        text = this.convertExtraEscapeCharacters(text);
        // Get Last Gained Item
        var item = $gameParty.lastGainedItem();
        // If Item Exists
        if (item) {
          // Get Amount
          var amount = $gameParty._lastItemData.amount;

          text = text.replace(/(\x1bc\[[0-9]+\])?(\x1bitemget)(\x1bc\[[0-9]+\])?/ig, function(_, a, __, c) {
            let determiner;
            let suffix = "";
            let name;
            if (a === undefined)
              a = "";
            if (c === undefined)
              c = "";
            const it = BEAF.get_data(item);

            if (amount > 0) {
              if (amount === 1) {
                determiner = BEAF.get_determiner("AI", it);
                name = it.TRANSLATION;
              } else {
                determiner = BEAF.get_determiner("PAI", it);
                name = it.PLURAL;
                suffix = ' (' + $gameParty._lastItemData.amount + ' exemplaires)';
              }
            } else {
              if (amount < -1) {
                determiner = BEAF.get_determiner("PAI", it);
                name = it.PLURAL;
                suffix = ' (' + Math.abs($gameParty._lastItemData.amount) + ' exemplaires)';
              } else {
                determiner = BEAF.get_determiner("AI", it);
                name = it.TRANSLATION;
              }
            }
            return determiner + a + name + c + suffix;
          })
        } else {
          text = text.replace(/\x1bitemget/ig, 'NULL ID #');
        };
        // Return Text
        return text;
      } catch (e) {
        chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes|${clazzName}]: ${e.message}\n${e.stack}\n\n`);
      }
    };

    clazz.prototype.drawShortActorHP = function(actor, x, y) {
      try {
        var icon = ImageManager.loadSystem('hp_icon');
        this.contents.blt(icon, 0, 0, icon.width, icon.height, x, y)
        this.contents.fontSize = 20;
        this.changeTextColor(this.hpColor(actor));
        this.drawText(actor.hp, x + icon.width + 4, y - 12, 100);
        this.resetFontSettings();
      } catch (e) {
        chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes|${clazzName}]: ${e.message}\n${e.stack}\n\n`);
      }
    };


    clazz.prototype.worldCurrencyUnit = function() {
      try {
        switch (SceneManager.currentWorldIndex()) {
          case 1:
            return 'P';
          case 2:
            return '$';
        };
        return 'P';
      } catch (e) {
        chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes|${clazzName}]: ${e.message}\n${e.stack}\n\n`);
      }
    };

    clazz.prototype.processDrawInputIcon = function(input, textState) {
      try {
        var key = Input.inputKeyCode(input);
        var rect = this.contents.keyIconRects(key).up;
        textState.x += 4;
        this.contents.drawAlginedKeyIcon(key, textState.x, textState.y + drawAddition, rect.width, textState.height);
        textState.x += rect.width + 4;
      } catch (e) {
        chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes|${clazzName}]: ${e.message}\n${e.stack}\n\n`);
      }
    };
  }

  patchWindowBase("Window_Selectable", Window_Selectable);
  patchWindowBase("Window_Command", Window_Command);
  patchWindowBase("Window_HorzCommand", Window_HorzCommand);
  patchWindowBase("Window_ItemCategory", Window_ItemCategory);
  patchWindowBase("Window_EquipCommand", Window_EquipCommand);
  patchWindowBase("Window_ShopCommand", Window_ShopCommand);
  patchWindowBase("Window_SlotCommand", Window_SlotCommand);
  patchWindowBase("Window_Wager", Window_Wager);
  patchWindowBase("Window_BlackJackCommands", Window_BlackJackCommands);
  patchWindowBase("Window_BJTitleCommands", Window_BJTitleCommands);
  patchWindowBase("Window_PetRockOptions", Window_PetRockOptions);
  patchWindowBase("Window_MenuCommand", Window_MenuCommand);
  patchWindowBase("Window_SkillType", Window_SkillType);
  patchWindowBase("Window_Options", Window_Options);
  patchWindowBase("Window_ChoiceList", Window_ChoiceList);
  patchWindowBase("Window_PartyCommand", Window_PartyCommand);
  patchWindowBase("Window_ActorCommand", Window_ActorCommand);
  patchWindowBase("Window_TitleCommand", Window_TitleCommand);
  patchWindowBase("Window_GameEnd", Window_GameEnd);
  patchWindowBase("Window_CommandTest", Window_CommandTest);
  patchWindowBase("Window_OmoBestiaryEnemyList", Window_OmoBestiaryEnemyList);
  patchWindowBase("Window_OmoBlackLetterList", Window_OmoBlackLetterList);
  patchWindowBase("Window_OmoMenuItemCategory", Window_OmoMenuItemCategory);
  patchWindowBase("Window_OmoMenuItemConfirmation", Window_OmoMenuItemConfirmation);
  patchWindowBase("Window_OmoMenuItemTrashPromptWindow", Window_OmoMenuItemTrashPromptWindow);
  patchWindowBase("Window_OmoMenuOptionsCategory", Window_OmoMenuOptionsCategory);
  patchWindowBase("Window_OmoMenuOptionsSystem", Window_OmoMenuOptionsSystem);
  patchWindowBase("Window_OmoMenuOptionsExitPromptWindow", Window_OmoMenuOptionsExitPromptWindow);
  patchWindowBase("Window_OmoMenuSkillEquipControl", Window_OmoMenuSkillEquipControl);
  patchWindowBase("Window_OmoriQuestTypes", Window_OmoriQuestTypes);
  patchWindowBase("Window_OmoriQuestList", Window_OmoriQuestList);
  patchWindowBase("Window_OmoriFileCommand", Window_OmoriFileCommand);
  patchWindowBase("Window_OmoriFilePrompt", Window_OmoriFilePrompt);
  patchWindowBase("Window_ReplayCommand", Window_ReplayCommand);
  patchWindowBase("Window_MenuStatus", Window_MenuStatus);
  patchWindowBase("Window_MenuActor", Window_MenuActor);
  patchWindowBase("Window_ItemList", Window_ItemList);
  patchWindowBase("Window_EquipItem", Window_EquipItem);
  patchWindowBase("Window_ShopSell", Window_ShopSell);
  patchWindowBase("Window_EventItem", Window_EventItem);
  patchWindowBase("Window_BattleItem", Window_BattleItem);
  patchWindowBase("Window_OmoriShopItemList", Window_OmoriShopItemList);
  patchWindowBase("Window_OmoMenuActorEquipItem", Window_OmoMenuActorEquipItem);
  patchWindowBase("Window_OmoMenuItemList", Window_OmoMenuItemList);
  patchWindowBase("Window_SnatchItem", Window_SnatchItem);
  patchWindowBase("Window_SkillList", Window_SkillList);
  patchWindowBase("Window_BattleSkill", Window_BattleSkill);
  patchWindowBase("Window_OmoMenuActorSkillList", Window_OmoMenuActorSkillList);
  patchWindowBase("Window_EquipSlot", Window_EquipSlot);
  patchWindowBase("Window_Status", Window_Status);
  patchWindowBase("Window_SavefileList", Window_SavefileList);
  patchWindowBase("Window_ShopBuy", Window_ShopBuy);
  patchWindowBase("Window_ShopNumber", Window_ShopNumber);
  patchWindowBase("Window_NameInput", Window_NameInput);
  patchWindowBase("Window_NumberInput", Window_NumberInput);
  patchWindowBase("Window_BattleLog", Window_BattleLog);
  patchWindowBase("Window_BattleStatus", Window_BattleStatus);
  patchWindowBase("Window_BattleActor", Window_BattleActor);
  patchWindowBase("Window_BattleEnemy", Window_BattleEnemy);
  patchWindowBase("Window_OmoMenuActorEquip", Window_OmoMenuActorEquip);
  patchWindowBase("Window_OmoMenuOptionsGeneral", Window_OmoMenuOptionsGeneral);
  patchWindowBase("Window_OmoMenuActorSkillEquip", Window_OmoMenuActorSkillEquip);
  patchWindowBase("Window_OmoMainMenuPartyStatus", Window_OmoMainMenuPartyStatus);
  patchWindowBase("Window_OmoriInputLetters", Window_OmoriInputLetters);
  patchWindowBase("Window_OmoriPictureList", Window_OmoriPictureList);
  patchWindowBase("Window_OmoTitleScreenBox", Window_OmoTitleScreenBox);
  patchWindowBase("Window_Help", Window_Help);
  patchWindowBase("Window_Gold", Window_Gold);
  patchWindowBase("Window_SkillStatus", Window_SkillStatus);
  patchWindowBase("Window_EquipStatus", Window_EquipStatus);
  patchWindowBase("Window_ShopStatus", Window_ShopStatus);
  patchWindowBase("Window_NameEdit", Window_NameEdit);
  patchWindowBase("Window_Message, 0, false", Window_Message, 0, false);
  patchWindowBase("WindowItemShopMessage, 0, false", WindowItemShopMessage, 0, false);
  patchWindowBase("Window_OmoriQuestMessage, 0, false", Window_OmoriQuestMessage, 0, false);
  patchWindowBase("Window_ScrollText", Window_ScrollText);
  patchWindowBase("Window_MapName", Window_MapName);
  patchWindowBase("Window_ChainSkillList", Window_ChainSkillList);
  patchWindowBase("Window_SkipCutscene", Window_SkipCutscene);
  patchWindowBase("Window_OmoMenuHelp", Window_OmoMenuHelp);
  patchWindowBase("Window_OmoWindowIndexCursor", Window_OmoWindowIndexCursor);
  patchWindowBase("Window_MessageFaceBox", Window_MessageFaceBox);
  patchWindowBase("Window_OmoriBattleActorStatus", Window_OmoriBattleActorStatus);
  patchWindowBase("Window_ItemListBack", Window_ItemListBack);
  patchWindowBase("Window_ScrollingTextSource, 5", Window_ScrollingTextSource, 5);
  patchWindowBase("Window_OmoBestiaryEnemy", Window_OmoBestiaryEnemy);
  patchWindowBase("Window_OmoBestiaryEnemyName", Window_OmoBestiaryEnemyName);
  patchWindowBase("Window_OmoBestiaryEnemyText", Window_OmoBestiaryEnemyText);
  patchWindowBase("Window_OmoBlackLetterMapName", Window_OmoBlackLetterMapName);
  patchWindowBase("Window_OmoBlackLetterWord", Window_OmoBlackLetterWord);
  patchWindowBase("Window_OmoHangmanBody", Window_OmoHangmanBody);
  patchWindowBase("Window_OmoriShopHeader", Window_OmoriShopHeader);
  patchWindowBase("Window_OmoriShopTotal", Window_OmoriShopTotal);
  patchWindowBase("Window_OmoMenuEquipStatus", Window_OmoMenuEquipStatus);
  patchWindowBase("Window_OmoMenuOptionsHelp", Window_OmoMenuOptionsHelp);
  patchWindowBase("Window_OmoMainMenuActorStatus", Window_OmoMainMenuActorStatus);
  patchWindowBase("Window_OmoriMapQTESmash", Window_OmoriMapQTESmash);
  patchWindowBase("Window_OmoriStopTheArrow", Window_OmoriStopTheArrow);
  patchWindowBase("Window_OmoriHitTheMark", Window_OmoriHitTheMark);
  patchWindowBase("Window_OmoriNameInputName", Window_OmoriNameInputName);
  patchWindowBase("Window_OmoriAlbumLegend", Window_OmoriAlbumLegend);
  patchWindowBase("Window_OmoriQuestHeader", Window_OmoriQuestHeader);
  patchWindowBase("Window_OmoriFileInformation", Window_OmoriFileInformation);
  patchWindowBase("Window_SlotInstruction", Window_SlotInstruction);
  patchWindowBase("Window_SlotMachine", Window_SlotMachine);
  patchWindowBase("Window_SlotsIntroduction", Window_SlotsIntroduction);
  patchWindowBase("Window_EnemyVisualSelect", Window_EnemyVisualSelect);
  patchWindowBase("Window_StatCompare", Window_StatCompare);
  patchWindowBase("Window_EventMiniLabel", Window_EventMiniLabel);
  patchWindowBase("Window_NameBox", Window_NameBox);
  patchWindowBase("Window_BlackJackData", Window_BlackJackData);
  patchWindowBase("Window_MinigameTitle", Window_MinigameTitle);
  patchWindowBase("Window_PizzaDeliveryNote", Window_PizzaDeliveryNote);
  patchWindowBase("Window_SnakeUI", Window_SnakeUI);
  patchWindowBase("Window_SpaceInvaderUI", Window_SpaceInvaderUI);

  DataManager.itemShortName = function(item) {
    try {
      if (item.meta.ShortName) {
        item.shortName = item.meta.ShortName.trim();
      } else {
        item.shortName = BEAF.get_data(item).TRANSLATION;
      }
      return item.shortName;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuHelp.prototype.standardFontSize = function() {
    return 20;
  };

  Window_OmoMenuHelp.prototype.refresh = function() {
    try {
      // Clear Contents
      this.contents.clear();
      // If Item Exists
      if (this._item) {
        const item = BEAF.get_data(this._item);

        this.contents.fontSize = 28;
        this.drawText(item.TRANSLATION, 6, -6, 200);
        this.contents.fontSize = 20;

        // replace with drawtextex

        this.drawTextEx(item.DESCRIPTION, 6, +28, 28); // CHANGE: Item descriptions text
        // Get Icon width
        var width = 106 * this._iconRate;
        // Draw Item Icon
        this.drawItemIcon(this._item, this.contents.width - width, 0, this._iconRate);
        // Get Icon Name
        var iconName = this._item.meta.IconName;
        // If Icon Name Exists
        if (iconName) {
          // Get Bitmap
          // var bitmap = ImageManager.loadSystem('/items/' + iconName.trim());
          var bitmap = ImageManager.loadSystem(iconName.trim());
          // Create Icon Bitmap
          bitmap.addLoadListener(() => {
            var icon = new Bitmap(bitmap.width * this._iconRate, bitmap.height * this._iconRate);
            icon.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 0, 0, icon.width, icon.height);
            var padding = this.standardPadding()
            var x = this.contents.width - icon.width;
            var y = this.contents.height - icon.height;
            this.contents.blt(icon, 0, 0, icon.width, icon.height, x, y)
          })
        }
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoWindowIndexCursor.prototype.refresh = function() {
    try {
      // Clear Contents
      let fontSize = 23;
      this.contents.fontSize = fontSize; // Change: Selection Text Size
      this.width = this.textWidth(this._text) + (this.standardPadding() * 2) + 10;
      this.createContents()
      this.contents.clear();
      this.contents.fontSize = fontSize; // Change: Selection Text Size
      // Draw Text
      this.drawText(this._text, 0, -13, this.contents.width, 'center');
      // Center Index Sprite
      this._indexSprite.x = this.width / 2;
      this._indexSprite.y = this.height + 5;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_NameBox.prototype.standardPadding = function() {
    return 10;
  };

  Window_NameBox.prototype.lineHeight = function() {
    return 24;
  };

  Window_NameBox.prototype.refresh = function(text, position) {
    try {
      this.show();
      this._lastNameText = text;
      this._text = Yanfly.Param.MSGNameBoxText + text;
      this._position = position;
      this.width = this.windowWidth();
      this.createContents();
      this.contents.clear();
      this.resetFontSettings();
      this.changeTextColor(this.textColor(Yanfly.Param.MSGNameBoxColor));
      var padding = eval(Yanfly.Param.MSGNameBoxPadding) / 2;
      this.drawTextEx(this._text, padding, -10, this.contents.width, this.contents.height);
      this._parentWindow.adjustWindowSettings();
      this._parentWindow.updatePlacement();
      this.adjustPositionY();
      this.y -= 4;
      this.open();
      this.activate();
      this._closeCounter = 4;
      return '';
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  const _Window_ChoiceList_updatePlacement = Window_ChoiceList.prototype.updatePlacement;
  Window_ChoiceList.prototype.updatePlacement = function updatePlacement() {
    try {
      this.cursor_x = [];
      for (let i = 0; i < $gameMessage.choices().length; ++i)
        this.cursor_x.push(10);

      _Window_ChoiceList_updatePlacement.call(this);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Scene_Gameover.prototype.createRetryWindows = function() {
    try {
      this._retryWindows = [];
      let text = LanguageManager.languageData().text.System.terms.game_over.choices;
      for (let i = 0; i < text.length; i++) {
        let win = new Window_Base(0, 0, 0, 0);
        win.standardPadding = function() {
          return 4;
        };
        win.initialize(0, 0, win.contents.measureTextWidth(text[i]) + win.standardPadding() * 4, 32)
        win.contents.fontSize = 26;

        win.x = Math.floor(Graphics.boxWidth / 2.6) + i * 100
        win.y = 380;
        win.drawOpacity = 0;
        win.opacity = 0;
        win.textToDraw = text[i];
        win.update = function(animPhase) {
          if (animPhase == 2) {
            if (!this.parent._retryQuestion.isTextComplete()) {
              return;
            }
            if (this.drawOpacity < 255) {
              this.contents.clear();
              this.drawOpacity += 2;
              this.opacity += 2;
              this.contents.paintOpacity = this.drawOpacity;
              win.contents.drawText(this.textToDraw, 0, -4, this.contents.width, this.contents.height, 'center');
            }
          } else if (animPhase == 4) {
            this.contents.clear();
            this.drawOpacity -= 4;
            this.opacity -= 4;
            this.contents.paintOpacity = this.drawOpacity;
            win.contents.drawText(this.textToDraw, 0, -4, this.contents.width, this.contents.height, 'center');
          }
        };
        this._retryWindows.push(win);
        this.addChild(win);
      };
      // Set Max Input
      this._inputData.max = text.length;
      // Create Retry Cursor Sprite
      this._retryCursorSprite = new Sprite_WindowCustomCursor(undefined, 'cursor_menu');
      this._retryCursorSprite.opacity = 0;
      this.addChild(this._retryCursorSprite);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  const _Game_Battler_addState = Game_Battler.prototype.addState;
  Game_Battler.prototype.addState = function(stateId) {
    try {
      const oldName = $dataEnemies[402].name;
      $dataEnemies[402].name = "SPACE EX-HUSBAND";
      _Game_Battler_addState.call(this, stateId);
      $dataEnemies[402].name = oldName;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Gamefall.OmoriFixes.parseNoEffectEmotion = function(tname, em) {
    try {
      if (typeof tname !== "string")
        tname = tname.name();
      const entity = BEAF.get_entity(tname);
      let e_t = entity.TRANSLATION;
      if (entity.SHOW_BATTLE_DETERMINER)
        e_t = BEAF.get_determiner("AD", entity) + e_t;
      let d = {
        "entity": e_t,
        "entity:can": BEAF.VERBS["CAN"][entity.NUMBER]
      };

      if (em.toLowerCase().contains("afraid")) {
        d["em"] = BEAF.EMOTIONS["AFRAID"][entity.GENDER][entity.NUMBER];
        return BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["CANNOT_BE"], d)) + "\r\n";
      }
      d["em"] = BEAF.EMOTIONS[em.toUpperCase()][entity.GENDER][entity.NUMBER];
      const text = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["CANNOT_BE"], d));
      return BEAF.get_battle_multiline(text, BEAF_BITMAP, BEAF.BATTLE_MAX_WIDTH);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Gamefall.OmoriFixes.parseNoStateChange = function(entity, stat, hl) {
    try {
      const char = BEAF.CHARACTERISTICS[stat];
      const d = {
        "stat": char.TRANSLATION,
        "AD:stat": BEAF.get_determiner("AD", char),
        "target_AP": BEAF.get_determiner("AP", entity) + entity.TRANSLATION,
        "hl": hl === "lower" ? BEAF.BATTLE_TEXT["STAT_MIN"] : BEAF.BATTLE_TEXT["STAT_MAX"]
      };
      const t = BEAF.format(BEAF.BATTLE_TEXT["STAT_MIN_MAX"], d);
      const final_lines = BEAF.get_battle_multiline(t, BEAF_BITMAP, BEAF.BATTLE_MAX_WIDTH);
      if (final_lines.length === 1)
        BattleManager.addText(final_lines[0], 16)
      else {
        BattleManager.addText(final_lines[0], 1)
        BattleManager.addText(final_lines[1], 16)
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Scene_Gameover.prototype.createRetryWindows = function() {
    try {
      this._retryQuestion = new Window_Base(0, 0, 0, 0);
      this._retryQuestion.standardPadding = function() {
        return 4;
      };

      this._retryQuestion.initialize(0, 0, Graphics.boxWidth, 32);
      this._retryQuestion.contents.fontSize = 26;

      this._retryQuestion.x = 0;
      this._retryQuestion.y = 380 - 48;
      this._retryQuestion.drawOpacity = 0;
      this._retryQuestion.opacity = 0;
      this._retryQuestion.textToDraw = this._isFinalBattle && this._finalBattlePhase >= 5 ? LanguageManager.languageData().text.System.terms.game_over.continue : LanguageManager.languageData().text.System.terms.game_over.retry;
      this._retryQuestion.textDrawn = "";
      this._retryQuestion.textIndex = -1;
      this._retryQuestion.isTextComplete = function() {
        return this.textDrawn === this.textToDraw;
      }
      this._retryQuestion.textDelay = 100;
      // Making the text already visible;
      this._retryQuestion.drawOpacity = 255;
      this._retryQuestion.update = function(animPhase) {
        if (animPhase == 2 || animPhase == 3) {
          if (!!this.isTextComplete()) {
            return;
          }
          if (this.textDelay > 0) {
            return this.textDelay--;
          }
          if (!this.isTextComplete()) {
            this.contents.clear();
            this.textIndex = Math.min(this.textIndex + 1, this.textToDraw.length);
            this.textDrawn += this.textToDraw[this.textIndex];
            this.contents.paintOpacity = this.drawOpacity;
            this.contents.drawText(this.textDrawn, 0, -4, this.contents.width, this.contents.height, 'center');
            SoundManager.playMessageSound();
            this.textDelay = 4;
          }
        } else if (animPhase == 4) {
          this.contents.clear();
          this.drawOpacity -= 4;
          this.contents.paintOpacity = this.drawOpacity;
          this.contents.drawText(this.textDrawn, 0, -4, this.contents.width, this.contents.height, 'center');
        }
      };
      this.addChild(this._retryQuestion);

      yin_gameover_createRetryWindows.call(this);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  const _yin_titlecrashload_initialize = yin_titlecrashload_initialize;
  yin_titlecrashload_initialize = function() {
    try {
      _yin_titlecrashload_initialize.call(this);
      if (StorageManager.exists(44)) {
        globalThis.BEAF = beaf($gameActors._data[8]._name);
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Global Fixes]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Object.defineProperty(TextManager, 'currencyUnit', {
    get: function() {
      return BEAF.ITEMS["CLAM"]["PLURAL"];
    },
    configurable: true
  });

  $plugins.find(plugin => plugin.name === "YEP_CoreEngine").parameters["Gold Overlap"] = "Beaucoup";
  $plugins.find(plugin => plugin.name === "YEP_X_MessageMacros2").parameters["Macro 107 Text"] = "\\n<SPACE PIRATE DUDE>";
  $plugins.find(plugin => plugin.name === "Olivia_SkipCutscene").parameters["Skip Text"] = "MAINTENIR \\DII[escape] POUR PASSER";
}}
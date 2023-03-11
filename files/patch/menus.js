return { name: "Menus", priority: 1, patch() {
  // Title Screen

  const PATCH_TEXT = "PATCH GOTY FR V1.0.2";
  
  const _Scene_OmoriTitleScreen_commandNewGame = Scene_OmoriTitleScreen.prototype.commandNewGame;
  Scene_OmoriTitleScreen.prototype.commandNewGame = function commandNewGame() {
    try {
      let entity;
      for (let i = 1; i < 501; ++i) {
        entity = BEAF.get_entity(Yanfly.MsgMacro[i].substring(3, Yanfly.MsgMacro[i].length - 1));
        if (entity)
          Yanfly.MsgMacro[i] = '\x1bn<' + entity.TRANSLATION + ">";
      }

      _Scene_OmoriTitleScreen_commandNewGame.call(this);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Scene_OmoriTitleScreen.prototype.createPatchText = function() {
    try {
      this.patch_version = new Sprite(new Bitmap(Math.ceil(Graphics.boxWidth / 4), 32));
      this.addChild(this.patch_version);
      this.patch_version.position.set(0, 24);
      this.patch_version.bitmap.fontSize = 24;
      this.patch_version.bitmap.drawText(PATCH_TEXT, 4, 4, this.patch_version.bitmap.width, 16, "left");
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Scene_OmoriTitleScreen.prototype.createCommandHints = function() {
    try {
      this._gs = 5;
      this._t = 5;
      this._g = 15;

      this.w1 = BEAF_BITMAP.keyIconRects(Input.inputKeyCode("ok")).up.width;
      this.w2 = BEAF_BITMAP.keyIconRects(Input.inputKeyCode("escape")).up.width;

      // Calculs de wco et wca
      this.wco = BEAF_BITMAP.measureTextWidth(LanguageManager.languageData().text.System.plugins.optionsMenu.buttonHints["confirm"]);
      this.wca = BEAF_BITMAP.measureTextWidth(LanguageManager.languageData().text.System.plugins.optionsMenu.buttonHints["cancel"]);

      // Calcul de la cordonnée x de P1
      const width = this._g + this._t + 2 * this._gs + this.w1 + this.w2 + this.wco + this.wca;
      const x = Graphics.boxWidth - width;

      this._commandHints = new Sprite(new Bitmap(width, Math.ceil(Graphics.boxHeight / 8)))
      this.addChild(this._commandHints);
      this._commandHints.position.set(x, 0);
      this.refreshCommandHints();
      //this._commandHints.bitmap
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Scene_OmoriTitleScreen.prototype.createTitleCommands = function() {
    try {
      this.createPatchText();
      // Initialize Title Comands
      this._titleCommands = [];
      // Text Array
      var textList = [LanguageManager.languageData().text.System.terms.command[18], LanguageManager.languageData().text.System.terms.command[19], LanguageManager.languageData().text.System.terms.command[23], "BADGES"]

      const N = textList.length;
      let text_buttons = [];
      let total_buttons_width = 0;

      for (let i = 0; i < N; ++i) {
        text_buttons.push(new Window_OmoTitleScreenBox(textList[i]));
        total_buttons_width += text_buttons[i].width;
      }
      const spacing = (Graphics.width - total_buttons_width) / (N + 1);
      let offset = 0;
      let x;

      for (let i = 0; i < N; ++i) {
        if (i === this._commandIndex)
          text_buttons[i].select(0);
        this._titleCommands[i] = text_buttons[i];
        this.addChild(text_buttons[i])
        text_buttons.y = Graphics.height;
        x = spacing * (i + 1) + offset;
        text_buttons[i].x = x;
        offset += text_buttons[i].width;
        text_buttons[i].cursor_x.push(-35);
      }

      // Set Continue text
      this._titleCommands[1].setText(textList[1], this._canContinue);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoTitleScreenBox.prototype.refresh = function() {
    try {
      Window_Selectable.prototype.refresh.call(this);
      // Clear Contents
      this.contents.clear();
      this.contents.fontSize = 28;
      // Set Paint Opacity based on enabled flag
      this.changePaintOpacity(this._enabled);
      // Draw Text
      // this.drawText(this._text, 40, -13, this.contents.width);
      this.drawText(this._text, 0, -13, this.contents.width, 'center');
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Main Menu

  Window_MenuCommand.prototype.standardFontSize = function() {
    return 24;
  };

  Window_MenuCommand.prototype.addCommand = function(name, type, boolean) {
    try {
      Window_Command.prototype.addCommand.call(this, name, type, boolean);

      if (this.visible) {
        const old_font_size = BEAF_BITMAP.fontSize;
        BEAF_BITMAP.fontSize = this.standardFontSize();
        const width = BEAF_BITMAP.measureTextWidth(name);
        BEAF_BITMAP.fontSize = old_font_size;

        this.total_width += width;
        this.widths.push(width);
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_MenuCommand.prototype.makeCommandList = function() {
    try {
      // Get Command Text
      var text = LanguageManager.getPluginText('mainMenu', 'commands');
      // Get Tag Text
      var tagText = text[0][0];
      const unlockedTag = $gameSwitches.value(17);
      const stabSwitch = $gameSwitches.value(4);
      const disableSwitch = $gameSwitches.value(5);

      if (unlockedTag) {
        tagText = text[0][1];
      };
      if (stabSwitch === true) {
        tagText = text[0][2];
      };

      this.widths = [];
      this.total_width = 0;
      this.cursor_x = [];
      this.commands_x = [];

      this.addCommand(tagText, 'talk', disableSwitch);
      this.addCommand(text[1], 'equip', $gameParty.members().length > 0);
      this.addCommand(text[2], 'item', $gameParty.hasValidPocketItems());
      this.addCommand(text[3], 'skill', $gameParty.members().length > 0);
      this.addCommand(text[4], 'options');

      const remaining_place = this.windowWidth() - this.total_width;
      const offset = remaining_place / (this._list.length + 1);
      let x = offset;
      for (let i = 0; i < this._list.length; i++) {
        this.cursor_x.push(x - 20);
        this.commands_x.push(x);
        x += this.widths[i] + offset;
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_MenuCommand.prototype.drawItem = function(index) {
    try {
      const stabSwitch = $gameSwitches.value(4);
      if (stabSwitch == true && index == 0) {
        //  this.resetTextColor();
        this.changeTextColor(this.textColor(9));
      } else {
        this.resetTextColor();
      }
      var align = this.itemTextAlign();
      this.changePaintOpacity(this.isCommandEnabled(index));

      this.drawText(this.commandName(index), this.commands_x[index], -3, this.widths[index], align);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMainMenuPartyStatus.prototype.createCursor = function() {
    try {
      this._cursorWindow = new Window_OmoWindowIndexCursor();
      this._cursorWindow.visible = false;
      this._cursorWindow.setText(LanguageManager.languageData().text.System.plugins.mainMenu.status.select);
      this._cursorWindow.y = -285;
      this.addChild(this._cursorWindow);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMainMenuActorStatus.prototype.refresh = function() {
    try {
      // Clear Contents
      this.contents.clear();
      // Get Actor
      var actor = this.actor();
      // If Actor Exists
      if (actor) {
        // Get World Index
        let worldIndex = SceneManager.currentWorldIndex();
        // Set Face Sprite Actor
        this._faceSprite.actor = actor;
        this._faceSprite.y = -this._faceSprite.height;
        this._faceSprite.x = Math.floor(143 / 2);
        this.contents.textColor = 'rgba(0, 0, 0, 1)';
        this.contents.outlineWidth = 0;
        this.contents.fontSize = 25;
        this.drawText(actor.name(), 12, -7, this.contents.width);
        this.contents.fontSize = 20;
        this.contents.textColor = 'rgba(255, 255, 255, 1)';
        // If world index is not 2
        if (worldIndex !== 2) {
          // Get Exp Rate parts
          let exp = actor.currentLevelExp();
          let currentExp = actor.currentExp() - exp;
          let nextExp = actor.nextLevelExp() - exp;
          // Set Rate
          let rate = currentExp / nextExp;
          rate = Math.min(rate, 1);
          this.contents.gradientFillRect(2, 30, 151 * rate, 15, 'rgba(51, 0, 196, 1)', 'rgba(254, 145, 246, 1)');
          this.drawText(LanguageManager.languageData().text.System.terms.basic[1] + '. ' + actor._level, 12, 18, this.contents.width);
        };
        // Get Bar Bitmap
        var bitmap = ImageManager.loadSystem('newtagmenud');
        // Draw HP Bar & HP
        this.contents.blt(bitmap, 0, 109, 116 * actor.hpRate(), 14, 29, 56);
        this.drawText(actor.hp + '/' + actor.mhp, 12, 42, this.contents.width - 26, 'right');
        // Draw MP Bar & MP
        this.contents.blt(bitmap, 0, 123, 116 * actor.mpRate(), 14, 29, 84);
        this.drawText(actor.mp + '/' + actor.mmp, 12, 70, this.contents.width - 26, 'right');
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Scene_OmoMenuBase.prototype.canUse = function(targets) {
    try {
      return this.user().canUse(this.item()) && this.isItemEffectsValid(targets);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Equip Menu

  Window_OmoMenuActorEquip.prototype.initialize = function() {
    try {
      // Super Call
      Window_Selectable.prototype.initialize.call(this, 0, 0, this.windowWidth(), this.windowHeight());
      this.cursor_x = [10, 10];
      // Actor Index
      this._actorIndex = 0;
      // Deactivate
      this.deactivate();
      // Refresh
      this.refresh();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuActorEquip.prototype.drawItem = function(index) {
    try {
      // Get Rect
      var rect = this.itemRect(index);
      // Get Equipment at index
      var equip = this.equipmentAtIndex(index);
      // Get Text
      var text = equip ? BEAF.get_data(equip).TRANSLATION : '------------'
      // Determine if enabled
      var enabled = this.isCurrentItemEnabled(index);
      if (enabled) {
        this.changePaintOpacity(true);
        this.contents.textColor = 'rgba(255, 255, 255, 1)';
      } else {
        this.changePaintOpacity(false);
        this.contents.textColor = 'rgba(140, 140, 140, 1)';
      };
      // Set Font Size
      this.contents.fontSize = 24;
      // Draw Text
      this.contents.drawText(text, rect.x, rect.y + 5, rect.width, rect.height);
      this.changePaintOpacity(true);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuEquipStatus.prototype.refresh = function() {
    try {
      // Clear Contents
      this.contents.clear();
      // Get Actor
      var actor = this._actor;
      // If Actor Exists
      if (actor) {
        // Get Arrow Bitmap
        var bitmap = ImageManager.loadSystem('equip_arrow');
        // Stats (Use 100+ for Xparam, 200+ For Sparam)
        var stats = this._params;
        // Go Through Stats
        for (var i = 0; i < stats.length; i++) {
          // Get Param Index
          var paramIndex = stats[i];
          var paramSub = Array.isArray(paramIndex) ? paramIndex[1] : null;
          if (paramSub) {
            paramIndex = paramIndex[0];
          }
          // Get First Value
          var value1 = this.actorParamValue(actor, paramIndex);
          // Get Param Name
          idx = paramSub ? paramSub : paramIndex;
          paramName = BEAF.CHARACTERISTICS[TextManager.param(idx)].TRANSLATION;
          this.contents.fontSize = 20;
          this.drawText(paramName + ' :', 8, -5 + i * 21, 100)
          this.drawText(value1, 132, -5 + i * 21, 100)
          this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 173, 13 + i * 21)
          // If Temp Actor Exists
          if (this._tempActor) {
            var value2 = this.actorParamValue(this._tempActor, paramIndex);
            this.resetTextColor();
            if (value1 < value2) {
              this.contents.textColor = "#69ff90";
            }
            if (value1 > value2) {
              this.contents.textColor = "#ff2b2b";
            }
          } else {
            var value2 = '---';
          }
          this.drawText(value2, 132 + 56, -5 + i * 21, 100)
          this.resetTextColor();
        };
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuActorEquipItem.prototype.drawItem = function(index) {
    try {
      // Get Rect
      this.cursor_x = [];
      for (let i = 0; i < this._data.length; ++i)
        this.cursor_x.push((i % 2 == 0) ? 10 : 210);
      this.cursor_initialized = true;
      var rect = this.itemRectForText(index);
      // Get Item
      var item = this._data[index]
      // Set Item Text
      // Set Font Size
      this.contents.fontSize = 24;
      // Draw Text
      const text = item ? BEAF.get_data(item).TRANSLATION : '------------'
      this.contents.drawText(text, rect.x, rect.y, rect.width, rect.height);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Item Menu

  Window_OmoMenuItemCategory.prototype.windowWidth = function() {
    try {
      const text = LanguageManager.getPluginText('itemMenu', 'categories');

      const old_font_size = BEAF_BITMAP.fontSize;
      BEAF_BITMAP.fontSize = this.standardFontSize();
      const width = BEAF_BITMAP.measureTextWidth(text[0] + text[1] + text[2]);
      BEAF_BITMAP.fontSize = old_font_size;

      return width + 80 + 45;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_OmoMenuItemCategory.prototype.standardFontSize = function() {
    return 20;
  };

  Window_OmoMenuItemCategory.prototype.makeCommandList = function() {
    try {
      // Get Commands Text
      const text = LanguageManager.getPluginText('itemMenu', 'categories');
      // Add Commands
      this.addCommand(text[0], 'consumables', $gameParty.hasConsumableItems());
      this.addCommand(text[1], 'toys', $gameParty.hasToyItems());
      this.addCommand(text[2], 'important', $gameParty.hasKeyItems());

      const old_font_size = BEAF_BITMAP.fontSize;
      BEAF_BITMAP.fontSize = this.standardFontSize();
      const text0_width = BEAF_BITMAP.measureTextWidth(text[0]);
      const text1_width = BEAF_BITMAP.measureTextWidth(text[1]);
      BEAF_BITMAP.fontSize = old_font_size;

      this.cursor_x = [8, text0_width + 48, text0_width + text1_width + 88];
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuItemCategory.prototype.itemRect = function(index) {
    try {
      // Get rect
      var rect = Window_Command.prototype.itemRect.call(this, index);
      rect.y -= 3;


      const text = LanguageManager.getPluginText('itemMenu', 'categories');
      const old_font_size = BEAF_BITMAP.fontSize;
      BEAF_BITMAP.fontSize = this.standardFontSize();
      rect.width = BEAF_BITMAP.measureTextWidth(text[index]);
      let x = 2;
      for (let i = 0; i < index; ++i)
        x += BEAF_BITMAP.measureTextWidth(text[i]) + 40;

      BEAF_BITMAP.fontSize = old_font_size;

      rect.x = x;
      // Return Rect
      return rect;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  const _Window_OmoMenuItemList_initialize = Window_OmoMenuItemList.prototype.initialize;
  Window_OmoMenuItemList.prototype.initialize = function() {
    try {
      _Window_OmoMenuItemList_initialize.call(this);
      this.last_category = null;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_OmoMenuItemList.prototype.itemWidth = function() {
    return 190;
  };

  Window_OmoMenuItemList.prototype.makeItemList = function() {
    try {
      // Run Original Function
      Window_ItemList.prototype.makeItemList.call(this);
      // Sort list
      this._data.sort(function(a, b) {
        var indexA = a.meta.ListIndex === undefined ? a.id : Number(a.meta.ListIndex);
        var indexB = b.meta.ListIndex === undefined ? b.id : Number(b.meta.ListIndex);
        return indexA - indexB;
      });
      if (this._category === "important") {
        this._data.sort((a, b) => {
          let priorityA = !!a.meta["ItemPriority"] ? parseInt(a.meta["ItemPriority"]) : 0;
          let priorityB = !!b.meta["ItemPriority"] ? parseInt(b.meta["ItemPriority"]) : 0;
          return priorityB - priorityA;
        })
      }
      if (this._category !== this.last_category) {
        this.cursor_x = [];
        for (let i = 0; i < this._data.length; ++i)
          this.cursor_x.push(10);
        this.last_category = this._category;
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuItemList.prototype.drawItem = function(index) {
    try {
      // Get Rect
      var rect = this.itemRectForText(index);
      // Get Item
      var item = this._data[index]
      // If Item
      if (item) {
        // Set Font Size
        this.contents.fontSize = 22;
        rect.width -= 20;
        // Draw Text
        this.contents.drawText(BEAF.get_item(item).TRANSLATION, rect.x, rect.y, rect.width, rect.height);
        rect.width += 5
        this.contents.drawText('x' + $gameParty.numItems(item), 200, rect.y, rect.width, rect.height);
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  const _Window_OmoMenuItemConfirmation_initialize = Window_OmoMenuItemConfirmation.prototype.initialize;
  Window_OmoMenuItemConfirmation.prototype.initialize = function() {
    try {
      _Window_OmoMenuItemConfirmation_initialize.call(this);
      this.cursor_x = [8, 8];
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuItemConfirmation.prototype.windowWidth = function() {
    try {
      const text = LanguageManager.getPluginText('itemMenu', 'itemUse').commands;

      const old_font_size = BEAF_BITMAP.fontSize;
      BEAF_BITMAP.fontSize = this.standardFontSize();

      const use_width = BEAF_BITMAP.measureTextWidth(text[0][0]);
      const trash_width = BEAF_BITMAP.measureTextWidth(text[1]);

      BEAF_BITMAP.fontSize = old_font_size;

      return (use_width > trash_width ? use_width : trash_width) + 50;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_OmoMenuItemConfirmation.prototype.standardFontSize = function() {
    return 24;
  };

  Window_OmoMenuItemTrashPromptWindow.prototype.windowWidth = function() {
    try {
      const text = LanguageManager.getPluginText('itemMenu', 'itemTrash');
      const commands = text.commands;
      const prompt = text.text;

      const commands_width = BEAF_BITMAP.measureTextWidth(commands[0]) + BEAF_BITMAP.measureTextWidth(commands[1]) + 45 + 40 + 20;
      const prompt_width = BEAF_BITMAP.measureTextWidth(prompt) + 40;


      return (commands_width > prompt_width ? commands_width : prompt_width);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuItemTrashPromptWindow.prototype.standardFontSize = function() {
    return 24;
  };

  Window_OmoMenuItemTrashPromptWindow.prototype.makeCommandList = function() {
    try {
      // Get Commands Text
      var text = LanguageManager.getPluginText('itemMenu', 'itemTrash').commands;
      this.addCommand(text[0], 'yes');
      this.addCommand(text[1], 'cancel');
      this.cursor_x = [8, BEAF_BITMAP.measureTextWidth(text[0]) + 48];
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuItemTrashPromptWindow.prototype.itemRectForText = function(index) {
    try {
      var rect = this.itemRect(index);

      let x = 45;
      const text = LanguageManager.getPluginText('itemMenu', 'itemTrash').commands;
      for (let i = 0; i < index; ++i)
        x += BEAF_BITMAP.measureTextWidth(text[i]) + 40;

      rect.x = x;
      rect.y -= 10;
      rect.width -= this.textPadding() * 2;
      return rect;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Options Menu

  Window_OmoMenuOptionsCategory.prototype.standardFontSize = function() {
    return 24;
  };

  Window_OmoMenuOptionsCategory.prototype.makeCommandList = function() {
    try {
      data = LanguageManager.languageData();

      this.addCommand(data.text.System.terms.command[26], 'ok');
      this.addCommand(data.text.System.terms.command[27], 'ok');
      this.addCommand(data.text.System.terms.command[28], 'ok');
      this.addCommand(data.text.System.terms.command[29], 'ok');

      this.initialized = false;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuOptionsCategory.prototype.itemRect = function(index) {
    try {
      // This part is required to handle "MODS" submenu (GOMORI / RpH modloader)
      if (!this.initialized) {
        const old_font_size = BEAF_BITMAP.fontSize;
        BEAF_BITMAP.fontSize = this.standardFontSize();
        let total_width = 0;
        this.widths = [];
        this.x_options = [];
        this.cursor_x = [];
        for (let i = 0; i < this._list.length; ++i) {
          width = BEAF_BITMAP.measureTextWidth(this._list[i].name);
          total_width += width;
          this.widths.push(width);
        }

        const remaining_width = this.windowWidth() - total_width;
        const padding = remaining_width / (this._list.length + 1); // In order to compute mods submenu if needed

        let offset = padding;
        for (let i = 0; i < this._list.length; ++i) {
          this.x_options.push(offset);
          this.cursor_x.push(offset - 35);
          offset += padding + this.widths[i];
        }

        BEAF_BITMAP.fontSize = old_font_size;
        this.initialized = true;
      }
      return new Rectangle(this.x_options[index] - 40, -3, this.widths[index] + 20, this.standardFontSize());
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuOptionsGeneral.prototype.initialize = function() {
    try {
      // Make Options List
      this.makeOptionsList();
      // Super Call
      Window_Selectable.prototype.initialize.call(this, 0, 0, this.windowWidth(), this.windowHeight());
      // Create Option Cursors
      this.createOptionCursors();
      this.cursor_x = Array(6).fill(15);
      this.select(0);
      this.refresh();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuOptionsGeneral.prototype.makeOptionsList = function() {
    try {
      // Get Text
      var text = LanguageManager.getPluginText('optionsMenu', 'general')
      // Get Config
      var config = ConfigManager;
      // Get Options
      var options = Object.keys(text);
      // Initialize Options List
      this._optionsList = [];
      // Go through Options
      for (var i = 0; i < options.length; i++) {
        // Get Name
        var name = options[i]
        // Get Data
        var data = text[name];
        // Create Option
        var option = {
          header: (data.text + ' :'),
          options: Array.from(data.options),
          helpText: data.help,
          spacing: data.spacing
        };

        // If Bool index
        if (data.boolIndex) {
          // Set Index by state
          option.index = config[name] ? 0 : 1
        } else {
          // Set index
          option.index = config[name];
        };
        // Add Option
        this._optionsList.push(option);
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_OmoMenuOptionsAudio.prototype.initialize = function() {
    try {
      // Make Options List
      this.makeOptionsList();
      // Super Call
      Window_Selectable.prototype.initialize.call(this, 0, 0, this.windowWidth(), this.windowHeight());
      // Create Volume Bars
      this.createVolumeBars();

      this.cursor_x = Array(4).fill(15);
      this.select(0);
      // Refresh
      this.refresh();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuOptionsAudio.prototype.makeOptionsList = function() {
    try {
      // Get Text
      var text = LanguageManager.getPluginText('optionsMenu', 'audio')
      // Get Config
      var config = ConfigManager;
      // Get Options
      var options = Object.keys(text);
      // Initialize Options List
      this._optionsList = [];
      // Go Through Options
      for (var i = 0; i < options.length; i++) {
        // Get Name
        var name = options[i];
        // Get Data
        var data = text[name];
        // Add Option
        this._optionsList.push({
          header: data.text + ' :',
          config: name,
          volume: AudioManager[name],
          helpText: data.help
        });
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_OmoMenuOptionsControls.prototype.initialize = function() {
    try {
      // Set Waiting for Input Flag
      this._waitingForInput = false;
      // Make Options List
      this.makeOptionsList();
      // Super Call
      Window_Selectable.prototype.initialize.call(this, 0, 0, this.windowWidth(), this.windowHeight());
      // Create Key Prompt Window
      this.createKeyPromptWindow();
      // Set Ok Handler
      this.setHandler('ok', this.onCommandOk.bind(this));

      this.cursor_x = [];
      for (let i = 0; i < 20; ++i) {
        if (i % 2 === 0) {
          this.cursor_x.push(200);
        } else {
          this.cursor_x.push(390);
        }
      }

      const old_font_size = BEAF_BITMAP.fontSize;
      BEAF_BITMAP.fontSize = this.standardFontSize();

      const width = BEAF_BITMAP.measureTextWidth(LanguageManager.languageData().text.System.plugins.optionsMenu.controls.resetAll);
      const offset = 50;
      this.x_reset_all = [this.windowWidth() - offset * 2 - width * 2, this.windowWidth() - offset - width];

      this.cursor_x.push(this.x_reset_all[0] - 30);
      this.cursor_x.push(this.x_reset_all[1] - 30);


      BEAF_BITMAP.fontSize = old_font_size;

      this.select(0);
      // Refresh
      this.refresh();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuOptionsControls.prototype.refresh = function() {
    try {
      // Run Original Function
      Window_Selectable.prototype.refresh.call(this);
      // Draw Headers
      var width = (this.contents.width / 2) - 100
      // Get Source Text
      var text = LanguageManager.getPluginText('optionsMenu', 'controls');
      const old_font_size = BEAF_BITMAP.fontSize;
      BEAF_BITMAP.fontSize = this.standardFontSize();

      width = BEAF_BITMAP.measureTextWidth(text.keyboardHeader);
      this.drawText(text.keyboardHeader, 248 - width / 2, 0, width);

      width = BEAF_BITMAP.measureTextWidth(text.gamepadHeader);
      this.drawText(text.gamepadHeader, 443 - width / 2, 0, width);

      BEAF_BITMAP.fontSize = old_font_size;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuOptionsControls.prototype.drawItem = function(index) {
    try {
      // Get Item Rect
      var rect = this.itemRect(index);
      // Get Row
      var row = index % this.maxCols();
      // Get Data
      var data = this._optionsList[index];
      // If Row is 0
      if (row === 0) {
        // this.contents.drawInputIcon('', rect.x - 140, rect.y + 7);
        // Draw Header
        this.contents.drawText(data.header, rect.x - 140, rect.y, rect.width, rect.height);
      };
      // If Data Exists
      if (data) {
        rect.x += 50;
        // 345 is the way to go
        if (data.resetKeyboard) {
          // Draw Header
          this.contents.drawText(data.name, this.x_reset_all[0], rect.y, rect.width, rect.height);
        } else if (data.resetGamepad) {
          // Draw Header
          this.contents.drawText(data.name, this.x_reset_all[1], rect.y, rect.width, rect.height);
        };

        if (data.keyboard) {
          rect.x += 35;
          this.contents.drawKeyIcon(data.key, rect.x, rect.y + 7, "keyboardBlack24");
        }
        if (data.gamepad) {
          rect.x += 25;
          this.contents.drawKeyIcon(data.key, rect.x, rect.y + 7, 'gamepadBlack24', data.direction ? 1 : 0);
        };
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuOptionsSystem.prototype.initialize = function() {
    try {
      // Super Call
      Window_Command.prototype.initialize.call(this, 0, 0);

      this.cursor_x = Array(4).fill(8);
      this.deactivate();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuOptionsExitPromptWindow.prototype.initialize = function() {
    try {
      // Super Call
      Window_Command.prototype.initialize.call(this, 0, 0);
      // Prompt Text
      this._promptText = LanguageManager.getPluginText('optionsMenu', 'system').exitPrompt.text;
      // Refresh Contents
      this.cursor_x = [8, this.itemWidth() + 8];

      this.refresh();
      this.openness = 0;
      this.deactivate();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Skill Menu

  Scene_OmoMenuSkill.prototype.onActorSkillControlUse = function() {
    try {
      // Close Control Window
      this._actorSkillControlWindow.close();
      // Set Function Index list index
      this.setFunctionListIndex(0);
      // Show All Actors Except The selected one
      this.queue(function() {
        var windows = this._statusWindow._statusWindows;
        for (var i2 = 0; i2 < windows.length; i2++) {
          if (i2 !== this._selectedIndex) {
            this.showActorStatus(i2);
          };
        };
        this._statusWindow.reorderStatusWindows(this._selectedIndex, 0);
        this.hideHelpWindow();
      }.bind(this))
      this.queue('setWaitMode', 'movement');
      // Activate Window
      this.queue(function() {
        // Set Skill
        this._skill = this._actorSkillEquipWindow.skillAtIndex();
        // Disable Ok Sound
        this._statusWindow._okSoundEnabled = false;
        // If Item is for all
        if (this.isItemForAll()) {
          this._statusWindow.setCursorText(LanguageManager.languageData().text.System.plugins.skillMenu.useOnAll);
          this._statusWindow.setCursorAll(true);
        } else {
          this._statusWindow.setCursorText(LanguageManager.languageData().text.System.plugins.skillMenu.useOnWho);
          this._statusWindow.setCursorAll(false);
        }
        this._statusWindow.activate();
        this._statusWindow.select(0);
      }.bind(this))
      // Clear Function List Index 
      this.clearFunctionListIndex();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Scene_OmoMenuSkill.prototype.hideActorEquipWindow = function(index) {
    try {
      // Set Cursor Change Handler
      this._actorSkillEquipWindow.setHandler('onCursorChange', null);
      if (!!this._statusWindow._statusWindows[index]) {
        this._statusWindow._statusWindows[index].animateFace(false);
      }
      // Enable Ok Sound
      this._statusWindow._okSoundEnabled = true
      // Set Function Index list index
      this.setFunctionListIndex(0);

      // this._actorSkillControlWindow.close();
      this.queue('hideHelpWindow', 15)
      this.queue('setWaitMode', 'movement');

      // Set Duration
      var duration = 15;
      // Move Actor Window to the First position
      this.queue(function() {
        // Get Object
        var obj = this._statusWindow._statusWindows[index];
        // Create Movement Data
        var data = {
          obj: obj,
          properties: ['y'],
          from: {
            y: obj.y
          },
          to: {
            y: -obj.height
          },
          durations: {
            y: duration
          },
          easing: Object_Movement.easeOutCirc
        };
        // Start Move    
        this.move.startMove(data);
        // Get Object
        var obj = this._actorSkillEquipWindow
        // Create Movement Data
        var data = {
          obj: obj,
          properties: ['y'],
          from: {
            y: obj.y
          },
          to: {
            y: Graphics.height
          },
          durations: {
            y: duration
          },
          easing: Object_Movement.easeOutCirc
        };
        // Start Move    
        this.move.startMove(data);
      }.bind(this))
      this.queue('setWaitMode', 'movement');
      // Move Actor Window to their original position
      this.queue(function() {
        // Get Object
        var obj = this._statusWindow._statusWindows[index];
        // Create Movement Data
        var data = {
          obj: obj,
          properties: ['x', 'y', 'contentsOpacity'],
          from: {
            x: obj.x,
            y: obj.y,
            contentsOpacity: obj.contentsOpacity
          },
          to: {
            x: obj._originX,
            y: -obj.height,
            contentsOpacity: 255
          },
          durations: {
            x: duration,
            y: duration,
            contentsOpacity: duration
          },
          easing: Object_Movement.easeInCirc
        };
        this.move.startMove(data);
      }.bind(this))
      this.queue('setWaitMode', 'movement');


      // Show All Actors Except The selected one
      this.queue(function() {
        // Sort Status Windows
        this._statusWindow.sortStatusWindows();

        var windows = this._statusWindow._statusWindows;
        for (var i2 = 0; i2 < windows.length; i2++) {
          this.showActorStatus(i2);
        };
      }.bind(this))
      this.queue('setWaitMode', 'movement');

      // Show Help window
      this.queue(function() {
        this._statusWindow.setCursorText(LanguageManager.languageData().text.System.plugins.mainMenu.status.select);
        this._statusWindow.select(index);
        this._statusWindow.activate();
      }.bind(this))

      // Clear Function List Index 
      this.clearFunctionListIndex();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuActorSkillEquip.prototype.initialize = function() {
    try {
      // Super Call
      Window_Selectable.prototype.initialize.call(this, 0, 0, this.windowWidth(), this.windowHeight());
      // Actor Index
      this._actorIndex = 0;
      // Deactivate
      this.deactivate();
      // Refresh
      this.refresh();

      this.cursor_x = Array(this.maxItems()).fill(9);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuActorSkillEquip.prototype.drawItem = function(index) {
    try {
      // Get Rect
      var rect = this.itemRect(index);
      // Get Skill at index
      var skill = this.skillAtIndex(index);
      // Determine if enabled
      var enabled = this.isCurrentItemEnabled(index);
      // If Enabled
      if (enabled) {
        this.changePaintOpacity(true);
        this.contents.textColor = 'rgba(255, 255, 255, 1)';
      } else {
        this.changePaintOpacity(false);
        this.contents.textColor = 'rgba(140, 140, 140, 1)';
      };

      // Get Text
      var text = skill ? BEAF.get_skill(skill).TRANSLATION : '------------'
      this.contents.fontSize = 24;
      // Draw Text
      this.contents.drawText(text, rect.x, rect.y + 5, rect.width, rect.height);
      this.changePaintOpacity(true);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuSkillEquipControl.prototype.initialize = function() {
    try {
      // Super Call
      Window_Command.prototype.initialize.call(this, 0, 0);
      this.cursor_x = [9, 9];
      // Create Bubble Sprites
      this.createBubbleSprites();
      // Set Openness to 0
      this.openness = 0;
      // Deactivate
      this.deactivate();
      // Refresh
      this.refresh();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuSkillEquipControl.prototype.windowWidth = function() {
    try {
      const old_text_width = BEAF_BITMAP.fontSize;
      BEAF_BITMAP.fontSize = this.standardFontSize();
      let width1 = BEAF_BITMAP.measureTextWidth(LanguageManager.languageData().text.System.plugins.skillMenu.confirm[0]);
      let width2 = BEAF_BITMAP.measureTextWidth(LanguageManager.languageData().text.System.plugins.skillMenu.confirm[1]);
      const max_width = width1 > width2 ? width1 : width2;
      BEAF_BITMAP.fontSize = old_text_width;
      return max_width + 50;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuSkillEquipControl.prototype.makeCommandList = function() {
    try {
      this.addCommand(LanguageManager.languageData().text.System.plugins.skillMenu.confirm[0], 'use');
      this.addCommand(LanguageManager.languageData().text.System.plugins.skillMenu.confirm[1], 'swap');
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuSkillEquipControl.prototype.refresh = function() {
    try {
      // Super Call
      Window_Command.prototype.refresh.call(this);

      this.contents.fontSize = 24;
      this.drawText(LanguageManager.languageData().text.System.plugins.skillMenu.use, 10, 0, this.contents.width);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  const _Window_OmoMenuActorSkillList_initialize = Window_OmoMenuActorSkillList.prototype.initialize;
  Window_OmoMenuActorSkillList.prototype.initialize = function() {
    try {
      _Window_OmoMenuActorSkillList_initialize.call(this);
      this.size = null;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_OmoMenuActorSkillList.prototype.makeItemList = function() {
    try {
      if (this._actor) {
        this._data = this._actor.equipableSkills().filter(function(item) {
          return this.includes(item);
        }, this);
      } else {
        this._data = [];
      };
      // Push Unequip Null Data
      this._data.push(null);
      if (this._data.length !== this.size) {
        this.cursor_x = Array(this._data.length);
        for (let i = 0; i < this._data.length; ++i)
          this.cursor_x[i] = i % 2 == 0 ? 9 : 219;
        this.size = this._data.length;
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoMenuActorSkillList.prototype.drawItem = function(index) {
    try {
      // Get Rect
      var rect = this.itemRectForText(index);
      // Get Item
      var item = this._data[index];
      // Determine if enabled
      var enabled = this.isCurrentItemEnabled(index);
      // Set Item Text
      const text = item ? BEAF.get_skill(item).TRANSLATION : '------------';
      // Set Font Size
      this.contents.fontSize = 24;
      // Draw Text
      this.contents.drawText(text, rect.x, rect.y, rect.width, rect.height);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Item Shop

  Window_OmoriShopTotal.prototype.refresh = function() {
    try {
      // Clear Contents
      this.contents.clear();
      // Draw Headers
      this.contents.drawText('PRIX TOTAL :', 5, 20, this.contents.width - 10, 20);
      this.contents.drawText('QUANTITÉ :', 5, 0, this.contents.width - 10, 20);
      // Draw Shopping Values
      this.drawShoppingValues();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  const _Window_OmoriShopItemList_makeItemList = Window_OmoriShopItemList.prototype.makeItemList;
  Window_OmoriShopItemList.prototype.makeItemList = function() {
    try {
      _Window_OmoriShopItemList_makeItemList.call(this);
      this.cursor_x = Array(this._data.length).fill(7);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_OmoriShopItemList.prototype.drawItem = function(index) {
    try {
      // Get Data
      var data = this._data[index];
      // Get Item
      var item = data.item;
      this.contents.fontSize = 24;
      if (item) {
        var rect = this.itemRect(index);
        rect.x += 32
        rect.width -= 40;
        this.changePaintOpacity(this.isEnabled(item));
        // this.contents.fillRect(rect.x, rect.y, rect.width - 50, rect.height, 'rgba(255, 0, 0, 0.5)')
        this.contents.drawText(BEAF.get_data(item).TRANSLATION, rect.x, rect.y, rect.width - 50, rect.height);
        this.contents.drawText('%1 %2'.format(this.price(index), this.worldCurrencyUnit()), rect.x, rect.y, rect.width, rect.height, 'right');
        this.changePaintOpacity(1);
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  WindowItemShopMessage.prototype.drawItem = function(item) {
    try {
      // If Item exists
      if (item) {
        // Get Item Text
        const translated_item = BEAF.get_data(item);
        var itemText = translated_item.DESCRIPTION;
        // Set Item Draw Flag to true
        this._drawingItemText = true;
        // Initialize Text State
        this._textState = {};
        this._textState.index = 0;
        this._textState.text = this.convertEscapeCharacters(itemText);
        this.newPage(this._textState);
        this._textState.x = 110;
        this._textState.y = 24;
        // Set Flags
        this._showFast = true;
        this._pauseSkip = true;
        this._wordWrap = true;
        // Unpause
        this.pause = false;
        // Set Sound count to max (Prevents sound from playing)
        this._soundCount = 99;
        // Update Message
        this.updateMessage();
        // Draw Item Icon
        this.drawItemIcon(item, 0, -5, 1)
        // Draw Item Name
        this.contents.drawText(translated_item.TRANSLATION, 106, 0, this.contents.width - 106, 24)
        // Draw Owned amount
        this.contents.drawText('(%1 : %2)'.format(LanguageManager.getPluginText('itemShopMenu', 'ownedText'), $gameParty.numItems(item)), 0, 0, this.contents.width - 10, 24, 'right')
        // Set Item Draw Flag to false
        this._drawingItemText = false;
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Quest Menu

  Window_OmoriQuestHeader.prototype.windowWidth = function() {
    try {
      const old_font_size = BEAF_BITMAP.fontSize;
      BEAF_BITMAP.fontSize = this.standardFontSize();
      const width = BEAF_BITMAP.measureTextWidth(LanguageManager.getPluginText('questMenu', 'header'));
      BEAF_BITMAP.fontSize = old_font_size;
      return width + 20;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoriQuestTypes.prototype.initialize = function() {
    try {
      // Super Call
      Window_Command.prototype.initialize.call(this, 12, 0);
      this.activate();
      this.select(0);
      this.cursor_x = [10, 10];
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoriQuestList.prototype.makeCommandList = function() {
    try {
      // Get Language
      this.cursor_x = [];
      var language = LanguageManager._language;
      // Go Through Quest List
      for (var i = 0; i < this._questList.length; i++) {
        // Get Quest
        var quest = this._questList[i];
        // Get Data
        var data = $dataQuests.quests[quest.id];
        this.addCommand(data.name[language], 'quest', true, quest);
        this.cursor_x.push(10);
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Album

  Window_OmoriAlbumLegend.prototype.refresh = function(canRead = true) {
    try {
      // Clear Contents
      this.contents.clear();
      // Get Width
      var width = this.contents.width;
      // Get Text List
      var textList = LanguageManager.getPluginText('albumMenu', 'legendText')[this._textList];
      // If Text List Exists
      if (textList) {
        // Get Segment Width
        var segmentWidth = Math.floor(this.contents.width / textList.length);

        let total_text_width = 0;
        for (let i = 0; i < textList.length; i++)
          total_text_width += BEAF_BITMAP.measureTextWidth(textList[i].text);

        offset = (this.windowWidth() - (total_text_width + 4 * 24 + 4 * 5)) / (textList.length + 1);
        let sx = offset;

        // Go through text list
        for (var i = 0; i < textList.length; i++) {
          // Get Data
          var data = textList[i];
          if (this._textList.toLowerCase() === "browsing" && i === 0 && !canRead) {
            continue;
          }
          var inputRects = data.inputs.map(input => this.contents.keyIconRects(Input.inputKeyCode(input)).up)
          // Get Total Width
          var tw = Math.floor(this.textWidth(data.text)) + 8;
          // Draw Header Text
          this.contents.drawText(data.text, sx, -4, tw, this.contents.height);
          const tmp = BEAF_BITMAP.measureTextWidth(data.text) + 5;
          // Get Starting Icon X Position
          var ix = sx + tmp;
          // Go Through Inputs
          for (var i2 = 0; i2 < data.inputs.length; i2++) {
            // Get Input
            var input = data.inputs[i2];
            this.contents.drawInputIcon(input, ix, 2);
            // Increase Icon X
            ix += inputRects[i2].width + 5;
          };
          sx += tmp + 24 + offset;
        };
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoriPictureList.prototype.initialize = function(data) {
    try {
      // Initialize Data
      this._data = [];
      // Set Data
      this._albumData = data;
      // Get Album Spot ID
      this._albumSpotId = null;
      // Super Call
      Window_Selectable.prototype.initialize.call(this, 0, 0, this.windowWidth(), this.windowHeight());
      this.cursor_x = [10];
      // Refresh Contents
      this.refresh();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoriPictureList.prototype.makeItemList = function() {
    try {
      // Initialize Data
      this._data = [];
      this.cursor_x = [];
      // Get Items
      var items = this._albumData.albumItems;
      // Get Positions
      const positions = $gameParty._albumPicturePositions[this._albumData.group];
      // Go through Items
      for (var i = 0; i < items.length; i++) {
        // Get Item
        var item = items[i];
        // If Album does not have picture
        if (!$gameParty.albumHasPicture(this._albumData.group, item.id)) {
          // Add Item to DAta
          this._data.push(item);
        };
        this.cursor_x.push(10 + 120 * (i % 5));
      };
      // Go through data
      this._data.sort(function(a, b) {
        return positions.indexOf(a.id) - positions.indexOf(b.id);
      });

      // // Randomize Item List Positions
      // this.shuffleItemList();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Bestiary

  Scene_OmoriBestiary.prototype.onListChangeUpdate = function() {
    try {
      // Get Enemy ID
      var enemyId = this._enemyListWindow.enemyId();
      // Get Enemy Sprite
      var enemySprite = this._enemyWindow._enemySprite;
      // If the enemy ID is more than 0
      if (enemyId > 0) {
        this._enemyWindow.clearOpacity();
        enemySprite.removeChildren();
        // If enemy ID has changed transform
        this._enemy.transform(enemyId);
        // Get Data
        var data = LanguageManager.getTextData('Bestiary', 'Information')[enemyId];
        // Get Background Data
        var background = data.background;
        // Draw Name
        this._enemyNameWindow.drawName(this._enemyListWindow.enemyName(data));
        // Set Home Position
        enemySprite.setHome(data.position.x, data.position.y)
        // Set Enemy Sprite to visible
        enemySprite.visible = true;
        // Start Enemy Sprite Motion
        enemySprite.startMotion("other");
        // Update Enemy Sprite
        enemySprite.update();
        // Set Background
        this._enemyWindow.setBackground(background.name, background.x, background.y)
      } else {
        // Make Enemy Sprite invisible
        enemySprite.setHome(-Graphics.width, -Graphics.height)
        // Draw Name
        this._enemyNameWindow.drawName(BEAF.ITEMS["FOE FACTS!"].TRANSLATION);
        // Set Background
        this._enemyWindow.setBackground(null);
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Scene_OmoriBestiary.prototype.onEnemyListOk = function() {
    try {
      // Get Enemy ID
      var enemyId = this._enemyListWindow.enemyId();
      // Get Data
      var data = LanguageManager.getTextData('Bestiary', 'Information')[enemyId];
      // Make Enemy Text Window Visible
      this._enemyTextWindow.visible = true;

      // Get Lines
      const lines = BEAF.FOES[data.name].DESCRIPTION.split(/[\r\n]/g);

      // Get Conditional Text
      var conditionalText = data.conditionalText;
      // If Conditional Text Exists
      if (conditionalText) {
        // Go through conditional text
        for (var i = 0; i < conditionalText.length; i++) {
          // Get text Data
          var textData = conditionalText[i];
          // Check if all switches are active
          if (textData.switchIds.every(function(id) {
              return $gameSwitches.value(id);
            })) {
            // Get Line Index
            var lineIndex = textData.line === null ? lines.length : textData.line;
            // Get Extra Lines
            var extraLines = textData.text.split(/[\r\n]/g);
            // Add extra lines to main lines array
            lines.splice(lineIndex, 0, ...extraLines)
          };
        };
      }

      // Draw Lines
      this._enemyTextWindow.drawLines(lines);
      // Get Character
      var character = this._enemyTextWindow._enemyCharacter;
      let sprite = this._enemyTextWindow._characterSprite;
      // If Character Data Exists
      if (data.character) {
        // Set Character Image
        character.setImage(data.character.name, data.character.index);
      } else {
        // Set Character Image to nothing
        character.setImage('', 0);
      };
      // Update Sprite
      sprite.update()
      // Update Character
      this._enemyTextWindow.updateCharacter();
      this._enemyTextWindow._characterSprite.update();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoBestiaryEnemyList.prototype.initialize = function() {
    try {
      // Get Entries for Sorted Bestiary list
      this._sortedBestiaryList = Object.entries(LanguageManager.getTextData('Bestiary', 'Information'));
      // Sort list
      this._sortedBestiaryList.sort(function(a, b) {
        var indexA = a[1].listIndex === undefined ? Number(a[0]) : a[1].listIndex
        var indexB = b[1].listIndex === undefined ? Number(b[0]) : b[1].listIndex
        return indexA - indexB
      });

      // Super Call
      Window_Command.prototype.initialize.call(this, 0, 0);

      this.cursor_x = Array(this._sortedBestiaryList.length).fill(17);
      this.select(0); // We need to initialize this.cursor_x after the parent call.
      // That's why we also need to make this call to select (in order
      // for the arrow to be correctly displayed)
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoBestiaryEnemyList.prototype.enemyName = function(obj) {
    try {
      // If object has conditional names
      if (obj.conditionalNames) {
        // Get Names
        const names = obj.conditionalNames
        // Go Through Names
        for (var i = 0; i < names.length; i++) {
          // Get Data
          const data = names[i];
          // Check Switches
          let switches = data.switches.every(arr => $gameSwitches.value(arr[0]) === arr[1])

          if (switches) {
            return BEAF.FOES[data.name].TRANSLATION;
          };
        };
      };
      // Return default name
      return BEAF.FOES[obj.name].TRANSLATION;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Name Input

  const layouts = [
    [
      "{layout0} a z e r t y u i o p {bksp}",
      "{layout1} q s d f g h j k l m {s}",
      "{layout2} w x c v b n {s} {s} {s} {s} {s}",
      "{layout3} {s} {s} {s} {s} {s} {s} {s} {s} {s} {s} {confirm}"
    ],
    [
      "{layout0} A Z E R T Y U I O P {bksp}",
      "{layout1} Q S D F G H J K L M {s}",
      "{layout2} W X C V B N {s} {s} {s} {s} {s}",
      "{layout3} {s} {s} {s} {s} {s} {s} {s} {s} {s} {s} {confirm}"
    ],
    [
      "{layout0} Á É Í Ó Ú á é í ó ú {bksp}",
      "{layout1} À È Ì Ò Ù à è ì ò ù Ç",
      "{layout2} Â Ê Î Ô Û â ê î ô û ç",
      "{layout3} Ä Ë Ï Ö Ü ä ë ï ö ü {confirm}"
    ],
    [
      "{layout0} 1 2 3 4 5 6 7 8 9 0 {bksp}",
      "{layout1} < > = - _ $ € % * ` ^",
      "{layout2} { } [ ] ( ) | ' # ~ &",
      "{layout3} @ ° + / \\ , ; : ! ? {confirm}"
    ]
  ];

  const customKeys = {
    "{layout0}": "abc",
    "{layout1}": "ABC",
    "{layout2}": "ÁÊÏ",
    "{layout3}": "@$#",
    "{confirm}": "OK",
    "{s}": " ",
    "{bksp}": "<="
  }

  let layoutIndex = 0;

  class FrenchVirtualKeyboard extends Window_Selectable {
    initialize() {
      try {
        const ww = Math.floor(Graphics.boxWidth / 1.2);
        const hh = Math.floor(Graphics.boxHeight / 2.5);
        const x = Graphics.boxWidth / 2 - ww / 2;
        const y = Graphics.boxHeight / 2 - hh / 2;
        super.initialize(x, y, ww, hh);
        this.openness = 0;
        this.refresh();
      } catch (e) {
        chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
      }
    }

    isOkEnabled() {
      return true;
    }

    isUsingCustomCursorRectSprite() {
      return true;
    }

    customCursorRectBitmapName() {
      return "name_cursor";
    }

    customCursorRectXOffset() {
      return -12;
    }

    add(char) {
      try {
        return this._nameWindow.add(char);
      } catch (e) {
        chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
      }
    }

    back() {
      try {
        return this._nameWindow.back();
      } catch (e) {
        chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
      }
    }

    confirmEntry() {
      try {
        const entry = this._nameWindow.name();
        if (entry.length > 0) {
          globalThis.BEAF = beaf(entry);
          this.dispose();
          this._nameWindow.close();
          if (_TDS_.NameInput.params.nameVariableID > 0) {
            $gameVariables.setValue(_TDS_.NameInput.params.nameVariableID, entry);
          };
        } else {
          this.playBuzzerSound();
        }
      } catch (e) {
        chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
      }
    }

    processOk() {
      const character = this.getCharacter();
      if (character in customKeys) {
        switch (character) {
          case "{layout0}":
          case "{layout1}":
          case "{layout2}":
          case "{layout3}":
            SoundManager.playOk();
            layoutIndex = parseInt(character.match(/\d/)[0]);
            this.determineLayoutData();
            this.refresh();
            break;
          case "{confirm}":
            this.confirmEntry()
            break;
          case "{s}":
            this._nameWindow.add(" ")
            break;
          case "{bksp}":
            if (this.back()) {
              SoundManager.playCancel()
            }
            break;
        }
      } else {
        if (this.add(character)) {
          SoundManager.playOk()
        } else {
          SoundManager.playBuzzer()
        }
      }
    }

    setup() {
      this.activate();
      this.select(0);
      this.open();
    }

    dispose() {
      this.deactivate();
      this.close();
    }

    standardFontSize() {
      return 24;
    }

    refresh() {
      this.determineLayoutData();
      super.refresh();
    }

    determineLayoutData() {
      this._currentLayout = layouts[layoutIndex].map(l => l.split(" "));
      this._layoutCols = 0;
      for (let layout of this._currentLayout) {
        if (this._layoutCols < layout.length) {
          this._layoutCols = layout.length;
        }
      }
      this._currentLayout = this._currentLayout.map(l => {
        let res = [];
        if (l.length >= this._layoutCols) {
          return l;
        }
        let missing_cols = Math.abs(l.length - this._layoutCols);
        let back = [];
        let forward = [];
        for (let i = 0; i < missing_cols; i++) {
          if (i % 2 === 0) {
            back.push(" ");
          } else {
            forward.push(" ");
          }
        }
        return res.concat(back).concat(l).concat(forward);
      })
    }

    maxItems() {
      return this._layoutCols * this._currentLayout.length;
    }

    maxCols() {
      return this._layoutCols;
    }

    getCharacter(index = this.index()) {
      return this._currentLayout[Math.floor(index / this.maxCols())][index % this.maxCols()];
    }

    drawItem(index) {
      const rect = this.itemRect(index);
      let current_char = this.getCharacter(index);
      if (current_char in customKeys) {
        if (current_char === "{confirm}") this.changeTextColor(this.textColor(1));
        current_char = customKeys[current_char];
      }
      this.drawText(current_char, rect.x, rect.y, rect.width, "center");
      this.resetTextColor();
    }
  }

  Scene_Map.prototype.showNameInputWindows = function(name, max) {
    try {
      this._nameInputNameWindow._maxCharacters = max;
      this._nameInputNameWindow.width = this._nameInputNameWindow.windowWidth();
      this._nameInputNameWindow.createContents();
      this._nameInputNameWindow.refresh();
      this._nameInputNameWindow.clearName(name);
      this._nameInputNameWindow.open();
      if (!(this._virtualKeyboard instanceof FrenchVirtualKeyboard)) {
        this._virtualKeyboard.dispose();
        this._virtualKeyboard = new FrenchVirtualKeyboard();
        this._virtualKeyboard._nameWindow = this._nameInputNameWindow;
        this.addWindow(this._virtualKeyboard);
        this._virtualKeyboard.position.set(this._nameInputNameWindow.x, this._nameInputNameWindow.y + this._nameInputNameWindow.height);
      }
      this._virtualKeyboard.setup();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Menus]: ${e.message}\n${e.stack}\n\n`);
    }
  }
}}
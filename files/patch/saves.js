return { name: "Saves", priority: 1, patch() {
  const CHAPTERS = JSON.parse(chowjs.loadFile("patch/beaf/data/chapters.json"));
  const PRELOADED_LOCATIONS = JSON.parse(chowjs.loadFile("patch/beaf/data/locations.json"));

  let SAVE_LOAD_WIDTH = undefined;
  let LOAD_WIDTH = undefined;

  const _makeSavefileInfo = DataManager.makeSavefileInfo;
  DataManager.makeSavefileInfo = function() {
    try {
      const info = _makeSavefileInfo.call(this);
      info.location = BEAF.LOCATIONS[$gameMap.displayName()].TRANSLATION;
      return info;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Saves]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  const _Scene_OmoriFile_initialize = Scene_OmoriFile.prototype.initialize;
  Scene_OmoriFile.prototype.initialize = function() {
    try {
      _Scene_OmoriFile_initialize.call(this);

      this.load_message = LanguageManager.languageData().text.System.plugins.optionsMenu.system.load.message;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Saves]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  const _Scene_OmoriFile_createPromptWindow = Scene_OmoriFile.prototype.createPromptWindow;
  Scene_OmoriFile.prototype.createPromptWindow = function() {
    try {
      if (!LOAD_WIDTH)
        LOAD_WIDTH = BEAF_BITMAP.measureTextWidth(this.load_message) + 20;

      _Scene_OmoriFile_createPromptWindow.call(this);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Saves]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Scene_OmoriFile.prototype.onSelectInputOk = function() {
    try {
      var index = this._commandWindow.index();
      var saveFileid = this.savefileId();
      if (index === 0) {
        if (StorageManager.exists(saveFileid)) {
          this.showPromptWindow(LanguageManager.languageData().text.System.plugins.optionsMenu.system.overwrite.message);
          this._canSelect = false;
        } else {
          this.saveGame();
        };
      } else {
        if (StorageManager.exists(saveFileid)) {
          this.showPromptWindow(this.load_message);
          this._canSelect = false;
        } else {
          SoundManager.playBuzzer();
        };
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Saves]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Scene_OmoriFile.prototype.loadGame = function() {
    try {
      if (DataManager.loadGame(this.savefileId())) {
        SoundManager.playLoad();
        this.fadeOutAll();
        if ($gameSystem.versionId() !== $dataSystem.versionId) {
          $gamePlayer.reserveTransfer($gameMap.mapId(), $gamePlayer.x, $gamePlayer.y);
          $gamePlayer.requestMapReload();
        };
        SceneManager.goto(Scene_Map);
        this._loadSuccess = true;
        this._promptWindow.close();
        this._promptWindow.deactivate();
        globalThis.BEAF = beaf($gameActors._data[8]._name);
        let entity;
        for (let i = 1; i < 501; ++i) {
          entity = BEAF.get_entity(Yanfly.MsgMacro[i].substring(3, Yanfly.MsgMacro[i].length - 1));
          if (entity)
            Yanfly.MsgMacro[i] = '\x1bn<' + entity.TRANSLATION + ">";
        }

        const good_letters = [1, 2, 3, 5, 10, 11, 12, 13, 15, 16, 17, 19, 20, 23];
        let tmp = 0;
        for (const gl of good_letters)
          if ($gameSwitches.value(1100 + gl))
            tmp += 1;

        $gameVariables.setValue(1761, tmp);
        if ($gameSwitches.value(1112))
          $gameVariables.setValue(1121, tmp - 1);
        else
          $gameVariables.setValue(1121, tmp);
      } else {
        SoundManager.playBuzzer();
        this._promptWindow.close();
        this._promptWindow.deactivate();
        this._canSelect = true;
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Saves]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoriFileInformation.prototype.windowWidth = function() {
    try {
      return Graphics.width - (22 + SAVE_LOAD_WIDTH);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Saves]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoriFileInformation.prototype.refresh = function() {
    try {
      // Clear Contents
      this.contents.clear();
      // Get Color
      var color = 'rgba(255, 255, 255, 1)';
      // Get ID
      var id = this._index + 1;
      var valid = DataManager.isThisGameFile(id);
      var info = DataManager.loadSavefileInfo(id);

      // Draw Lines
      this.contents.fillRect(0, 29, this.contents.width, 3, color);
      for (var i = 0; i < 3; i++) {
        var y = 55 + (i * 25)
        this.contents.fillRect(113, y, this.contents.width - 117, 1, color);
      };


      // Draw File
      this.contents.fontSize = 30;
      const file_text = LanguageManager.languageData().text.System.terms.basic[12];
      const file_width = BEAF_BITMAP.measureTextWidth(file_text);
      this.contents.drawText(file_text + ' ' + id + ':', 10 + 30, -5, 100, this.contents.fontSize);
      // If Valid
      if (valid) {
        this.contents.drawText(CHAPTERS[info.chapter.toUpperCase()], file_width + 75, -5, this.contents.width, this.contents.fontSize);
        this.contents.fontSize = 28;

        let backBitmap = ImageManager.loadSystem('faceset_states');
        let width = backBitmap.width / 4;
        let height = backBitmap.height / 5;
        // this.contents.blt(backBitmap, 0, 0, width, height, 0, 34, width + 10, height);
        this.contents.blt(backBitmap, 0, 0, width, height, 1, 33);
        // Get Actor
        var actor = info.actorData
        // Draw Actor Face
        let bit = ImageManager.loadFace(actor.faceName);
        bit.addLoadListener(() => this.drawFace(actor.faceName, actor.faceIndex, -2, this.contents.height - Window_Base._faceHeight + 7, Window_Base._faceWidth, height - 2));
        // Draw Actor Name
        this.contents.fontSize = 24;
        this.contents.drawText(actor.name, 118, 30, 100, 24);
        // Draw Level
        const level_text = LanguageManager.languageData().text.System.terms.basic[0] + " :";
        const level_width = BEAF_BITMAP.measureTextWidth(level_text);

        this.contents.drawText(level_text, this.windowWidth() - level_width - 30, 30, 100, 24);
        this.contents.drawText(actor.level, this.windowWidth() - 87, 30, 70, 24, 'right');
        // Draw Total PlayTime
        this.contents.drawText(LanguageManager.languageData().text.System.terms.basic[10] + " :", 118, 55, 200, 24);
        this.contents.drawText(info.playtime, this.windowWidth() - 80, 55, 100, 24);
        // Draw Location
        this.contents.drawText(LanguageManager.languageData().text.System.terms.basic[11] + " :", 118, 80, 200, 24);
        if (PRELOADED_LOCATIONS[info.location])
          this.contents.drawText(PRELOADED_LOCATIONS[info.location].TRANSLATION, this.windowWidth() - 166, 80, 150, 24, 'right');
        else
          this.contents.drawText(info.location, this.windowWidth() - 166, 80, 150, 24, 'right');
      };

      // Draw Border
      this.contents.fillRect(102, 32, 3, 102, 'rgba(255, 255, 255, 1)')
      this.contents.fillRect(0, 29, 108, 3, 'rgba(255, 255, 255, 1)')
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Saves]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoriFileCommand.prototype.initialize = function() {
    try {
      // Super Call
      Window_Command.prototype.initialize.call(this, 10, 28);
      // Setup File
      this.setupFile(true, true);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Saves]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoriFileCommand.prototype.windowWidth = function() {
    return SAVE_LOAD_WIDTH;
  };

  Window_OmoriFileCommand.prototype.makeCommandList = function() {
    try {
      const save_text = LanguageManager.languageData().text.System.terms.command[9];
      const load_text = LanguageManager.languageData().text.System.terms.command[20];

      const save_width = BEAF_BITMAP.measureTextWidth(save_text);
      const load_width = BEAF_BITMAP.measureTextWidth(load_text);

      const max_width = save_width > load_width ? save_width : load_width;

      this.total_width = max_width;
      if (!SAVE_LOAD_WIDTH)
        SAVE_LOAD_WIDTH = this.total_width + 60;

      this.addCommand(save_text, 'save', this._canSave);
      this.addCommand(load_text, 'load', this._canLoad);

      this.cursor_x = [10, 10]
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Saves]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoriFilePrompt.prototype.initialize = function() {
    try {
      // Super Call
      Window_Command.prototype.initialize.call(this, 0, 0);
      this.width = LOAD_WIDTH;

      // Center Window
      const middle_x = (Graphics.width - this.width) / 2;

      this.x = middle_x;
      this.y = (Graphics.height - this.height) / 2;

      const x = this.width / 2 - 50;
      this.cursor_x = [x, x];
      // Create Cover Sprite
      this.createCoverSprite();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Saves]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoriFilePrompt.prototype.customCursorRectTextXOffset = function() {
    try {
      return this.width / 2 - 20;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Saves]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_OmoriFilePrompt.prototype.makeCommandList = function() {
    try {
      const commands = LanguageManager.languageData().text.System.plugins.optionsMenu.system.load.commands;
      this.addCommand(commands[0], 'ok');
      this.addCommand(commands[1], 'cancel');
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Saves]: ${e.message}\n${e.stack}\n\n`);
    }
  };
}}
return { name: "Text Processor", priority: 2, patch() {
  const _showLanguageMessage = Game_Message.prototype.showLanguageMessage;
  Game_Message.prototype.showLanguageMessage = function(code) {
    try {
      var data = LanguageManager.getMessageData(code);

      const originalText = data.text;

      if (code === "gacha_minigame.message_2") {
        const it = BEAF.ARMORS[$gameVariables.value(829)];
        data.text = data.text.replace("{determiner}", BEAF.get_determiner("AI", it))
                             .replace("\\v[829]", it.TRANSLATION);
      } else if (code === "sidequest_farawaytown_ginojukebox.message_2") {
        const it = BEAF.ITEMS[$gameVariables.value(829)];
        data.text = data.text.replace("{determiner}", BEAF.get_determiner("DPY", it))
                             .replace("\\v[829]", it.TRANSLATION);
      } else if (code === "sidequest_farawaytown_ginojukebox.message_3") {
        const it = BEAF.ITEMS[$gameVariables.value(829)];
        data.text = data.text.replace("{determiner}", BEAF.get_determiner("AD", it))
                             .replace("\\v[829]", it.TRANSLATION);
      } else if (code === "XX_MELON.message_298" ||
                 code === "XX_MELON.message_299" ||
                 code === "XX_MELON.message_77"  ||
                 code === "XX_MELON.message_88"  ||
                 code === "XX_MELON.message_75"  ||
                 code === "XX_MELON.message_74"    ) {
        const it = BEAF.ITEMS[$gameVariables.value(102)];
        data.text = data.text.replace("{determiner}", BEAF.get_determiner("AD", it))
                             .replace("\\v[102]", it.TRANSLATION);
      } else if (code === "farawaytown_extras_misc.message_60" ||
                 code === "farawaytown_extras_misc.message_101"||
                 code === "farawaytown_extras_misc.message_80"   ) {
        const it = BEAF.ITEMS[$gameVariables.value(806)];
        data.text = data.text.replace("{determiner}", BEAF.get_determiner("AD", it))
                             .replace("\\v[806]", it.TRANSLATION);
      } else if (code === "farawaytown_extras_hardwareminigame.message_9"  ||
                 code === "farawaytown_extras_hardwareminigame.message_12" ||
                 code === "farawaytown_extras_hardwareminigame.message_13" ||
                 code === "farawaytown_extras_hardwareminigame.message_15"   ) {
        const it = BEAF.ITEMS[$gameVariables.value(815)];
        data.text = data.text.replace("{determiner}", BEAF.get_determiner("AD", it))
                             .replace("\\v[815]", it.TRANSLATION);
      } else if (code === "farawaytown_extras_hardwareminigame.message_11") {
        const it1 = BEAF.ITEMS[$gameVariables.value(813)];
        const it2 = BEAF.ITEMS[$gameVariables.value(815)];
        data.text = data.text.replace("{determiner1}", BEAF.get_determiner("AD", it1))
                             .replace("\\v[813]", it1.TRANSLATION)
                             .replace("{determiner2}", BEAF.get_determiner("AD", it2))
                             .replace("\\v[815]", it2.TRANSLATION);
      } else if (code.startsWith("XX_OCEAN")) {
        const it = BEAF.get_data($gameParty.lastGainedItem());
        data.text = data.text.replace("{determiner}", BEAF.get_determiner("AI", it))
                             .replace("\\itemget", it.TRANSLATION);
      }

      _showLanguageMessage.call(this, code);

      data.text = originalText;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Text Processor]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Sprite_MapCharacterTag.prototype.createPartySprites = function() {
    try {
      // Initialize Party Sprites
      this._partySprites = [];
      // Create Party Sprites Container
      this._partySpritesContainer = new Sprite()
      this._partySpritesContainer.opacity = 0;
      this.addChild(this._partySpritesContainer);
      // Iterate

      for (var i = 0; i < 4; i++) {
        var sprite = new Sprite_MapCharacterTagFace();
        sprite.x = this._centerX;
        sprite.y = this._centerY;
        this._partySprites[i] = sprite;
        this._partySpritesContainer.addChild(sprite)
      };
      // Create Leader Sprite
      this._leaderSprite = new Sprite_MapCharacterTagFace();
      this._leaderSprite.x = this._centerX;
      this._leaderSprite.y = this._centerY;
      this._leaderSprite.showText();
      this._leaderSprite.setText('TOUCHER ?')
      this.addChild(this._leaderSprite);
      // Refresh Party Sprites
      this.refreshPartySprites();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Text Processor]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Sprite_MapCharacterTag.prototype.refreshPartySprites = function() {
    try {
      const l = $gameParty.members().length;
      for (var i = 0; i < this._partySprites.length; i++) {
        // Get Sprite
        var sprite = this._partySprites[i];
        if (i >= l || BEAF.CHARACTERS[$gameParty.members()[i]._name].GENDER === "MASCULINE")
          sprite.setText("CHEF");
        else
          sprite.setText("CHEFFE");
        // Get Actor
        var actor = $gameParty.members()[i];
        sprite._faceSprite.actor = actor;
        // Set Visibility
        sprite.visible = actor !== undefined;
      };
      // Set Leader Sprite Face Sprite
      this._leaderSprite._faceSprite.actor = $gameParty.leader();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Text Processor]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Sprite_MapCharacterTagFace.prototype.setText = function(text) {
    try {
      var bitmap = this._textSprite.bitmap;
      bitmap.fontSize = 24;
      bitmap.clear();
      bitmap.drawText(text, 0, 0, bitmap.width, bitmap.height, 'center');
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Text Processor]: ${e.message}\n${e.stack}\n\n`);
    }
  };
}}
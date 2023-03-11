return { name: "Minigames", priority: 2, patch() {
  // Blackjack
  Scene_BlackJack.prototype.setWagerAmount = function(amount) {
    try {
      if (!(this._earnings >= amount)) {
        this._titleWindow.refresh(LanguageManager.getMessageData("blackjack_minigame.message_1").text + " " + amount + " $");
        this._timer = 90;
        this._wagerWindow.activate();
        return;
      }
      this._wagerAmount = amount;
      this._titleWindow.visible = false;
      this._wagerWindow.deactivate();
      this._wagerWindow.visible = false;
      this.updateData();
      this._dataWindow.visible = true;
      this._commandWindow.activate();
      this._commandWindow.visible = true;
      this._commandWindow.select(0);
      this.commandDeal();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Scene_BlackJack.prototype.update = function() {
    try {
      Scene_Base.prototype.update.call(this);
      if (this._exitFade > 0) {
        this._exitFade--;
        this._logo.opacity -= 12;
        if (this._exitFade <= 0) {
          this.removeChild(this._logo);
          this.removeChild(this.mainImage);
          this.removeChild(this._titleCommands);
          this.popScene();
          $gameSystem.replayBgm();
        }
        return;
      }

      if (this._resultsDelay > 0) {
        this._commandWindow.deactivate();
        this._resultsDelay--;
        if (this._resultsDelay <= 0) {
          this.showResultImage(this._matchOutcome);
          this.endGame(this._winner);
          this._winner = null;
          this._matchOutcome = null;
        }
      }
      if (this._musicDelay > 0) {
        this._musicDelay -= 1;
        if (this._musicDelay <= 0) {
          var bgm = {
            name: "minigame_blackjack",
            volume: 100,
            pitch: 100,
            pan: 0
          };
          AudioManager.playBgm(bgm);
          this.mainImage.bitmap = ImageManager.loadPicture("blackjack_layout");
          this._titleCommands.deactivate();
          this._titleCommands.visible = false;
          this._wagerWindow.activate();
          this._wagerWindow.visible = true;
          this._wagerWindow.select(0);
          this._titleWindow.visible = true;
          this._titleWindow.refresh(LanguageManager.getMessageData("blackjack_minigame.message_2").text + " " + this._earnings + " $" + LanguageManager.getMessageData("blackjack_minigame.message_3").text);
          this.startFadeIn(100);
        }
      }
      if (this._gameResults) {
        if (Input.isTriggered('ok')) {
          this.toTitle();
          this._gameResults = false;
        }
      }
      if (this._titleScreenActive) {
        if (!this._logo) {
          this._logo = new Sprite();
          this._logo.bitmap = ImageManager.loadPicture("blackjack_logo");
          this._logo.x = (Graphics.boxWidth - 418) / 2;
          this._logo.y = Graphics.boxHeight;
          this.addChild(this._logo);

          this._frame = new Sprite();
          this._frame.bitmap = ImageManager.loadPicture("blackjack_frame");
          this.addChild(this._frame);

        } else if (this._logo && this._logo.y > 128) {
          this._logo.y -= 2;
          if (Input.isTriggered('ok') || Input.isTriggered('cancel')) {
            this._logo.y = 128;
            this._titleCommands.activate();
          }
        } else {
          if (this._titleCommands.visible === false) {
            this.removeChild(this._frame);
            this._frame = null;
            this._titleCommands.refresh();
            this._titleCommands.visible = true;
            this._titleCommands.activate();
          }
        }
      }
      if (this._timer > 0 && this._wagerWindow.visible) {
        this._timer--;
        if (this._timer <= 0) {
          this._titleWindow.refresh(LanguageManager.getMessageData("blackjack_minigame.message_2").text + " " + this._earnings + " $" + LanguageManager.getMessageData("blackjack_minigame.message_3").text);
        }
      }
      if (this._showingOpponentAction) {
        if (this._commandWindow.active) this._commandWindow.deactivate();
        if (this._timer > 0) {
          this._timer--;
        }
        if (this._action) {
          if (Input.isTriggered('ok') || this._timer < 1) {
            if (this._action) this.removeChild(this._action);
            this._commandWindow.refresh();
            this._commandWindow.activate();
            this._commandWindow.visible = true;

            this.updateData();
            this._showingOpponentAction = false;
          }
        }
      }
      if (this._resultsOpen) {
        if (this._commandWindow.active) {
          this._commandWindow.deactivate();
        }

        if (this._timer > 0) {
          this._timer--;
        } else {
          if (Input.isTriggered('ok')) {
            this.removeChild(this._result);
            this._commandWindow.refresh();
            this._commandWindow.deactivate();
            this._commandWindow.select(2);
            this._commandWindow.visible = false;
            this._dataWindow._showOpponentHand = false;
            if (this._earnings <= 0) {
              this.gameOver();
            } else {
              this._titleWindow.refresh(LanguageManager.getMessageData("blackjack_minigame.message_2").text + " " + this._earnings + " $" + LanguageManager.getMessageData("blackjack_minigame.message_3").text);
              this._titleWindow.visible = true;
              this._dataWindow.visible = false;
              this.softReset();
              this._wagerWindow.activate();
              this._wagerWindow.visible = true;
            }
            this.updateData();
            this._resultsOpen = false;
          }
        }
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Scene_BlackJack.prototype.payOut = function() {
    try {
      this._titleWindow.visible = true;
      if (this._atLeastOneGameStarted) this._titleWindow.refresh(LanguageManager.getMessageData("blackjack_minigame.message_2").text + " " + this._earnings + " $ !");
      else this._titleWindow.refresh(LanguageManager.getMessageData("blackjack_minigame.message_8").text + " " + this._earnings + " $ !");
      $gameVariables.setValue(827, this._earnings);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_Wager.prototype.makeCommandList = function() {
    try {
      this.addCommand("5 $", '5')
      this.addCommand("25 $", '25');
      this.addCommand("100 $", '100');
      this.addCommand(LanguageManager.languageData().text.System.plugins.minigames.quit, 'quit');
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BlackJackCommands.prototype.makeCommandList = function() {
    try {
      this.addCommand("Rester".toUpperCase(), 'stand');
      this.addCommand("Piocher".toUpperCase(), 'hit');
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BlackJackData.prototype.refresh = function() {
    try {
      this.contents.clear();
      this.contents.fontBold = false;
      this.contents.fontItalic = false;
      this.contents.fontSize = 20;
      this.contents.outlineColor = 'rgba(0, 0, 0, 0.5)';
      this.contents.outlineWidth = 0;
      this.changeTextColor(this.textColor(6));
      this.contents.fontFace = 'Times New Roman';
      var dealerStreak = SceneManager._scene._opponentStreak > 0 ? " - Winning Streak - " + SceneManager._scene._opponentStreak : "";
      var playerStreak = SceneManager._scene._playerStreak > 0 ? " - Winning Streak - " + SceneManager._scene._playerStreak : "";
      this.drawText("Croupier" + dealerStreak, 48, 32, this.windowWidth());
      this.drawText("Joueur" + playerStreak, 48, 196, this.windowWidth());

      this.drawText('Score : Croupier - ' + this._opponentScore + '   Toi - ' + this._playerScore, 0, 22, this.windowWidth() - 76, 'right');
      this.drawText('Mise : ' + SceneManager._scene._wagerAmount + ' $ x' + this._currentPlayerBonus + ' Argent total - ' + this._currentEarnings + ' $', 0, 40, this.windowWidth() - 76, 'right');

      var spacing = 96;
      if (this._playerHand != null) {
        for (var i = 0; i < this._playerHand.length; i++) {
          if (this._playerHand.length > 5) var spacing = 96 - ((this._playerHand.length - 5) * 14);
          this.getCardImage(this._playerHand[i].index, 64 + (spacing * i), 232);
        }
      }

      if (this._opponentHand != null) {
        if (this._opponentHand.length > 5) var spacing = 96 - ((this._opponentHand.length - 5) * 14);
        for (var i = 0; i < this._opponentHand.length; i++) {
          if (i === 0 && !this._showOpponentHand) {
            var bitmap = ImageManager.loadPicture('CardBack');
            this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, 64 + (spacing * i), 68);
          } else {
            this.getCardImage(this._opponentHand[i].index, 64 + (spacing * i), 68);
          }
        }
      }
      this.resetTextColor();
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BJTitleCommands.prototype.makeCommandList = function() {
    try {
      this.addCommand("Nouvelle Partie".toUpperCase(), 'new');
      this.addCommand("Continuer".toUpperCase(), 'continue', $gameVariables.value(827) >= 5);
      this.addCommand("Quitter".toUpperCase(), 'quit');
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  // Jukebox

  const _yin_WindowChoiceList_callOkHandlerJukebox = yin_WindowChoiceList_callOkHandlerJukebox;
  yin_WindowChoiceList_callOkHandlerJukebox = function() {
    try {
      if ($gameSystem._jukeboxOn) {
        if (this._list[this.index()].name == "OUBLIE ÇA") {
          $gameMap._interpreter.command115();
        } else {
          if (LanguageManager.getMessageData($gameSystem._jukeboxList[this.index()][0]).text == "jb_omniboi") { // CHILL CD volume
            var bgm = {
              name: LanguageManager.getMessageData($gameSystem._jukeboxList[this.index()][0]).text,
              volume: 90,
              pitch: 100,
              pan: 0
            };
          } else {
            var bgm = {
              name: LanguageManager.getMessageData($gameSystem._jukeboxList[this.index()][0]).text,
              volume: 100,
              pitch: 100,
              pan: 0
            };
          }
          AudioManager.playBgm(bgm);
        }
        $gameSystem._jukeboxOn = false;
      }
      _yin_WindowChoiceList_callOkHandlerJukebox.call(this);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  // Hardware Shop

  const _yin_WindowChoiceList_callOkHandlerShop = yin_WindowChoiceList_callOkHandlerShop;
  yin_WindowChoiceList_callOkHandlerShop = function() {
    try {
      if ($gameSwitches.value(804) && this._list[this.index()].name !== "OUI" && this._list[this.index()].name !== "NON") {
        if (this._list[this.index()].name == "OUBLIE ÇA") {
          $gameMap._interpreter.command115();
        } else {
          $gameVariables.setValue(814, this.index());
          $gameVariables.setValue(815, this._list[this.index()].name);
        }
      }
      _yin_WindowChoiceList_callOkHandlerShop.call(this);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  // Slot machine

  Window_SlotMachine.prototype.drawCoinText = function(text, x, y, maxWidth, align) {
    try {
      this.coinContents.drawText(text, x + 40, y, maxWidth, this.lineHeight(), align);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_SlotCommand.prototype.makeCommandList = function() {
    try {
      const quit_text = LanguageManager.getMessageData("slot_machine_minigame.message_7").text;
      this.max_width = BEAF_BITMAP.measureTextWidth(LanguageManager.getMessageData("slot_machine_minigame.message_5").text);
      let tmp = BEAF_BITMAP.measureTextWidth(LanguageManager.getMessageData("slot_machine_minigame.message_6").text);
      if (tmp > this.max_width)
        this.max_width = tmp;
      tmp = BEAF_BITMAP.measureTextWidth(quit_text);
      if (tmp > this.max_width)
        this.max_width = tmp;

      this._margin = 15;
      this.max_width += 60;
      this.initialized = false;
      this.addCommand(LanguageManager.getMessageData("slot_machine_minigame.message_5").text, 'bet', this._betAllow);
      this.addCommand(LanguageManager.getMessageData("slot_machine_minigame.message_6").text, 'spin', this._spinAllow);
      this.addCommand(quit_text, 'cancel');
      const total_width = this.max_width * 3 + 2 * this._margin;
      this._origin_x = -(this.windowWidth() - total_width) / 2;

      this.cursor_x = [this._margin - this._origin_x, this._margin - this._origin_x + this.itemWidth() + this._margin, this._margin - this._origin_x + (this.itemWidth() + this._margin) * 2];
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_SlotCommand.prototype.windowWidth = function() {
    try {
      return Graphics.width;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_SlotCommand.prototype.itemWidth = function() {
    try {
      return this.max_width;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_SlotCommand.prototype.itemRectForText = function(index) {
    try {
      let r = new Rectangle();
      r.width = this.itemWidth();
      r.height = this.itemHeight();
      r.x = (this.itemWidth() + this._margin) * index;
      r.y = 0;
      return r;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_SlotCommand.prototype.drawItem = function(index) {
    try {
      if (!this.initialized) {
        this.origin.x = this._origin_x;
        this.initialized = true;
      }
      let rect = this.itemRectForText(index);
      this.drawOptionBack(index, 0)
      this.resetTextColor();
      this.changePaintOpacity(this.isCommandEnabled(index));
      this.drawText(this.commandName(index), rect.x + 50, rect.y + 2, rect.width, 'left');
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_SlotCommand.prototype.drawOptionBack = function(index, _) {
    try {
      const rect = this.itemRectForText(index);
      this.changePaintOpacity(true);
      let m = 4;
      let x = rect.x;
      let y = rect.y;
      let w = rect.width + 6;
      let h = rect.height;
      const p = 96;
      const q = 96;

      if (w > 0 && h > 0 && this._windowskin) {
        this.contents.blt(this._windowskin, 0, 0, p, p, x, 0, w, h);
        for (y = 0; y < h; y += p) {
          for (x = 0; x < w; x += p) {
            this.contents.blt(this._windowskin, 0, p, p, p, x, y, p, p);
          }
        }
        this.contents.adjustTone(this._colorTone[0], this._colorTone[1], this._colorTone[2]);
      }

      x = rect.x;
      y = rect.y;
      w = rect.width + 6;
      h = rect.height;
      if (w > 0 && h > 0 && this._windowskin) {
        this.contents.blt(this._windowskin, p + m, 0 + 0, p - m * 2, m, m + x, 0, w - m * 2, m); // Upper center
        this.contents.blt(this._windowskin, p + m, 0 + q - m, p - m * 2, m, m + x, h - m, w - m * 2, m); // lower center
        this.contents.blt(this._windowskin, p + 0, 0 + m, m, p - m * 2, x, m, m, h - m * 2); // left center
        this.contents.blt(this._windowskin, p + q - m, 0 + m, m, p - m * 2, x + (w - m), m, m, h - m * 2); // right center
        this.contents.blt(this._windowskin, p + 0, 0 + 0, m, m, x, 0, m, m); // top left corner
        this.contents.blt(this._windowskin, p + q - m, 0 + 0, m, m, x + (w - m), 0, m, m); // top right corner
        this.contents.blt(this._windowskin, p + 0, 0 + q - m, m, m, x, h - m, m, m); // bottom left corner
        this.contents.blt(this._windowskin, p + q - m, 0 + q - m, m, m, x + (w - m), h - m, m, m); // bottom right corner
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_ReplayCommand.prototype.makeCommandList = function() {
    try {
      this.addCommand(LanguageManager.getMessageData("XX_GENERAL.message_4").text, 'yes');
      this.addCommand(LanguageManager.getMessageData("XX_GENERAL.message_5").text, 'no');
      this.cursor_x = [10, 10];
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Minigames]: ${e.message}\n${e.stack}\n\n`);
    }
  };
}}
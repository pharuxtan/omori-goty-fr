return { name: "Black Letters", priority: 2, patch() {
  // DataManager

  DataManager.hangmanWord = function() {
    return "BWEMQEMTE KAMS LESPACE MOWJ";
  };

  DataManager.blackLetterCollectionState = function(word = this.hangmanWord()) {
    try {
      var items = this.getBlackletterItems();
      var letters = [...new Set(word.replace(/\s/g, '').split(''))].map(function(l) {
        return l.toUpperCase();
      });
      var rightCount = 0,
        wrongCount = 0;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if ($gameParty.hasItem(item)) {
          var blackletter = item.meta.Blackletter.trim().toUpperCase();
          if (letters.contains(blackletter)) {
            rightCount++;
          } else {
            wrongCount++;
          };
        };
      };
      if (wrongCount >= 12) {
        return 1;
      };
      if (rightCount >= letters.length) {
        return 0;
      };
      return 2;
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Black Letters]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Black Letter Map

  Sprite_OmoBlackLetterMap.prototype.createOverlaySprites = function() {
    try {
      // Create Overlay Bitmap
      var bitmap = new Bitmap(Graphics.width, Graphics.height);
      // Get Background Bitmap
      var bgBitmap = ImageManager.loadAtlas('blackLetter_map_atlas');
      var bgBitmap50 = ImageManager.loadAtlas('blackLetter_map_50_atlas');
      // Get Map Data
      bgBitmap.addLoadListener(() => {
        bgBitmap50.addLoadListener(() => {
          var mapData = [{
              name: BEAF.LOCATIONS['PYREFLY FOREST'].TRANSLATION,
              namePos: new Point(80, 195),
              rect: new Rectangle(0, 0, 193, 139),
              pos: new Point(111, 103),
              blackSwitchId: 23,
              nameSwitchId: 30,
              blackSwitch50Id: 900
            },
            // {name: 'Forgotten Pier',   namePos: new Point(200, 27), rect: new Rectangle(194, 0, 155, 120), pos: new Point(225, 52),  blackSwitchId: 21, nameSwitchId: 29 },
            {
              name: BEAF.LOCATIONS['PINWHEEL FOREST'].TRANSLATION,
              namePos: new Point(440, 240),
              rect: new Rectangle(350, 0, 99, 107),
              pos: new Point(471, 128),
              blackSwitchId: 24,
              nameSwitchId: 31,
              blackSwitch50Id: 901
            },
            {
              name: BEAF.LOCATIONS['SPROUT MOLE TOWN'].TRANSLATION,
              namePos: new Point(25, 340),
              rect: new Rectangle(450, 0, 94, 80),
              pos: new Point(54, 267),
              blackSwitchId: 25,
              nameSwitchId: 32,
              blackSwitch50Id: 902
            },
            {
              name: BEAF.LOCATIONS['VAST FOREST'].TRANSLATION,
              namePos: new Point(250, 300),
              rect: new Rectangle(0, 124, 640, 201),
              pos: new Point(-2, 143),
              blackSwitchId: 26,
              nameSwitchId: 33,
              blackSwitch50Id: 903
            },
            {
              name: BEAF.LOCATIONS['DEEP WELL'].TRANSLATION,
              namePos: new Point(450, 355),
              rect: new Rectangle(0, 326, 418, 113),
              pos: new Point(119, 366),
              blackSwitchId: 27,
              nameSwitchId: 34,
              blackSwitch50Id: 904
            },
            {
              name: BEAF.LOCATIONS['ORANGE OASIS'].TRANSLATION,
              namePos: new Point(20, 55),
              rect: new Rectangle(545, 0, 122, 102),
              pos: new Point(31, 85),
              blackSwitchId: 28,
              nameSwitchId: 35,
              blackSwitch50Id: 905
            },
            {
              name: BEAF.LOCATIONS['OTHERWORLD'].TRANSLATION,
              namePos: new Point(450, 75),
              rect: new Rectangle(419, 326, 140, 209),
              pos: new Point(390, 21),
              blackSwitchId: 29,
              nameSwitchId: 36,
              blackSwitch50Id: 906
            },
          ]
          // Initialize Name Windows Array
          this._nameWindows = [];
          // Create Container for Name Windows
          this._nameWindowsContainer = new Sprite();
          // Go Through Map Data
          for (var i = 0; i < mapData.length; i++) {
            // Get Data
            var data = mapData[i];
            // Get Rect & Position
            var rect = data.rect,
              pos = data.pos;
            var test = Math.randomInt(100) > 50;
            // If Black switch ID is not on
            /*if (!$gameSwitches.value(data.blackSwitchId)) {
              if (!$gameSwitches.value(data.blackSwitch50Id)) {
              // Draw Black onto Bitmap
              bitmap.blt(bgBitmap50, rect.x, rect.y, rect.width, rect.height, pos.x, pos.y);
             } else {
              
             }
            };*/
            //if(!!$gameSwitches.value(data.blackSwitchId)) {bitmap.blt(bgBitmap, rect.x, rect.y, rect.width, rect.height, pos.x, pos.y);}
            //else if(!!$gameSwitches.value(data.blackSwitch50Id)) {bitmap.blt(bgBitmap50, rect.x, rect.y, rect.width, rect.height, pos.x, pos.y);}
            if (!!$gameSwitches.value(data.blackSwitch50Id)) {
              bitmap.blt(bgBitmap, rect.x, rect.y, rect.width, rect.height, pos.x, pos.y);
            } else {
              if (!$gameSwitches.value(data.blackSwitchId)) {
                bitmap.blt(bgBitmap50, rect.x, rect.y, rect.width, rect.height, pos.x, pos.y);
              }
            }
            // Get Name Position
            var namePos = data.namePos;
            var name = $gameSwitches.value(data.nameSwitchId) ? data.name : "???"
            // Create Window
            var win = new Window_OmoBlackLetterMapName(name);
            // Set Window Position
            win.x = namePos.x;
            win.y = namePos.y;
            this._nameWindows.push(win);
            this._nameWindowsContainer.addChild(win);
          };
          // Create Black Overlay Sprite
          this._blackOverlay = new Sprite(bitmap);
          this.addChild(this._blackOverlay)

          // Add Name Window container as a child
          this.addChild(this._nameWindowsContainer);
          this.createTextCounterSprite();
        })
      });
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Black Letters]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Black Letter Menu

  Scene_OmoBlackLetterMenu.prototype.createHangmanHeaderWindow = function() {
    try {
      // Create Hangman Header Window
      this._hangmanHeaderwindow = new Window_Base(0, 0, 0, 0);
      this._hangmanHeaderwindow.standardPadding = function() {
        return 4;
      };
      this._hangmanHeaderwindow.initialize(0, 0, 386, 45)
      this._hangmanHeaderwindow.fontSize = 38;
      // this._hangmanHeaderwindow.drawText('HANGMAN', 5, -7, 200, 40);

      this._hangmanHeaderwindow.drawBlackLetterText('PEMKT', 5, 2, 26);
      this._windowContainer.addChild(this._hangmanHeaderwindow);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Black Letters]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Scene_OmoBlackLetterMenu.prototype.createHangmanHeaderHelpWindow = function() {
    try {
      // Get Header Window
      var header = this._hangmanHeaderwindow;
      // Create Hangman Header Window
      this._hangmanHeaderHelpwindow = new Window_Base(0, 0, 0, 0);
      this._hangmanHeaderHelpwindow.standardPadding = function() {
        return 4;
      };
      this._hangmanHeaderHelpwindow.initialize(0, header.height, header.width, 60)
      this._hangmanHeaderHelpwindow.contents.fontSize = 22;
      this._hangmanHeaderHelpwindow.drawText('Récupère les TOUCHES pour remplir les trous.', 5, -7, 400, 40);
      this._hangmanHeaderHelpwindow.drawText('Les touches incorrectes seront mises à droite.', 5, 15, 400, 40);
      this._windowContainer.addChild(this._hangmanHeaderHelpwindow);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Black Letters]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  const _Window_OmoBlackLetterList_selectLetter = Window_OmoBlackLetterList.prototype.selectLetter;
  Window_OmoBlackLetterList.prototype.selectLetter = function(letter) {
    try {
      _Window_OmoBlackLetterList_selectLetter.call(this, letter);
      this.select(0);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Black Letters]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_OmoBlackLetterList.prototype.makeCommandList = function() {
    try {
      // Get Blackletter Items
      var items = DataManager.getBlackletterItems();

      let el = items[3];
      items[3] = items[10];
      items[10] = el;

      el = items[8];
      items[8] = items[22];
      items[22] = el;

      el = items[12];
      items[12] = items[13];
      items[13] = el;

      el = items[19];
      items[19] = items[20];
      items[20] = el;

      el = items[17];
      items[17] = items[9];
      items[9] = el;

      el = items[21];
      items[21] = items[16];
      items[16] = el;
      // Go through Items
      let l;
      for (var i = 0; i < items.length; i++) {
        // Get Item
        l = String.fromCharCode(65 + i);
        var item = items[i];
        // Get Data
        var data = {
          letter: item.meta.Blackletter.trim(),
          clue: BEAF.BLACKLETTERS[l],
          itemId: item.id
        };
        // Add Command
        this.addCommand(item.name, 'ok', true, data)
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Black Letters]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoBlackLetterWord.prototype.createLetterSprites = function() {
    try {
      // Get Split Word
      var word = this._hangmanWord.split('');
      // Get bitmap
      var bitmap = ImageManager.loadSystem('Blackletters_menu');
      // Create Low Bitmap
      var lowBitmap = new Bitmap(32, 32);
      lowBitmap.fillRect(1, 30, 27, 2, 'rgba(255, 255, 255, 1)');
      // Initialize Blackletters Array
      var blackletters = [];
      // Get Blackletter Items
      var items = DataManager.getBlackletterItems();

      // Go through Items
      for (var i = 0; i < items.length; i++) {
        // Get Item
        var item = items[i];
        // If Party has item
        if ($gameParty.hasItem(item)) {
          // Add Blackletter to Blackletters array
          blackletters.push(item.meta.Blackletter.trim());
        };
      };

      // Initialize Letter Sprites
      this._letterSprites = [];
      // Set Starting X
      var sx = 20;
      // Go Through Word


      for (var i = 0; i < word.length; i++) {
        // Get Letter
        var letter = word[i].toUpperCase();
        // If Letter is not space
        if (letter !== " ") {
          // Create Sprite
          var sprite = new Sprite_OmoBlackletter(blackletters.contains(letter) ? letter : "");
          sprite.setTransform(0, 0, 0.87, 1);
          sprite.x = sx;
          sprite.y = 34;
          // If Forced and Letter matches the last letter
          if (this._forced && letter === this._lastLetter) {
            sprite.opacity = 0;
            this._introPhase = 0;
          };
          // Add Letter Sprite to Array
          this._letterSprites.push(sprite)
          // Add Child
          this.addChild(sprite);
          sx += 24;
        } else {
          sx += 16;
        };
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Black Letters]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoHangmanBody.prototype.createLetterSprites = function() {
    try {
      // Get Split Word
      var word = this._hangmanWord.split('');
      // Get Blackletters
      var blackLetters = $gameParty._blackLetters.map(function(id) {
        return $dataItems[id].meta.Blackletter.trim().toUpperCase();
      });
      // Initialize Letter Sprites
      this._letterSprites = [];
      // Return if inert
      if (this._inert) {
        return;
      }
      // Get index
      var index = 0;
      // Go Through Word
      const letters_order = {
        'A': 0,
        'B': 1,
        'C': 2,
        'D': 10,
        'E': 4,
        'F': 5,
        'G': 6,
        'H': 7,
        'I': 22,
        'J': 17,
        'K': 3,
        'L': 11,
        'M': 13,
        'N': 12,
        'O': 14,
        'P': 15,
        'Q': 21,
        'R': 9,
        'S': 18,
        'T': 20,
        'U': 19,
        'V': 16,
        'W': 8,
        'X': 23,
        'Y': 24,
        'Z': 25
      };
      let sorted_blackletters = blackLetters;
      sorted_blackletters.sort((letter_1, letter_2) => {
        if (letters_order[letter_1] < letters_order[letter_2])
          return -1;
        else if (letters_order[letter_1] > letters_order[letter_2])
          return 1;
        else
          return 0;
      });

      for (var i = 0; i < sorted_blackletters.length; i++) {
        // Get Letter
        var letter = sorted_blackletters[i];
        // If Letter is not space
        if (letter !== " " && !word.contains(letter)) {
          // Create Sprite
          var sprite = new Sprite_OmoBlackletter(letter);
          sprite.x = 24 + ((index % 7) * 34);
          sprite.y = 24 + (Math.floor(index / 7) * 34);
          sprite.opacity = index < $gameParty._blackLetterIndex ? 255 : 0;
          // Add Letter Sprite to Array
          this._letterSprites.push(sprite)
          // Add Child
          this.addChild(sprite);
          // Increase index
          index++
        };
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Black Letters]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoHangmanBody.prototype.createBodySprites = function() {
    try {
      // Create Body Sprite Container
      this._bodySpriteContainer = new Sprite();
      this._bodySpriteContainer.y = 25
      this.addChild(this._bodySpriteContainer);

      // Return if inert
      if (this._inert) {
        this._smudgeSprite = new Sprite(this.sheetBitmap())

        this._backgroundSprite.setFrame(253, 4, 247, 403);
        this._bodySpriteContainer.addChild(this._backgroundSprite)
        return;
      }

      var source = [{
          name: "rope",
          x: 71,
          y: 76,
          rect: new Rectangle(253, 447, 21, 63)
        },
        {
          name: "base1",
          x: 84,
          y: 75,
          rect: new Rectangle(277, 447, 82, 21)
        },
        {
          name: "base2",
          x: 158,
          y: 88,
          rect: new Rectangle(253, 513, 21, 246)
        },
        {
          name: "base3",
          x: 88,
          y: 324,
          rect: new Rectangle(277, 471, 126, 15)
        },

        {
          name: "head",
          x: 46,
          y: 131,
          rect: new Rectangle(277, 489, 64, 63)
        },
        {
          name: "body",
          x: 68,
          y: 180,
          rect: new Rectangle(344, 489, 38, 52)
        },

        {
          name: "arms",
          x: 77,
          y: 192,
          rect: new Rectangle(385, 489, 17, 32)
        },

        {
          name: "legs",
          x: 75,
          y: 228,
          rect: new Rectangle(344, 544, 28, 35)
        },

        {
          name: "rightEye",
          x: 62,
          y: 165,
          rect: new Rectangle(277, 555, 12, 7)
        },
        {
          name: "leftEye",
          x: 81,
          y: 161,
          rect: new Rectangle(292, 555, 16, 7)
        },

        {
          name: "mouth",
          x: 74,
          y: 172,
          rect: new Rectangle(277, 565, 11, 7)
        },
        {
          name: "hair",
          x: 47,
          y: 134,
          rect: new Rectangle(277, 582, 65, 104)
        },
      ];

      // Body Sprites Object
      this._bodySprites = {};
      // Get Sheet Bitmap
      var bitmap = this.sheetBitmap();
      // Go Through Sources
      for (var i = 0; i < source.length; i++) {
        // Get Data From Source
        var data = source[i];
        // Create Sprite
        var sprite = new Sprite(bitmap);
        // If Index is less than blackletter index
        if (i < $gameParty._blackLetterIndex) {
          // Set Sprite Frame
          sprite.setFrame(data.rect.x, data.rect.y, data.rect.width, data.rect.height);
        } else {
          // Set Sprite Frame
          sprite.setFrame(data.rect.x, data.rect.y, 0, 0);
        };
        // Set Sprite Position
        sprite.y = data.y;
        sprite.x = data.x;
        // Set Source Rect
        sprite._srcRect = data.rect;
        // Set Index
        sprite._letterIndex = i;
        // Set Data
        this._bodySprites[data.name] = sprite;
        // Add Sprite to Body Sprite container
        this._bodySpriteContainer.addChild(sprite);
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Black Letters]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoHangmanBody.prototype.updateBodyAnimations = function() {
    try {
      // Get Animation
      var anim = this._anim;
      // If Animation Part Exists
      if (anim.part) {
        // Get Sprite
        var sprite = this._bodySprites[anim.part];
        // Get Letter Sprite
        var letterSprite = this._letterSprites[sprite._letterIndex];
        // Get Duration
        var d = anim.duration;
        // Animation Part switch case
        switch (anim.part) {
          case 'rope':
          case 'base2':
          case 'arms':
          case 'legs':
          case 'head':
          case 'body':
          case 'hair':
            sprite.height = (sprite.height * (d - 1) + sprite._srcRect.height) / d;
            sprite.width = sprite._srcRect.width;
            break;
          case 'base1':
          case 'base3':
          case 'rightEye':
          case 'leftEye':
          case 'mouth':
            sprite.height = sprite._srcRect.height;
            sprite.width = (sprite.width * (d - 1) + sprite._srcRect.width) / d;
            break;
        };
        // If letter sprite exists
        if (letterSprite) {
          // Set Letter Sprite Opacity
          letterSprite.opacity = (letterSprite.opacity * (d - 1) + 255) / d;
        };
        if (anim.duration >= 20) {
          AudioManager.playSe({
            name: "SE_chalk",
            volume: 60,
            pitch: Math.randomInt(80) + 70,
            pan: 30
          })
        }
        // Decrease Duration
        anim.duration--;
        // Set Animation part to null if finished
        if (anim.duration <= 0) {
          anim.part = null;
          anim.duration = 1;
        };
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Black Letters]: ${e.message}\n${e.stack}\n\n`);
    }
  };
}}
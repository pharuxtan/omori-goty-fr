return { name: "Battles", priority: 2, patch() {
  const regex_auto_state = /{entity:([^}]*)}/g;
  const regex_verb = /{(user|target):([^}]*)}/g;
  const FEMALE_STATE_LIST_OFFSET = 13;
  const SKILLS_EXCEPTIONS = {
    // ATTACK
    15: "_1",
    883: "_2",

    // HACK AWAY
    28: "_1",
    1152: "_2",

    // FINAL STRIKE
    37: "_1",
    1156: "_2",

    // RUN AROUND
    229: "_1",
    465: "_2",
    569: "_3",

    // SCUTTLE
    429: "_1",
    457: "_2",

    // EXPLODE
    447: "_1",
    651: "_2",
    1026: "_3",

    // SPIN
    484: "_1",
    952: "_2",
    963: "_3",

    // DYNAMITE
    607: "_1",
    933: "_2",

    // FLING TRASH
    739: "_1",
    1252: "_2",

    // GATHER TRASH
    740: "_1",
    1253: "_2",

    // ANGRY SONG
    843: "_1",
    864: "_2",

    // BULLET HELL
    845: "_1",
    868: "_2",

    // HIT TWICE
    941: "_1",
    951: "_2",
    962: "_3",

    // ULTIMATE ATTACK
    942: "_1",
    953: "_2",
    965: "_3",

    // DO NOTHING
    1060: "_1",
    1399: "_2"
  };

  // BattleManager

  const _checkBattleEnd = BattleManager.checkBattleEnd;
  BattleManager.checkBattleEnd = function() {
    try {
      if (this._phase && $gameTroop.isAllDead()) {
        // processVictory
        this._logWindow.clear();
        this._victoryPhase = true;
        if (this._windowLayer) this._windowLayer.x = 0;
        $gameParty.removeBattleStates();
        $gameParty.performVictory();
        this.playVictoryMe();
        //this.replayBgmAndBgs();
        this.makeRewards();
        this.displayVictoryMessage();
        this.displayExp();
        this.displayGold();
        // displayDropItems
        var items = this._rewards.items;
        if (items.length > 0) {
          $gameMessage.newPage();
          items.forEach(function(item) {
            let it = BEAF.get_data(item);
            this._logWindow.push('addText', TextManager.obtainItem.format(BEAF.get_determiner("AI", it), it.TRANSLATION));
            this._logWindow.push('wait');
          }, this);
          this._logWindow.push('waitForInput')
        }
        // end
        this.gainRewards();
        this.endBattle(0);
        return true;
      }
      return _checkBattleEnd.call(this);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  BattleManager.gainExp = function() {
    try {
      var exp = this._rewards.exp;
      $gameParty.allMembers().forEach(function(actor) {
        actor.gainExp(exp);
      });
      $gameMessage.clear();

      $gameParty.allMembers().forEach(function(actor) {
        var data = actor._levelUpData;
        if (data) {
          this._logWindow.push('clear');
          this._logWindow.push('playSE', {
            name: "BA_Happy",
            volume: 90,
            pitch: 100,
            pan: 0
          });
          const tactor = BEAF.get_entity(actor._name.toUpperCase());
          this._logWindow.push('addText', TextManager.levelUp.format(actor._name, BEAF.ADJECTIVES["LEVEL"][tactor.GENDER][tactor.NUMBER], TextManager.level, data.level));
          this._logWindow.push('wait');
          this._logWindow.push('waitForInput');
          data.skills.forEach(function(skill) {
            this._logWindow.push('addText', TextManager.obtainSkill.format(BEAF.get_skill(skill).TRANSLATION));
            this._logWindow.push('wait');
          }, this);
          if (data.skills.length > 0) {
            this._logWindow.push('waitForInput')
          };
        };
        delete actor._levelUpData;
      }, this);
      var lastMethod = this._logWindow._methods[this._logWindow._methods.length - 1];
      if (lastMethod && lastMethod.name !== 'waitForInput') {
        this._logWindow.push('waitForInput')
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  BattleManager.processTurn = Yanfly.BEC.BattleManager_processTurn = function() {
    try {
      var subject = this._subject;
      var action = subject.currentAction();
      if (action) {
        action.prepare();
        if (action.isValid()) {
          this.startAction();
        } else {
          //===================================
          // Addon for checking JUICE
          if (DataManager.isSkill(action.item())) {
            if (subject.mp < action.item().mpCost) {
              const entity = BEAF.get_entity(subject.name().toUpperCase());
              const d = {
                "entity": entity.TRANSLATION,
                "entity:have": BEAF.VERBS["HAVE"][entity.NUMBER]
              };

              this._logWindow.push("addText", BEAF.format(BEAF.BATTLE_TEXT["NOT_ENOUGH_JUICE"], d));
              this._logWindow.push("wait");
            }
          }
          //===================================
        }
        subject.removeCurrentAction();
      } else {
        subject.onAllActionsEnd();
        this.refreshStatus();
        this._logWindow.displayAutoAffectedStatus(subject);
        displayCurrentState.call(this._logWindow, subject);
        this._logWindow.displayRegeneration(subject);
        this._subject = this.getNextSubject();
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  const _processActionSequence = BattleManager.processActionSequence;
  BattleManager.processActionSequence = function(actionName, actionArgs) {
    try {
      if (actionName === 'DISPLAY ACTION') {
        const subject = this._subject;
        const item = this._action.item();
        if (item.meta.BattleLogType) {
          return;
        }
        if (Yanfly.Param.BECFullActText) {
          var numMethods = this._logWindow._methods.length;
          if (DataManager.isSkill(item)) {
            let n = item.name;
            if (item.id in SKILLS_EXCEPTIONS)
              n += SKILLS_EXCEPTIONS[item.id];
            let text = "";
            if (item.message1) {
              const entity = BEAF.get_entity(subject.name().toUpperCase());
              if (entity.SHOW_BATTLE_DETERMINER)
                text += BEAF.get_determiner("AD", entity);
              text += entity.TRANSLATION + BEAF.BATTLE_TEXT[n + "_message1"];
            }
            if (item.message2 && BEAF.BATTLE_TEXT[n + "_message2"])
              text += " " + BEAF.BATTLE_TEXT[n + "_message2"];
            if (text) {
              text = text.replace(regex_verb, (_, __, verb) => {
                const e = BEAF.get_entity(subject.name().toUpperCase());
                return BEAF.VERBS[verb.toUpperCase()][e.NUMBER];
              });
              if (BEAF_BITMAP.measureTextWidth(text) > BEAF.BATTLE_MAX_WIDTH) {
                let words = text.split(" ");
                let nb = 10;
                let tmp = words.slice(0, nb).join(" ");

                while (BEAF_BITMAP.measureTextWidth(tmp) > BEAF.BATTLE_MAX_WIDTH) {
                  --nb;
                  tmp = words.slice(0, nb).join(" ");
                }
                check = words.slice(nb);
                if (check.length === 1 && (check[0] === "!" || check[0] === "?"))
                  --nb;
                tmp = words.slice(0, nb).join(" ");
                this._logWindow.push('addText', BEAF.capitalize(tmp));
                this._logWindow.push('addText', words.splice(nb).join(" "));
              } else
                this._logWindow.push('addText', BEAF.capitalize(text));
            }
          } else {
            let t = "";
            const entity = BEAF.get_entity(subject.name().toUpperCase());
            if (entity.SHOW_BATTLE_DETERMINER)
              t += BEAF.get_determiner("AD", entity);

            this._logWindow.push('addText', TextManager.useItem.format(t + entity.TRANSLATION, BEAF.get_data(item).TRANSLATION));
          }
          if (this._logWindow._methods.length === numMethods) {
            this._logWindow.push('wait');
          }
        } else {
          this._logWindow._actionIcon = this._logWindow.displayIcon(item);
          var text = this._logWindow.displayText(item);
          this._logWindow.push('addText', '<SIMPLE>' + text);
          if (item.message2) {
            this._logWindow.push('addText', '<CENTER>' + item.message2.format(text));
          }
        }
        return false;
      }
      return _processActionSequence.call(this, actionName, actionArgs);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  // Window_BattleLog

  Window_BattleLog.prototype.displayCurrentState = displayCurrentState;
  function displayCurrentState(subject) {
    try {
      if (!Yanfly.Param.BECShowStateText) return;
      var stateText = subject.mostImportantStateText();
      if (stateText) {
        this.push('addText', BEAF.get_entity(subject.name().toUpperCase()).TRANSLATION + stateText);
        this.push('wait');
        this.push('clear');
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  const types_modifier = {
    "OMORI ATTACK": "ATTACK",
    "SOMETHING ATTACK 1": "ATTACK",
    "SOMETHING ATTACK 2": "ATTACK",
  }

  Window_BattleLog.prototype.makeCustomActionText = makeCustomActionText;
  function makeCustomActionText(subject, target, item) {
    try {
      var type = item.meta.BattleLogType.toUpperCase();
      if (BEAF.BATTLE_TEXT[type] == void 0)
        type = types_modifier[type];

      var user = subject;
      const tuser = BEAF.get_entity(user.name().toUpperCase());
      const ttarget = BEAF.get_entity(target.name().toUpperCase());
      var result = target.result();
      var critical = result.critical;
      var hpDam = result.hpDamage;
      var mpDam = result.mpDamage;
      var strongHit = result.elementStrong;
      var weakHit = result.elementWeak;
      var text = '';
      var unitLowestIndex = target.friendsUnit().getLowestIndexMember();
      const regex_emotion_change_max = /{(target|user)_(sadder|happier|angrier)_max(_check)?}/g;
      const regex_emotion_change = /{(target|user)_(sadder|happier|angrier)}/g;
      const regex_stat_change = /{(target|user)_(speed|defense|attack)_(lower|higher)}/g
      const regex_set_emotion = /{(target|user)_(angry|happy|sad|afraid)}/g;
      const regex_to = /{to_(user|target)}/g;
      const regex_possessive = /{(sa|son|ses)_(target|user)}/g;
      const regex_if = /\[if (?<type>((?<entity_type>target|user)_(?<emotion>happy|sad|angry))|(?<unit>unit_lowest))\]\[(?<content>[^]*)\]/g;

      function parseNoEffectEmotion(entity, em) {
        const tentity = entity === target ? ttarget : tuser;
        let e_t = tentity.TRANSLATION;
        if (tentity.SHOW_BATTLE_DETERMINER)
          e_t = BEAF.get_determiner("AD", tentity) + e_t;
        let d = {
          "entity": e_t,
          "entity:can": BEAF.VERBS["CAN"][tentity.NUMBER]
        };
        if (em.toLowerCase().contains("afraid")) {
          if (entity.name() === "OMORI") {
            d["em"] = BEAF.EMOTIONS["AFRAID"][tentity.GENDER][tentity.NUMBER];
            return BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["CANNOT_BE"], d)) + "\r\n";
          }
        }
        d["em"] = BEAF.EMOTIONS[em.toUpperCase()][tentity.GENDER][tentity.NUMBER];
        return BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["CANNOT_BE"], d));
      }

      function parseNoStateChange(entity, stat, hl) {
        const char = BEAF.CHARACTERISTICS[stat];
        const d = {
          "stat": char.TRANSLATION,
          "AD:stat": BEAF.get_determiner("AD", char),
          "hl": hl === "lower" ? BEAF.BATTLE_TEXT["STAT_MIN"] : BEAF.BATTLE_TEXT["STAT_MAX"],
          "target_AP": BEAF.get_determiner("AP", entity) + entity.TRANSLATION
        };
        return BEAF.format(BEAF.BATTLE_TEXT["STAT_MIN_MAX"], d);
      }


      let dict = BEAF.FORMAT_DICT;

      if (tuser.SHOW_BATTLE_DETERMINER)
        dict["user"] = (BEAF.get_determiner("AD", tuser)) + tuser.TRANSLATION;
      else
        dict["user"] = tuser.TRANSLATION;
      if (ttarget.SHOW_BATTLE_DETERMINER)
        dict["target"] = (BEAF.get_determiner("AD", ttarget)) + ttarget.TRANSLATION;
      else
        dict["target"] = ttarget.TRANSLATION;
      dict["AP:user"] = BEAF.get_determiner("AP", tuser);
      dict["AP:target"] = BEAF.get_determiner("AP", ttarget);
      dict["DQ:target"] = BEAF.get_determiner("DQ", ttarget);
      dict["damage"] = hpDam;
      dict["mp"] = mpDam;
      if (ttarget.GENDER === "MASCULINE") {
        if (ttarget.NUMBER === "SINGULAR")
          dict["target:himself"] = "lui-même";
        else
          dict["target:himself"] = "eux-mêmes";
      } else {
        if (ttarget.NUMBER === "SINGULAR")
          dict["target:himself"] = "elle-même";
        else
          dict["target:himself"] = "elles-mêmes";
      }
      if (tuser.GENDER === "MASCULINE") {
        if (tuser.NUMBER === "SINGULAR")
          dict["user:himself"] = "lui-même";
        else
          dict["user:himself"] = "eux-mêmes";
      } else {
        if (tuser.NUMBER === "SINGULAR")
          dict["user:himself"] = "elle-même";
        else
          dict["user:himself"] = "elles-mêmes";
      }
      for (const [key, value] of Object.entries(BEAF.VERBS)) {
        dict["target:" + key.toLowerCase()] = value[ttarget.NUMBER];
        dict["user:" + key.toLowerCase()] = value[tuser.NUMBER];
      }
      for (const [key, value] of Object.entries(BEAF.ADJECTIVES)) {
        dict["target:" + key.toLowerCase()] = value[ttarget.GENDER][ttarget.NUMBER];
        dict["user:" + key.toLowerCase()] = value[tuser.GENDER][tuser.NUMBER];
      }
      dict["target_AP"] = BEAF.get_determiner("AP", ttarget) + ttarget.TRANSLATION;
      dict["user_AP"] = BEAF.get_determiner("AP", tuser) + tuser.TRANSLATION;

      // Type case
      //OMORI//
      let hpDamageText = "",
        mpDamageText = "";
      if (hpDam != 0) {
        if (hpDam === 1)
          hpDamageText = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["ONE_DAMAGE"], dict));
        else
          hpDamageText = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["DAMAGE"], dict));
        if (strongHit) {
          hpDamageText = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["STRONG_HIT"], dict)) + "\r\n" + hpDamageText;
        } else if (weakHit) {
          hpDamageText = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["WEAK_HIT"], dict)) + "\r\n" + hpDamageText;
        }
      } else if (result.isHit() === true) {
        hpDamageText = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["NO_HIT"], dict));
      } else {
        dict["determiner"] = (tuser.NUMBER === "PLURAL" ? "leur " : "son ");
        hpDamageText = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["WHIFF"], dict));
      }
      if (critical) {
        hpDamageText = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["CRITICAL"], dict)) + '\r\n' + hpDamageText;
      }

      if (mpDam > 0) {
        mpDamageText = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["LOSS_JUICE"], dict));
        hpDamageText = hpDamageText + "\r\n" + mpDamageText;
      }

      dict["hp_damage_text"] = hpDamageText;
      dict["mp_damage_text"] = mpDamageText;

      let original_text = BEAF.BATTLE_TEXT[type];

      const match = regex_if.exec(original_text);
      if (match !== null) {
        if (match.groups.type.startsWith("target") || match.groups.type.startsWith("user")) {
          const e = match.groups.entity_type === "target" ? target : user;
          const em = match.groups.emotion;

          if (e.isEmotionAffected(em))
            original_text = original_text.replace(regex_if, match.groups.content);
          else
            original_text = original_text.replace(regex_if, "");
        } else if (match.groups.type === "unit_lowest") {
          if (target.index() <= unitLowestIndex)
            original_text = original_text.replace(regex_if, match.groups.content);
          else
            original_text = original_text.replace(regex_if, "");
        }
      }

      original_text = original_text.replace(regex_to, (_, entity) => {
        const te = entity === "user" ? tuser : ttarget;
        let t;

        if (te["SHOW_BATTLE_DETERMINER"])
          t = BEAF.get_determiner("TO", te);
        else
          t = "à ";

        return t + te.TRANSLATION;
      });

      original_text = original_text.replace(regex_set_emotion, (_, entity, emotion) => {
        const te = entity === "user" ? tuser : ttarget;

        const em = BEAF.EMOTIONS[emotion.toUpperCase()];
        const d = {
          "entity": (te.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", te) : "") + te.TRANSLATION,
          "entity:feel": BEAF.VERBS["FEEL"][te.NUMBER],
          "em": em[te.GENDER][te.NUMBER],
          "em:suffix": em.SUFFIX
        };
        return BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
      });

      original_text = original_text.replace(regex_possessive, (_, pos, entity) => {
        const te = entity === "user" ? tuser : ttarget;

        if (te.NUMBER === "PLURAL") {
          if (pos === "ses")
            return "leurs";
          else
            return "leur";
        } else
          return pos;
      });

      original_text = original_text.replace(regex_stat_change, (_, entity, stat, direction) => {
        const e = entity === "user" ? user : target;
        const te = entity === "user" ? tuser : ttarget;
        if (!e._noStateMessage) {
          const char = BEAF.CHARACTERISTICS[stat.toUpperCase()];
          const d = {
            "stat": char.TRANSLATION,
            "AD:stat": BEAF.get_determiner("AD", char),
            "target_AP": BEAF.get_determiner("AP", te) + te.TRANSLATION,
            "hl": direction === "lower" ? BEAF.BATTLE_TEXT["STAT_L"] : BEAF.BATTLE_TEXT["STAT_H"]
          }
          return BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["STAT_HL"], d));
        } else
          return parseNoStateChange(te, stat.toUpperCase(), direction);
      });

      original_text = original_text.replace(regex_emotion_change_max, (_, entity, emotion, check) => {
        const e = entity === "user" ? user : target;
        const te = entity === "user" ? tuser : ttarget;
        let em, d;
        switch (emotion) {
          case "sadder":
            if (e.isStateAffected(12))
              em = "MISERABLE";
            else if (e.isStateAffected(11))
              em = "DEPRESSED";
            else if (e.isStateAffected(10))
              em = "SAD";
            break;
          case "happier":
            if (e.isStateAffected(8))
              em = "MANIC";
            else if (e.isStateAffected(7))
              em = "ECSTATIC";
            else if (e.isStateAffected(6))
              em = "HAPPY";
            break;
          case "angrier":
            if (e.isStateAffected(14))
              em = "ANGRY";
            else if (e.isStateAffected(15))
              em = "ENRAGED";
            else if (e.isStateAffected(16))
              em = "FURIOUS";
            break;
        }
        if (em)
          d = {
            "entity": (te.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", te) : "") + te.TRANSLATION,
            "entity:feel": BEAF.VERBS["FEEL"][te.NUMBER],
            "em": BEAF.EMOTIONS[em][te.GENDER][te.NUMBER],
            "em:suffix": BEAF.EMOTIONS[em]["SUFFIX"]
          };

        if (check !== undefined) {
          if (!e._noEffectMessage)
            return BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          else
            return parseNoEffectEmotion(e, emotion);
        }

        return BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
      });

      original_text = original_text.replace(regex_emotion_change, (_, entity, emotion) => {
        const e = entity === "user" ? user : target;
        const te = entity === "user" ? tuser : ttarget;
        let em;
        switch (emotion) {
          case "sadder":
            em = "SAD";
            break;
          case "happier":
            em = "HAPPY";
            break;
          case "angrier":
            em = "ANGRY";
            break;
        }

        const d = {
          "entity": (te.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", te) : "") + te.TRANSLATION,
          "entity:feel": BEAF.VERBS["FEEL"][te.NUMBER],
          "em": BEAF.EMOTIONS[em][te.GENDER][te.NUMBER],
          "em:suffix": BEAF.EMOTIONS[em]["SUFFIX"]
        }

        if (!e._noEffectMessage)
          return BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
        else
          return parseNoEffectEmotion(e, emotion);
      });


      text = BEAF.format(original_text, dict);
      let e, d = {},
        em;
      switch (type) {
        case 'LOOK KEL 2': // Look at Kel 2
          const AUBREY = $gameActors.actor(2);
          const KEL = $gameActors.actor(3);
          let same_emotion = false;
          let em1, em2;
          if (AUBREY.isStateAffected(14) && KEL.isStateAffected(14)) {
            same_emotion = true;
            em1 = "ANGRY";
          } else if (AUBREY.isStateAffected(14) && KEL.isStateAffected(15)) {
            em1 = "ENRAGED";
            em2 = "ANGRY";
          } else if (AUBREY.isStateAffected(15) && KEL.isStateAffected(14)) {
            em1 = "ANGRY";
            em2 = "ENRAGED";
          } else if (AUBREY.isStateAffected(15) && KEL.isStateAffected(15)) {
            same_emotion = true;
            em1 = "ENRAGED";
          } else {
            same_emotion = true;
            em1 = "ANGRY";
          }
          const char_aubrey = BEAF.CHARACTERS["AUBREY"];
          const char_kel = BEAF.CHARACTERS["KEL"];
          if (same_emotion) {
            em = BEAF.EMOTIONS[em1];
            const plural_gender = BEAF.get_plural_gender([char_aubrey, char_kel])
            d["entity:feel"] = BEAF.VERBS["FEEL"]["PLURAL"];
            d["em"] = em[plural_gender]["PLURAL"];
            d["em:suffix"] = em["SUFFIX"];
            d["entity"] = char_aubrey.TRANSLATION + " et " + char_kel.TRANSLATION;

            text += BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d);
          } else {
            em = BEAF.EMOTIONS[em1];
            d["entity:feel"] = BEAF.VERBS["FEEL"][char_kel.NUMBER];
            d["em"] = em[char_kel.GENDER][char_kel.NUMBER];
            d["em:suffix"] = em["SUFFIX"];
            d["entity"] = char_kel.TRANSLATION;
            text += BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d) + "\r\n";

            em = BEAF.EMOTIONS[em2];
            d["entity:feel"] = BEAF.VERBS["FEEL"][char_aubrey.NUMBER];
            d["em"] = em[char_aubrey.GENDER][char_aubrey.NUMBER];
            d["em:suffix"] = em["SUFFIX"];
            d["entity"] = char_aubrey.TRANSLATION;
            text += BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d) + "\r\n";
          }
          break;

        case 'LOOK HERO 2': // LOOK AT HERO 2
          if (!!$gameTemp._statsState[0]) {
            var absHp = Math.abs($gameTemp._statsState[0] - $gameActors.actor(2).hp);
            e = BEAF.CHARACTERS["AUBREY"];
            d = {
              "entity": (e.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", e) : "") + e.TRANSLATION,
              "entity:recover": BEAF.VERBS["RECOVER"][e.NUMBER],
            };
            if (absHp > 0) {
              d["hp"] = String(absHp);
              text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_HP"], d)) + "\r\n";
            }

          }
          if (!!$gameTemp._statsState[1]) {
            var absMp = Math.abs($gameTemp._statsState[1] - $gameActors.actor(2).mp);
            if (absMp > 0) {
              d["mp"] = String(absMp);
              text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_MP"], d));
            }
          }
          $gameTemp._statsState = undefined;
          break;

        case 'JUICE ME': // JUICE ME
          var absMp = Math.abs(mpDam);
          if (absMp > 0) {
            d = {
              "entity": (tuser.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", tuser) : "") + tuser.TRANSLATION,
              "entity:recover": BEAF.VERBS["RECOVER"][tuser.NUMBER],
              "mp": absMp,
            };
            text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_MP"], d)) + "\r\n";
          }
          text += hpDamageText;
          break;

        case 'RALLY': // RALLY
          for (let actor of $gameParty.members()) {
            if (actor.name() === "KEL") {
              continue;
            }
            var result = actor.result();
            if (result.mpDamage >= 0) {
              continue;
            }
            var absMp = Math.abs(result.mpDamage);
            let char = BEAF.CHARACTERS[actor.name()];
            d = {
              "entity": (char.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", char) : "") + char.TRANSLATION,
              "entity:recover": BEAF.VERBS["RECOVER"][char.NUMBER],
              "mp": absMp
            };
            text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_MP"], d)) + "\r\n";
          }
          break;

        case 'CURVEBALL': // CURVEBALL
          let emotion;
          switch ($gameTemp._randomState) {
            case 6:
              if (!target._noEffectMessage)
                emotion = "HAPPY";
              else
                emotion = "HAPPIER";
              break;
            case 14:
              emotion = "ANGRY";
              if (!target._noEffectMessage)
                emotion = "ANGRY";
              else
                emotion = "ANGRIER";
              break;
            case 10:
              if (!target._noEffectMessage)
                emotion = "SAD";
              else
                emotion = "SADDER";
              break;
          }
          if (!target._noEffectMessage) {
            em = BEAF.EMOTIONS[emotion];
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": em[ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": em["SUFFIX"]
            }
            text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d)) + "\r\n";
          } else
            text += parseNoEffectEmotion(target, emotion) + "\r\n";
          text += hpDamageText;
          break;

        case 'PASS OMORI 2': //KEL PASS OMORI 2
          var OMORI = $gameActors.actor(1);
          const omori = BEAF.CHARACTERS[OMORI.name()];
          d = {
            "entity": omori.TRANSLATION,
            "entity:feel": BEAF.VERBS["FEEL"][omori.NUMBER]
          };
          if (OMORI.isStateAffected(6) || OMORI.isStateAffected(7)) {
            if (OMORI.isStateAffected(6))
              em = BEAF.EMOTIONS["HAPPY"];
            else if (OMORI.isStateAffected(7))
              em = BEAF.EMOTIONS["ECSTATIC"];
            d["em"] = em[omori.GENDER][omori.NUMBER];
            d["em:suffix"] = em["SUFFIX"];
            text += BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d) + '\r\n';
          }
          text += hpDamageText;
          break;

          //HERO//
        case 'MASSAGE': // MASSAGE
          if (!!target.isAnyEmotionAffected(true)) {
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:calm": BEAF.VERBS["CALM"][ttarget.NUMBER]
            };
            text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["CALM"], d)) + "...";
          } else
            text += BEAF.BATTLE_TEXT["NO_EFFECT"];
          break;

        case 'TEA TIME': // TEA TIME
          if (result.hpDamage < 0) {
            var absHp = Math.abs(result.hpDamage);
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:recover": BEAF.VERBS["RECOVER"][ttarget.NUMBER],
              "hp": absHp,
            };
            text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_HP"], d)) + "\r\n";
          }
          if (result.mpDamage < 0) {
            var absMp = Math.abs(result.mpDamage);
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:recover": BEAF.VERBS["RECOVER"][ttarget.NUMBER],
              "mp": absMp,
            };
            text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_MP"], d)) + "\r\n";
          }
          break;

        case 'SHARE FOOD': //SHARE FOOD
          if (target.name() === user.name())
            text = "";
          break;

        case 'CALL OMORI': // CALL OMORI
          e = BEAF.CHARACTERS["OMORI"];
          d = {
            "entity": (e.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", e) : "") + e.TRANSLATION,
            "entity:recover": BEAF.VERBS["RECOVER"][e.NUMBER],
          };
          if (!!$gameTemp._statsState[0]) {
            var absHp = Math.abs($gameTemp._statsState[0] - $gameActors.actor(1).hp);
            if (absHp > 0) {
              d["hp"] = String(absHp);
              text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_HP"], d)) + "\r\n";
            }
          }
          if (!!$gameTemp._statsState[1]) {
            var absMp = Math.abs($gameTemp._statsState[1] - $gameActors.actor(1).mp);
            if (absMp > 0) {
              d["mp"] = String(absMp);
              text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_MP"], d));
            }
          }
          $gameTemp._statsState = undefined;
          break;

        case 'CALL KEL': // CALL KEL
          e = BEAF.CHARACTERS["KEL"];
          d = {
            "entity": (e.SHOW_BATTLE_DETERMINER ? BEAF.capitalize(BEAF.get_determiner("AD", e)) : "") + e.TRANSLATION,
            "entity:recover": BEAF.VERBS["RECOVER"][e.NUMBER],
          };
          if (!!$gameTemp._statsState[0]) {
            var absHp = Math.abs($gameTemp._statsState[0] - $gameActors.actor(3).hp);
            if (absHp > 0) {
              d["hp"] = String(absHp);
              text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_HP"], d)) + "\r\n";
            }
          }
          if (!!$gameTemp._statsState[1]) {
            var absMp = Math.abs($gameTemp._statsState[1] - $gameActors.actor(3).mp);
            if (absMp > 0) {
              d["mp"] = String(absMp);
              text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_MP"], d)) + "\r\n";
            }
          }
          break;

        case 'CALL AUBREY': // CALL AUBREY
          e = BEAF.CHARACTERS["AUBREY"];
          d = {
            "entity": (e.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", e) : "") + e.TRANSLATION,
            "entity:recover": BEAF.VERBS["RECOVER"][e.NUMBER],
          };
          if (!!$gameTemp._statsState[0]) {
            var absHp = Math.abs($gameTemp._statsState[0] - $gameActors.actor(2).hp);
            if (absHp > 0) {
              d["hp"] = String(absHp);
              text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_HP"], d)) + "\r\n";
            }
          }
          if (!!$gameTemp._statsState[1]) {
            var absMp = Math.abs($gameTemp._statsState[1] - $gameActors.actor(2).mp);
            if (absMp > 0) {
              d["mp"] = String(absMp);
              text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_MP"], d));
            }
          }
          break;

          //PLAYER//
        case 'CALM DOWN': // PLAYER CALM DOWN
          if (item.id !== 1445) {
            d = {
              "entity": (tuser.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", tuser) : "") + tuser.TRANSLATION,
              "entity:calm": BEAF.VERBS["CALM"][tuser.NUMBER]
            }
            text = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["CALM"], d)) + ".\r\n";
          } // Process if Calm Down it's not broken;
          if (Math.abs(hpDam) > 0) {
            d = {
              "entity": (tuser.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", tuser) : "") + tuser.TRANSLATION,
              "entity:recover": BEAF.VERBS["RECOVER"][tuser.NUMBER],
              "hp": Math.abs(hpDam)
            }
            text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_HP"], d));
          }
          break;

          //UNIVERSAL//
        case 'FIRST AID': // FIRST AID
          d = {
            "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
            "entity:recover": BEAF.VERBS["RECOVER"][ttarget.NUMBER],
            "hp": Math.abs(target._result.hpDamage)
          }
          text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_HP"], d));
          break;

        case 'SAD EYES2': //SAD EYES
          if (!target._noEffectMessage) {
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": BEAF.EMOTIONS["SAD"][ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": " ?"
            }
            text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          } else
            text += parseNoEffectEmotion(target, "sadder");
          break;

        case 'MUFFLED SCREAMS': //MUFFLED SCREAMS
          if (!target._noEffectMessage && target.name() !== "OMORI") {
            em = BEAF.EMOTIONS["AFRAID"];
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": em[ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": "."
            };
            text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          } else
            text += parseNoEffectEmotion(target, "afraid");
          break;

        case 'MECHA MOLE STRANGE LASER': //MECHA MOLE STRANGE LASER
          d = {
            "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
            "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
            "em": BEAF.ADJECTIVES["WEIRD"][ttarget.GENDER][ttarget.NUMBER],
            "em:suffix": "."
          }
          text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          break;

        case 'UPLIFTING HYMN':
        case 'TOASTY RILE':
        case 'WATERMELON CONFETTI':
        case 'WATERMELON RAIN CLOUD':
        case 'WATERMELON AIR HORN':
        case 'LAB HAPPY GAS':
        case 'SWEET GAS':
        case 'SH INSULT':
          target._noEffectMessage = undefined;
          break;


        case 'SPROUT BUNNY FEED': //SPROUT BUNNY FEED
          d = {
            "entity": (tuser.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", tuser) : "") + tuser.TRANSLATION,
            "entity:recover": BEAF.VERBS["RECOVER"][tuser.NUMBER],
            "hp": String(Math.abs(hpDam))
          }
          text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_HP"], d));
          break;

        case 'PLUTO EXPAND': // PLUTO EXPAND
          if (!target._noStateMessage) {
            text += BEAF.format(BEAF.BATTLE_TEXT["PLUTO EXPAND_1"], dict);
          } else {
            text += parseNoStateChange(tuser, "ATTACK", "higher") + "\r\n";
            text += parseNoStateChange(tuser, "DEFENSE", "higher") + "\r\n";
            text += parseNoStateChange(tuser, "SPEED", "lower");
          }
          break;

        case 'BD COOK': //BISCUIT AND DOUGHIE CHEER UP
          d = {
            "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
            "entity:recover": BEAF.VERBS["RECOVER"][ttarget.NUMBER],
            "hp": String(Math.abs(hpDam))
          }
          text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_HP"], d));
          break;

        case 'KC CONSUME': //KING CRAWLER CONSUME
          d = {
            "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
            "entity:recover": BEAF.VERBS["RECOVER"][ttarget.NUMBER],
            "hp": String((Math.abs(hpDam)))
          };
          text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_HP"], d)) + "\r\n";
          break;

        case 'KC RECOVER': //KING CRAWLER CONSUME
          d = {
            "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
            "entity:recover": BEAF.VERBS["RECOVER"][ttarget.NUMBER],
            "hp": String((Math.abs(hpDam)))
          };
          text = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_HP"], d)) + "\r\n" + text;
          break;

        case 'EXPANDED EXPAND FURTHER':
          if (!target._noStateMessage)
            text += BEAF.format(BEAF.BATTLE_TEXT["EXPANDED EXPAND FURTHER_1"], dict);
          else {
            text += parseNoStateChange(tuser, "ATTACK", "higher") + "\r\n";
            text += parseNoStateChange(tuser, "DEFENSE", "higher") + "\r\n";
            text += parseNoStateChange(tuser, "SPEED", "lower");
          }
          break;

        case 'TENTACLE GRAB': //ABBI TENTACLE GRAB
          if (result.isHit()) {
            if (target.name() !== "OMORI" && !target._noEffectMessage) {
              d = {
                "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
                "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
                "em": BEAF.EMOTIONS["AFRAID"][ttarget.GENDER][ttarget.NUMBER],
                "em:suffix": ".\r\n"
              };
              text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
            } else
              text += parseNoEffectEmotion(target, "afraid");
          }
          text += hpDamageText;
          break;

          //PERFECT HEART//
        case 'PERFECT STEAL HEART':
          if (user.result().hpDamage < 0) {
            d = {
              "entity": (tuser.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", tuser) : "") + tuser.TRANSLATION,
              "entity:recover": BEAF.VERBS["RECOVER"][tuser.NUMBER],
              "hp": String(Math.abs(user.result().hpDamage))
            }
            text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_HP"], d)) + "\r\n";
          }
          break;

        case 'PERFECT STEAL BREATH': //PERFECT HEART STEAL BREATH
          if (user.result().mpDamage < 0) {
            d = {
              "entity": (tuser.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", tuser) : "") + tuser.TRANSLATION,
              "entity:recover": BEAF.VERBS["RECOVER"][tuser.NUMBER],
              "mp": String(Math.abs(user.result().mpDamage))
            }
            text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["RECOVER_MP"], d)) + "\r\n";
          }
          break;

        case "PERFECT ANGELIC WRATH":
          if (target.index() <= unitLowestIndex)
            text = tuser.TRANSLATION + " déchaîne sa colère.\r\n";
          if (!target._noEffectMessage) {
            if (target.isStateAffected(8))
              em = "MANIC";
            else if (target.isStateAffected(7))
              em = "ECSTATIC";
            else if (target.isStateAffected(6))
              em = "HAPPY";
            else if (target.isStateAffected(12))
              em = "MISERABLE";
            else if (target.isStateAffected(11))
              em = "DEPRESSED";
            else if (target.isStateAffected(10))
              em = "SAD";

            if (em) {
              e = BEAF.EMOTIONS[em];
              d = {
                "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
                "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
                "em": e[ttarget.GENDER][ttarget.NUMBER],
                "em:suffix": e["SUFFIX"]
              };
              text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d)) + "\r\n";
            }
          } else {
            if (target.isEmotionAffected("happy"))
              text += parseNoEffectEmotion(target, "happier") + "\r\n";
            else if (target.isEmotionAffected("sad"))
              text += parseNoEffectEmotion(target, "sadder") + "\r\n";
            else if (target.isEmotionAffected("angry"))
              text += parseNoEffectEmotion(target, "angrier") + "\r\n";
          }
          text += hpDamageText;
          break;

        case 'SLIME GIRLS STRANGE GAS': //SLIME GIRLS STRANGE GAS
          if (!target._noEffectMessage) {
            if (target.isStateAffected(8))
              em = "MANIC";
            else if (target.isStateAffected(7))
              em = "ECSTATIC";
            else if (target.isStateAffected(6))
              em = "HAPPY";
            else if (target.isStateAffected(12))
              em = "MISERABLE";
            else if (target.isStateAffected(11))
              em = "DEPRESSED";
            else if (target.isStateAffected(10))
              em = "SAD";
            else if (target.isStateAffected(16))
              em = "FURIOUS";
            else if (target.isStateAffected(15))
              em = "ENRAGED";
            else if (target.isStateAffected(14))
              em = "ANGRY";
            e = BEAF.EMOTIONS[em];
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": e[ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": e["SUFFIX"]
            };
            text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d)) + "\r\n";
          } else {
            if (target.isEmotionAffected("happy"))
              text += parseNoEffectEmotion(target, "happier") + "\r\n";
            else if (target.isEmotionAffected("sad"))
              text += parseNoEffectEmotion(target, "sadder") + "\r\n";
            else if (target.isEmotionAffected("angry"))
              text += parseNoEffectEmotion(target, "angrier") + "\r\n";
          }
          break;

        case 'H FACE HEAL': //HUMPHREY FACE HEAL
          const humphrey = BEAF.FOES["HUMPHREY"];
          d = {
            "entity": humphrey.TRANSLATION,
            "entity:recover": BEAF.VERBS["RECOVER"][humphrey.NUMBER],
            "hp": String(Math.abs(hpDam))
          };
          text += BEAF.format(BEAF.BATTLE_TEXT["RECOVER_HP"], d);
          break;

        case 'DREAM HEIGHTS SHOVE': //DREAM FEAR OF HEIGHTS SHOVE
          if (!target._noEffectMessage && target.name() !== "OMORI") {
            e = BEAF.EMOTIONS["AFRAID"];
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": e[ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": "."
            }
            text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          } else
            text += parseNoEffectEmotion(target, "afraid");
          break;

        case 'ECSTATIC':
          if (!target._noEffectMessage) {
            e = BEAF.EMOTIONS["ECSTATIC"];
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": e[ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": e["SUFFIX"]
            };
            text = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          } else
            text = parseNoEffectEmotion(target, "happier");
          break;

        case 'MANIC':
          if (!target._noEffectMessage) {
            e = BEAF.EMOTIONS["MANIC"];
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": e[ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": e["SUFFIX"]
            };
            text = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          } else
            text = parseNoEffectEmotion(target, "happier");
          break;

        case 'DEPRESSED':
          if (!target._noEffectMessage) {
            e = BEAF.EMOTIONS["DEPRESSED"];
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": e[ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": e["SUFFIX"]
            };
            text = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          } else
            text = parseNoEffectEmotion(target, "sadder");
          break;

        case 'MISERABLE':
          if (!target._noEffectMessage) {
            e = BEAF.EMOTIONS["MISERABLE"];
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": e[ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": e["SUFFIX"]
            };
            text = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          } else
            text = parseNoEffectEmotion(target, "sadder");
          break;

        case 'ENRAGED':
          if (!target._noEffectMessage) {
            e = BEAF.EMOTIONS["ENRAGED"];
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": e[ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": e["SUFFIX"]
            };
            text = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          } else
            text = parseNoEffectEmotion(target, "angrier");
          break;

        case 'FURIOUS':
          if (!target._noEffectMessage) {
            e = BEAF.EMOTIONS["FURIOUS"];
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": e[ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": e["SUFFIX"]
            };
            text = BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          } else
            text = parseNoEffectEmotion(target, "angrier");
          break;

        case 'BASIL VENT':
          for (const e of [$gameParty.members().find(m => m.name() === "OMORI"), $gameParty.members().find(m => m.name() === "BASIL")]) {
            const te = BEAF.get_entity(e.name().toUpperCase());
            let em, d;
            if (e.isStateAffected(14))
              em = "ANGRY";
            else if (e.isStateAffected(15))
              em = "ENRAGED";
            else if (e.isStateAffected(16))
              em = "FURIOUS";
            if (em)
              d = {
                "entity": (te.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", te) : "") + te.TRANSLATION,
                "entity:feel": BEAF.VERBS["FEEL"][te.NUMBER],
                "em": BEAF.EMOTIONS[em][te.GENDER][te.NUMBER],
                "em:suffix": BEAF.EMOTIONS[em]["SUFFIX"]
              };

            text += "\r\n" + BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          }
          break;

        case 'BASIL MULL':
          if (target.index() > unitLowestIndex)
            text = "";
          if (target.isStateAffected(12))
            e = "MISERABLE";
          else if (target.isStateAffected(11))
            e = "DEPRESSED";
          else if (target.isStateAffected(10))
            e = "SAD";
          if (e)
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": BEAF.EMOTIONS[e][ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": BEAF.EMOTIONS[e]["SUFFIX"]
            };

          text += "\r\n" + BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          break;

        case 'BASIL COMFORT':
          if (target.index() > unitLowestIndex)
            text = "";
          if (target.isStateAffected(8))
            e = "MANIC";
          else if (target.isStateAffected(7))
            e = "ECSTATIC";
          else if (target.isStateAffected(6))
            e = "HAPPY";
          if (e)
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": BEAF.EMOTIONS[e][ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": BEAF.EMOTIONS[e]["SUFFIX"]
            };

          text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          break;

        case 'KEL RAINCLOUD':
          if (target.index() > unitLowestIndex)
            text = "";
          if (target.isStateAffected(12))
            e = "MISERABLE";
          else if (target.isStateAffected(11))
            e = "DEPRESSED";
          else if (target.isStateAffected(10))
            e = "SAD";
          if (e)
            d = {
              "entity": (ttarget.SHOW_BATTLE_DETERMINER ? BEAF.get_determiner("AD", ttarget) : "") + ttarget.TRANSLATION,
              "entity:feel": BEAF.VERBS["FEEL"][ttarget.NUMBER],
              "em": BEAF.EMOTIONS[e][ttarget.GENDER][ttarget.NUMBER],
              "em:suffix": BEAF.EMOTIONS[e]["SUFFIX"]
            };

          text += BEAF.capitalize(BEAF.format(BEAF.BATTLE_TEXT["FEELING"], d));
          break;

        case 'HERO BIG MONEY':
        case 'KEL TAGS HERO':
        case 'KEL TAGS AUBREY':
        case 'BASIL TULIP':
          if (target.index() > unitLowestIndex)
            text = "";
          text += hpDamageText;
          break;
      }

      // Return Text
      return BEAF.capitalize(text);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayCustomActionText = displayCustomActionText;
  function displayCustomActionText(subject, target, item) {
    try {
      // Make Custom Action Text
      var text = makeCustomActionText.call(this, subject, target, item);
      // If Text Length is more than 0
      if (text.length > 0) {
        if (!!this._multiHitFlag && !!item.isRepeatingSkill) {
          return;
        }
        // Get Get
        text = text.split(/\r\n/);
        for (var i = 0; i < text.length; i++) {
          this.push('addText', text[i]);
        }
        // Add Wait
        this.push('wait', 15);

      }
      if (!!item.isRepeatingSkill) {
        this._multiHitFlag = true;
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayCritical = displayCritical;
  function displayCritical(target) {
    try {
      if (!Yanfly.Param.BECShowCritText) return;
      if (target.result().critical)
        this.push('addText', BEAF.BATTLE_TEXT["CRITICAL"]);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayMiss = displayMiss;
  function displayMiss(target) {
    try {
      if (!Yanfly.Param.BECShowMissText) return;
      var fmt;
      const e = BEAF.get_entity(target.name().toUpperCase());
      let format_dict = {};
      if (e.SHOW_BATTLE_DETERMINER)
        format_dict["target"] = (BEAF.get_determiner("AD", e)) + e.TRANSLATION;
      else
        format_dict["target"] = e.TRANSLATION;
      if (target.result().physical) {
        fmt = BEAF.BATTLE_TEXT["RESULT_NO_HIT"];
        fmt = fmt.replace(regex_verb, (_, __, verb) => {
          return BEAF.VERBS[verb.toUpperCase()][e.NUMBER];
        });
        this.push('performMiss', target);
      } else
        fmt = BEAF.BATTLE_TEXT["ACTION_FAILURE"];
      this.push('addText', BEAF.format(fmt, format_dict));
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayEvasion = displayEvasion;
  function displayEvasion(target) {
    try {
      if (!Yanfly.Param.BECShowEvaText) return;
      let fmt;
      const e = BEAF.get_entity(target.name().toUpperCase());
      let format_dict = {};
      if (e.SHOW_BATTLE_DETERMINER)
        format_dict["target"] = (BEAF.get_determiner("AD", e)) + e.TRANSLATION;
      else
        format_dict["target"] = e.TRANSLATION;
      if (target.result().physical) {
        fmt = BEAF.BATTLE_TEXT["EVASION"];
        this.push('performEvasion', target);
      } else {
        fmt = BEAF.BATTLE_TEXT["MAGIC_EVASION"];
        this.push('performMagicEvasion', target);
      }
      fmt = fmt.replace(regex_verb, (_, __, verb) => {
        return BEAF.VERBS[verb.toUpperCase()][e.NUMBER];
      });
      this.push('addText', BEAF.format(fmt, format_dict));
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.makeHpDamageText = makeHpDamageText;
  function makeHpDamageText(target) {
    try {
      var result = target.result();
      var damage = result.hpDamage;
      let fmt;
      const char = BEAF.get_entity(target.name().toUpperCase());
      let char_t = char.TRANSLATION;
      if (char.SHOW_BATTLE_DETERMINER)
        char_t = BEAF.get_determiner("AD", char) + char_t;
      const format_dict = {
        "target": char_t,
        "entity": char_t,
        "entity:recover": BEAF.VERBS["RECOVER"][char.NUMBER],
        "damage": String(damage),
        "hp": String(-damage)
      }

      if (damage > 0 && result.drain)
        fmt = BEAF.BATTLE_TEXT["DRAIN"];
      else if (damage > 0) {
        if (damage === 1)
          fmt = BEAF.BATTLE_TEXT["ONE_DAMAGE"];
        else
          fmt = BEAF.BATTLE_TEXT["DAMAGE"];
      } else if (damage < 0)
        fmt = BEAF.BATTLE_TEXT["RECOVER_HP"];
      else
        fmt = BEAF.BATTLE_TEXT["TARGET_NO_HIT"];

      fmt = fmt.replace(regex_verb, (_, __, verb) => {
        return BEAF.VERBS[verb.toUpperCase()][char.NUMBER];
      });

      return BEAF.capitalize(BEAF.format(fmt, format_dict));
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayHpDamage = displayHpDamage;
  function displayHpDamage(target) {
    try {
      let result = target.result();
      if (result.isHit() && result.hpDamage > 0) {
        if (!!result.elementStrong) {
          this.push("addText", BEAF.BATTLE_TEXT["STRONG_HIT"]);
          this.push("waitForNewLine");
        } else if (!!result.elementWeak) {
          this.push("addText", BEAF.BATTLE_TEXT["WEAK_HIT"]);
          this.push("waitForNewLine")
        }
      }
      if (!Yanfly.Param.BECShowHpText) return;
      if (target.result().hpAffected) {
        if (target.result().hpDamage > 0 && !target.result().drain) {
          this.push('performDamage', target);
        }
        if (target.result().hpDamage < 0) {
          this.push('performRecovery', target);
        }
        this.push('addText', makeHpDamageText.call(this, target));
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.makeMpDamageText = makeMpDamageText;
  function makeMpDamageText(target) {
    try {
      var result = target.result();
      var damage = result.mpDamage;
      let fmt;
      const e = BEAF.get_entity(target.name().toUpperCase());
      let e_t = e.TRANSLATION;
      if (e.SHOW_BATTLE_DETERMINER)
        e_t = BEAF.get_determiner("AD", e) + e_t;
      let format_dict = {
        "target": e_t,
        "entity": e_t
      };
      if (damage > 0 && result.drain) {
        format_dict["mp"] = damage;
        fmt = BEAF.BATTLE_TEXT["DRAIN_MP"];
      } else if (damage > 0) {
        format_dict["mp"] = damage;
        format_dict["target:lose"] = BEAF.VERBS["LOSE"][e.NUMBER];
        fmt = BEAF.BATTLE_TEXT["LOSS_JUICE"];
      } else if (damage < 0) {
        format_dict["mp"] = -damage;
        format_dict["entity:recover"] = BEAF.VERBS["RECOVER"][e.NUMBER];
        fmt = BEAF.BATTLE_TEXT["RECOVER_MP"];
      } else
        fmt = "";

      fmt = fmt.replace(regex_verb, (_, __, verb) => {
        return BEAF.VERBS[verb.toUpperCase()][e.NUMBER];
      });
      return BEAF.capitalize(BEAF.format(fmt, format_dict));
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayMpDamage = displayMpDamage;
  function displayMpDamage(target) {
    try {
      if (!Yanfly.Param.BECShowMpText) return;
      if (target.isAlive() && target.result().mpDamage !== 0) {
        if (target.result().mpDamage < 0) {
          this.push('performRecovery', target);
        }
        this.push('addText', makeMpDamageText.call(this, target));
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.makeTpDamageText = makeTpDamageText;
  function makeTpDamageText(target) {
    try {
      var result = target.result();
      var damage = result.tpDamage;
      var isActor = target.isActor();
      var fmt;
      if (damage > 0) {
        fmt = isActor ? TextManager.actorLoss : TextManager.enemyLoss;
        return fmt.format(target.name(), TextManager.tp, damage);
      } else if (damage < 0) {
        fmt = isActor ? TextManager.actorGain : TextManager.enemyGain;
        return fmt.format(target.name(), TextManager.tp, -damage);
      } else {
        return '';
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayTpDamage = displayTpDamage;
  function displayTpDamage(target) {
    try {
      if (!Yanfly.Param.BECShowTpText) return;
      if (target.isAlive() && target.result().tpDamage !== 0) {
        if (target.result().tpDamage < 0) {
          this.push('performRecovery', target);
        }
        this.push('addText', makeTpDamageText.call(this, target));
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayDamage = displayDamage;
  function displayDamage(target) {
    try {
      if (target.result().missed) {
        displayMiss.call(this, target);
      } else if (target.result().evaded) {
        displayEvasion.call(this, target);
      } else {
        displayHpDamage.call(this, target);
        displayMpDamage.call(this, target);
        displayTpDamage.call(this, target);
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayAddedStates = displayAddedStates;
  function displayAddedStates(target) {
    try {
      if (!Yanfly.Param.BECShowStateText) return;
      target.result().addedStateObjects().forEach(function(state) {
        var stateMsg = target.isActor() ? state.message1 : state.message2;
        const character = BEAF.get_entity(target.name().toUpperCase());
        let add_character = false;
        if (stateMsg) {
          if (stateMsg in BEAF.BATTLE_TEXT) {
            stateMsg = BEAF.BATTLE_TEXT[stateMsg];
            add_character = true;
          } else {
            if (state.name.startsWith("ATTACK UP"))
              stateMsg = BEAF.BATTLE_TEXT["ATTACK_STAT"] + BEAF.get_determiner("AP", character) + character.TRANSLATION + BEAF.BATTLE_TEXT["STAT_UP"];
            else if (state.name.startsWith("ATTACK DOWN"))
              stateMsg = BEAF.BATTLE_TEXT["ATTACK_STAT"] + BEAF.get_determiner("AP", character) + character.TRANSLATION + BEAF.BATTLE_TEXT["STAT_DOWN"];
            else if (state.name.startsWith("DEFENSE UP"))
              stateMsg = BEAF.BATTLE_TEXT["DEFENSE_STAT"] + BEAF.get_determiner("AP", character) + character.TRANSLATION + BEAF.BATTLE_TEXT["STAT_UP"];
            else if (state.name.startsWith("DEFENSE DOWN"))
              stateMsg = BEAF.BATTLE_TEXT["DEFENSE_STAT"] + BEAF.get_determiner("AP", character) + character.TRANSLATION + BEAF.BATTLE_TEXT["STAT_DOWN"];
            else if (state.name.startsWith("SPEED UP"))
              stateMsg = BEAF.BATTLE_TEXT["SPEED_STAT"] + BEAF.get_determiner("AP", character) + character.TRANSLATION + BEAF.BATTLE_TEXT["STAT_UP"];
            else if (state.name.startsWith("SPEED DOWN"))
              stateMsg = BEAF.BATTLE_TEXT["SPEED_STAT"] + BEAF.get_determiner("AP", character) + character.TRANSLATION + BEAF.BATTLE_TEXT["STAT_DOWN"];
            else {
              let suffix = "_message" + (target.isActor() ? "1" : "2");
              stateMsg = BEAF.BATTLE_TEXT[state.name + suffix];
              add_character = true;
            }
          }
          stateMsg = stateMsg.replace(regex_auto_state, (_, term) => {
            if (term.toUpperCase() in BEAF.EMOTIONS)
              return BEAF.EMOTIONS[term.toUpperCase()][character.GENDER][character.NUMBER];
            else if (term.toUpperCase() in BEAF.ADJECTIVES)
              return BEAF.ADJECTIVES[term.toUpperCase()][character.GENDER][character.NUMBER];
            else if (term.toUpperCase() in BEAF.VERBS)
              return BEAF.VERBS[term.toUpperCase()][character.NUMBER];
            return "UNDEFINED";
          });
          if (add_character)
            stateMsg = character.TRANSLATION + stateMsg;
        }
        if (state.id === target.deathStateId()) {
          this.push('performCollapse', target);
        }
        if (state.id === target.deathStateId() && target.isActor()) {
          if ([1, 8, 9, 10, 11].contains(target.actorId())) {
            const d = {
              "entity:black_out": BEAF.VERBS["BLACK_OUT"][character.NUMBER]
            };
            stateMsg = character.TRANSLATION + BEAF.format(BEAF.BATTLE_TEXT["BLACKED OUT"], d);
          }
        }
        if (stateMsg) {
          this.push('popBaseLine');
          this.push('pushBaseLine');
          this.push('addText', stateMsg);
          this.push('waitForEffect');
        }
      }, this);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayRemovedStates = displayRemovedStates;
  function displayRemovedStates(target) {
    try {
      if (!Yanfly.Param.BECShowStateText) return;
      target.result().removedStateObjects().forEach(function(state) {
        if (state.message4) {
          const character = BEAF.get_entity(target.name().toUpperCase());
          let msg = BEAF.BATTLE_TEXT[state.message4];

          msg = msg.replace(regex_auto_state, (_, term) => {
            if (term.toUpperCase() in BEAF.EMOTIONS)
              return BEAF.EMOTIONS[term.toUpperCase()][character.GENDER][character.NUMBER];
            else if (term.toUpperCase() in BEAF.ADJECTIVES)
              return BEAF.ADJECTIVES[term.toUpperCase()][character.GENDER][character.NUMBER];
            else if (term.toUpperCase() in BEAF.VERBS)
              return BEAF.VERBS[term.toUpperCase()][character.NUMBER];
            return "UNDEFINED";
          });
          msg = character.TRANSLATION + msg;
          msg = msg.replace(regex_verb, (_, __, verb) => {
            return BEAF.VERBS[verb.toUpperCase()][character.NUMBER];
          });

          this.push('popBaseLine');
          this.push('pushBaseLine');
          this.push('addText', msg);
        }
      }, this);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayChangedStates = displayChangedStates;
  function displayChangedStates(target) {
    try {
      displayAddedStates.call(this, target);
      displayRemovedStates.call(this, target);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayChangedBuffs = displayChangedBuffs;
  function displayChangedBuffs(target) {
    try {
      if (!Yanfly.Param.BECShowBuffText) return;
      var result = target.result();
      this.displayBuffs(target, result.addedBuffs, BEAF.BATTLE_TEXT["STATE_UP"]);
      this.displayBuffs(target, result.addedDebuffs, BEAF.BATTLE_TEXT["STATE_DOWN"]);
      this.displayBuffs(target, result.removedBuffs, BEAF.BATTLE_TEXT["STATE_NORMAL"]);
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayAffectedStatus = displayAffectedStatus;
  function displayAffectedStatus(target) {
    try {
      if (target.result().isStatusAffected()) {
        this.push('pushBaseLine');
        displayChangedStates.call(this, target);
        displayChangedBuffs.call(this, target);
        this.push('waitForNewLine');
        this.push('popBaseLine');
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.displayFailure = displayFailure;
  function displayFailure(target) {
    try {
      if (!Yanfly.Param.BECShowFailText) return;
      if (target.result().isHit() && !target.result().success) {
        const e = BEAF.get_entity(target.name().toUpperCase());
        let format_dict = {};
        if (e.SHOW_BATTLE_DETERMINER)
          format_dict["target"] = (BEAF.get_determiner("AD", e)) + e.TRANSLATION;
        else
          format_dict["target"] = e.TRANSLATION;
        this.push('addText', BEAF.format(BEAF.BATTLE_TEXT["ACTION_FAILURE"], format_dict));
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  Window_BattleLog.prototype.push = function(methodName) {
    try {
      // Dynamically replace Game_Party name function
      $gameParty.name = function() {
        var numBattleMembers = this.battleMembers().length;
        const leader = BEAF.get_entity(this.leader().name().toUpperCase());
        if (numBattleMembers === 0) {
          return '';
        } else if (numBattleMembers === 1) {
          return leader.TRANSLATION;
        } else {
          return TextManager.partyName.format(BEAF.get_determiner("AP", leader), leader.TRANSLATION);
        }
      };

      // battleLog push function
      if (methodName === "addText") {
        let text = arguments[1];
        const final_lines = BEAF.get_battle_multiline(text, BEAF_BITMAP, BEAF.BATTLE_MAX_WIDTH);
        for (const line of final_lines)
          this._methods.push({
            name: methodName,
            params: [line]
          });
      } else {
        var methodArgs = Array.prototype.slice.call(arguments, 1);
        this._methods.push({
          name: methodName,
          params: methodArgs
        });
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_BattleLog.prototype.displayActionResults = function(subject, target) {
    try {
      // Get Item Object
      var item = BattleManager._action._item.object();
      // If Item has custom battle log type
      if (item && item.meta.BattleLogType) {
        // Display Custom Action Text
        displayCustomActionText.call(this, subject, target, item);
      } else {
        if (Yanfly.Param.BECOptSpeed) {
          if (target.result().used) {
            displayCritical.call(this, target);
            displayDamage.call(this, target);
            displayAffectedStatus.call(this, target);
            displayFailure.call(this, target);
          }
        } else {
          if (target.result().used) {
            this.push('pushBaseLine');
            displayCritical.call(this, target);
            this.push('popupDamage', target);
            this.push('popupDamage', subject);
            displayDamage.call(this, target);
            displayAffectedStatus.call(this, target);
            displayFailure.call(this, target);
            this.push('waitForNewLine');
            this.push('popBaseLine');
          }
        }
        if (target.isDead()) target.performCollapse();
      }
      // If Subject is an actor
      if (subject.isActor()) {
        // Get Chain Window
        var chainWindow = BattleManager._activeChainSkillWindow;
        // If Chain Window is visible
        if (chainWindow.visible) {
          // Set Wait mode to chain skill input
          this.push('setWaitMode', 'chainSkillInput');
          // Hide Chain List
          this.push('hideChainSkillList');
        }
        // Enable Active Chain
        this.push('processCustomCode', function() {
          subject.disableActiveChain();
        });
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }

  // Window_OmoriBattleActorStatus

  Window_OmoriBattleActorStatus.prototype.refresh = function() {
    try {
      var actor = this.actor();
      if (actor) {
        this.setStatusBack(actor.statusBackIndex());
        const character = BEAF.get_entity(actor._name.toUpperCase());
        const offset = character.GENDER === BEAF.GENDER.FEMININE ? FEMALE_STATE_LIST_OFFSET : 0;
        this.setStatusHeader(actor.statusListIndex() + offset);
        this._faceSprite.setAnimRow(actor.statusFaceIndex())
        this.setupStatusParticles(actor.statusStateParticlesData())
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoriBattleActorStatus.prototype.drawHP = function(hp, maxHP) {
    try {
      this.contents.fontSize = 16;
      var y = 112
      this.contents.clearRect(0, y + 10, this.width, 24);
      var maxText = ' ' + maxHP
      var width = this.textWidth(maxText) + 11;
      this.drawText(hp, 0, y, this.width - width, 'right');
      this.drawText(maxText, 0, y, this.width - 10, 'right');
      this.drawText('/', 0, y + 1, this.width - width + 5, 'right');
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_OmoriBattleActorStatus.prototype.drawMP = function(mp, maxMP) {
    try {
      this.contents.fontSize = 16;
      var y = 131;
      this.contents.clearRect(0, y + 10, this.width, 24);
      var maxText = ' ' + maxMP
      var width = this.textWidth(maxText) + 11;
      this.drawText(mp, 0, y, this.width - width, 'right');
      this.drawText(maxText, 0, y, this.width - 10, 'right');
      this.drawText('/', 0, y + 1, this.width - width + 5, 'right');
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Window_ActorCommand

  Window_ActorCommand.prototype.makeCommandList = function() {
    try {
      _TDS_.OmoriBattleSystem.Window_ActorCommand_makeCommandList.call(this);
      if ($gameVariables.value(22) === 3 || $gameVariables.value(22) === 4) {
        this._list.splice(2, 99);
      };
      if (this._list.length === 2)
        this.cursor_x = [50, 50];
      else
        this.cursor_x = [10, 193, 10, 193];
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Window_PartyCommand

  Window_PartyCommand.prototype.initialize = function() {
    try {
      Window_Command.prototype.initialize.call(this, 0, 0);
      this.opacity = 0;
      this.createCommandSprites();
      this.createEscapeBlockSprites();
      this.deactivate();

      this.cursor_x = [50, 50];
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Window_ItemListBack

  Window_ItemListBack.prototype.setItem = function(item) {
    try {
      this.contents.clearRect(0, 0, this.contents.width, 28);
      if (DataManager.isItem(item)) {
        this.contents.bitmapFontColor = null;
        this.contents.drawText(`${LanguageManager.languageData().text.System.terms.basic[14]} : x${$gameParty.battleNumItems(item)}`, 6, 2, 100, 20);
      };
      if (DataManager.isSkill(item)) {
        this.contents.bitmapFontColor = null;
        this.contents.drawText(LanguageManager.languageData().text.System.terms.basic[13] + " :", 6, 2, 100, 20);
        this.contents.drawText(this._actor.skillMpCost(item), 0, 2, 95, 20, 'right');
        this.drawMPIcon(100, 6);
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Window_BattleItem

  Window_BattleItem.prototype.drawItem = function(index) {
    try {
      if (!this.last_category) {
        this.cursor_x = Array(this._data.length);
        for (let i = 0; i < this._data.length; ++i)
          this.cursor_x[i] = (i % 2 == 0 ? 9 : 182);
        this.last_category = this._category;
      }
      var item = this._data[index];
      this.contents.fontSize = 24;
      if (item) {
        var rect = this.itemRect(index);
        rect.width -= this.textPadding();
        rect.width -= 40;
        this.changePaintOpacity(this.isEnabled(item));
        // Get Name
        var name = DataManager.itemShortName(item);
        this.contents.drawText(name, rect.x, rect.y, rect.width, rect.height);
        this.changePaintOpacity(1);
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  Window_BattleItem.prototype.updateHelp = function() {
    try {
      // Super Call
      Window_ItemList.prototype.updateHelp.call(this);
      if (this.last_category !== this._category) {
        this.cursor_x = Array(this._data.length);
        for (let i = 0; i < this._data.length; ++i)
          this.cursor_x[i] = (i % 2 == 0 ? 9 : 182);
        this.last_category = this._category;
      }
      if (this._backWindow) {
        this._backWindow._actor = this._actor;
        this._backWindow.setItem(this.item());
      };
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Window_BattleSkill

  Window_BattleSkill.prototype.initialize = function(x, y, width, height) {
    try {
      // Super Call
      Window_SkillList.prototype.initialize.call(this, x, y + 30, width, 90);
      // Create Back Window
      this._backWindow = new Window_ItemListBack(width, height)
      this.addChildToBack(this._backWindow);
      this.opacity = 0;
      this.hide();

      this.cursor_x = [9, 182, 9, 182];
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  };

  // Window_ScrollingTextSource

  Window_ScrollingTextSource.prototype.standardFontSize = function() {
    return 24;
  };

  // Sprite_EnemyBattlerStatus

  const _refreshBitmap = Sprite_EnemyBattlerStatus.prototype.refreshBitmap;
  Sprite_EnemyBattlerStatus.prototype.refreshBitmap = function(battler) {
    try {
      if (battler) {
        const _name = battler.name;
        battler.name = function() {
          return BEAF.get_enemy_from_name(_name.call(this)).TRANSLATION;
        }
        _refreshBitmap.call(this, battler);
        battler.name = _name;
      }
    } catch (e) {
      chowjs.writeFile("save/crash.txt", chowjs.loadFile("save/crash.txt") + `${e.name} [Battles]: ${e.message}\n${e.stack}\n\n`);
    }
  }
}}
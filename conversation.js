async function conversation() {
  if(!await verifySettings()) {
    return;
  }

  const as_db = await getASData();

  const obcy = getDefaultObcy();

  const def_autoFix_idleCounter = 10;
  const autoFix = {
    firstTry: true,
    reanalyzed: false,
    idleCounter: def_autoFix_idleCounter
  }
  const prefs = await getSettings();
  //pick a name for this conversation
  if(prefs.user.name.length > 0) {
    prefs.user.name = drawRandom(seperateAlternatives(prefs.user.name));
  }

  const convo_timeout = sleep(prefs.convo.timeout * 1000);
  updateOIB(obcy);

  //Greeting
  if (prefs.convo.greeting.length > 0) {
    await sendMessage(prefs.convo.greeting, prefs, obcy);
  }

  const minConvoTime = sleep(5000);

  //Wait for answer, if not received end convo
  if (getConvo().length < 2) {
    if (!await waitForAnswer(15, 0)) {
      await endConvo();
      return;
    };
  }

  if (prefs.convo.verify) {
    //gather info
    let lastInbox = 0;
    let lastConvoLen = 0;
    while (!convoEnded() && (await promiseState(convo_timeout)) === 'pending') {
      const convo = getConvo();
      const inbox = getInboxLength();
      const autoFix_reanalyze = (autoFix.idleCounter == 0 && !autoFix.reanalyzed);

      if (lastInbox < inbox || autoFix_reanalyze) {
        //autoFix
        if(!autoFix_reanalyze) {
          autoFix.idleCounter = def_autoFix_idleCounter;
          autoFix.reanalyzed = false;
        } else {
          lastConvoLen = 0;
          lastInboxLen = 0;
          autoFix.reanalyzed = true;
        }

        //analyze answers
        for (let i = lastConvoLen; i < convo.length; i++) {
          if (!convo[i].received) {
            continue;
          }

          if (isSPAM(convo[i].value, as_db, prefs.antispam.threshold)) {
            obcy.status.spam = true;
            console.log(convo[i].value + ' was recognized as SPAM');
            break;
          }

          await answerQuestions(convo[i].value, prefs, obcy);
          analyzeMessage(convo[i].value, obcy);

          if(obcy.sex === undefined)
            recognizeName(convo[i].value, obcy);
        }
        updateOIB(obcy);

        obcy.status = testObcy(prefs.search, obcy);
        if (!obcy.status.passed) {
          break;
        }

        // ask question
        if (obcy.sex === undefined && obcy.asked.sex === false) {
          let m = drawRandom(seperateAlternatives(prefs.questions.name));
          await sendMessage(m, prefs, obcy);
          obcy.asked.sex = true;
        }
        else if (obcy.age === undefined && obcy.asked.age === false) {
          let m = drawRandom(seperateAlternatives(prefs.questions.age));
          await sendMessage(m, prefs, obcy);
          obcy.asked.age = true;
        }
        else if (obcy.zb === undefined && (prefs.user.zb == 1 || prefs.search.zb == 1) && prefs.search.zb != 0.5 && obcy.asked.zb === false) {
          let m = drawRandom(['zb?', 'z6?', ('zboczon' + (obcy.sex !== undefined ? (obcy.sex ? 'y' : 'a') : 'y/a' + '?'))]);
          await sendMessage(m, prefs, obcy);
          obcy.asked.zb = true;
        }
        else if ((obcy.sex !== undefined && obcy.age !== undefined && (obcy.zb !== undefined || prefs.search.zb == 0.5 || prefs.search.zb == 0)) || !autoFix.firstTry) {
          break;
        }
        else {
          autoFix.firstTry = false;
          obcy.asked.zb = false;
          obcy.asked.age = false;
          obcy.asked.sex = false;
          await waitForAnswer(5, inbox);
          continue;
        }

        lastInbox = inbox;
        lastConvoLen = convo.length;
        await waitForAnswer(10, inbox);
      }
      else {
        --autoFix.idleCounter;
        if(autoFix.reanalyzed && autoFix.idleCounter == 0) {
          break;
        }
        await sleep(1000);
      }
    }

    if(prefs.antispam.feed) {
      let msgs = [];
      const convo = getConvo();
      for(const msg of convo) {
        if(msg.received) {
          msgs.push(msg.value);
        }
      }
      send_messages(msgs);
    }

    if(convoEnded()) {
      return;
    }

    obcy.status = testObcy(prefs.search, obcy);

    if (!obcy.status.passed) {
      let msg = '';
      if(prefs.convo.feedback) {
        if (obcy.status.reason === 'too young')
          msg += 'za mało'
        else if (obcy.status.reason === 'too old')
          msg += 'za dużo'
        else if (obcy.status.reason === 'sex')
          msg += 'nie interesuje mnie ta płeć'
        else if (obcy.status.reason === 'sexual activities') {
          if(prefs.search.zb == 1) {
            msg += 'nie zb mnie nie interesuje'
          }
          else {
            msg += 'nie rozmawiam ze zb'
          }
        }
      }

      await Promise.all([
        minConvoTime,
        msg.length == 0 ? sleep(100) : sendMessage(msg, prefs, obcy)
      ]);
      await endConvo();
      return;
    }

    if (prefs.convo.final_msg.length > 0) {
      await sendMessage(prefs.convo.final_msg, prefs, obcy);
    }

    if (prefs.convo.disconnect == 1) {
      await minConvoTime;
      await endConvo();
    }
  }
  
  if (!convoEnded()) {
    playNotif();
  }
}
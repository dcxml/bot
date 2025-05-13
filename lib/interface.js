async function sendMessage(text, prefs, obcy) {
  const reaction = sleep(prefs.convo.reaction_time);
  const lastMsg = getLastMessage();
  const txtarea = document.getElementById('box-interface-input');
  const sendbtn = isMobile() ? document.querySelector('img[alt="Wyślij"]').parentElement : document.querySelector('button.o-send');

  if(lastMsg !== undefined) {
    if(!lastMsg.received && lastMsg.value == text) {
      return;
    }
  }

  text = translateMsg(text, prefs.user, obcy);

  if(/^ *$/.test(text)) {
    return;
  }

  await reaction;

  if(prefs.convo.typing_delay > 0) {
    for(let i = 1; i <= text.length; ++i) {
      if(convoEnded())
        return;
      txtarea.value = text.substring(0, i);
      await sleep(prefs.convo.typing_delay);
    }
  }
  
  txtarea.value = text;
  await sleep(prefs.convo.typing_delay);
  if(text.length == 0 || txtarea.value.length == 0) {
    return;
  }
  sendbtn.click();
  await sleep(prefs.convo.typing_delay);

  if(messageDuplicate()) {
    await hitCancelButton();
  }
}

async function hitNextButton() {
  if(isMobile()) {
    const btn1 = document.querySelector('img[alt="Rozłącz się"]').parentElement;
    const btn2 = document.querySelectorAll('div.sd-interface.unselectable>button')[0];
    const btn3 = document.querySelector('button.o-new-talk.enabled');
    const btn3_available = btn3 === null ? false : btn3.parentNode.parentNode.computedStyleMap().get('display').value != 'none';

    if(btn3_available) {
      btn3.click();
    }
    else if(btn2 !== undefined) {
      btn2.click();
    }
    else if(!btn1.classList.contains('disabled')) {
      btn1.click();
    }
    
  }
  else {
    const btn = document.querySelector('button.o-esc');
    if(!btn.classList.contains('disabled')) {
      btn.click();
    } 
  }
}

async function hitConfirmButton() {
  const btn = document.querySelectorAll('div.sd-interface.unselectable>button')[1];
  btn.click();
}

async function hitCancelButton() {
  const btn = document.querySelectorAll('div#sd-current>div.sd-unit>div.sd-interface.unselectable>button')[1];
  btn.click();
}
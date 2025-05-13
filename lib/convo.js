function getConvo() {
  const raw = document.querySelectorAll('p.log-msg');
  const parsed = [];
  for(const msg of raw) {
    const text_simple = msg.querySelector('span.log-msg-text');
    const text_long = msg.querySelector('span.log-msg-full');
    const received = msg.querySelector('span.nick').innerText === 'Obcy:';
    const text = (text_simple === null ? text_long : text_simple).innerText;
    const parsedtxt = text.toLowerCase();
    if(parsedtxt === null)
      continue;
    parsed.push({
      received: received,
      value: parsedtxt,
      rawValue: text
    });
  }
  return parsed;
}

function getLastMessage() {
  const convo = getConvo();
  return convo[convo.length - 1];
}

function getConvoLength() {
  return document.querySelectorAll('p.log-msg').length;
}

function getInboxLength() {
  const t = document.querySelectorAll('span.nick');
  const textObcy = 'Obcy';
  let counter = 0;
  for(const m of t ) {
    counter += m.innerText.includes(textObcy);
  }
  return counter;
}

async function waitForAnswer(time, convoLen=getInboxLength()) {
  let passed = 0;
  while (getInboxLength() === convoLen) {
    await sleep(1000);
    passed++;

    if (passed > time || convoEnded()) {
      return false;
    }
  }
  return true;
}


async function endConvo() {
  if(!convoEnded()) {
    await sleep(100);
    await hitNextButton();
  }
}
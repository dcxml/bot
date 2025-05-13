async function send_captcha(captcha, solution=null, attempt=0) {
    if(attempt == 5) {
      return;
    }
    try {
        const url = "https://6bot.chaueq.com/api/ml/" + (solution === null ? 'unsolved' : 'solved');
        const response = await fetch(url, {
        method: "POST",
        headers: {
          'Accept': '*',
          'Content-Type': 'text/csv',
          'X-Apikey': 'Ir6thu0fi8feiZoy5hein6eoPeimeetae4ceiquaelaeshe6zei9johzu1VaNg9j'
        },
        body: (solution === null ? captcha : (captcha + '|' + solution))
      });
      if(!response.ok) {
        console.log(response);
      }
    }
    catch (e) {
      await sleep(1000);
      await send_captcha(captcha, solution, attempt+1);
    }
}

async function commitCaptchaFindings() {
  if((await getSettings()).captcha.feed_ml) {
    const history = getCaptchaHistory();
    if(history.length == 0) {
      return;
    }
    const solution = history[history.length-1];
    const captcha = document.getElementById('last_captcha').value;
    const known = document.getElementById('known_captchas').value.split('|').filter((x) => x.length > 0);
    for(c of known) {
        if(c == captcha) {
            // send_captcha(c, solution);
            continue;
        }
        send_captcha(c);
    }
  }
  
  const to_reset = [document.getElementById('known_captchas'), document.getElementById('last_captcha')];
  for(const obj of to_reset) {
      if(obj != null && obj != undefined)
          obj.value = '';
  }
}

async function send_messages(msgs, attempt=0) {
  if(attempt == 5) {
    return;
  }
  try {
      const url = "https://6bot-as.chaueq.com/api/messages";
      const response = await fetch(url, {
      method: "POST",
      headers: {
        'Accept': '*',
        'Content-Type': 'text/csv',
        'X-Apikey': 'Ir6thu0fi8feiZoy5hein6eoPeimeetae4ceiquaelaeshe6zei9johzu1VaNg9j'
      },
      body: msgs.join('\n')
    });
    if(!response.ok) {
      console.log(response);
    }
  }
  catch (e) {
    await sleep(1000);
    await send_messages(msgs, attempt+1);
  }
}
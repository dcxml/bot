if(getApiKey() === null) {
    document.getElementById('access').classList.remove('hidden');
}
else {
    getNewCaptcha();
}

document.getElementById('solution').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        const img = document.getElementById('image').style.backgroundImage.split('(')[1].split(')')[0].replaceAll('"', '');
        if(img.length > 0) {
            const solution = document.getElementById('solution').value;
            if(solution.length == 7) {
                send_result(img, solution.toLowerCase()).then(getNewCaptcha);
            }
        }
    }
});

document.getElementById('apikey').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        const key = document.getElementById('apikey').value;
        if(key.length > 0) {
            localStorage.setItem('apikey', key);
            document.getElementById('access').classList.add('hidden');
            getNewCaptcha();
        }
    }
});

function getApiKey() {
    return 'Ir6thu0fi8feiZoy5hein6eoPeimeetae4ceiquaelaeshe6zei9johzu1VaNg9j';
}

async function getNewCaptcha() {
    const response = await fetch("https://6bot.chaueq.com/api/ml/unsolved", {
        method: "GET",
        headers: {
          'Accept': '*',
          'Content-Type': 'text/csv',
          'X-Apikey': getApiKey()
        }
    });
    if(response.status === 200) {
        const ua = updateAmount();
        document.getElementById('image').style.backgroundImage = 'url(' + await response.text() + ')';
        document.getElementById('solution').value = '';
        document.getElementById('solution').focus();
        await ua;
    }
    else if(response.status === 401 || response.status === 403) {
        document.getElementById('access').classList.remove('hidden');
    }
    else if(response.status === 204) {
        const e = document.getElementById('image');
        e.style.backgroundImage = '';
        e.innerText = 'All captchas solved\ncome back later';
    }
}

async function send_result(captcha, solution, attempt=0) {
    if(attempt == 5) {
      return;
    }
    try {
      const response = await fetch("https://6bot.chaueq.com/api/ml/solved", {
        // mode: 'no-cors',
        method: "POST",
        headers: {
          'Accept': '*',
          'Content-Type': 'text/csv',
          'X-Apikey': getApiKey()
        },
        body: captcha + '|' + solution
      });
      if(!response.ok) {
        console.log(response);
      }
    }
    catch (e) {
      await sleep(1000);
      await send_result(captcha, solution, attempt+1);
    }
}

async function updateAmount() {
    const response = await fetch("https://6bot.chaueq.com/api/ml/unsolved/amount", {
        method: "GET",
        headers: {
          'Accept': '*',
          'Content-Type': 'text/csv',
          'X-Apikey': getApiKey()
        }
    });
    if(response.ok) {
        const text = await response.text();
        document.getElementById('amount').innerText = text;
    }
}
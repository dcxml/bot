async function captchaInputWatcher(init=true) {
    const txt = document.querySelector('input.caper-solution-input[type="text"]');

    if(txt !== null) {
        if(init) {
            txt.value = '';
            txt.focus();
        }
    
        if(txt.value.length == 7) {
            hitConfirmButton();
            setTimeout(captchaInputWatcher, 1000, true);
        }
        else {
            setTimeout(captchaInputWatcher, 100, false);
        }
    }
    else {
        setTimeout(captchaInputWatcher, 200, true);
    }
}
function captchaError() {
    try {
        return document.querySelector('div.caper-wrong-field').checkVisibility() || document.querySelector('div.caper-slowdown-field').checkVisibility();
    } catch(e) {return false}
}
function captchaAppeared() {
  const captchaText = '🤖 Captcha';
  try {
    const text = document.querySelector('div.caper-title-field').innerText;
    return (captchaText === text)
  }
  catch(e){
    return false;
  }
}

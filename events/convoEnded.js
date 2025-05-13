function convoEnded() {
  if(isMobile()) {
    const btn1 = document.querySelector('img[alt="Rozłącz się"]').parentElement;
    const btn2 = document.querySelectorAll('div.sd-interface.unselectable>button')[0];
    const btn3 = document.querySelector('button.o-new-talk.enabled');
    const btn3_available = btn3 === null ? false : btn3.parentNode.parentNode.computedStyleMap().get('display').value != 'none';
    return btn1.classList.contains('disabled') || btn2 !== undefined || btn3_available; 
  }
  else {
    const pauseText = "Rozłącz się\nESC";
    const btn = document.querySelector('button.o-esc');

    return (pauseText != btn.innerText)
  }
}

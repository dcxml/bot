function messageDuplicate() {
  const alertText = 'Wiadomość się powtarza. Wysłać wiadomość?';
  try {
    const text = document.querySelector('div#sd-current>div.sd-unit>div.sd-message').innerText
    return (alertText === text)
  }
  catch(e){
    return false;
  }
}
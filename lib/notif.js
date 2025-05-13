function playNotif() {
  const notifAudio = new Audio(chrome.runtime.getURL('media/notif.mp3'));
  notifAudio.loop = false;
  notifAudio.play();
}

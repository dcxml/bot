document.getElementById('ver').innerText = 'v ' + chrome.runtime.getManifest().version;

const links = [
    chrome.runtime.getURL('history/history.html'),
    chrome.runtime.getURL('settings/settings.html'),
    'https://discord.gg/8F3RnX7bjm',
    'https://chrome.google.com/webstore/detail/6bot/nnckhobpojcmpdakklaondphkgceadnm',
    chrome.runtime.getURL('faq/faq.html'),
    chrome.runtime.getURL('help/help.html'),
    chrome.runtime.getURL('captcha/solver.html')
];
const buttons = document.getElementsByClassName('btn');

for(let i = 0; i < links.length; ++i) {
    buttons[i].addEventListener('click', (e) => {
        window.open(links[i], '_blank');
    });
}
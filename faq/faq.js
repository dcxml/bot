const headers = document.querySelectorAll('div.sectionHeader');
const inputs = document.querySelectorAll('div.setting>div.settingContent>input');

for(const h of headers) {
    h.addEventListener('click', (e) => {
        const hdr = e.target;
        const cnt = hdr.parentElement.querySelector('div.sectionContent');

        if(hdr.classList.contains('active')) {
            hdr.classList.remove('active');
            cnt.classList.remove('active');
        }
        else {
            hdr.classList.add('active');
            cnt.classList.add('active');
        }
    });
}
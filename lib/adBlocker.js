function removeAds() {
    if(isMobile()) {
        const ad = document.getElementById('da-sns-bttm-da');
        ad.remove();
    }
    else {
        const ads = document.querySelectorAll('div.szobcy-da');
        for(ad of ads) {
            ad.parentNode.removeChild(ad);
        }
    }
}
function aads() {
    let ad = document.createElement('iframe');
    ad.setAttribute('data-aa', 2114030);
    ad.setAttribute('id', '6bot_ad');
    ad.setAttribute('src', '//ad.a-ads.com/2114030?size=320x50&background_color=182e44&text_color=eeeeee&title_color=dcb000&title_hover_color=dcb000&link_color=eeeeee&link_hover_color=dcb000');
    ad.setAttribute('style', 'width:320px; height:50px; border:0px; padding:0; overflow:hidden; background-color: transparent;');
    return ad;
}

function chaueq_ads() {
    let ad = document.createElement('iframe');
    ad.setAttribute('id', '6bot_ad');
    ad.setAttribute('src', 'https://ads.chaueq.com/banner/?aa=2114030&type=ad');
    ad.setAttribute('style', 'width:320px; height:50px; border:0px; padding:0; overflow:hidden; background-color: transparent; pointer-events: all !important;');
    return ad;
}

function insertAd() {
    document.querySelector('div.sd-message').appendChild(chaueq_ads());
}

function adMain() {
    const delay = 100;
    if(captchaAppeared()) {
        const ad = document.getElementById('6bot_ad');
        if(ad == null) {
            insertAd();
        }
    }
    setTimeout(adMain, delay);
}

async function adVerify() {
    let ad;
    while(ad == null || ad == undefined) {
        await sleep(100);
        ad = document.getElementById('6bot_ad');
    }
    for(let i = 0; i < 50; ++i) {
        if(ad.checkVisibility()) {
            return true;
        }
        await sleep(100);
    }
    window.alert('Disable your adblock to use 6bot!');
    return false;
}
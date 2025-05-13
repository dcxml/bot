async function uxOnOpen() {
    try {
        const metrics = await getData('ux');
    }
    catch(e) {
        await setData('ux', {
            rating: {
                accepted: false,
                last_asked: 0
            }
        });
    }

    feedbackQuestionWatcher();
}


async function feedbackQuestionAsk() {
    const prefs = await getData('prefs');
    if(prefs.user.name.length > 0) {
        prefs.user.name = drawRandom(seperateAlternatives(prefs.user.name));
    }

    const shadow = document.createElement('div');
    shadow.style = `
        background-color: #00000080;
        z-index: 1001;
        width: 100vw;
        height: 100vh;
        position: absolute;
        left: 0;
        top: 0;
    `;

    const popup = document.createElement('div');
    popup.style = `
        width: 40vw;
        height: 40vh;
        background: #404040;
        position: absolute;
        left: 30vw;
        top: 30vh;
        z-index: 1002;
        border: white 1px solid;
        text-align: justify;
        font-size: 5vh;
    `;
    
    const text = document.createElement('div');
    text.style = `
        width: 100%;
        height: 70%;
        margin: 1vmax;
    `;
    text.innerText = translateMsg("Hej" + (prefs.user.name.length > 0 ? ' $i' : '') + ", tu 6bot!\nCzy " + (prefs.user.sex == 1 ? 'mógłbyś' : 'mogłabyś') + ' ocenić jak działam?', prefs.user);

    const confirm = document.createElement('div');
    confirm.style = `
        width: 49%;
        height: 10%;
        float: left;
        text-align: center;
        cursor: pointer;
        user-select: none;
        color: #a0f0a0;
    `;
    confirm.innerText = 'Jasne!'
    confirm.addEventListener('click', async (e) => {
        const ux = await getData('ux');
        ux.rating.accepted = true;
        e.target.parentNode.parentNode.remove();
        window.open('https://chrome.google.com/webstore/detail/6bot/nnckhobpojcmpdakklaondphkgceadnm', '_blank');
        setData('ux', ux);
    });
    const later = document.createElement('div');
    later.style = `
        width: 49%;
        height: 10%;
        float: right;
        text-align: center;
        cursor: pointer;
        color: #f0a0a0;
        user-select: none;
    `;
    later.innerText = 'Nie teraz';
    later.addEventListener('click', (e) => {
        e.target.parentNode.parentNode.remove();
        feedbackQuestionWatcher();
    });

    popup.appendChild(text);
    popup.appendChild(confirm);
    popup.appendChild(later);
    
    shadow.appendChild(popup);

    document.body.appendChild(shadow);
}

async function feedbackQuestionWatcher() {
    const metrics = await getData('metrics');
    const ux = await getData('ux');
    
    if(!ux.rating.accepted) {
        if(metrics.minutes_counter > 60) {
            const t = Date.now();
            if(ux.rating.last_asked + 259200000 < t) {
                ux.rating.last_asked = t;
                setData('ux', ux).then(feedbackQuestionAsk);
            }
            else {
                setTimeout(feedbackQuestionWatcher, (ux.rating.last_asked + 259200000 - t));
            }
        }
        else {
            setTimeout(feedbackQuestionWatcher, (61-metrics.minutes_counter)*60000);
        }
    }
}
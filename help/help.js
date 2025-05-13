function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function nextStage() {
    const stages = document.querySelectorAll('div.stage');
    let active = null;
    for(let i = 0; i < stages.length; ++i) {
        if(stages[i].classList.contains('active_pt1')) {
            active = i;
            break;
        }
    }

    if(active !== null) {
        stages[active].classList.remove('active_pt2');
        await sleep(1000);
        stages[active].classList.remove('active_pt1');
    }

    active = active === null ? 0 : active+1;
    if(active < stages.length) {
        stages[active].classList.add('active_pt1');
        await sleep(1000);
        stages[active].classList.add('active_pt2');
        await sleep(1000);
    }
}

async function setProgress(p) {
    document.querySelector('div.progress>div').style.width = p + '%';

    if(p == 100) {
        await sleep(1500);
        nextStage();
    }
}

//init
window.addEventListener('load', async () => {
    sleep(1000).then(nextStage)

    //stage1
    document.querySelector('.st1_yes').addEventListener('click', nextStage);
    document.querySelector('.st1_no').addEventListener('click', () => {
        window.location.href = chrome.runtime.getURL('faq/faq.html');
    });

    //next
    const nexts = document.querySelectorAll('.next');
    for(const n of nexts) {
        n.addEventListener('click', nextStage);
    }

    document.getElementById('start').addEventListener('click', async () => {
        await sleep(3000);
        
        //preparations
        const ticket = {
            timestamp: Date.now(),
            version: chrome.runtime.getManifest().version,
            userAgent: window.navigator.userAgent,
            description: '',
            settings: null,
            history: {
                index: null,
                content: {}
            },
            antispam: {
                data: null,
                stamp: null
            },
            captcha: {
                data: null,
                stamp: null
            }
        };
        const optionals = document.querySelectorAll('input[type="checkbox"]');
        
        setProgress(17);

        //insert description
        ticket.description = document.querySelector('textarea.description').value;
        
        setProgress(33);

        //insert settings
        if(optionals[0].checked) {
            ticket.settings = await getSettings();
        }

        setProgress(50);

        //insert history
        if(optionals[1].checked) {
            ticket.history.index = await getHistoryIndex();
            let saved = 0;
            const total = ticket.history.index.permanent.length + ticket.history.index.temporary.length;
            for(const p of ticket.history.index.permanent) {
                ticket.history.content[p.timestamp] = await getData('conversation_'+p.timestamp);
                saved += 1;
                setProgress(50 + (17 * (saved/total)));
            }
            for(const t of ticket.history.index.temporary) {
                ticket.history.content[t.timestamp] = await getData('conversation_'+t.timestamp);
                saved += 1;
                setProgress(50 + (17 * (saved/total)));
            }
        }

        setProgress(67);

        //insert antispam and captcha
        try {
            ticket.antispam.data = await getASData();
            ticket.antispam.stamp = await getData('as_stamp');
        }
        catch (e) {}
        try {
            ticket.captcha.data = await getData('captcha_model');
            ticket.captcha.stamp = await getData('captcha_stamp');
        }
        catch (e) {}

        setProgress(83);

        //encrypt & prepare download
        const json = JSON.stringify(ticket);
        const pgp_msg = await pgp_enc(json);

        const download = document.getElementById('download');
        download.setAttribute('href', 'data:application/pgp-encrypted;charset=utf-8,' + encodeURIComponent(pgp_msg));
        download.setAttribute('download', '6bot_problem_'+ticket.timestamp+'.asc');

        await setProgress(100);

        //try auto-download
        download.click();
    })
});


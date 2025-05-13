async function saveSettings() {
    const settings = {
        user: {
            sex: document.getElementById('u_sex').value,
            age: document.getElementById('u_age').value,
            zb: document.getElementById('u_zb').value,
            name: document.getElementById('u_name').value
        },
        search: {
            sex: document.getElementById('o_sex').value,
            age: {
                min: document.getElementById('o_age_min').value,
                max: document.getElementById('o_age_max').value
            },
            zb: document.getElementById('o_zb').value
        },
        convo: {
            greeting: document.getElementById('c_greeting').value,
            final_msg: document.getElementById('c_final').value,
            verify: document.getElementById('c_verify').value == "1",
            disconnect: document.getElementById('c_disconnect').value == "1",
            feedback: document.getElementById('c_feedback').value == "1",
            typing_delay: document.getElementById('c_delay').value,
            reaction_time: document.getElementById('c_reactionTime').value,
            timeout: document.getElementById('c_timeout').value
        },
        captcha: {
            tries_limit: document.getElementById('captcha_tries').value,
            use_ml: document.getElementById('captcha_use_ml').value == "1",
            model: document.getElementById('captcha_ml_model').value == "1",
            feed_ml: document.getElementById('captcha_feed_ml').value == "1"
        },
        history: {
            min_length: document.getElementById('history_min_length').value,
            max_amount: document.getElementById('history_max_amount').value,
            max_duration: document.getElementById('history_max_duration').value,
        },
        antispam: {
            threshold: document.getElementById('as_threshold').value,
            feed: document.getElementById('as_feed').value == "1"
        },
        questions: {
            name: document.getElementById('q_name').value,
            age: document.getElementById('q_age').value
        }
    }
    await setData('prefs', settings);
    await setData('captcha_stamp', 0);
    sendMessageToBackground(5, undefined);
}

async function getSettings() {
    const def = {
        user: {
            sex: 0,
            age: 18,
            zb: true,
            name: ''
        },
        search: {
            sex: 0.5,
            age: {
                min: 18,
                max: 100
            },
            zb: 0.5
        },
        convo: {
            greeting: 'Hejka $| Hejo $| Siemka $| Witam $| Doberek $| Elo $| $p $| $*',
            final_msg: '',
            verify: true,
            disconnect: false,
            feedback: false,
            typing_delay: 50,
            reaction_time: 1000,
            timeout: 60
        },
        captcha: {
            tries_limit: 3,
            use_ml: true,
            model: false,
            feed_ml: true
        },
        history: {
            min_length: 3,
            max_amount: 1000,
            max_duration: 7
        },
        antispam: {
            threshold: 0.8,
            feed: true
        },
        questions: {
            name: 'km $| km?',
            age: 'ile lat $| ile lat? $| wiek $| wiek? $| lat $| lat? $| jaki wiek $| jaki wiek?'
        }
    };
    try {
        const data = await getData('prefs');
        for(const section in def) {
            if(data[section] === undefined) {
                data[section] = def[section];
                continue;
            }
            for(const property in def[section]) {
                if(data[section][property] === undefined) {
                    data[section][property] = def[section][property];
                }
            }
        }
        return data;
    }
    catch(e) {
        return def;
    }
}

async function verifySettings() {
    const as_db = await getASData();
    const s = await getSettings();
    let verdict = true;
    
    if(parseInt(s.search.age.max) < parseInt(s.search.age.min))
        verdict = false;
    else if(s.convo.timeout < 5)
        verdict = false;
    else if(isSPAM(s.convo.greeting, as_db))
        verdict = false;
    else if(isSPAM(s.convo.final_msg, as_db))
        verdict = false;
    else if(isSPAM(s.user.name, as_db))
        verdict = false;
    
    if(!verdict) {
        window.alert('Twoje ustawienia 6bot są nieprawidłowe!\nPopraw je aby używać 6bota.')
    }
    
    return verdict;
}
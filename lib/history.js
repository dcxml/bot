async function recordConvo() {
    const convo = {
        name: null,
        timestamp: Date.now(),
        end_time: null,
        messages: [],
        preview: ''
    }

    let final_check_left = true;

    while(final_check_left) {
        if(convoEnded()) {
            final_check_left = false;
        }

        const latest = getConvo();

        const diff = latest.length - convo.messages.length;
        
        for(let i = 0; i < diff; ++i) {
            const id = convo.messages.length;
            convo.messages.push({
                received: latest[id].received,
                value: latest[id].rawValue,
                time: Date.now()
            });
        }

        if(final_check_left) {
            await sleep(100);
        }
    }

    convo.end_time = Date.now();

    for(let i = 0; i < 5 && i < convo.messages.length; ++i) {
        convo.preview += (convo.messages[i].received ? 'Obcy: ' : 'Ty: ');
        convo.preview += convo.messages[i].value;
        if(i < 4 || convo.messages.length > 5)
            convo.preview += '\n';
    }
    if(convo.messages.length > 5)
        convo.preview += '...'

    saveConvo(convo);
}

async function saveConvo(convo) {
    const prefs = await getSettings();
    if(convo.messages.length < prefs.history.min_length || prefs.history.max_duration === 0 || prefs.history.max_amount === 0) {
        return;
    }
    sendMessageToBackground(1, convo);
}

async function getHistoryIndex() {
    try {
        const index = await getData('history_index');
        return index;
    }
    catch(e) {
        return {
            permanent: [],
            temporary: []
        };
    }
}
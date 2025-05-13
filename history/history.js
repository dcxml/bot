getHistoryIndex().then((index) => {
    for(let i = 0; i < index.permanent.length; ++i) {
        appendRecord(index.permanent[i], true);
    }
    for(let i = index.temporary.length-1; i >= 0; --i) {
        appendRecord(index.temporary[i]);
    }
})

function formatTimestamp(stamp) {
    const d = new Date(stamp);
    return d.toLocaleString('pl-PL');
}

function timeDiff(start, end) {
    let diff = Math.floor(Math.abs(end - start)/1000);
    let h = Math.floor(diff / 60 / 60);
    diff -= h * 60 * 60;
    let m = Math.floor(diff / 60);
    diff -= m * 60;
    let s = Math.floor(diff);
    diff -= s;

    if(h < 10) h = '0' + h;
    if(m < 10) m = '0' + m;
    if(s < 10) s = '0' + s;

    return h + ':' + m + ':' + s;
}

function spawnNamePopup(convo_stamp, permanent, suggested_name) {
    return function() {
        let popup = document.createElement('div');
        popup.classList.add('popup');
        popup.setAttribute('convo_stamp', convo_stamp);
        popup.setAttribute('arch_permanent', permanent);

            const text = document.createElement('div');
            text.classList.add('popup_text');
            text.innerText = 'Nazwa rozmowy'

            let input = document.createElement('input');
            input.classList.add('popup_name');
            input.value = suggested_name;

            let cancel = document.createElement('div');
            cancel.classList.add('btn', 'popup_cancel');
            cancel.innerText = 'Anuluj';

            let submit = document.createElement('div');
            submit.classList.add('btn', 'popup_submit');
            submit.innerText = 'Zapisz';

            popup.appendChild(text);
            popup.appendChild(input);
            popup.appendChild(cancel);
            popup.appendChild(submit);
        
        popup = document.body.appendChild(popup);
        input = popup.querySelector('input.popup_name');
        input.focus();
        cancel = popup.querySelector('div.popup_cancel');
        submit = popup.querySelector('div.popup_submit');

        cancel.addEventListener('click', (e) => {
            e.target.parentElement.remove();
        });

        submit.addEventListener('click', async (e) => {
            const popup = e.target.parentElement;
            const stamp = popup.getAttribute('convo_stamp');
            const permanent = popup.getAttribute('arch_permanent') == 'true';
            const convo = await (async (stamp) => {
                const index = await getHistoryIndex();
                for(const convo of index.temporary) {
                    if(convo.timestamp == stamp) {
                        return convo;
                    }
                }
                for(const convo of index.permanent) {
                    if(convo.timestamp == stamp) {
                        return convo;
                    }
                }
            })(stamp);
            Object.assign(convo, {name: popup.querySelector('input.popup_name').value});

            sendMessageToBackground(permanent === true ? 4 : 3, {
                stamp,
                name: convo.name
            });

            if(permanent === true) {
                document.getElementById('conversation_' + stamp).querySelector('div.rec_name').innerText = convo.name;
            }
            else {
                document.getElementById('conversation_' + stamp).remove();
                appendRecord(convo, true);
            }

            popup.remove();
        });
    }
}

function appendRecord(convo, permanent=false) {
    let record = document.createElement('div');
    record.classList.add('record');
    record.setAttribute('id', 'conversation_' + convo.timestamp);

        const name = document.createElement('div');
        name.classList.add('rec_cell', 'rec_name');
        name.innerText = convo.name !== null ? convo.name : formatTimestamp(convo.timestamp);
        name.title = convo.preview;

        const time = document.createElement('div');
        time.classList.add('rec_cell', 'rec_time');
        time.innerText = timeDiff(convo.timestamp, convo.end_time);
        time.title = formatTimestamp(convo.timestamp) + '\n' + formatTimestamp(convo.end_time);

        const msgs = document.createElement('div');
        msgs.classList.add('rec_cell', 'rec_msgs');
        msgs.innerText = convo.msg_count;

        let acts = document.createElement('div');
        acts.classList.add('rec_cell', 'rec_acts');

            const view = document.createElement('div');
            view.classList.add('rec_act');
            view.innerText = '👁️';

            const modify = document.createElement('div');
            modify.classList.add('rec_act');
            modify.innerText = permanent ? '📝' : '⭐';

            const remove = document.createElement('div');
            remove.classList.add('rec_act');
            remove.innerText = '🗑️';

            acts.appendChild(view);
            acts.appendChild(modify);
            acts.appendChild(remove);

        record.appendChild(name);
        record.appendChild(time);
        record.appendChild(msgs);
        record.appendChild(acts);
    
    record = document.getElementById('arch_' + (permanent ? 'permanent' : 'temporary')).appendChild(record);
    acts = record.querySelectorAll('div.rec_act');
    acts[0].addEventListener('click', (e) => {
        const stamp = e.target.parentElement.parentElement.id.split('_')[1];
        window.open(chrome.runtime.getURL('/history/convo.html?stamp=' + stamp), '_blank');
    });
    acts[1].addEventListener('click', spawnNamePopup(
        convo.timestamp,
        permanent,
        convo.name !== null ? convo.name : formatTimestamp(convo.timestamp)
    ));
    acts[2].addEventListener('click', (e) => {
        const record = e.target.parentElement.parentElement;
        const stamp = record.id.split('_')[1];
        sendMessageToBackground(2, stamp);
        record.remove();
    });
}
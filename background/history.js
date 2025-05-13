async function addToHistory(convo) {
    const prefs = (await getSettings()).history;
    const indexes = await getHistoryIndex();
    indexes.temporary.push({
        name: convo.name,
        timestamp: convo.timestamp,
        end_time: convo.end_time,
        preview: convo.preview,
        msg_count: convo.messages.length
    });

    indexes.temporary = await filterByAmount(indexes.temporary, prefs.max_amount);
    
    await Promise.all([
        setData('history_index', indexes),
        setData('conversation_' + convo.timestamp, convo)
    ]);
}

async function removeFromHistory(convo_stamp) {
    const indexes = await getHistoryIndex();
    let found = false
    for(let i = 0; i < indexes.permanent.length; ++i) {
        if(convo_stamp == indexes.permanent[i].timestamp) {
            indexes.permanent.splice(i, 1);
            found = true;
            break;
        }
    }
    if(!found) {
        for(let i = 0; i < indexes.temporary.length; ++i) {
            if(convo_stamp == indexes.temporary[i].timestamp) {
                indexes.temporary.splice(i, 1);
                found = true;
                break;
            }
        }
    }
    await Promise.all([
        setData('history_index', indexes),
        delData('conversation_' + convo_stamp)
    ]);
}

async function filterByAmount(index, treshold) {
    if(index.length > treshold) {
        for (const c of index.splice(0, index.length - treshold)) {
            await delData('conversation_' + c.timestamp);
        }
    }
    return index
}

async function filterHistory() {
    const prefs = (await getSettings()).history;
    const indexes = await getHistoryIndex();
    const treshold = Date.now() - (prefs.max_duration * 86400000);
    indexes.temporary = await filterByAmount(indexes.temporary, prefs.max_amount);

    let i = 0;
    for(; i < indexes.temporary.length; ++i) {
        if(indexes.temporary[i].end_time >= treshold) {
            break;
        }
    }

    const deletions = [];
    for (const c of indexes.temporary.splice(0, i)) {
        deletions.push(delData('conversation_' + c.timestamp));
    }
    
    await Promise.all([
        Promise.all(deletions),
        setData('history_index', indexes)
    ]);
}

async function transferToPermanent(convo_stamp, name) {
    const indexes = await getHistoryIndex();
    for(let i = 0; i < indexes.temporary.length; ++i) {
        if(indexes.temporary[i].timestamp == convo_stamp) {
            indexes.temporary[i].name = name;
            indexes.permanent.push(indexes.temporary[i]);
            indexes.temporary.splice(i, 1);
        }
    }
    setData('history_index', indexes); 
}

async function renameConversationInHistory(convo_stamp, name) {
    const indexes = await getHistoryIndex();
    for(let i = 0; i < indexes.permanent.length; ++i) {
        if(indexes.permanent[i].timestamp == convo_stamp) {
            indexes.permanent[i].name = name;
        }
    }
    setData('history_index', indexes); 
}
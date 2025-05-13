const query = window.location.search.substring(1);
const stamp = query.split('=')[1];

function formatTimestamp(stamp) {
    const d = new Date(stamp);
    return d.toLocaleTimeString('pl-PL');
}

getData('conversation_'+stamp).then((convo) => {
    for(const msg of convo.messages) {
        const box = document.createElement('div');
        box.classList.add('msg', msg.received ? 'obcy' : 'ty');
        box.innerText = msg.value;
        box.title = formatTimestamp(msg.time);
        document.getElementById('chatbox').appendChild(box);
    }
});
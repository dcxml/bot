function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function tipsyRemove() {
    const objs = document.querySelectorAll('div.tipsy.unselectable.tipsy-n');
    for(const o of objs) {
        o.parentNode.removeChild(o);
    }
    setTimeout(tipsyRemove, 100);
}

function promiseState(p) {
    const t = {};
    return Promise.race([p, t])
      .then(v => (v === t)? "pending" : "fulfilled", () => "rejected");
}
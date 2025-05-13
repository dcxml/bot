async function lockBg() {
    await bgUnlocked();
    await setData('bg_lock', true);
}

function unlockBg() {
    return setData('bg_lock', false);
}

async function isBgLocked() {
    try {
        return await getData('bg_lock');
    } catch(e) {
        return false;
    }
}

async function bgUnlocked() {
    while(await isBgLocked()) {
        await sleep(100);
    }
}
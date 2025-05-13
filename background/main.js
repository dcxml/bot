importScripts(
    '/lib/data.js',
    '/lib/settings.js',
    '/lib/history.js',
    '/lib/workarounds.js',
    '/lib/model.js',
    './history.js',
    './lock.js',
    './updates.js'
);

as_updater();
captcha_updater();

unlockBg().then(lockBg).then(filterHistory).then(unlockBg);
const historyWatcher = setInterval(
    async () => {
        await lockBg();
        await filterHistory();
        await unlockBg();
    }, 
    3600000
);
// const activityWatcher = setInterval(isBgLocked, 15000);

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    await lockBg();
    if(msg.type === 1) {
        await addToHistory(msg.content);
    }
    else if(msg.type === 2) {
        await removeFromHistory(msg.content);
    }
    else if(msg.type === 3) {
        await transferToPermanent(msg.content.stamp, msg.content.name);
    }
    else if(msg.type === 4) {
        await renameConversationInHistory(msg.content.stamp, msg.content.name);
    }
    else if(msg.type === 5) {
        await filterHistory();
    }
    await unlockBg();
});
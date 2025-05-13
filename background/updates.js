async function as_updater() {
    try {
        const stamp = await getData('as_stamp');
        if (Date.now() >= (stamp + 3600000)) { //1 hour
            try {
                const response = await fetch("https://6bot-as.chaueq.com/api/static");
                const data = await response.json();
                await setData('as_data', data);
                await setData('as_stamp', Date.now());
            }
            catch(e) {
                console.log(e);
            }
        }
    }
    catch(e) {
        await setData('as_stamp', 0);
        setTimeout(as_updater, 900000); //15 minutes
        return;
    }

    setTimeout(as_updater, 20000); //20 seconds
}

async function captcha_updater() {
    try {
        const stamp = await getData('captcha_stamp');
        if (Date.now() >= (stamp + 3600000)) { //1 hour
            try {
                const model = (await getSettings()).captcha.model ? 'ml' : 'darwin'
                const response = await fetch("https://6bot.chaueq.com/api/" + model + "/model", {
                    method: "GET",
                    headers: {
                        'Accept': '*',
                        'Content-Type': 'text/csv'
                    },
                });
                const data = parseModel(await response.text());
                await setData('captcha_model', data);
                await setData('captcha_stamp', Date.now());
            }
            catch(e) {
                console.log(e);
            }
        }
    }
    catch(e) {
        await setData('captcha_stamp', 0);
        setTimeout(captcha_updater, 900000); //15 minutes
        return;
    }

    setTimeout(captcha_updater, 20000); //20 seconds
}
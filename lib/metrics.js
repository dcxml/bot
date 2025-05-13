async function metricsOnOpen() {
    try {
        const metrics = await getData('metrics');
    }
    catch(e) {
        setData('metrics', {
            minutes_counter: 0
        });
    }
}

async function timeCounter() {
    const metrics = await getData('metrics');
    metrics.minutes_counter += 1;
    setData('metrics', metrics);
}
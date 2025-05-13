const headers = document.querySelectorAll('div.sectionHeader');
const inputs = document.querySelectorAll('div.setting>div.settingContent>input');

for(const h of headers) {
    h.addEventListener('click', (e) => {
        const hdr = e.target;
        const cnt = hdr.parentElement.querySelector('div.sectionContent');

        if(hdr.classList.contains('active')) {
            hdr.classList.remove('active');
            cnt.classList.remove('active');
        }
        else {
            hdr.classList.add('active');
            cnt.classList.add('active');
        }
    });
}

for(const i of inputs) {
    i.addEventListener(i.type == 'text' ? 'focusout' : 'change', saveSettings);
}

getSettings().then((settings) => {
    document.getElementById('u_sex').value = settings.user.sex;
    document.getElementById('u_age').value = settings.user.age;
    document.getElementById('u_zb').value = settings.user.zb;
    document.getElementById('u_name').value = settings.user.name;

    document.getElementById('o_sex').value = settings.search.sex;
    document.getElementById('o_age_min').value = settings.search.age.min;
    document.getElementById('o_age_max').value = settings.search.age.max;
    document.getElementById('o_zb').value = settings.search.zb;

    document.getElementById('c_greeting').value = settings.convo.greeting;
    document.getElementById('c_final').value = settings.convo.final_msg;
    document.getElementById('c_verify').value = settings.convo.verify ? 1 : 0;
    document.getElementById('c_disconnect').value = settings.convo.disconnect ? 1 : 0;
    document.getElementById('c_feedback').value = settings.convo.feedback ? 1 : 0;
    document.getElementById('c_delay').value = settings.convo.typing_delay;
    document.getElementById('c_reactionTime').value = settings.convo.reaction_time;
    document.getElementById('c_timeout').value = settings.convo.timeout;

    document.getElementById('captcha_tries').value = settings.captcha.tries_limit;
    document.getElementById('captcha_use_ml').value = settings.captcha.use_ml ? 1 : 0;;
    document.getElementById('captcha_ml_model').value = settings.captcha.model ? 1 : 0;;
    document.getElementById('captcha_feed_ml').value = settings.captcha.feed_ml ? 1 : 0;;

    document.getElementById('history_min_length').value = settings.history.min_length;
    document.getElementById('history_max_amount').value = settings.history.max_amount;
    document.getElementById('history_max_duration').value = settings.history.max_duration;

    document.getElementById('as_threshold').value = settings.antispam.threshold;
    document.getElementById('as_threshold').title = settings.antispam.threshold;
    document.getElementById('as_feed').value = settings.antispam.feed ? 1 : 0;

    document.getElementById('q_name').value = settings.questions.name;
    document.getElementById('q_age').value = settings.questions.age;
});

document.getElementById('as_threshold').addEventListener('change', (e) => {
    e.target.title = e.target.value;
})
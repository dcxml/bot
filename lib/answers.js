async function answerQuestions(msg, prefs, obcy) {
  const answers = [{
      question: /^(km|mk|k czy m|m czy k)/g,
      answer: '$p'
    },
    {
      question: /((ile)? ?lat|(jaki)? ?wiek)/g,
      answer: '$w'
    },
    {
      question: /z[b6](oczon[ya])?\?/g,
      answer: '$z'
    },
    {
      question: /(co|jak) ?(tam|s[lł]ycha[cć])/g,
      answer: drawRandom(['wszystko fajnie', 'dobrze', 'ok', 'fajnie', 'w porządku'])
    },
    {
      question: /(a )?ty/g,
      answer: '$*'
    },
    {
      question: /(jak masz na )?imi[eę]\??/g,
      answer: prefs.user.name.length == 0 ? drawRandom(['nie podaję', 'nie chcę mówić', 'nie podam', 'tajemnica', 'nie musisz wiedzieć']) : '$i'
    },
    {
      question: /(jeste[sś] botem\??|(kolejny|j[e*]bany|znowu) bot)/g,
      answer: prefs.convo.disconnect == 1 ? drawRandom(['no shit sherlock', '01100010 01110010 01100001 01110111 01101111 00100000 01010111 01100001 01110100 01110011 01101111 01101110', 'no i kolejny test Turinga oblany :(', 'ano jestem botem... 6bot, miło mi ;)']) : drawRandom(['nope', 'nie jestem botem'])
    }
  ];

  for (a of answers) {
    if (a.question.test(msg))
      await sendMessage(a.answer, prefs, obcy);
  }
}
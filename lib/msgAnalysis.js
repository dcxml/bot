function analyzeMessage(msg, obcy) {
  const greetingsRE = /((hej(ka|o)?|cze[sś][cć]|wit[ao]m|elk?(o(szk[ai])?|uwina)|siemk?an?(o|eczko)?|essa|(dzie[nń])? do(bry|erek)?)[ ,.!]*)/g;
  const sexRE_m = /(^|[^a-z])(m([eę][zż]czyzna)?){1}( ?bi)?($|[^a-z?])/g;
  const sexRE_f = /(^|[^a-z])(k(obieta)?){1}( ?bi)?($|[^a-z?])/g;
  const ageRE = /\d{1,2}([^\d]|$)/g;
  const zboRE_T = /(^|[^a-z])(ta+k*|z[b6]+|tro(ch|szk)[ęe]+|oczywi[sś]cie+|pewnie+|yup|dobr(a|rze))($|[^a-z])/g;
  const zboRE_F = /(^|[^a-z])((ni|nop)e+) ?(z[b6]+)?(yt+)?($|[^a-z])/g;
  const retroRE = /(^|[^a-z])((r[oó]wnie|te)[zż]|tak ?samo)($|[^a-z])/g;
  const originalMsg = msg;

  msg = msg.replaceAll(greetingsRE, '');
  msg = msg.replaceAll(/(km|mk|k czy m|m czy k)\??/g, '');
  msg = msg.replaceAll('z6', 'zb');

  if(msg.length === 0) {
    return;
  }

  if(retroRE.test(msg)) {
    const convo = getConvo().reverse();
    for(let i = 0; i < convo.length-1; ++i) {
      if(!convo[i].received)
        continue;
      if(convo[i].value == originalMsg) {
        for(let j = i+1; j < convo.length; ++j) {
          if(convo[j].received)
            continue;
          analyzeMessage(convo[j].value, obcy);
          msg = msg.replaceAll(retroRE, '');
        }
      }
    }
  }

  if(obcy.sex === undefined) {
    if(sexRE_m.test(msg)) {
      obcy.sex = true;
    }
    else if(sexRE_f.test(msg)) {
      obcy.sex = false;
    }
  }

  if(obcy.age === undefined) {
    let result = msg.match(ageRE);
    if(result != null)
      obcy.age = parseInt(result[0])
  }

  if(obcy.zb === undefined) {
    obcy.zb = zboRE_T.test(msg) ? true : (zboRE_F.test(msg) && (/z[b6]/g.test(msg) || obcy.asked.zb) ? false : undefined);
  }

  if(/(^|[^a-z])le[zs]{1,2}(b(ijka)?)?($|[^a-z])/g.test(msg)) {
    obcy.sex = false;
  }
  else if(/(^|[^a-z])g(ej|ay)($|[^a-z])/g.test(msg)) {
    obcy.sex = true;
  }

  if(/(^|[^a-z])(szmat|suczk|uleg[łl]|[łl]atw)a($|[^a-z])/g.test(msg)) {
    obcy.sex = false;
    obcy.zb = true;
  }
  else if(/(^|[^a-z])(uleg[łl]y)($|[^a-z])/g.test(msg)) {
    obcy.sex = true;
    obcy.zb = true;
  }
}
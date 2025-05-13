async function getData(key) {
    const storage = chrome.storage.local;
    const result = await storage.get(key);
    const json = result[key];
    return JSON.parse(json);
}

function delData(key) {
    const storage = chrome.storage.local;
    return storage.remove(key);
}

async function setData(key, val) {
    const storage = chrome.storage.local;
    const json = JSON.stringify(val);
    const obj = {};
    obj[key] = json;
    return storage.set(obj);
}

function sendMessageToBackground(msg_type, content) {
    /*
        MESSAGE TYPES:
        1 - save conversation
        2 - remove conversation
        3 - move conversation from temporary to permanent
        4 - rename conversation
        5 - request filtering of history entires
    */

    chrome.runtime.sendMessage({
        type: msg_type,
        content
    });
}

function getDefaultObcy() {
  return {
    sex: undefined, //1 = male, 0 = female
    age: undefined,
    zb: undefined,
    asked: {
      sex: false,
      age: false,
      zb: false
    },
    told: {
      sex: false,
      age: false,
      zb: false,
      name: false
    },
    status: {
      passed: true,
      spam: false
    }
  };
}

function translateMsg(text, user, obcy=getDefaultObcy()) {

    text = drawRandom(seperateAlternatives(text));
    
    const keywords = [
        {key: 'p', value: (user.sex == 1 ? 'm' : 'k')},
        {key: 'w', value: user.age.toString()},
        {key: 'z', value: (user.zb == 1 ? 'tak' : 'nie ')},
        {key: 'i', value: user.name},

        {key: '*', value: (user.name.length == 0 ? '$p' : '$i') + ' $w' + (user.zb == 1 && !obcy.told.zb ? ' zb' : '')},
    ];

    while(/([^\$]|^)\$[^\$]/g.test(text)) {
          if(obcy.told.sex) {
              text = text.replaceAll('$p', '').replaceAll(/ {2,}/g, ' ');
          }
          if(obcy.told.age) {
              text = text.replaceAll('$w', '').replaceAll(/ {2,}/g, ' ');
          }
          if(obcy.told.zb) {
              text = text.replaceAll('$z', '').replaceAll(/ {2,}/g, ' ');
          }
          if(obcy.told.name) {
              text = text.replaceAll('$i', '').replaceAll(/ {2,}/g, ' ');
          }

          obcy.told.sex = obcy.told.sex || text.includes('$p');
          obcy.told.age = obcy.told.age || text.includes('$w');
          obcy.told.zb = obcy.told.zb || text.includes('$z');
          obcy.told.name = obcy.told.name || text.includes('$i');

          for(const k of keywords) {
          text = text.replaceAll('$'+k.key, k.value);
        }
    }

    return text.replaceAll('$$', '$');
}

function drawRandom(array) {
    return array[Math.max(Math.min(Math.floor(Math.random() * array.length), array.length-1), 0)];
}

function seperateAlternatives(str) {
    const rex = /([^\$]|^)\$\|/;
    const match = str.match(rex);
    if(match == null) {
        return str.length > 0 ? [str] : [];
    }
    const index = match.index + match[1].length;
    const res = str.slice(0, index).trim();
    if(res.length > 0 ) {
        return [res, ...seperateAlternatives(str.slice(index + 2))];
    }
    else {
        return seperateAlternatives(str.slice(index + 2));
    }
}

function strcmp(a, b, caseSensitive=true) {
    if(!caseSensitive){
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
  
    var longer, shorter;
    var score = 0.0;
  
    if(a.length > b.length){
      longer = a;
      shorter = b;
    }
    else{
      longer = b;
      shorter = a;
    }
  
    var used = [];
    for(var i=0; i < longer.length; ++i)
    {
      used.push(false);
    }
  
    for(var i=0; i < shorter.length; ++i)
    {
      var best = undefined;
      var bestMove = longer.length;
      var maxMove = Math.max(i, (longer.length - (i+1)));
      for(var j=0; j < longer.length; ++j)
      {
        if(used[j]){
          continue;
        }
        if(shorter[i] === longer[j]){
          const currentMove = Math.abs(j-i);
          if(best === undefined || currentMove < bestMove){
            best = j;
            bestMove = currentMove;
          }
          else if(best !== undefined && currentMove > bestMove){
            break;
          }
        }
      }
      if(best !== undefined){
        used[best] = true;
        score += (1/longer.length) * (1-(bestMove/(maxMove+1)));
      }
    }
  
    return score;
  }
  
  function csv2arr(csv) {
    const rows = csv.split('\n');
    return rows.map(row => row.split(','));
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
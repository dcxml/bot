function isSPAM(msg, as_db, threshold=0.8) {
  
  for(const fp of as_db.false_positives) {
    if(msg === fp) {
      return false;
    }
  }
  
  const pre = `(^|[!&\s()\[\]{}:;'"<>,./\\?])`;
  const post = `($|[!&\s()\[\]{}:;'"<>,./\\?])`;
  for(const fp of as_db.false_positives) {
    msg = msg.replaceAll(new RegExp(pre + escapeRegex(fp) + post, 'g'), '');
  }

  for(const test of [...as_db.phrases, ...as_db.usernames]) {
    if(SPAM_phrase(test, msg)) {
      return true;
    }
  }
  for(const test of as_db.usernames) {
    if(SPAM_username(test, msg)) {
      return true;
    }
  }
  for(const test of as_db.regexes) {
    if(SPAM_regex(test, msg)) {
      return true;
    }
  }
  for(const test of [...as_db.phrases, ...as_db.usernames]) {
    if(SPAM_heuristic(test, msg, threshold)) {
      return true;
    }
  }

  return false;
}

function SPAM_phrase(phrase, msg) {
  return msg.includes(phrase);
}

function SPAM_username(username, msg) {
  const separators_pattern = '[^a-z0-9?]*';
  let pattern = '(^|' + separators_pattern + ')';
  for(let i=0; i < username.length; ++i) {
    if(i == username.length-1) {
      pattern += username[i] + '($|' + separators_pattern + ')';
    }
    else {
      pattern += username[i] + separators_pattern;
    }
  }
  return SPAM_regex(pattern, msg);
}

function SPAM_regex(regex, msg) {
  const rex = new RegExp(regex, 'g');
  return rex.test(msg);
}

function SPAM_heuristic(word, msg, sensivity) {
  return (strcmp(word, msg) > sensivity);
}

async function getASData() {
  try {
    return await getData('as_data');
  }
  catch (e) {
    try {
      const response = await fetch(chrome.runtime.getURL('data/antispam.json'));
      const data = await response.json();
      return data;
    }
    catch(e) {
      return {
        false_positives: [],
        phrases: [],
        usernames: [],
        regexes: []
      }
    }
  }
}
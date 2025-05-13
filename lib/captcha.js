function solveCaptcha() {
    if(document.getElementById('captcha-solver') == null) {
        let canvas = document.createElement('canvas');
        canvas.id = 'captcha-solver';
        canvas.style = 'display: none;';
        canvas = document.body.appendChild(canvas);
    }

    if(document.getElementById('captcha-history') == null) {
        let span = document.createElement('span');
        span.id = 'captcha-history';
        span.style = 'display: none;';
        span.innerText = '';
        
        span = document.body.appendChild(span);
    }

    if(document.getElementById('known_captchas') == null) {
        const known_captchas = document.createElement('input');
        known_captchas.type = 'hidden';
        known_captchas.id = 'known_captchas';
        document.body.appendChild(known_captchas);
    }

    if(document.getElementById('last_captcha') == null) {
        const last_captcha = document.createElement('input');
        last_captcha.type = 'hidden';
        last_captcha.id = 'last_captcha';
        document.body.appendChild(last_captcha);
    }

    captchaSolvingInit();    
}

function captchaSolvingInit() {
    let img = new Image();
    const src = document.getElementsByClassName('caper-image-holder')[0].src;
    img.src = src;
    document.getElementById('last_captcha').value = src;
    const known = document.getElementById('known_captchas').value.split('|').filter((x) => x.length > 0);
    if(!known.includes(src)) {
        known.push(src);
        document.getElementById('known_captchas').value = known.join('|');
    }

    img.addEventListener('load', captchaSolvingKernel);
}

async function captchaSolvingKernel(e) {
    let img = e.target;
    let canvas = document.getElementById('captcha-solver');
    let ctx = canvas.getContext('2d', {willReadFrequently: true});

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let gray = rgb2mono(imgData.data, canvas.width, canvas.height);

    gray = reInvert(gray);
    gray = saturationEnchance(imgData.data, gray);

    const counter = countBars(gray);

    let startX = 0;
    while(counter[startX] == 0){
        ++startX;
    }

    let result = [];
    for(let i = 0; i < 7; ++i) {
        let letter = await recognizeLetter(counter, startX);
        startX += letter.code.length + letter.dx;
        result.push(letter);
    }
        let solution = extractString(result);
    const history = getCaptchaHistory();
    
    if(history.includes(solution)) {
        solution = transformToUnique(result, solution, history);
    }

    submitSolution(solution);
}

function extractString(letters) {
    let result = '';
    for(let i = 0; i < letters.length; ++i) {
        result += letters[i].char;
    }
    return result;
}

function rgbToHsv( r, g, b ) {
    	
	var h;
	var s;
	var v;
     
	var maxColor = Math.max(r, g, b);
	var minColor = Math.min(r, g, b);
	var delta = maxColor - minColor;
    	
	// Calculate hue
	// To simplify the formula, we use 0-6 range.
	if(delta == 0) {
		h = 0;
	}
	else if(r == maxColor) {
		h = (6 + (g - b) / delta) % 6;
	}
	else if(g == maxColor) {
		h = 2 + (b - r) / delta;
	}
	else if(b == maxColor) {
		h = 4 + (r - g) / delta;
	}
	else {
		h = 0;
	}
	// Then adjust the range to be 0-1
	h = h/6;
	
	// Calculate saturation
	if(maxColor != 0) {
		s = delta / maxColor;
	}
	else {
		s = 0;
	}
	
	// Calculate value
	v = maxColor / 255;
	
	return { h: h, s: s, v: v };
};

function countBars(gray) {

    const bg = getBGcolor(gray);
    let counter = new Array(gray.length).fill(0);

    for(let x = 0; x < gray.length; ++x) {
        let len = 0;
        const def_lives = 2;
        let lives = def_lives;
        for(let y = 13; y < 75; ++y) {
            if(gray[x][y] != bg) {
                len += 1 + (def_lives - lives);
                lives = def_lives;
            }
            else if(lives > 0 && len > 0) {
                --lives;
            }
            else {
                len = 0;
                lives = def_lives;
            }

            if(len > counter[x]) {
                counter[x] = len;
            }
        }
    }

    return counter;
}

function rgb2mono(data, width, height) {
    const gray = Array.from({length: width}, () => new Array(height).fill(0));

    for(let x = 0; x < gray.length; ++x) {
        for(let y = 0; y < gray[x].length; ++y) {
            let pixel = rgbToHsv(data[x*4 + width*y*4 + 0], data[x*4 + width*y*4 + 1], data[x*4 + width*y*4 + 2]);
            gray[x][y] = (pixel.v > 0.5) * 255;
        }
    }

    return gray;
}

function saturationEnchance(data, gray) {
    const bg = getBGcolor(gray);
    const width = gray.length;
    const height = gray[0].length;

    for(let x = 0; x < width; ++x) {
        for(let y = 0; y < height; ++y) {
            if(gray[x][y] != bg) {
                continue;
            }
            let pixel = rgbToHsv(data[x*4 + width*y*4 + 0], data[x*4 + width*y*4 + 1], data[x*4 + width*y*4 + 2]);
            if(pixel.s > 0.15) {
                gray[x][y] = Math.abs(255 - bg);
            }
        }
    }

    return gray;
}

function findInvertionTop(data, y) {
    let maxDiff = 0;
    let d = 0;
    for(let b = 0; b < data.length-1; ++b) {
        let left = 0, right = 0;
        for(let x = 0; x < data.length; ++x) {
            const val = data[x][y] == 0 ? -1 : 1;
            if(x >= b)
                right += val;
            else
                left += val;
        }
        const diff = Math.abs(left - right);
        if(diff > maxDiff) {
            maxDiff = diff;
            d = b;
        }
    }
    return {x: d, y};
}

function reInvert(data) {

    const top = findInvertionTop(data, 0);
    const mid = findInvertionTop(data, 44);
    const bot = findInvertionTop(data, 89);

    const upper = {
        a: (mid.y - top.y) / (mid.x - top.x),
        b: undefined
    };
    upper.b = mid.y - upper.a*mid.x;
    const lower = {
        a: (mid.y - bot.y) / (mid.x - bot.x),
        b: undefined
    };
    lower.b = mid.y - lower.a*mid.x;

    for(let x = 0; x < data.length; ++x) {
        for(let y = 0; y < data[x].length; ++y) {
            if (isToReverse(x, y, {top, mid, bot}, {upper, lower})) {
                data[x][y] = 255 - data[x][y];
            }
        }
    }

    return data;
}

function isToReverse(x, y, points, funs) {

    const top = points.top;
    const mid = points.mid;
    const bot = points.bot;

    const upper = funs.upper;
    const lower = funs.lower;

    if(top.x == mid.x && mid.x == bot.x) {
        return x < mid.x;
    }

    if(y < mid.y) {
        //upper
        if(top.x < mid.x) {
            return y <= calcLinearFun(upper, x);
        }
        else if(top.x > mid.x) {
            return y >= calcLinearFun(upper, x);
        }
        else {
            return (bot.x > mid.x ? x > mid.x : x < mid.x);
        }
    }
    else {
        //lower
        if(bot.x < mid.x) {
            return y >= calcLinearFun(lower, x);
        }
        else if(bot.x > mid.x) {
            return y <= calcLinearFun(lower, x);
        }
        else {
            return (top.x > mid.x ? x > mid.x : x < mid.x);
        }
    }
}

function calcLinearFun(f, x) {
    return (f.a*x + f.b);
}

function getBGcolor(data) {
    let black = 0, white = 0;
    data[0][0] == 0 ? ++black : ++white;
    data[0][data[0].length-1] == 0 ? ++black : ++white;
    data[data.length-1][0] == 0 ? ++black : ++white;
    data[data.length-1][data[data.length-1].length-1] == 0 ? ++black : ++white;
    return black > white ? 0 : 255;
}

function mark(imgData, point, width) {
    imgData.data[point.x*4 + width*point.y*4 + 0] = 0;
    imgData.data[point.x*4 + width*point.y*4 + 1] = 255;
    imgData.data[point.x*4 + width*point.y*4 + 2] = 0;
    imgData.data[point.x*4 + width*point.y*4 + 3] = 255;
}

async function recognizeLetter(data, start) {
    const patterns = await getPatterns();
    const ampX = 3;
    let bestDiff = Infinity;
    let bestChar = undefined;
    let secondDiff = Infinity;
    let secondChar = {char: ''};
    for(const char of patterns) {
        if(char.code.length == 0)
            continue;
   
        let best_pat_dx = undefined;
        let best_pat_score = Infinity;
        let best_pat_char = undefined;
        
        for(let dx = -ampX; dx <= ampX; ++dx) {
            if(start+dx < 0)
                continue;

            const diff = charPatternAssess(data, start, dx, char.code);

            if(diff < best_pat_score) {
                best_pat_dx = dx;
                best_pat_score = diff;
                best_pat_char = char;
            }
        }

        if(best_pat_score < bestDiff) {
            if(bestChar !== undefined) {
                secondChar.char = bestChar.char;
                secondChar.code = bestChar.code;
                secondDiff = bestDiff;
                secondChar.dx = bestChar.dx;
            }
            bestChar = best_pat_char;
            bestDiff = best_pat_score;
            bestChar.dx = best_pat_dx;
        }
        else if(best_pat_score < secondDiff) {
            secondChar.char = best_pat_char.char;
            secondChar.code = best_pat_char.code;
            secondDiff = best_pat_score;
            secondChar.dx = best_pat_dx;
        }
    }

    bestChar.second = {
        char: secondChar.char,
        diff: secondDiff / bestDiff,
        code: secondChar.code,
        dx: secondChar.dx
    }

    return bestChar;
}

function charPatternAssess(data, start, dx, pattern) {
    start += dx;
    const width = Math.min(pattern.length, data.length-start);
    let diff = 0;
    const edge = width + start;
    for(let x = start; x < edge; ++x) {
        diff += Math.abs(pattern[x-start] - data[x]);
    }
    return diff/width;
}

async function getPatterns() {
    const settings = await getSettings();
    const model_default = [
        {char: 'a', code: [15,42,42,42,42,42,42,47,48,48,48,48,48,48,42,42,42,42,42,42,42,42,42,44,45,47,49,51,51,49,47,45,43,42,42,42,42,42,42,34,33,33,37,37,37,37,33,33]},
        {char: 'b', code: []},
        {char: 'c', code: [14,16,16,41,42,42,47,48,48,48,48,48,48,48,48,48,48,48,47,36,36,36,36,36,36,36,36,36,36,36,40,41,41,40,36,36,39,40,39,36,36,36,36,36,38,36,34,32,30,29]},
        {char: 'd', code: [23,23,23,30,30,30,30,47,47,47,47,47,47,36,36,36,39,39,38,36,36,36,36,48,48,48,48,48,48,36,36,36,36,55,55,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56]},
        {char: 'e', code: [47,47,47,47,47,47,47,47,47,47,47,47,47,47,45,44,47,48,45,43,40,37,36,36,36,36,36,43,43,43,43,43,43,43,43,43,43,36,36,36,36,36,29,29,29,29,33]},
        {char: 'f', code: []},
        {char: 'g', code: [40,42,43,45,47,49,55,55,55,49,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,60,61,61,55,55,55,55,55,55,55]},
        {char: 'h', code: [50,50,49,50,53,53,53,53,53,53,49,50,50,49,50,49,50,37,36,37,36,37,37,36,55,56,56,56,56,56,56,56,56,56,55,56,59,59,59,56,56,59,59,59,55,56,55]},
        {char: 'i', code: [26,26,26,55,55,55,55,55,55,55,55,55,55,55,56,56,55,55,55,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,58,61,61,61,51,51,51,51,51,50]},
        {char: 'j', code: [10,33,55,55,55,60,60,60,55,55,43,43,43,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62,62]},
        {char: 'k', code: [27,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,38,38,38,38,38,45,45,45,45,48,48,48,48,45,45,45,45,45,45,49,49,49,49,49,49,45,45,45,39]},
        {char: 'l', code: []},
        {char: 'm', code: [42,42,42,42,42,43,45,47,46,44,45,46,43,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,37,37,37,37,37,43,43,44,44,44,44,43,43,37,37,37,37,37,29,30]},
        {char: 'n', code: [26,26,39,38,39,38,38,37,37,37,37,37,38,38,38,38,38,38,38,38,38,38,38,38,38,38,37,38,38,37,40,38,44,44,44,44,44,45,44,44,44,44,44]},
        {char: 'p', code: [19,19,19,44,44,44,44,44,44,44,44,44,44,44,47,47,47,44,44,44,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,53,43,43,48,51,53]},
        {char: 'q', code: []},
        {char: 'r', code: [42,42,42,42,42,42,42,42,42,42,47,46,47,42,42,42,36,36,36,36,36,36,36,36,36,36,41,40,41,41,36,36,36,36,36,14]},
        {char: 's', code: []},
        {char: 't', code: []},
        {char: 'u', code: [21,21,22,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42,43,48,48,50,51,51,51,42,42,42,42,22,21,21,21,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48]},
        {char: 'v', code: []},
        {char: 'w', code: [18,19,31,31,32,32,42,42,42,42,42,42,42,42,42,31,42,42,42,42,42,42,46,46,35,46,46,46,46,46,46,48,54,54,54,54,53,46,46,46,46,46,46,50,51,51,50,46,46]},
        {char: 'x', code: [8,8,8,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,35,35,35,35,35,35,35,47,47,47,35,35,35,35,42,42,42,42,42,42,42,42,42,42,42,42,42,42,42]},
        {char: 'y', code: [43,43,43,43,43,43,43,43,43,43,43,43,43,43,43,43,43,22,22,22,22,22,46,46,46,46,46,46,46,46,46,46,54,55,55,55,55,59,59,59,59,59,56,57,55,55,55,55,46]},
        {char: 'z', code: [8,8,9,35,35,35,35,35,35,35,35,41,42,42,42,42,42,42,42,42,42,42,42,42,42,35,35,35,35,35,35,35,35,35,46,45,45,45,45,45,35,35,35,35,42,42,42,35,35,35]},
        {char: '0', code: []},
        {char: '1', code: []},
        {char: '2', code: [55,55,55,55,55,55,55,55,55,55,53,55,58,55,52,52,52,52,52,58,58,58,58,58,58,58,58,58,58,53,49,49,49,55,55,55,55,56,56,55,55,56,58,58,56,56]},
        {char: '3', code: []},
        {char: '4', code: [55,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,56,55,37,37,37,37,37,37,37,37,37,38,48,48,48,48,37,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50]},
        {char: '5', code: []},
        {char: '6', code: []},
        {char: '7', code: [24,25,25,55,56,56,56,56,56,56,56,56,55,56,56,56,56,55,49,49,49,56,58,58,58,58,58,58,58,58,58,58,52,52,52,52,52,56,56,56,56,55,56,55,55,56,56,56,56,56]},
        {char: '8', code: [36,37,54,55,55,55,55,55,55,59,55,55,55,55,55,55,55,54,52,52,52,52,52,49,49,50,49,50,49,49,50,59,59,57,52,52,52,52,52,52,52,52,52,52,52,52,52,52,52,43]},
        {char: '9', code: [42,42,43,45,49,49,55,55,55,49,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,55,61,61,61,56,55,55,55,55,55,55,55,55]}
    ];
    try {
        if(settings.captcha.use_ml) {
            return parseModel(await getData('captcha_model'));
        }
        else {
            return model_default;
        }
    }
    catch(e) {
        return model_default;
    }
}

function submitSolution(result) {
    appendToCaptchaHistory(result);
    const txt = document.querySelector('input.caper-solution-input[type="text"]');
    txt.value = result;
}

async function changeCaptcha() {
    const changePic = document.querySelector('div.sd-interface>button');
    const oldsrc = document.getElementsByClassName('caper-image-holder')[0].src;
    let src = oldsrc;
    changePic.click();
    let counter = 10;
    while(src === oldsrc) {
        if(counter == 0) {
            changeCaptcha();
            return;
        }
        --counter;
        await sleep(100 + Math.round(Math.random() * 100));
        src = document.getElementsByClassName('caper-image-holder')[0].src;
    }
    captchaSolvingInit();
}

function transformToUnique(result, original, history) {
    const all = [];
    for(let i = 0; i < 7; ++i) {
        let solution = original.substring(0, i) + result[i].second.char + original.substring(i+1, 7);
        if(!history.includes(solution)) {
            all.push({
                txt: solution,
                diff: result[i].second.diff
            });
        }
    }

    let best = original;
    let best_diff = Infinity;
    for(const candidate of all) {
        if(candidate.diff < best_diff) {
            best = candidate.txt;
            best_diff = candidate.diff;
        }
    }

    return best;
}

function resetCaptchaHistory() {
    const obj = document.getElementById('captcha-history');
    if(obj != null && obj != undefined)
        obj.innerText = '';
}

function getCaptchaHistory() {
    try {
        const obj = document.getElementById('captcha-history');
        return obj.innerText.split(',');
    }
    catch (e) {
        return [];
    }
}

function appendToCaptchaHistory(str) {
    const obj = document.getElementById('captcha-history');
    if(obj.innerText.length == 0) {
        obj.innerText = str;
    }
    else {
        const history = getCaptchaHistory();
        if(!history.includes(str)) {
            obj.innerText += ',' + str;
        }
    }
}
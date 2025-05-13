function getOIBProperties() {
    return ['Płeć', 'Wiek', 'Zb'];
}

function setOIBValue(property, value) {
    const obj = document.getElementById('oib_' + property);
    obj.innerText = property + ': ' + value;
}

async function updateOIB(obcy) {
    const props = getOIBProperties();
    setOIBValue(props[0], obcy.sex === undefined ? '❔' : obcy.sex ? '♂️' : '♀️');
    setOIBValue(props[1], obcy.age === undefined ? '❔' : obcy.age);
    setOIBValue(props[2], obcy.zb === undefined ? '❔' : obcy.zb ? '😈' : '😇');
}

function createObcyInfoBox() {
    let box = document.createElement('div');
    const properties = getOIBProperties();
    if(isMobile()) {
        box.style = `
            position: absolute;
            top: 50px;
            right: 30px;
            width: 100px;
            background-color: rgba(0,0,0,0.5);
            border-radius: 5px;
            padding-left: 1px;
        `;
    }
    else {
        box.style = `
            position: absolute;
            top: 100px;
            left: 23px;
            width: 140px;
        `;
    }

    for(const p of properties) {
        const e = document.createElement('div');
        e.style = `
            color: white;
            font-size: 20px;
            line-height: 30px;
        `;
        e.id = 'oib_' + p;
        e.innerText = p + ': ❔';
        box.appendChild(e);
    }

    return document.body.appendChild(box);
}
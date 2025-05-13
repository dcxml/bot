function parseModel(csv) {
    const chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9'];
    const codes = csv2arr(csv);
    const model = [];
    for(let i = 0; i < chars.length; ++i) {
        model.push({
            char: chars[i],
            code: codes[i][0] == '' ? [] : codes[i]
        });
    }
    return model;
}
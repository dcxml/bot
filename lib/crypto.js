function get_pgp_pubkey() {
    return pgp_clean_armor(`-----BEGIN PGP PUBLIC KEY BLOCK-----

    xjMEZIPTghYJKwYBBAHaRw8BAQdAGwbS9mtr1iaUprWGeXGMyOXoi6ioH7/8
    8V/NLLmpfPDNKXNvZnR3YXJlQGNoYXVlcS5kZXYgPHNvZnR3YXJlQGNoYXVl
    cS5kZXY+wowEEBYKAD4FgmSD04IECwkHCAmQLjOFI7yfDngDFQgKBBYAAgEC
    GQECmwMCHgEWIQQ5IfCR1tTZC4IcpU0uM4UjvJ8OeAAAU4gA/31ceeP/g3CS
    umUqMUbdKKyo/naOWYRRjUzdoxNh/0w0AQC8ZYhqjHNKRrfuOy5vciZ42PFf
    BttgTmWVl3IwQk2HA844BGSD04ISCisGAQQBl1UBBQEBB0Dpp/W0vvbBbxSs
    PsiZoJNdFmBPSKkHampeo/cr+jfDQwMBCAfCeAQYFggAKgWCZIPTggmQLjOF
    I7yfDngCmwwWIQQ5IfCR1tTZC4IcpU0uM4UjvJ8OeAAAa/8A/ipqWFncncKY
    nUSpsGMhXm9Gp7xjBZ4lk81Bi+/WjkxLAP0RBgZjOEdd1IZ1COLbNZ+PWaly
    yv+ItHny+V6yO948BQ==
    =qHyh
    -----END PGP PUBLIC KEY BLOCK-----
    `);
}

function pgp_clean_armor(armor) {
    return armor.replaceAll(' ', '').replaceAll('PGP', ' PGP ').replaceAll('KEY', ' KEY ');
}

async function pgp_enc(txt) {
    const pubkey = await openpgp.readKey({armoredKey: get_pgp_pubkey()});
    const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: txt }),
        encryptionKeys: pubkey
    });
    return encrypted;
}
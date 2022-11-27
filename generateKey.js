let generateKey = (secret) => {
    return Buffer.from(secret, 'utf8').toString('base64');
};

// console.log(generateKey('secret'));

module.exports = generateKey;
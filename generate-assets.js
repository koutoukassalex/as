const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

// Minimal valid PNG (1x1 pixel)
const minimalPng = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2DB40000000049454E44AE426082', 'hex');

const assets = [
    'icon.png',
    'splash.png',
    'adaptive-icon.png',
    'favicon.png'
];

assets.forEach(asset => {
    const assetPath = path.join(assetsDir, asset);
    fs.writeFileSync(assetPath, minimalPng);
    console.log(`Generated ${asset}`);
});

console.log('All placeholder assets generated successfully!');

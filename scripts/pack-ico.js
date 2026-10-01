import fs from 'fs';
import path from 'path';

const pngPath = path.resolve('public/icon.png');
const pngBuffer = fs.readFileSync(pngPath);

// Create ICO buffer: 6-byte header + 16-byte dir entry + PNG buffer
const icoHeader = Buffer.alloc(22);

// ICONDIR
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type: 1 = icon
icoHeader.writeUInt16LE(1, 4); // count: 1 image

// ICONDIRENTRY
icoHeader.writeUInt8(32, 6); // width: 32
icoHeader.writeUInt8(32, 7); // height: 32
icoHeader.writeUInt8(0, 8);  // color palette: 0
icoHeader.writeUInt8(0, 9);  // reserved
icoHeader.writeUInt16LE(1, 10); // color planes: 1
icoHeader.writeUInt16LE(32, 12); // bits per pixel: 32
icoHeader.writeUInt32LE(pngBuffer.length, 14); // image size in bytes
icoHeader.writeUInt32LE(22, 18); // offset of image data: 22

const icoBuffer = Buffer.concat([icoHeader, pngBuffer]);

fs.writeFileSync(path.resolve('public/favicon.ico'), icoBuffer);
fs.writeFileSync(path.resolve('src/app/favicon.ico'), icoBuffer);

console.log('Successfully created public/favicon.ico and src/app/favicon.ico (size:', icoBuffer.length, 'bytes)');

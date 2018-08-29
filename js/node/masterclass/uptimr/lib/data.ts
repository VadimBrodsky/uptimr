import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const close = util.promisify(fs.close);
const open = util.promisify(fs.open);
const writeFile = util.promisify(fs.writeFile);

const baseDir = path.join(__dirname, '../.data');

export const create = (dir, file, data) =>
  open(`${baseDir}/${file}.json`, 'wx').then((fileDescriptor) => {
    writeFile(fileDescriptor, JSON.stringify(data)).then(() => close(fileDescriptor));
  });

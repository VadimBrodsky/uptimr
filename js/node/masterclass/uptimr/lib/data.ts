import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const open = util.promisify(fs.open);
const writeFile = util.promisify(fs.writeFile);
const close = util.promisify(fs.close);

const baseDir = path.join(__dirname, '../.data');

const lib = {
  create(dir, file, data) {
    return open(`${baseDir}/${file}.json`, 'wx').then((fileDescriptor) => {
      writeFile(fileDescriptor, JSON.stringify(data)).then(() => close(fileDescriptor));
    });
  },
};

export default lib;

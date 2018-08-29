import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const close = util.promisify(fs.close);
const open = util.promisify(fs.open);
const readFile = util.promisify(fs.readFile);
const truncate = util.promisify(fs.truncate);
const unlink = util.promisify(fs.unlink);
const writeFile = util.promisify(fs.writeFile);

const filePath = (dir: string, file: string) =>
  path.join(__dirname, '../.data', dir, `${file}.json`);

export const create = (dir, file, data) =>
  open(filePath(dir, file), 'wx').then((fileDescriptor) =>
    writeFile(fileDescriptor, JSON.stringify(data)).then(() => close(fileDescriptor)),
  );

export const read = (dir, file) => readFile(filePath(dir, file), 'utf8');

export const update = (dir, file, data) =>
  truncate(filePath(dir, file)).then(() =>
    open(filePath(dir, file), 'r+').then((fileDescriptor) =>
      writeFile(fileDescriptor, JSON.stringify(data)).then(() => close(fileDescriptor)),
    ),
  );

export const destroy = (dir, file) => unlink(filePath(dir, file));

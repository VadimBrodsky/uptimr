import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { parseJSON } from './helpers';

const close = util.promisify(fs.close);
const open = util.promisify(fs.open);
const readFile = util.promisify(fs.readFile);
const truncate = util.promisify(fs.truncate);
const unlink = util.promisify(fs.unlink);
const writeFile = util.promisify(fs.writeFile);

const filePath = (dir: string, file: string) =>
  path.join(__dirname, '../.data', dir, `${file}.json`);

export const create = (dir, file, data) =>
  open(filePath(dir, file), 'wx')
    .then((fileDescriptor) =>
      writeFile(fileDescriptor, JSON.stringify(data)).then(() => close(fileDescriptor)),
    )
    .then(() => data);

export const read = (dir: string, file: string) =>
  readFile(filePath(dir, file), 'utf8').then((data) => parseJSON(data));

export const update = (dir, file, data) =>
  truncate(filePath(dir, file)).then(() =>
    open(filePath(dir, file), 'r+').then((fileDescriptor) => {
      writeFile(fileDescriptor, JSON.stringify(data)).then(() => close(fileDescriptor));
      return data;
    }),
  );

export const destroy = (dir: string, file: string) => unlink(filePath(dir, file));

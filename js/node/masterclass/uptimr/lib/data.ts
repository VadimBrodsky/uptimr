import * as fs from 'fs';
import * as path from 'path';

const baseDir = path.join(__dirname, '../.data/');

const lib = {
  create(dir, file, data, callback) {
    fs.open(`${baseDir}/${file}.json`, 'wx', (fsOpenErr, fileDescriptor) => {
      if (!fsOpenErr && fileDescriptor) {
        fs.writeFile(fileDescriptor, JSON.stringify(data), (fsWriteErr) => {
          if (!fsWriteErr) {
            fs.close(fileDescriptor, (fsCloseErr) => {
              if (!fsCloseErr) {
                callback(false);
              } else {
                callback('Error closing file');
              }
            });
          } else {
            callback('Error writing to new file');
          }
        })

      } else {
        callback('Cannot create new file, it may already exist')
      }
    });
  }
}

export default lib;

'use strict';

const path = require('path');
const uuidV4 = require('uuid/v4');


class Giga {
  constructor(options = {}) {
    this.storage = options.storage;

    if (!this.storage)
      throw new Error('Storage must be provided');
  }

  /**
   * Upload file to the storage
   *
   * @param {Stream} src
   * @param {object} options
   * @returns {Promise}
   */
  upload(src, options = {}) {
    const directory = options.directory || '';
    const filename = options.filename || uuidV4();
    const filePath = path.posix.join(directory, filename);
    const result = {
      filePath
    };

    if (!src)
      throw new TypeError('Source must be stream');

    return this.storage.upload(src, filePath)
      .then(() => result);
  }

  /**
   * Download file from the storage
   *
   * @param {string} filePath
   * @param {Writable} dst
   * @param {object} options
   * @returns {Promise}
   */
  download(filePath, dst, options = {}) {
    if (!filePath)
      throw new Error('File path must be provided');

    if (!dst)
      throw new TypeError('Destination must be stream');

    const result = { filePath };
    return this.storage.download(filePath, options)
      .then(src => {
        return new Promise((resolve, reject) => {
          src.pipe(dst)
            .once('error', reject)
            .on('finish', () => resolve(result));
        });
      });
  }

  /**
   * Remove the data from storage
   *
   * @param {string} filePath
   * @returns {promise}
   */
  remove(filePath) {
    if (!filePath)
      throw new Error('File path must be provided');

    return this.storage
      .remove(filePath)
      .then(() => filePath);
  }
}

module.exports = Giga;
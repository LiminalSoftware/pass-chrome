import * as openpgp from 'openpgp';
import { LOCAL_STORAGE } from '../constants';

export function init ({ key, passphrase, generateOptions }) {
  //-- retrieve `chrome.storage` gpg key from `localStorage`: the key used to encrypt `chrome.storage` items
  // is stored in `localStorage` (not sure if we'll continue to store it here)
  const keyContainer = JSON.parse(localStorage.getItem(LOCAL_STORAGE.SECURE_STORE_KEY));
  const keyArmored = keyContainer && keyContainer.privateKeyArmored;
  const storedKey = loadKey(keyArmored);

  return new Promise((resolve, reject) => {
    if (typeof(storedKey) === 'undefined') {
      openpgp.generateKey({...generateOptions, passphrase})
        .then(({ key, privateKeyArmored, publicKeyArmored }) => {
          localStorage.setItem(LOCAL_STORAGE.SECURE_STORE_KEY, JSON.stringify({
            privateKeyArmored,
            publicKeyArmored
          }));

          resolve(key);
        })
        .catch(reject);
    } else {
      //-- defer resolution to next event loop as per promise spec
      setTimeout(() => {
        resolve(storedKey);
      }, 0)
    }
  })
}

export function loadKey (keyArmored) {
  if (!!keyArmored) {
    const loaded = openpgp.key.readArmored(keyArmored);

    if ((loaded.errors && loaded.errors.length > 0) || (loaded.keys && loaded.keys.length < 1)) {
      const delimiter = '<!-- next error -->';

      if (loaded.errors.length > 1) {
        console.warn(`ERROR: the following errors were uncaught while trying to read your storage-encrypting key; errors are delimited by "${delimiter}"`);
      }

      throw new Error(loaded.errors.join(delimiter))
    } else {
      return loaded.keys[ 0 ];
    }
  }
}

export function ensureUnlocked (key, passphrase) {
  return !key.primaryKey.isDecrypted ? key.decrypt(passphrase) : true;
}
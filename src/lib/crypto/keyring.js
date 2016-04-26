import * as openpgp from 'openpgp';

export function init(options) {
  //-- retrieve `chrome.storage` gpg key from `localStorage`: the key used to encrypt `chrome.storage` items
  // is stored in `localStorage` (not sure if we'll continue to store it here)
  let keyContainer = JSON.parse(localStorage.getItem('secureStore.key'))
    , keyArmored   = keyContainer && keyContainer.privateKeyArmored
    , storedKey    = loadKey(keyArmored)
    ;

  return new Promise((resolve, reject) => {
    if (typeof(storedKey) === 'undefined') {
      openpgp.generateKey(options)
        .then((keyContainer) => {
          resolve(keyContainer.key);
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

export function loadKey(keyArmored) {
  if (!!keyArmored) {
    let loaded = openpgp.key.readArmored(keyArmored)
      ;

    if ((loaded.errors && loaded.errors.length > 0) || (loaded.keys && loaded.keys.length < 1)) {
      let delimiter = '<!-- next error -->'
        ;

      if (loaded.errors.length > 1) {
        console.warn(`ERROR: the following errors were uncaught while trying to read your storage-encrypting key; errors are delimited by "${delimiter}"`);
      }

      throw new Error(loaded.errors.join(delimiter))
    } else {
      //-- assumes we're only storing/retrieving 1 key here
      return loaded.keys[0];
    }
  }
}

export function ensureUnlocked(key, passphrase) {
  return !key.primaryKey.isDecrypted ? key.decrypt(passphrase) : true;
}
import * as openpgp from 'openpgp';
window.openpgp = openpgp;

const ERRORS = {
        'KEY_LOCKED'
      }
  ;

export default (passphrase) => {
  const GENERATE_OPTIONS = {
          numBits: 4096,
          userIds: [{name: 'pass-chrome', email: 'pass-chrome@pass-chrome.example'}],
          passphrase
        }
    ;

  //-- NOTE: return from default function
  return initKey().then((key) => {
    const KEY               = key
      , storageProxyHandler = {
            /*
             * Proxies `chrome.storage.local` or `chrome.storage.sync` which are objects.
             * Switch statement to match which property is being accesses, each of which is a function,
             * thus, we return a function which extends the default behavior.
             *
             * NOTE: to be consistent with the rest of the codebase, we're returning promises but also
             * allow for continuation passing and automatically register callbacks if they're passed.
             */
            get: (target, property, receiver) => {
              switch (name) {
                case 'get':
                  //-- if `get`, decrypt before getting
                  return (items, callback) => {
                    //-- NOTE: items can be a string or an array of strings
                    items = typeof(items) === 'string' ? [items] : items;

                    //-- used in conjunction with `Promise.all` when trying to resolve an object instead of an array
                    let labelPromise     = (label, promise) => {
                          return new Promise((resolve) => {
                            promise.then((resolution) => {
                              resolve({[label]: resolution})
                            })
                          })
                        }
                      , operationPromise = new Promise((resolve, reject) => {
                          try {
                            target[property](items, (encryptedValues) => {
                              let decryptPromises = []
                                ;

                              Object.keys(encryptedValues).forEach((label) => {
                                decryptPromises.push(labelPromise(label, decrypt(encryptedValues[label])));
                              });

                              Promise.all(decryptPromises).then((decryptedValuesArray) => {
                                let decryptedValuesObject = {}
                                  ;

                                //-- EXAMPLE: convert something like `[{a: 1}, {b: 2}, {c: 3}]` to `{a: 1, b: 2, c: 3}`
                                decryptedValuesArray.reduce((previous, current) => {
                                  return Object.assign(previous, current);
                                });

                                resolve(decryptedValuesObject);
                              })
                            })
                          } catch (error) {
                            //-- NOTE: if `error` is uncaught via promise (eg. `operationPromise.catch`), it gets re-thrown
                            reject(error);
                          }
                        })
                      ;

                    operationPromise.then(callback);
                    return operationPromise;
                  };
                  break;
                case 'set':
                  //-- if `set`, encrypt before setting
                  return (items, callback) => {
                    //-- NOTE: items is an object
                    let encryptPromises = []
                      , operationPromise = new Promise((resolve, reject) => {
                          try {
                            Object.keys(items).forEach((label) => {
                              encryptPromises.push(labelPromise(label, encrypt(item)))
                            });

                            Promise.all(encryptPromises).then((encryptedValuesArray) => {
                              let encryptedValuesObject = {}
                                ;

                              //-- EXAMPLE: convert something like `[{a: 1}, {b: 2}, {c: 3}]` to `{a: 1, b: 2, c: 3}`
                              encryptedValuesArray.reduce((previous, current) => {
                                return Object.assign(previous, current);
                              });

                              target[property](encryptedValuesObject, () => {
                                //-- success
                                resolve(true);
                              })
                            })
                          } catch (error) {
                            //-- NOTE: if `error` is uncaught via promise (eg. `operationPromise.catch`), it gets re-thrown
                            reject(error);
                          }
                        })
                      ;

                    operationPromise.then(callback);
                    return operationPromise;

                  };
                  break;
                default:
                  //-- if not a function, just proxy, otherwise change function signature to return a promise
                  // and register passed callback (eg. `remove`, `clear`).
                  //-- NOTE: this preserves the original signature but makes callbacks optional allowing the use
                  // of promises instead (or both)
                  return typeof(target[property]) !== 'function' ?
                    target[property] :
                    (...args) => {
                      //-- function signatures for [`StorageArea`](https://developer.chrome.com/extensions/storage#type-StorageArea)
                      // all have `callback` as the last argument
                      let callback         = args.splice(args.length - 1)
                        , operationPromise = new Promise((resolve, reject) => {
                            try {
                              target[property](...args, resolve);
                            } catch (error) {
                              //-- NOTE: if `error` is uncaught via promise (eg. `operationPromise.catch`), it gets re-thrown
                              reject(error);
                            }
                          })
                        ;

                      operationPromise.then(callback);
                      return operationPromise;
                    };
              }
            }
          }
      ;

    return new Promise((resolve, reject) => {
      chrome.storage.local.get('secureStore.pass-chrome', function (encryptedStore) {
        !encryptedStore ?
          newStore().then(resolve, reject) :
          decrypt(encryptedStore).then(resolve, reject);
      })
    });

    function newStore() {
      return new Promise((resolve, reject) => {
        //-- defer resolution to next event loop as per promise spec
        //-- NOTE: `newStore` returns a promise to be consistent with `decrypt`
        setTimeout(() => {
          resolve(new Proxy(chrome.storage.local, storageProxyHandler))
        }, 0)
      })
    }

    function decrypt(encrypted) {
      let message = openpgp.message.readArmored(encrypted)
        ;

      return new Promise((resolve, reject) => {
        if (ensureKeyUnlocked(key, passphrase)) {
          return openpgp.decrypt({
            message   : message,
            publicKeys: [KEY],
            privateKey: KEY
          }).then((decrypted) => {
            resolve(decrypted);
          });
        } else {
          reject({code: ERRORS.KEY_LOCKED, message: 'store key could not be unlocked'})
        }
      })
    }
  });

  function initKey() {
    //-- retrieve `chrome.storage` gpg key from `localStorage`: the key used to encrypt `chrome.storage` items
    // is stored in `localStorage` (not sure if we'll continue to store it here)
    let keyContainer = JSON.parse(localStorage.getItem('secureStore.key'))
      , keyArmored   = keyContainer && keyContainer.privateKeyArmored
      , storedKey    = loadKey(keyArmored)
      ;

    return new Promise((resolve, reject) => {
      if (typeof(storedKey) === 'undefined') {
        openpgp.generate(GENERATE_OPTIONS)
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

  //-- TODO: probably will want to move this out to a utility module
  function loadKey(keyArmored) {
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

  //-- TODO: probably will want to move this out to a utility module
  function ensureKeyUnlocked(key, passphrase) {
    return !key.primaryKey.isDecrypted ? key.decrypt(passphrase) : true;
  }
};

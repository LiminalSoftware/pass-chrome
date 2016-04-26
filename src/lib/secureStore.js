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
  return initStoreKey().then((storeKey) => {
    const STORE_KEY         = storeKey
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
                  return (item, callback) => {
                    return new Promise((resolve, reject) => {
                      target[property](item, (value) => {

                      })
                    })
                  };
                  break;
                case 'set':
                  //-- if `set`, encrypt before setting
                  return (item, callback) => {

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
                              reject(error)
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
          loadStore(encryptedStore).then(resolve, reject);
      })
    });

    function newStore() {
      return new Promise((resolve, reject) => {
        //-- defer resolution to next event loop as per promise spec
        //-- NOTE: `newStore` returns a promise to be consistent with `loadStore`
        setTimeout(() => {
          resolve(new Proxy(chrome.storage.local, storageProxyHandler))
        }, 0)
      })
    }

    function loadStore(encryptedStore) {
      let storeMessage = openpgp.message.readArmored(encryptedStore)
        ;

      return new Promise((resolve, reject) => {
        //return ensureKeyUnlocked(key, passphrase) ? resolve(key) : reject(key)
        if (ensureKeyUnlocked(key, passphrase)) {
          return openpgp.decrypt({
            message   : storeMessage,
            publicKeys: [STORE_KEY],
            privateKey: STORE_KEY
          }).then((store) => {
            resolve(store);
          });
        } else {
          reject({code: ERRORS.KEY_LOCKED, message: 'store key could not be unlocked'})
        }
      })
    }
  });

  function initStoreKey() {
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

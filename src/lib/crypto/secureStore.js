import * as openpgp from 'openpgp';
import { ERRORS } from '../constants';
import { decrypt, encrypt } from './helpers';
import * as keyring from './keyring';

// TODO: remove this!
window.openpgp = openpgp;

export default (passphrase) => {
  const GENERATE_OPTIONS = {
          numBits: 4096,
          userIds: [ { name: 'pass-chrome', email: 'pass-chrome@pass-chrome.example' } ],
          passphrase
        }
    ;

  //-- NOTE: return from default function
  return keyring.init(GENERATE_OPTIONS).then((key) => {
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
            get (target, property, receiver) {
              switch (property) {
                case 'get':
                  //-- if `get`, decrypt before getting
                  return (items, callback) => {
                    //-- NOTE: items can be a string or an array of strings
                    // (see `chrome.storage.local.get` documentation)
                    items = typeof(items) === 'string' ? [ items ] : items;

                    let resolutionHandler = ({ valuesObject, resolve, reject }) => {
                          resolve(valuesObject);
                        }
                      , itemsPromise      = new Promise((resolve, reject) => {
                          target[ property ](items, (encryptedValues) => {
                            resolve(encryptedValues);
                          })
                        })
                      ;

                    return proxyPromiseFactory({
                      itemsPromise,
                      itemHandler: decrypt,
                      callback,
                      resolutionHandler
                    })
                  };
                  break;
                case 'set':
                  //-- if `set`, encrypt before setting
                  return (items, callback) => {
                    //-- NOTE: items is an object
                    let resolutionHandler = ({ valuesObject: encryptedValuesObject, resolve, reject }) => {
                          target[ property ](encryptedValuesObject, () => {
                            //-- success
                            resolve(true);
                          })
                        }
                      ;

                    return proxyPromiseFactory({
                      items,
                      itemHandler: encrypt,
                      callback,
                      resolutionHandler
                    });
                  };
                  break;
                default:
                  //-- if not a function, just proxy, otherwise change function signature to return a promise
                  // and register passed callback (eg. `remove`, `clear`).
                  //-- NOTE: this preserves the original signature but makes callbacks optional allowing the use
                  // of promises instead (or both)
                  return typeof(target[ property ]) !== 'function' ?
                    target[ property ] :
                    (...args) => {
                      //-- function signatures for [`StorageArea`](https://developer.chrome.com/extensions/storage#type-StorageArea)
                      // all have `callback` as the last argument
                      let callback         = args.splice(args.length - 1)[ 0 ]
                        , operationPromise = new Promise((resolve, reject) => {
                            try {
                              target[ property ](...args, resolve);
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

    // TODO: allow proxying of `chrome.storage.sync`
    return new Proxy(chrome.storage.local, storageProxyHandler);

    function proxyPromiseFactory ({ itemsPromise, items, itemHandler, callback, resolutionHandler }) {
      let valuePromises    = []
          //-- used in conjunction with `Promise.all` when trying to resolve an object instead of an array
        , operationPromise = new Promise((resolve, reject) => {
            try {
              //-- if `itemsPromise` is provided, wait for it to resolve with items; otherwise, use `items`.
              //-- NOTE: if both `itemsPromise` and `items` are passed, `items` will be ignored.
              itemsPromise ?
                itemsPromise.then((items) => {
                  handle({ items, resolve, reject })
                }) :
                handle({ items, resolve, reject });
            } catch (error) {
              //-- NOTE: if `error` is uncaught via promise (eg. `operationPromise.catch`), it gets re-thrown
              reject(error);
            }
          })
        ;

      operationPromise.then(callback);
      return operationPromise;

      function handle ({ items, resolve, reject }) {
        let itemsType = typeof(items)
          ;

        if (itemsType !== 'object') {
          //-- prevent processing non-object enumerables (eg. strings: would encrypt each letter as it's own store item).
          // consistent with `StorageArea` methods' interfaces
          reject({ code: ERRORS.TYPE_ERROR, message: `${ERRORS.TYPE_ERROR}: expected object, got ${itemsType}` })
        } else {
          Object.keys(items).forEach((label) => {
            valuePromises.push(labelPromise(label, itemHandler({
              key       : KEY,
              passphrase: GENERATE_OPTIONS.passphrase,
              input     : items[ label ]
            })))
          });

          Promise.all(valuePromises).then((pairsArray) => {
            let valuesObject = {}
              ;

            //-- EXAMPLE: convert something like `[{a: 1}, {b: 2}, {c: 3}]` to `{a: 1, b: 2, c: 3}`
            pairsArray.reduce((previous, current) => {
              return Object.assign(previous, current);
            }, valuesObject);

            resolutionHandler({
              resolve,
              reject,
              valuesObject
            });
          })
        }
      }

      function labelPromise (label, promise) {
        return new Promise((resolve) => {
          promise.then((resolution) => {
            resolve({ [label]: resolution })
          })
        })
      }
    }
  })
};

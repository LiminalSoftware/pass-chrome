import * as openpgp from 'openpgp';
import { ERRORS } from '../constants';
import * as keyring from './keyring';
import storageProxyFactory from './storageProxy'

// TODO: remove this!
window.openpgp = openpgp;

const defaultGenOptions = {
  numBits: 4096,
  userIds: [ { name: 'pass-chrome', email: 'pass-chrome@pass-chrome.example' } ]
};

const secureStore = ({ keyArmoredObject = {}, passphrase }) => {
  const { publicKeyArmored, privateKeyArmored } = keyArmoredObject;
  const keyLoadedHandler = (key) => {
    return storageProxyFactory({key, passphrase});
  };

  if (publicKeyArmored && privateKeyArmored) {
    //-- TODO: maybe move these into the promise, wrap with `try/catch` and reject in the catch
    const publicKey = keyring.loadKey(publicKeyArmored);
    const privateKey = keyring.loadKey(privateKeyArmored);
    const keyIsUnlocked = keyring.ensureUnlocked(privateKey, passphrase);

    return new Promise((resolve, reject) => {
      //-- TODO: is this `setTimeout` necessary in es6?
      setTimeout(() => {
        if (!keyIsUnlocked) {
          reject(ERRORS.KEY_LOCKED);
        } else {
          resolve(keyLoadedHandler(privateKey));
        }
      }, 0)
    })
  } else {
    //-- NOTE: return from default function
    return keyring.init({ keyArmoredObject, passphrase, defaultGenOptions })
      .then(keyLoadedHandler)
  }
};

export default secureStore;

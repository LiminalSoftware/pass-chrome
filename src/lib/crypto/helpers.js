import * as openpgp from 'openpgp';
import {ERRORS} from '../constants';
import {ensureUnlocked} from './keyring';

export function encrypt({key, input}) {
  return new Promise((resolve, reject) => {
    //-- NOTE: unlock is needed for signing encrypted data (which we want; although, technically, it's optional)
    if (ensureUnlocked(key, passphrase)) {
      return openpgp.encrypt({
        data       : input,
        // TODO: this is where we would add support for multiple key decryption
        publicKeys : [key],
        privateKeys: [key],
        armor      : true
      }).then((encrypted) => {
        resolve(encrypted.data);
      });
    } else {
      reject({code: ERRORS.KEY_LOCKED, message: 'store key could not be unlocked'})
    }
  })
}

export function decrypt({key, input}) {
  let message = openpgp.message.readArmored(input)
    ;

  return new Promise((resolve, reject) => {
    if (ensureUnlocked(key, passphrase)) {
      return openpgp.decrypt({
        message   : message,
        publicKeys: [key],
        privateKey: key
      }).then((decrypted) => {
        resolve(decrypted);
      });
    } else {
      reject({code: ERRORS.KEY_LOCKED, message: 'store key could not be unlocked'})
    }
  })
}

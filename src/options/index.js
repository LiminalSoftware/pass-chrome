//-- TODO: switch to `import * as openpgp from 'openpgp';`
const openpgp = require('openpgp');
import SecureStore from '../lib/crypto/secureStore';

const storePromise = SecureStore({passphrase: 'badpassword'})
  .then((secureStore)=> {
    // TODO: remove this!
    window.store = secureStore;

    return new Promise((resolve) => {
      secureStore.get([ 'options', 'publicKeys', 'privateKeys' ]).then((data) => {
        resolve({ ...data, secureStore })
      })
    });
  })

  .then(({ secureStore, options = {}, publicKeys = {}, privateKeys = {} })=> {

    window.addEvent("domready", function () {
      const findSettingByName = (name) => {
        return manifest.settings.filter(function (setting) {
          return setting.name === name;
        })[ 0 ]
      };
      const publicKeysSetting = findSettingByName('publicKeys');
      const privateKeysSetting = findSettingByName('privateKeys');

      const mapKeysToSettingOptions = (keys, setting) => {
        if (Object.keys(keys).length > 0) {
          setting.options = Object.keys(keys).map(function (keyId) {
            const key = keys[ keyId ];
            return {
              text : `${key.uids.join(', ')}: ${key.keyId}`,
              value: keyId
            }
          });
        }
      };

      mapKeysToSettingOptions(publicKeys, publicKeysSetting);
      mapKeysToSettingOptions(privateKeys, privateKeysSetting);

      new FancySettings.initWithManifest(function (settings) {
        /*
         * Event Bindings
         */

        settings.manifest.removeKey.addEvent('action', function () {
          const publicKeyOptions = [].slice.call(settings.manifest.publicKeys.element.options);
          const privateKeyOptions = [].slice.call(settings.manifest.privateKeys.element.options);
          const deleteSelectedKeys = (keys, options) => {
            options.forEach(function (option) {
              if (option.selected) delete keys[ option.value ];
            });
          };

          deleteSelectedKeys(publicKeys, publicKeyOptions);
          deleteSelectedKeys(privateKeys, privateKeyOptions);

          secureStore.set({ privateKeys }, function () {
            //-- NOTE: since we're reloading we don't have to keep `privateKeys`
            // in sync with `settings.manifest.privateKeys`, etc. when modifying
            location.reload();
          })
        });

        settings.manifest.addKey.addEvent('modal_submit', function () {
          //-- TODO: can't we just access the settings object directly instead?
          const keyText = JSON.parse(localStorage.getItem('store.settings.keyText'));

          //-- TODO: use helper like `keyring.loadKey` (or whatever that gets refactored into)
          const { keys: [ key] } = openpgp.key.readArmored(keyText);
          const newKey = {
            uids : [
              ...(key.users.map(user => {
                return user.userId.userid
              }))
            ],
            keyId: key.primaryKey.keyid.toHex(),
            armor: key.armor()
          };

          const cleanup = () => {
            //-- cleanup entered key from localStorage
            localStorage.removeItem('store.settings.keyName');
            localStorage.removeItem('store.settings.keyText');
            location.reload();
          };

          if (key.isPublic()) {
            publicKeys[ newKey.keyId ] = newKey;
            secureStore.set({ publicKeys });
          } else {
            privateKeys[ newKey.keyId ] = newKey;
            secureStore.set({ privateKeys });
          }
        })
      });
    })
  });

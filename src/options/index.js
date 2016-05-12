const openpgp = require('openpgp');
import SecureStore from '../lib/crypto/secureStore';

const storePromise = SecureStore('badpassword')
  .then((secureStore)=> {
    // TODO: remove this!
    window.store = secureStore;

    return new Promise((resolve) => {
      secureStore.get([ 'options', 'privateKeys' ]).then((data) => {
        resolve({ ...data, secureStore })
      })
    });
  })

  .then(({ secureStore, options, privateKeys = [] })=> {
    options = options || {};
    privateKeys = privateKeys || {};

    window.addEvent("domready", function () {
      // Merge `options` with `settings` or something...
      let keysSetting = manifest.settings.filter(function (setting) {
        return setting.name == 'privateKeys';
      })[ 0 ];

      if (Object.keys(privateKeys).length > 0) {
        keysSetting.options = Object.keys(privateKeys).map(function (keyId) {
          const key = privateKeys[ keyId ];
          return {
            text : `${key.uids.join(', ')}: ${key.keyId}`,
            value: keyId
          }
        });
      }

      new FancySettings.initWithManifest(function (settings) {
        /*
         * Event Bindings
         */

        settings.manifest.removeKey.addEvent('action', function () {
          var removeIds = [];

          [].slice.call(settings.manifest.privateKeys.element.options).forEach(function (option) {
            if (option.selected) removeIds.push(option.value)
          });

          removeIds.forEach((keyId) => {
            delete privateKeys[ keyId ];
          });

          secureStore.set({ privateKeys }, function () {
            //-- NOTE: since we're reloading we don't have to keep `keys`
            // in sync with `settings.manifest.privateKeys` when modifying
            location.reload();
          })
        });

        settings.manifest.addKey.addEvent('modal_submit', function () {
          //-- TODO: can't we just access the settings object directly instead?
          const keyText = JSON.parse(localStorage.getItem('store.settings.keyText'));

          const { keys: [ key] } = openpgp.key.readArmored(keyText);
          //-- TODO: verify that this is a private key... `key.isPrivate()` (`key.isPublic()`)
          debugger;
          privateKeys.push({
            uids : [
              ...(key.users.map(user => {
                return user.userId.userid
              }))
            ],
            keyId: key.primaryKey.keyid.toHex(),
            armor: key.armor()
          });

          secureStore.set({ privateKeys }, function () {
            //-- cleanup entered key from localStorage
            localStorage.removeItem('store.settings.keyName');
            localStorage.removeItem('store.settings.keyText');
            location.reload();
          });
        })
      });
    })
  });

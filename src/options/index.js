//var encryptedStore = require('./encryptedStore');
import SecureStore from '../lib/crypto/secureStore';
//console.log(SecureStore);
//console.log(new SecureStore('badpassword'));
//console.log(SecureStore.test());

const storePromise = SecureStore('badpassword')
  .then((store)=> {
    console.log('got store: ');
    console.log(store);
    return store.get('options')
  })

  .then((options)=> {
    console.log('got options: ');
    console.log(options);
    options = options || {};

    window.addEvent("domready", function () {
      // Merge `options` with `settings` or something...
      let keysSetting = manifest.settings.filter(function (setting) {
        return setting.name == 'storedKeys';
      })[0];

      if (options.keys && options.keys.length > 0) {
        keysSetting.options = options.keys.map(function (key) {
          return {
            text : key.email,
            value: key.id
          }
        });
      }

      new FancySettings.initWithManifest(function (settings) {
        /*
         * Event Bindings
         */

        settings.manifest.removeKey.addEvent('action', function () {
          var removeIds = [];

          [].slice.call(settings.manifest.storedKeys.element.options).forEach(function (option) {
            if (option.selected) removeIds.push(option.value)
          });

          options.keys = options.keys.filter(function (key) {
            return removeIds.every(function (id) {
              return id !== key.id;
            })
          });

          chrome.storage.sync.set({options: options}, function () {
            location.reload();
          })
        });

        settings.manifest.addKey.addEvent('modal_submit', function () {
          var keyName = JSON.parse(localStorage.getItem('store.settings.keyName'))
            , keyText = JSON.parse(localStorage.getItem('store.settings.keyText'))
            ;

          //-- error if keyName or keyText is empty
          if (!keyName || !keyText) {
            return alert('Key name and key text must be provided!');
          }

          //-- add key to encrypted storage
          var newKey = {
            email: keyName,
            id   : keyName
          };

          if (options.keys && options.keys.length > 0) {
            options.keys.push(newKey);
          } else {
            options.keys = [newKey]
          }

          //-- TODO: add keyText to encrypted storage
          //-- TODO: extract and use keyId
          chrome.storage.sync.set({options: options}, function () {
            //-- cleanup entered key from localStorage
            localStorage.removeItem('store.settings.keyName');
            localStorage.removeItem('store.settings.keyText');
            location.reload();
          })
        })
      });
    })
  });

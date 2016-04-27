Secure Store
============

Currently the secure store generates a new gpg key when it's instantiated, using the passphrase passed in. 
All values stored and retrieved from that instance will use that key with that passphrase.

While this may not be very practical for the moment, there will be key storage/loading options as this gets built out more.

Demo
----

```javascript
var secureStore = require('../src/lib/crypto/secureStore'); //-- literal path, relative to this file
var store = secureStore('your passphrase');

//-- clear anything that may be lingering in storage (for this domain)
console.log('clear anything that may be lingering in storage (for this domain)...');
chrome.storage.local.clear();


//-- verify storage is empty
chrome.storage.local.get((data)=> {
  console.log('verify storage is empty:', data);
});


//-- store an encrypted value
console.log('store an encrypted value...');
// store.set({test:'testing 123'})
store.set({test: 'testing 123'})
    .then(()=> {
      //-- verify there is encrypted value stored on the expected key
      // chrome.storage.local.get((i)=>{console.log(i)})

      chrome.storage.local.get((encryptedData)=> {
        console.log('verify there is encrypted value stored on the expected key:', encryptedData);
      })
    })
    .then(()=> {
      //-- retrieve an encrypted value and decrypt it
      //store.get('test',(i)=>{console.log(i)})

      return store.get('test')
    })
    .then((decryptedData)=> {
      console.log('retrieve an encrypted value and decrypt it:', decryptedData);
    })
    .then(()=> {
      //-- store a second encrypted value
      console.log('store a second encrypted value...');
      //  store.set({test2:'testing 456'})

      return store.set({test2: 'testing 456'})
    })
    .then(()=> {
      //-- verify that there are 2 encrypted value stored on the expected keys
      //  chrome.storage.local.get((i)=>{console.log(i)})

      chrome.storage.local.get((encryptedData)=> {
        console.log('verify that there are 2 encrypted value stored on the expected keys:', encryptedData);
      })
    })
    .then(()=> {
      //-- retrieve both encrypted values and decrypt them
      //    store.get(['test', 'test2'],(i)=>{console.log(i)})

      return store.get(['test', 'test2'])
    })
    .then((decryptedData)=> {
      console.log('retrieve both encrypted values and decrypt them:', decryptedData);
    })
;
```

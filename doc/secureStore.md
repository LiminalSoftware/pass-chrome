Secure Store
============

Secure store is a proxy of `chrome.storage.local` (or `chrome.storage.sync` with a future option). Its primary purpose 
is to intercept calls to `.set` and `.get`, encrypting or decrypting (respectively) the passed data in-between caller 
and receiver. It also intercepts calls to other methods (eg. `.remove`, `.clear`, etc.) as a result of the way proxies 
work and fact that `chrome.storage.local` is an object. It does its best to get out of the way and provide normal functionality 
of these other methods.

Secondarily, it adapts the interface of all properties of `chrome.storage.local` which are functions, to return a 
promise (as opposed to `undefined`). This change allows for the use of callback, which is consistent with the original 
interface, but also allows for the use of promises if you would rather go that route. For an example of the practical 
ramifications of this, reference the [demo](#demo) below.


Currently the secure store generates a new gpg key when it's instantiated, using the passphrase passed in. 
All values stored and retrieved from that instance of secure store will use that key with that passphrase.

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
  //-- output: Object {}
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
        // output: Object {test: "-----BEGIN PGP MESSAGE----- ↵Version: OpenPGP.js v…tPOISI6Hpp2hR ↵=A4+M ↵-----END PGP MESSAGE----- ↵"}
      })
    })
    .then(()=> {
      //-- retrieve an encrypted value and decrypt it
      //store.get('test',(i)=>{console.log(i)})

      return store.get('test')
    })
    .then((decryptedData)=> {
      console.log('retrieve an encrypted value and decrypt it:', decryptedData);
      //-- output: Object {test: "testing 123"}
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
        //-- output: Object {
        //             test: "-----BEGIN PGP MESSAGE----- ↵Version: OpenPGP.js v…tPOISI6Hpp2hR ↵=A4+M ↵-----END PGP MESSAGE----- ↵", 
        //             test2: "-----BEGIN PGP MESSAGE----- ↵Version: OpenPGP.js v…LA5ksHrRUIL4t ↵=mFF2 ↵-----END PGP MESSAGE----- ↵"
        //           }
      })
    })
    .then(()=> {
      //-- retrieve both encrypted values and decrypt them
      //    store.get(['test', 'test2'],(i)=>{console.log(i)})

      return store.get(['test', 'test2'])
    })
    .then((decryptedData)=> {
      console.log('retrieve both encrypted values and decrypt them:', decryptedData);
      //-- output: Object {test: "testing 123", test2: "testing 456"}
    })
;
```

Pass-Chrome
===========
-----------

Rationale
---------

I love `pass`  [(password-store)](http://www.passwordstore.org) but I'm tired of having to find the nearest terminal 
window or opening [qtPass](https://github.com/IJHack/qtpass) and switching windows to use it.

The goal of this project is to bring all the security, control, and awesomeness of `pass` into the browser, where I find 
myself needing it most often.

------------

Contributing
------------

####Getting set up

_NOTE: this project assumes you have `npm` and `nvm` installed_

1. Use the correct node version: `nvm use` to load the correct version from the `.nvmrc` file
  * _If you don't have `nvm`, make sure you're using the version of node that mathces what's in the `.nvmrc` file_
1. Install webpack globally: `npm i -g webpack`
1. Install project dependencies: `npm i`
1. Load the extension into chrome:
  1. Go to [chrome://extensions](chrome://extensions)
  1. Ensure the "Developer mode" checkbox is checked
  1. Click "Load unpacked extension..."
  1. Navigate to the project root and click "Select"

####Running in development / Workflow

You can start a build with `npm run dev`; this watches the filesystem for changes and rebuilds. Once each build is 
complete you can simply reload in the inspector/console window or form the chome://extensions page to see your changes.

####Building for Production **(WIP)**

_NOTE: not currently implemented_

You can build static output by running `npm run build`; the output is placed in `<project root>/build` which can then 
be used as the root for packaging the extension with chrome.

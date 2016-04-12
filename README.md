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

_NOTE: this project assumes you have `npm` installed_

1. Install webpack globally: `npm i -g webpack`
1. Install project dependencies: `npm i`

####Running in development

You can start a develompent webserver with `npm run dev`; This development server builds and serves everything from 
memory and does not create any output on the filesystem. This environment includes a [hot reload for react](https://github.com/gaearon/react-hot-loader) 
which will update your source in the browser without refreshing or restarting the server.

####Building

You can build static output by running `npm run build`; the output is placed in `<project root>/build`.

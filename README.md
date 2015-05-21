# npm Enterprise Installer

[![Build Status](https://travis-ci.org/npm/npme-installer.svg?branch=master)](https://travis-ci.org/npm/npme-installer)

One-step-installer for npmE servers.

## Supported Platforms

* Ubuntu Trusty
* Centos 6.5

## Prerequisites

* provision a VM for one of our supported platforms.
* ensure that npm and Node.js 0.10.x are installed:
  * https://github.com/joyent/node/wiki/installing-node.js-via-package-manager
* upgrade npm to 2.x.x on the VM you have provisioned:
  * `sudo npm install npm -g`
* npm Enterprise must be installed from an account that has passwordless sudo:
  * as part of the installation process npm Enterprise creates the `npme` user.

## Installing

```bash
npm install npme
```

## Updating

```bash
npm install npme
npme update
```

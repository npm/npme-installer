# npm on-site Installer

[![Build Status](https://travis-ci.org/npm/npmo-installer.svg?branch=master)](https://travis-ci.org/npm/npmo-installer)

One-step-installer for npm on-site.

## Supported Platforms

Modern versions of Ubuntu (12.04+), Debian, Centos (7+), Red Hat & Fedora

## Prerequisites

* provision a VM for one of our supported platforms.
* ensure that a modern version of node is installed on the server.
  * https://github.com/joyent/node/wiki/installing-node.js-via-package-manager

## Installing

```shell
sudo npm install npmo -g --unsafe
```

Once installation is complete visit __https://your-server-address:8800__ and bypass the security warning (you can provide your own certificate later to prevent this warning). You will be presented with a management UI which allows you to configure your npm Enterprise appliance.

## Connecting to the Registry

By default the npm on-site registry will be availble on __http://your-server-address:8080__.

Simply run:

```shell
npm login --scope=@my-company-name --registry=http://your-server-address:8080
```

And publish modules using the corresponding scope name:

```json
{
  "name": "@my-company-name/my-module",
  "repository": {
    "url": "git://github.mycompany.com/myco/mypackage.git"
  }
}
```

## Updating

Access your server via HTTPS on port 8800 and check for updates via
the management console.

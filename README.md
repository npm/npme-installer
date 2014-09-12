# Docker Image for the npm Enterprise Installer

sudo docker run -ti marcellodesales/npme

```
$ sudo docker run -t -i marcellodesales/npme 
npm Enterprise. It's npm, but you run it yourself!

install:	install npm Enterprise on a (preferably) blank operating system.
start:		start npmE and all its services.
stop:		stop npmE services.
restart:	restart npmE services.
add-package:	add a package to the package-follower whitelist (add-package jquery).
reset-follower:	reindex from the public registry all packages listed in whitelist.
update:		update npm Enteprise.

Options:
  -u, --user   [default: "npme"]
  -g, --group  [default: "npme"]
  -s, --sudo   [default: true]

```

You need to install and obtain a license.

```
$ sudo docker run -t -i marcellodesales/npme install
[?] this will install npmE on this server (you should only run this on a dedicated machine), continue? Yes
[?] enter your billing email: example@mail.com
[?] enter your license key: @#!@34%$@#

```

The manual steps are described below:

# npm Enterprise Installer

One-step-installer for npmE servers.

## Supported Platforms

* Ubuntu Trusty
* Centos 6.5

## Prerequisites

* provision a VM for one of our supported platforms.
* ensure that npm and Node.js 0.10.x are installed:
  * https://github.com/joyent/node/wiki/installing-node.js-via-package-manager
* upgrade npm to 2.x.x on the VM you have provisioned:
  * `sudo npm install npm@2.0.0-beta.3 -g`
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

# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="4.0.0"></a>
# [4.0.0](https://github.com/npm/npme-installer/compare/v3.10.0...v4.0.0) (2016-06-01)


### Features

* switch to docker/stable as our default installation ([#143](https://github.com/npm/npme-installer/issues/143))([01f8d14](https://github.com/npm/npme-installer/commit/01f8d14))
* use replicated bin if present, fall back to docker admin command ([#142](https://github.com/npm/npme-installer/issues/142))([3700bef](https://github.com/npm/npme-installer/commit/3700bef))


### BREAKING CHANGES

* replicated will now run on Docker without a central bin being installed for management



<a name="3.10.0"></a>
# [3.10.0](https://github.com/npm/npme-installer/compare/v3.9.2...v3.10.0) (2016-05-06)


### Features

* added a new command for removing third-party addons ([#137](https://github.com/npm/npme-installer/issues/137))([6469c9c](https://github.com/npm/npme-installer/commit/6469c9c))



<a name="3.9.2"></a>
## [3.9.2](https://github.com/npm/npme-installer/compare/v3.9.1...v3.9.2) (2016-04-28)


### Bug Fixes

* cannot get google deploy to pick up the zone variable :shurgmoji: ([b9801b7](https://github.com/npm/npme-installer/commit/b9801b7))



<a name="3.9.1"></a>
## [3.9.1](https://github.com/npm/npme-installer/compare/v3.9.0...v3.9.1) (2016-04-28)


### Bug Fixes

* property should be compute/zone rather than zone ([#136](https://github.com/npm/npme-installer/issues/136)) ([8800a69](https://github.com/npm/npme-installer/commit/8800a69))



<a name="3.9.0"></a>
# [3.9.0](https://github.com/npm/npme-installer/compare/v3.6.0...v3.9.0) (2016-04-28)


### Bug Fixes

* Do not let update-notifier errors crash the bin ([#132](https://github.com/npm/npme-installer/issues/132)) ([c28d4bb](https://github.com/npm/npme-installer/commit/c28d4bb))
* have to chown -R to fix update-notifier access ([#134](https://github.com/npm/npme-installer/issues/134)) ([daea8bc](https://github.com/npm/npme-installer/commit/daea8bc)), closes [(#134](https://github.com/(/issues/134)
* move profile.sh to boot.sh ([#135](https://github.com/npm/npme-installer/issues/135)) ([aad1239](https://github.com/npm/npme-installer/commit/aad1239))

### Features

* added template for booting npm Enterprise on GCE ([#133](https://github.com/npm/npme-installer/issues/133)) ([0be4f8d](https://github.com/npm/npme-installer/commit/0be4f8d))
* check for newer npme version via update-notifier ([#131](https://github.com/npm/npme-installer/issues/131)) ([2298157](https://github.com/npm/npme-installer/commit/2298157))



<a name="3.8.0"></a>
# [3.8.0](https://github.com/npm/npme-installer/compare/v3.7.1...v3.8.0) (2016-04-28)


### Bug Fixes

* have to chown -R to fix update-notifier access ([#134](https://github.com/npm/npme-installer/issues/134)) ([daea8bc](https://github.com/npm/npme-installer/commit/daea8bc)), closes [(#134](https://github.com/(/issues/134)

### Features

* added template for booting npm Enterprise on GCE ([#133](https://github.com/npm/npme-installer/issues/133)) ([0be4f8d](https://github.com/npm/npme-installer/commit/0be4f8d))



<a name="3.7.1"></a>
## [3.7.1](https://github.com/npm/npme-installer/compare/v3.7.0...v3.7.1) (2016-04-28)


### Bug Fixes

* Do not let update-notifier errors crash the bin ([#132](https://github.com/npm/npme-installer/issues/132)) ([c28d4bb](https://github.com/npm/npme-installer/commit/c28d4bb))



<a name="3.7.0"></a>
# [3.7.0](https://github.com/npm/npme-installer/compare/v3.6.0...v3.7.0) (2016-04-27)


### Features

* check for newer npme version via update-notifier ([#131](https://github.com/npm/npme-installer/issues/131)) ([2298157](https://github.com/npm/npme-installer/commit/2298157))



<a name="3.6.0"></a>
# [3.6.0](https://github.com/npm/npme-installer/compare/v3.5.0...v3.6.0) (2016-04-22)


### Features

* add admin command for installing addons ([9d33ebc](https://github.com/npm/npme-installer/commit/9d33ebc))
* rename the bin back to npme ([#125](https://github.com/npm/npme-installer/issues/125)) ([af83c54](https://github.com/npm/npme-installer/commit/af83c54))

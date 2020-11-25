# CFW Scripts

[![sync2gitee(list)](<https://github.com/yi-Xu-0100/hub-mirror/workflows/sync2gitee(list)/badge.svg>)](https://github.com/yi-Xu-0100/hub-mirror)
[![Github last commit](https://img.shields.io/github/last-commit/yi-Xu-0100/cfw-scripts)](https://github.com/yi-Xu-0100/cfw-scripts)
[![Github latest release](https://img.shields.io/github/v/release/yi-Xu-0100/cfw-scripts)](https://github.com/yi-Xu-0100/cfw-scripts/releases)
[![Github license](https://img.shields.io/github/license/yi-Xu-0100/cfw-scripts)](./LICENSE)

[![views](https://raw.githubusercontent.com/yi-Xu-0100/traffic2badge/traffic/traffic-cfw-scripts/views.svg)](https://github.com/yi-Xu-0100/traffic2badge/tree/traffic#-cfw-scripts)
[![views per week](https://raw.githubusercontent.com/yi-Xu-0100/traffic2badge/traffic/traffic-cfw-scripts/views_per_week.svg)](https://github.com/yi-Xu-0100/traffic2badge/tree/traffic#-cfw-scripts)
[![clones](https://raw.githubusercontent.com/yi-Xu-0100/traffic2badge/traffic/traffic-cfw-scripts/clones.svg)](https://github.com/yi-Xu-0100/traffic2badge/tree/traffic#-cfw-scripts)
[![clones per week](https://raw.githubusercontent.com/yi-Xu-0100/traffic2badge/traffic/traffic-cfw-scripts/clones_per_week.svg)](https://github.com/yi-Xu-0100/traffic2badge/tree/traffic#-cfw-scripts)

Some scripts for [`parser`](https://docs.cfw.lbyczf.com/contents/parser.html) in [`Fndroid/clash_for_windows_pkg`](https://github.com/Fndroid/clash_for_windows_pkg).

**Only for studying and testing usage, and delete code yourself with the usage completed. Thanks!** 😜

## 🎨 Table of Contents

- [🎨 Table of Contents](#-table-of-contents)
- [🚀 Usage](#-usage)
  - [📝 setup repository with git and npm](#-setup-repository-with-git-and-npm)
  - [📝 Setup parser for `change-keys.js`](#-setup-parser-for-change-keysjs)
  - [📝 Setup parser for `change-rules.js`](#-setup-parser-for-change-rulesjs)
  - [📝 Setup parser for `merge-nodes.js`](#-setup-parser-for-merge-nodesjs)
  - [📝 Setup parser for `auto-check-in.js`](#-setup-parser-for-auto-check-injs)
  - [📝 Setup parser for `subs-info-parser.js`](#-setup-parser-for-subs-info-parserjs)
- [📝 Scripts](#-scripts)
- [🍱 Libraries](#-libraries)
- [🔊 CHANGELOG](#-changelog)
- [📄 LICENSE](#-license)
- [🎉 Thanks](#-thanks)

## 🚀 Usage

### 📝 setup repository with git and npm

The scripts used [`mikaelbr/node-notifier`](https://github.com/mikaelbr/node-notifier) for fitting windows notification persist in action center.

```bash
git clone https://github.com/yi-Xu-0100/cfw-scripts.git
npm ci
npm run start
```

The notify will be test and copy `./lib/variables.yml` and `./lib/rule-providers.yml` to `./scripts/variables.yml` and `./scripts/rule-providers.yml`. **You can set variables in `./scripts/variables.yml` and set personal rule in `./scripts/rule-providers.yml`, and the files will include in `.gitignore`.**

### 📝 Setup parser for `change-keys.js`

**The script was used to change keys for fitting [breaking changes](https://github.com/Dreamacro/clash/wiki/breaking-changes-in-1.0.0) in clash v1.0.0.**

You can set the parsers with `reg` to fit the all link without string `www.example.com`.

```yml
parsers:
  - reg: ^((?!www\.example\.com).)*$
    file: 'D:/Applications/cfw-scripts/scripts/change-keys.js' #set the path of `change-keys.js`.
```

### 📝 Setup parser for `change-rules.js`

**The script will use [`rule-providers`](https://lancellc.gitbook.io/clash/clash-config-file/rule-provider) with [`Loyalsoldier/clash-rules`](https://github.com/Loyalsoldier/clash-rules).**

You can set the parsers with `reg` to fit the all link without string `www.example.com`.

```yml
parsers:
  - reg: ^((?!www\.example\.com).)*$
    file: 'D:/Applications/cfw-scripts/scripts/change-rules.js' #set the path of `change-rules.js`.
```

### 📝 Setup parser for `merge-nodes.js`

**The script should use behind `change-rules.js`. The variables need to be set in `./scripts/variables.yml`.**

You can set the parsers with `reg` to fit the all link without string `www.example.com`.

```yml
parsers:
  - reg: ^((?!www\.example\.com).)*$
    file: 'D:/Applications/cfw-scripts/scripts/merge-nodes.js' #set the path of `merge-nodes.js`.
```

### 📝 Setup parser for `auto-check-in.js`

**The script was used to automatic check in. The variables need to be set in `./scripts/variables.yml`.**

You can set the parsers with `reg` to fit the all link without string `www.example.com`.

```yml
parsers:
  - reg: ^((?!www\.example\.com).)*$
    file: 'D:/Applications/cfw-scripts/scripts/auto-check-in.js' #set the path of `auto-check-in.js`.
```

**It will add fake node into `proxies` and add `CHECK-INFO` into the end of `proxy-groups`. Be careful to edit the subscription later.**

### 📝 Setup parser for `subs-info-parser.js`

**The script was used to get subscription information of domains. The variables need to be set in `./scripts/variables.yml`.**

You can set the parsers with `reg` to fit the all link without string `www.example.com`.

```yml
parsers:
  - reg: ^((?!www\.example\.com).)*$
    file: 'D:/Applications/cfw-scripts/scripts/subs-info-parser.js' #set the path of `subs-info-parser.js`.
```

**It will add fake node into `proxies` and add `SUBS-INFO` into the end of `proxy-groups`. Be careful to edit the subscription later.**

You can set the default variables for `current` and `expire`. The `current` for controlling whether the subscription information of current URL showing, and The `expire` for controlling whether the expiry time of subscription information showing.

## 📝 Scripts

|         name          |         description          |    variables     |
| :-------------------: | :--------------------------: | :--------------: |
|   [change-keys.js]    |     fit new version key      |                  |
|   [change-rules.js]   |      add personal rule       |                  |
|   [merge-nodes.js]    |         merge nodes          |   merge-nodes    |
| [subs-info-parser.js] | get subscription information | subs-info-parser |
|  [auto-check-in.js]   |        auto check in         |  auto-check-in   |

[change-keys.js]: https://github.com/yi-Xu-0100/cfw-scripts/tree/main/scripts/change-keys.js
[change-rules.js]: https://github.com/yi-Xu-0100/cfw-scripts/tree/main/scripts/change-rules.js
[merge-nodes.js]: https://github.com/yi-Xu-0100/cfw-scripts/tree/main/scripts/merge-nodes.js
[subs-info-parser.js]: https://github.com/yi-Xu-0100/cfw-scripts/tree/main/scripts/subs-info-parser.js
[auto-check-in.js]: https://github.com/yi-Xu-0100/cfw-scripts/tree/main/scripts/auto-check-in.js

## 🍱 Libraries

|         name          |         description         |        dependencies        |
| :-------------------: | :-------------------------: | :------------------------: |
|   [variables.json]    |    variables for scripts    |                            |
|      [notify.js]      |     notify for windows      |  [mikaelbr/node-notifier]  |
| [rule-providers.json] | template for rule-providers | [Loyalsoldier/clash-rules] |

[variables.json]: https://github.com/yi-Xu-0100/cfw-scripts/tree/main/lib/variables.json
[notify.js]: https://github.com/yi-Xu-0100/cfw-scripts/tree/main/lib/notify.js
[mikaelbr/node-notifier]: https://github.com/mikaelbr/node-notifier
[rule-providers.json]: https://github.com/yi-Xu-0100/cfw-scripts/tree/main/lib/rule-providers.json
[loyalsoldier/clash-rules]: https://github.com/Loyalsoldier/clash-rules

## 🔊 CHANGELOG

- [CHANGELOG](https://github.com/yi-Xu-0100/cfw-scripts/blob/main/CHANGELOG.md)

## 📄 LICENSE

- [MIT](https://github.com/yi-Xu-0100/cfw-scripts/blob/main/LICENSE)

## 🎉 Thanks

- [Fndroid/clash_for_windows_pkg](https://github.com/Fndroid/clash_for_windows_pkg)
- [Loyalsoldier/clash-rules](https://github.com/Loyalsoldier/clash-rules)

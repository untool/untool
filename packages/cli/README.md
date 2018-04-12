# `untool`

[![npm](https://img.shields.io/npm/v/untool.svg)](https://www.npmjs.com/package/untool)

`untool` is our main, global command line interface. It serves two purposes: it can be used to to control `untool` projects and to bootstrap new ones. It provides a terminal command, `un`, that exposes its entire functionality.

### Installation

`untool` is meant to be installed globally, not in specific projects. If you want to add a local command line interface to your project to be used in `package.json` scripts, please use [`@untool/yargs`](https://github.com/untool/untool/blob/master/packages/yargs/README.md) instead.

```bash
$ yarn global add untool # OR npm install --global untool
```

### Utilization

`untools`'s mode of operation inside an existing project is that it will find a locally installed [`@untool/yargs`](https://github.com/untool/untool/blob/master/packages/yargs/README.md) and execute it. In this case, it will act as a very minimal wrapper around it.

```text
$ un start -s
foo info
server listening at http://localhost:8080
```

You can also call it without arguments to see a list of available commands. This list will vary depending on the mixins you installed in every individual project.

```text
$ un
Usage: un <command> [options]

Commands:
  un serve    Serve untest
  un start    Build and serve untest
  un build    Build untest
  un develop  Serve untest in watch mode

Options:
  --version   Show version number                                     [boolean]
  --help, -h  Show help                                               [boolean]
```

If you call `un` in a folder that does not contain a `package.json` file, however, it will offer to initialize the current folder as a new project and create one.

```text
$ un
? Initialize foo as new project? Yes
! Initializing project...
```

If you accept that offer or if you call `un` in a folder that already contains a `package.json` file, `un` will ask you if you want to install the [`@untool/defaults`](https://github.com/untool/untool/blob/master/packages/defaults/README.md) preset.

```text
$ un
? Install untool default preset? Yes
! Installing (this can take a while)...

\o/ All done!
```

If you do not accept, `un` will search NPM for the keywords `unmixin` and `unpreset` and offer to install the packages it finds. Please make sure you, at the very least, select [`@untool/yargs`](https://github.com/untool/untool/blob/master/packages/yargs/README.md).

```text
$ un
? Install untool default preset? No
! Looking up presets and modules...
? What presets do you want to install? @untool/express, @untool/webpack
? What mixins do you want to install? @untool/react, @untool/yargs
! Installing (this can take a while)...

\o/ All done!
```

### API

`untool` does not provide an API. [`@untool/webpack`](https://github.com/untool/untool/blob/master/packages/webpack/README.md), however, defines `untool` as an alias for [`@untool/core`](https://github.com/untool/untool/blob/master/packages/core/README.md) for your convenience: if you `import 'untool'` in your application, what you get are actually [`@untool/core`](https://github.com/untool/untool/blob/master/packages/core/README.md)'s `exports`.

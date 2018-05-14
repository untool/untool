# `untool`

[![npm](https://img.shields.io/npm/v/untool.svg)](https://www.npmjs.com/package/untool)

`untool` is our main, global command line interface. It serves a single purposes: it can be used to to control `untool` projects. To do so, it provides the terminal command `un`.

### Installation

`untool` is meant to be installed globally, not inside specific projects. If you want to add a local command line interface to your project to be used in `package.json` scripts, please just use [`@untool/yargs`](https://github.com/untool/untool/blob/master/packages/yargs/README.md) directly.

```bash
$ yarn global add untool # OR npm install --global untool
```

### Utilization

`untools`'s mode of operation is that it will find a locally installed [`@untool/yargs`](https://github.com/untool/untool/blob/master/packages/yargs/README.md) and execute it. It will act as a very minimal wrapper around it.

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
  un serve    Serve foo
  un start    Build and serve foo
  un build    Build foo
  un develop  Serve foo in watch mode

Options:
  --version   Show version number                                     [boolean]
  --help, -h  Show help                                               [boolean]
```

### API

`untool` does not provide an API. [`@untool/webpack`](https://github.com/untool/untool/blob/master/packages/webpack/README.md), however, defines `untool` as an alias for [`@untool/core`](https://github.com/untool/untool/blob/master/packages/core/README.md) for your convenience: if you `import 'untool'` in your application, what you get are actually [`@untool/core`](https://github.com/untool/untool/blob/master/packages/core/README.md)'s `exports`.

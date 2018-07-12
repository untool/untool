# `@untool/defaults`

[![npm](https://img.shields.io/npm/v/@untool%2Fdefaults.svg)](https://www.npmjs.com/package/@untool%2Fdefaults)

`@untool/defaults` is a very simple [preset](https://github.com/untool/untool/blob/master/packages/core/README.md#presets) that sets up a basic `untool` environment featuring [Yargs](https://github.com/untool/untool/blob/master/packages/yargs/README.md), [Express](https://github.com/untool/untool/blob/master/packages/express/README.md), [Webpack](https://github.com/untool/untool/blob/master/packages/webpack/README.md), and [React](https://github.com/untool/untool/blob/master/packages/react/README.md) support.

### Installation

If you need to set up a new project using `@untool/defaults`, just use the package manager of your choice to install it:

```bash
$ yarn add @untool/defaults react react-dom react-router-dom react-helmet
# OR npm install @untool/defaults react react-dom react-router-dom react-helmet
```

Afterwards, you need to add a new `untool` section to your project's `package.json` file:

```json
{
  "scripts": {
    "start": "un start"
  },
  "untool": {
    "presets": ["@untool/defaults"]
  }
}
```

Additionally you might want to add a start script using `untool`'s CLI functionality to be able to use your package manager to start your application:

```bash
$ yarn start -p # OR npm start -p
```

## Settings

```javascript
module.exports = {
  presets: [
    '@untool/express',
    '@untool/react',
    '@untool/webpack',
    '@untool/yargs',
  ],
};
```

The code block above mirrors `@untool/defaults/preset.js`' actual source code in its entirety. Please refer to the listed mixins and presets for more information. While `@untool/defaults` does not really provide any relevant settings of its own, `@untool/core` does:

| Property  | Type     | Default                  |
| --------- | -------- | ------------------------ |
| `name`    | `string` | `PACKAGE_JSON_NAME`      |
| `version` | `string` | `PACKAGE_JSON_VERSION`   |
| `rootDir` | `string` | `PACKAGE_JSON_DIRECTORY` |

### `name`

The application name; used throughout the `untool` ecosystem to individualize log output, asset file names, and even HTML IDs. This value is determined by checking your application's package.json file and falling back to its directory name. **Do not override - simply update the `name` field in your `package.json` file.**

### `version`

The application version; can come handy for asset versioning and logging, but not currently used in `untool`'s default modules. This value is determined by checking your application's package.json file. **Do not override - simply update the `version` field in your `package.json` file.**

### `rootDir`

The application's filesystem context; used heavily throughout the `untool` ecosystem for module resolution, build configuration and the like. This value is determined by finding the directory your `package.json` file is in. **Really, do not override this unless you know exactly what you are doing.**

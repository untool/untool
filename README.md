<p align="center">
  <img
    width="150"
    height="150"
    src="https://avatars.githubusercontent.com/u/36716786?s=300"
  />
</p>

<p align="center">
  <a href="https://travis-ci.org/untool/untool">
    <img src="https://img.shields.io/travis/untool/untool/master.svg">
  </a>
  <a href="https://www.npmjs.com/package/untool">
    <img src="https://img.shields.io/npm/v/untool.svg">
  </a>
</p>
<p>&nbsp;</p>

`untool` is a JavaScript tool designed to streamline configuration and usage of other JavaScript tools. By default, it comes with a basic development and runtime environment for universal React applications. This environment is highly modular. Every one of its default modules is configurable and extensible - and entirely optional.

## Docs

[Read the docs here](https://github.com/untool/untool/tree/master/DOCUMENTATION.md).

## Contribution

We are using [git](https://git-scm.com), [lerna](https://lernajs.io) and [yarn](https://yarnpkg.com/en/) for building `untool`. To be able to help us out effectively, you have to have `git` and `yarn` globally available on your machine.

If you want to contribute to `untool`, create a [fork](https://help.github.com/articles/about-forks/) of its [repository](https://github.com/untool/untool/fork) using the GitHub UI and clone your fork into your local workspace:

```text
$ mkdir untool && cd $_
$ git clone git@github.com:<USER>/untool.git .
$ yarn install
```

When you are finished implementing your contribution, go ahead and create a [pull request](https://help.github.com/articles/creating-a-pull-request/). If you are planning to add a feature, please open an [issue](https://github.com/untool/untool/issues/new) first and discuss your plans.

All code in this repository is expected to be formatted using [prettier](https://prettier.io), and we will only merge valid [conventional commits](https://conventionalcommits.org) in order to enable automatic [versioning](https://semver.org).

We will not usually accept pull requests introducing breaking changes unless we are preparing a `major` release: `untool` strives to be a solid and robust base for others to build upon.

Releasing untool requires the environment variable `GH_TOKEN` [to be set](https://github.com/lerna/lerna/tree/master/commands/version#--github-release) to a valid [GitHub access token](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line) with the `public_repo` scope in order to publish the release notes to the [GitHub releases page](https://github.com/untool/untool/releases).

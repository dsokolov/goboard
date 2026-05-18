# Building

Language:&nbsp;**English**&nbsp;•&nbsp;[Русский](../ru/build.md)&nbsp;•&nbsp;[中文](../zh/build.md)

This document describes building the GoBoard plugin from source.

## Requirements

- [Node.js](https://nodejs.org/) 24 LTS or newer (see `.nvmrc` in the repository root)

## Build

Build the project, including copying the distribution to the development vault:

```
npm run build
```

Running tests:

```
npm test
```

Running linter:

```
npm run lint
```

Updating test baselines:

```
npm run update-baseline
```

Updating documentation images:

```
npm run update-docs
```

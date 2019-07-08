# a11y-report [![Build Status](https://travis-ci.org/danielhusar/a11y-report.svg?branch=master)](https://travis-ci.org/danielhusar/a11y-report)
> Run accessibility report on the provided urls via [axe-core](https://github.com/dequelabs/axe-core)

## How it works
Using [puppeeter](https://github.com/GoogleChrome/puppeteer) we run axe-core on all provided urls and collect all violations.

Make sure you have at least axe-core ^3.0.0 loaded in your urls or provide axe url to be automatically injected for you.

![screenshot.png](screenshot.png)

## Install

```sh
yarn add --dev @daniel.husar/a11y-report
```
or
```sh
npm install --dev @daniel.husar/a11y-report
```

## Usage

```js
const report = require('@daniel.husar/a11y-report');

const config = {
  urls: ['http://localhost:9001/index.html'],
  axeUrl: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/3.2.2/axe.min.js'
}

report(config);
```

## API

### report(config)

Returns void and prints accessibility report. It will process exit with 1 if there are any errors, or 0 with no errors.

#### config

| Property                  | Type        | Default                   | Description                                                                                                                   |
| :------------------------ | :---------- | :-----------------------  | :---------- |
| `urls`                    | `string[]`  | `[]`                      | Array of urls to run report on. |
| `delay`                   | `number`    | `100`                     | Delay to wait for `axe-core` to be executed. |
| `axeUrl`                  | `string`    | `undefined`               | Every page needs axe-core script to be loaded. If your pages don't load axe-core, you can provide axe-core url to be injected. |
| `ignoreViolations`        | `string[]`  | `[]`                      | Global array of all violations that should be ignored. |
| `ignoreViolationsForUrls` | `{}`        | `[]`                      | Mappings of violations per url to ignore. Example: `{ 'http://localhost:9001/index.html': ['Violation to ignore'] }` |
| `errorTags`               | `string[]`  | `['wcag2a', 'wcag2aa', 'wcag21aa']` | Array of [tags](https://www.deque.com/axe/axe-for-web/documentation/api-documentation/#parameters) which would consider violation as error. |
| `reporter`                | `default | simple`  | `default`         | Which reporter to use. |
| `logger`                  | `function`  | `console.log`             | Logger function to use. |
| `exitProcess`             | `boolean `  | `true`                    | Exit current process with exit code 1 if there are errors, or 0 for no errors. |
| `axe`                     | `{}`        |                           | [Axe-core](https://github.com/dequelabs/axe-core) config. |
| `axe.context`             | `{}`        | `element: { include: ['html'] }` | [Context parameter](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#context-parameter). |
| `axe.options`             | `{}`        | `{}` | [Axe-core options parameter](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#options-parameter). |

## License
MIT

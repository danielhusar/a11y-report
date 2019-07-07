# a11y-report
> Run accessibility report on the provided urls via [axe-core](https://github.com/dequelabs/axe-core)

## How it works
It will use [puppeeter](https://github.com/GoogleChrome/puppeteer) to run axe-core on all provided urls, and collect all violations.

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
  urls: ['http://localhost:9001/index.html']
}

report(config);
```

## API

### report(config)

Returns void and prints accessibility report.

#### urls

Type: `string[]`

Array of urls to run report on.

#### delay

Type: `number`

Default: `1000`

Delay to wait for `axe-core` to be executed.

#### ignoreViolations

Type: `string[]`

Global array of all violations that should be ignored.

#### ignoreViolationsForUrls

Type: `object`

Example: `ignoreViolationsForUrls: { 'http://localhost:9001/index.html': ['Error to ignore'] }`

Mappings of violations per url to ignore.

#### errorTags

Type: `string[]`

Default: `['wcag2a', 'wcag2aa', 'wcag21aa']`

Array of tags which would consider violation as error or warning.

#### reporter

Type: `default | simple`

Default: 'default'

Which reporter to use.

#### logger

Type: `fn`

Default: 'console.log`

Logger function to use.

#### axe

Type: `object`

[Axe-core](https://github.com/dequelabs/axe-core) config.

##### axe.context
Type: `object`

Default: `element: { include: ['body'] }`

[Context parameter](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#context-parameter).

##### axe.config
Type: `object`

Default: `{}`

[Axe-core configuration options](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#parameters-1).

##### axe.options
Type: `object`

Default: `{}`

[Axe-core options parameter](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#options-parameter).

## License
MIT

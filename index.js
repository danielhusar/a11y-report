const { platform } = require('os');
const puppeteer = require('puppeteer');
const { green, red, yellow, blue } = require('chalk');
const axe = require.resolve('axe-core');

const runAxe = config =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      axe.run(config.axe.context, config.axe.options, (error, result) => (error ? reject(error) : resolve(result)));
    }, config.delay);
  });

const baseConfig = {
  delay: 100,
  axeUrl: undefined,
  ignoreViolations: [],
  ignoreViolationsForUrls: {},
  errorTags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  reporter: 'default',
  logger: console.log,
  exitProcess: true,
  axe: {
    context: {
      include: ['html'],
    },
    options: {},
  },
};

module.exports = async userConfig => {
  const config = {
    ...baseConfig,
    ...userConfig,
  };
  const launchArgs = [];
  if (platform() === 'linux') launchArgs.push('--no-sandbox');
  const browser = await puppeteer.launch({ headless: true, args: launchArgs });
  const page = await browser.newPage();

  let totalFailures = 0;
  let totalPasses = 0;
  let totalWarnings = 0;
  for (const url of config.urls) {
    await page.goto(url);
    if (config.axeUrl) {
      await page.addScriptTag({ url: config.axeUrl });
    }

    const { violations, passes } = await page.evaluate(runAxe, config);
    const failures = [];
    const warnings = [];
    violations.forEach(item => {
      if (config.ignoreViolations.includes(item.description)) return;
      if (config.ignoreViolationsForUrls[url] && config.ignoreViolationsForUrls[url].includes(item.description)) return;

      if (item.tags.some(tag => config.errorTags.includes(tag))) {
        failures.push(item);
      } else {
        warnings.push(item);
      }
    });

    const isDefaultReporter = config.reporter === 'default';
    const showFileName = failures.length || warnings.length || isDefaultReporter;
    if (showFileName) config.logger(blue(url));
    if (isDefaultReporter) passes.forEach(({ description }) => config.logger(`  ${green('PASS')}: ${description}`));
    warnings.forEach(({ description }) => config.logger(`  ${yellow('WARN')}: ${description}`));
    failures.forEach(({ description }) => config.logger(`  ${red('FAIL')}: ${description}`));
    if (showFileName) config.logger('');

    totalPasses += passes.length;
    totalFailures += failures.length;
    totalWarnings += warnings.length;
  }

  await browser.close();

  config.logger(
    `${red(`${totalFailures} failures, `)}${yellow(`${totalWarnings} warnings, `)}${green(`${totalPasses} passed, `)}${totalFailures +
      totalWarnings +
      totalPasses} total`
  );

  return {
    failures: totalFailures,
    warnings: totalWarnings,
    passes: totalPasses,
  };
};

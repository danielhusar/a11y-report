const fs = require('fs');
const { platform } = require('os');
const path = require('path');
const puppeteer = require('puppeteer');
const { green, red, yellow, blue } = require('chalk');
const express = require('express');
const glob = require('glob');
const cheerio = require('cheerio');
const axe = require.resolve('axe-core');
const config = require('./config');

fs.copyFileSync(axe, `${config.publicFolder}/axe.js`);
const files = glob
  .sync(`${config.publicFolder}/**/*.html`)
  .map(file => {
    return file.replace(config.publicFolder, '').replace(/\/?index\.html$/, '') || '/';
  })
  .sort();

const runAxe = config =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      axe.run(config.axe.element, config.axe.config, (error, result) => (error ? reject(error) : resolve(result)));
    }, config.delay);
  });

module.exports = () => {
  const app = express();
  for (let file of files) {
    app.get(file, (_, res) => {
      if (!file.endsWith('.html')) {
        file = `${file.replace(/\/$/, '')}/index.html`;
      }
      const html = fs.readFileSync(config.publicFolder + file, 'utf8');
      const $ = cheerio.load(html);
      $('body').append('<script src="/axe.js"></script>');
      res.send($.html());
    });
  }
  app.use(express.static(config.publicFolder, { redirect: false, index: false }));

  const server = app.listen(config.port, async () => {
    const launchArgs = [];
    if (platform() === 'linux') launchArgs.push('--no-sandbox');
    const browser = await puppeteer.launch({ headless: true, args: launchArgs });
    const page = await browser.newPage();

    let totalFailures = 0;
    let totalPasses = 0;
    let totalWarnings = 0;
    for (const file of files) {
      await page.goto(`http://localhost:${config.port}${file}`);
      const { violations, passes } = await page.evaluate(runAxe, config);
      const failures = [];
      const warnings = [];
      violations.forEach(item => {
        if (config.globalIgnoreErrors.includes(item.description)) return;
        if (config.filesIgnoreErrors[file] && config.filesIgnoreErrors[file].includes(item.description)) return;

        if (item.tags.some(tag => config.errorTags.includes(tag))) {
          failures.push(item);
        } else {
          warnings.push(item);
        }
      });

      const showFileName = failures.length || warnings.length || config.reporter === 'default';
      if (showFileName) console.log(blue(file));
      if (config.reporter === 'default') passes.forEach(({ description }) => console.log(`  ${green('PASS')}: ${description}`));
      warnings.forEach(({ description }) => console.log(`  ${yellow('WARN')}: ${description}`));
      failures.forEach(({ description }) => console.log(`  ${red('FAIL')}: ${description}`));
      if (showFileName) console.log('');

      totalPasses += passes.length;
      totalFailures += failures.length;
      totalWarnings += warnings.length;
    }
    await browser.close();

    console.log(
      `${red(`${totalFailures} failures, `)}${yellow(`${totalWarnings} warnings, `)}${green(`${totalPasses} passed, `)}${totalFailures +
        totalWarnings +
        totalPasses} total`
    );
    server.close(() => process.exit(totalFailures ? 1 : 0));
  });
};

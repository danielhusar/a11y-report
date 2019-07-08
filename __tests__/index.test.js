const { resolve } = require('path');
const express = require('express');
const report = require('../index');

jest.mock('chalk', () => ({
  green: string => string,
  red: string => string,
  yellow: string => string,
  blue: string => string,
}));
jest.setTimeout(30000);

let server;

beforeAll(async done => {
  const app = express();
  app.use(express.static(resolve(__dirname, '../fixtures'), { redirect: false }));
  server = app.listen(9001, done);
});

afterAll(() => {
  server.close();
});

describe('a11y-report', () => {
  test('with defaults', async () => {
    const logger = jest.fn();
    await report({
      urls: ['http://localhost:9001/default.html'],
      exitProcess: false,
      reporter: 'simple',
      logger,
    });
    expect(logger).toHaveBeenNthCalledWith(1, 'http://localhost:9001/default.html');
    expect(logger).toHaveBeenNthCalledWith(
      2,
      '  WARN: Ensures the document has only one main landmark and each iframe in the page has at most one main landmark'
    );
    expect(logger).toHaveBeenNthCalledWith(3, '  WARN: Ensures all page content is contained by landmarks');
    expect(logger).toHaveBeenNthCalledWith(4, '  FAIL: Ensures every HTML document has a lang attribute');
    expect(logger).toHaveBeenLastCalledWith('1 failures, 2 warnings, 9 passed, 12 total');
  });

  test('with no error tags', async () => {
    const logger = jest.fn();
    await report({
      urls: ['http://localhost:9001/default.html'],
      exitProcess: false,
      errorTags: [],
      reporter: 'simple',
      logger,
    });
    expect(logger).toHaveBeenLastCalledWith('0 failures, 3 warnings, 9 passed, 12 total');
  });

  test('with ignoreViolations', async () => {
    const logger = jest.fn();
    await report({
      urls: ['http://localhost:9001/default.html'],
      exitProcess: false,
      ignoreViolations: ['Ensures every HTML document has a lang attribute'],
      reporter: 'simple',
      logger,
    });
    expect(logger).toHaveBeenLastCalledWith('0 failures, 2 warnings, 9 passed, 11 total');
  });

  test('with ignoreViolationsForUrls', async () => {
    const logger = jest.fn();
    await report({
      urls: ['http://localhost:9001/default.html'],
      exitProcess: false,
      ignoreViolationsForUrls: {
        'http://localhost:9001/default.html': ['Ensures every HTML document has a lang attribute'],
      },
      reporter: 'simple',
      logger,
    });
    expect(logger).toHaveBeenLastCalledWith('0 failures, 2 warnings, 9 passed, 11 total');
  });

  test('with default reporter', async () => {
    const logger = jest.fn();
    await report({
      urls: ['http://localhost:9001/default.html'],
      exitProcess: false,
      logger,
    });
    expect(logger).toHaveBeenNthCalledWith(2, "  PASS: Ensures aria-hidden='true' is not present on the document body.");
    expect(logger).toHaveBeenCalledTimes(15);
  });

  test('with axe injected', async () => {
    const logger = jest.fn();
    await report({
      urls: ['http://localhost:9001/no-axe.html'],
      exitProcess: false,
      axeUrl: '/axe.min.js',
      logger,
    });
    expect(logger).toHaveBeenLastCalledWith('1 failures, 2 warnings, 9 passed, 12 total');
  });
});

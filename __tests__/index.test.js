const { resolve } = require('path');
const express = require('express');
const a11yReport = require('../index');

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
    const report = await a11yReport({
      urls: ['http://localhost:9001/default.html'],
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
    expect(report).toEqual({
      failures: 1,
      passes: 9,
      warnings: 2,
    });
  });

  test('with no error tags', async () => {
    const logger = jest.fn();
    const report = await a11yReport({
      urls: ['http://localhost:9001/default.html'],
      errorTags: [],
      reporter: 'simple',
      logger,
    });
    expect(logger).toHaveBeenLastCalledWith('0 failures, 3 warnings, 9 passed, 12 total');
    expect(report).toEqual({
      failures: 0,
      passes: 9,
      warnings: 3,
    });
  });

  test('with ignoreViolations', async () => {
    const logger = jest.fn();
    const report = await a11yReport({
      urls: ['http://localhost:9001/default.html'],
      ignoreViolations: ['Ensures every HTML document has a lang attribute'],
      reporter: 'simple',
      logger,
    });
    expect(logger).toHaveBeenLastCalledWith('0 failures, 2 warnings, 9 passed, 11 total');
    expect(report).toEqual({
      failures: 0,
      passes: 9,
      warnings: 2,
    });
  });

  test('with ignoreViolationsForUrls', async () => {
    const logger = jest.fn();
    const report = await a11yReport({
      urls: ['http://localhost:9001/default.html'],
      ignoreViolationsForUrls: {
        'http://localhost:9001/default.html': ['Ensures every HTML document has a lang attribute'],
      },
      reporter: 'simple',
      logger,
    });
    expect(logger).toHaveBeenLastCalledWith('0 failures, 2 warnings, 9 passed, 11 total');
    expect(report).toEqual({
      failures: 0,
      passes: 9,
      warnings: 2,
    });
  });

  test('with default reporter', async () => {
    const logger = jest.fn();
    await a11yReport({
      urls: ['http://localhost:9001/default.html'],
      logger,
    });
    expect(logger).toHaveBeenNthCalledWith(2, "  PASS: Ensures aria-hidden='true' is not present on the document body.");
    expect(logger).toHaveBeenCalledTimes(15);
  });

  test('with axe injected', async () => {
    const logger = jest.fn();
    const report = await a11yReport({
      urls: ['http://localhost:9001/no-axe.html'],
      axeUrl: '/axe.min.js',
      logger,
    });
    expect(logger).toHaveBeenLastCalledWith('1 failures, 2 warnings, 9 passed, 12 total');
    expect(report).toEqual({
      failures: 1,
      passes: 9,
      warnings: 2,
    });
  });
});

const puppeteer = require('puppeteer');

const EventEmitter = require('./promise');

const run = require('./run');

const { normalizeResponse } = require('./normalize');

module.exports = (...args) =>
  run(...args).then((api) =>
    Promise.all([api.getServer(), puppeteer.launch({ args: ['--no-sandbox'] })])
      .then(([server, browser]) => Promise.all([server, browser.newPage()]))
      .then(([server, page]) => {
        const { port } = server.address();
        const events = new EventEmitter();
        const api = {
          getArg(...args) {
            return events.promiseArg(...args);
          },
          getArgs(...args) {
            return events.promiseArgs(...args);
          },
          getArgTypes(...args) {
            return events.promiseArgs(...args);
          },
          getConfig() {
            return events.promiseArg('constructor', 1);
          },
          getMixin() {
            return events.promiseArg('constructor', 0);
          },
          navigate(uri) {
            return new Promise((resolve) =>
              process.nextTick(() =>
                resolve(
                  page
                    .goto(`http://localhost:${port}${uri}`)
                    .then(() =>
                      page
                        .waitForSelector('div[data-mounted]')
                        .then(() =>
                          // eslint-disable-next-line no-undef
                          page.evaluate(() => __untest)
                        )
                        .then((data) =>
                          Object.entries(data).forEach(([key, value]) =>
                            events.emit(key.replace(/^_/, ''), ...value)
                          )
                        )
                    )
                    .then(() =>
                      page.content().then((body) => normalizeResponse({ body }))
                    )
                )
              )
            );
          },
        };
        page.setDefaultTimeout(90000);
        page.setDefaultNavigationTimeout(90000);
        return api;
      })
  );

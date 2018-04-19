const puppeteer = require('puppeteer');

const EventEmitter = require('./promise');

const run = require('./run');

const { normalizeResponse } = require('./normalize');

const createConsoleEvents = (page, type = 'log') => {
  const emitter = new EventEmitter();
  page.on('console', msg => {
    if (msg.type() === type) {
      Promise.all(msg.args().map(arg => arg.jsonValue())).then(
        ([topic, ...args]) => emitter.emit(topic, ...args)
      );
    }
  });
  return emitter;
};

module.exports = (...args) =>
  run(...args).then(api =>
    Promise.all([api.getServer(), puppeteer.launch({ args: ['--no-sandbox'] })])
      .then(([server, browser]) => Promise.all([server, browser.newPage()]))
      .then(([server, page]) => {
        const { port } = server.address();
        const events = createConsoleEvents(page);
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
          getDevReady() {
            return events.promise('[HMR] connected');
          },
          navigate(uri) {
            return new Promise(resolve =>
              process.nextTick(() =>
                resolve(
                  page
                    .goto(`http://localhost:${port}${uri}`)
                    .then(() =>
                      page.content().then(body => normalizeResponse({ body }))
                    )
                )
              )
            );
          },
          evaluate: page.evaluate.bind(page),
          screenshot: page.screenshot.bind(page),
        };
        return api;
      })
  );

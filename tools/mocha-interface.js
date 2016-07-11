'use strict';

const mocha = require('mocha');
const Test = mocha.Test;
const Suite = mocha.Suite;

module.exports = function(root) {
  root.on('require', (obj, file) => {
    if (typeof obj !== 'function' && typeof obj.default !== 'function') {
      return;
    }

    const Ctr = typeof obj === 'function' ? obj : obj.default;
    const instance = new Ctr();
    const suite = Suite.create(root, Ctr.name);

    Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
      .filter(name => name.startsWith('test'))
      .filter(name => typeof instance[name] === 'function')
      .forEach(name => {
        const test = new Test(name, () => instance[name]());
        suite.addTest(test);
      });
  });
};

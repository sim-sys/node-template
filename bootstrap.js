'use strict';

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const packageDefaults = {
  name: path.basename(process.cwd()),
  version: '1.0.0',
  private: true,
  author: 'Simple Systems',
  license: 'UNLICENSED',
};

function run(gen) {
  function step(fn) {
    let next;

    try {
      next = fn();
    } catch (e) {
      console.error(e ? e.stack || e : e);
      process.exit(-1);
      return;
    }

    if (next.done) {
      process.exit(0);
      return;
    }

    Promise
      .resolve(next.value)
      .then(
        val => step(() => gen.next(val)),
        err => step(() => gen.throw(err))
      );
  }

  step(() => gen.next());
}


function askOnce(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function * ask(question, defaultAnswer, options, caseInsensetive, parser) {
  function completer(line) {
    if (caseInsensetive) {
      line = line.toLowerCase();
    }

    const matches = options.filter(c => c.indexOf(line) === 0);

    return [matches, line];
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: options ? completer : null
  });

  const optionsLine = options && options.length ? ` [${options.join(', ')}]` : '';
  const defaultLine = defaultAnswer ? ` (${defaultAnswer})` : '';

  const line = `${question}${optionsLine}${defaultLine} `;
  let answer;

  while (answer === null || answer === undefined || answer === '') {
    answer = yield askOnce(rl, line);

    if (!answer) {
      if (defaultAnswer) {
        answer = defaultAnswer;
      }
    } else {
      if (caseInsensetive) {
        answer = answer.toLowerCase();
      }

      if (parser) {
        answer = parser(answer);
      }

      if (options && options.indexOf(answer) === -1) {
        answer = null;
      }
    }
  }

  rl.close();
  return answer;
}

function boolParser(str) {
  str = str.toLowerCase();

  const yes = ['true', 'yes', 'y'];
  const no = ['false', 'no', 'n'];

  if (yes.indexOf(str) !== -1) return true;
  if (no.indexOf(str) !== -1) return false;
  return null;
}


function * main() {
  const type = yield * ask('App or lib?', 'lib', ['app', 'lib'], true);
  const name = yield * ask('name', packageDefaults.name, null, false);
  const version = yield * ask('version', packageDefaults.version, null, false);

  const isOpenSource = yield * ask('Open source?', false, null, false, boolParser);
  const author = yield * ask('author', packageDefaults.author, null, false);

  let license = 'UNLICENSED';

  if (isOpenSource) {
    license = yield * ask('license', 'MIT', null, false);
  }

  const packageJSON = require('./package.json');

  packageJSON.name = name;
  packageJSON.version = version;

  if (isOpenSource) {
    delete packageJSON.private;
  } else {
    packageJSON.private = true;
  }

  packageJSON.author = author;
  packageJSON.license = license;

  fs.writeFileSync(path.resolve(__dirname, 'package.json'), JSON.stringify(packageJSON, null, '  ') + '\n');

  if (type === 'app') {
    cp.execSync('rm index.js');
    cp.execSync('rm index.js.flow');
    fs.appendFileSync(path.resolve(__dirname, '.gitignore'), 'src-compiled\n');
  }

  cp.execSync('rm -rf .git');
  cp.execSync('make .flowconfig');
  cp.execSync('rm bootstrap.js');
  cp.execSync('cd tools && npm install', { stdio: 'inherit' });
  cp.execSync('npm install', { stdio: 'inherit' });
}

run(main());

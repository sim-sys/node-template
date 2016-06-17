# node-template
## Lib template for Node 4

What's inside:

 - ES 2015 and `async await` (via Babel);
 - testing (via `mocha` and `chai`);
 - coverage (via `istanbul`);
 - type-checking (via `flow`);
 - lintings (via `eslint`).

Targets:

 - `clean` - remove all artifacts;
 - `run.%` - run `scripts/%.js`;
 - `test` - run unit tests;
 - `lint` - lint code;
 - `flow` - run `flow`;
 - `compile` - compile code;
 - `cover` - run `istanbul`;
 - `check-coverage` - check coverage levels;
 - `all` (default) - check everything.

## How to start

Run:

```bash
mkdir my-project
cd my-project
git clone https://github.com/sim-sys/node-template ./
node bootstrap.js
```

And answer some questions. When you are ready to publish your lib, run `make dist`
and `make publish`.

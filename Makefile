node := node
eslint := node_modules/.bin/eslint
jscs := node_modules/.bin/jscs
flow := node_modules/.bin/flow
babel := node_modules/.bin/babel
babel-node := node_modules/.bin/babel-node
mocha := node_modules/.bin/mocha
_mocha := node_modules/.bin/_mocha
babel-external-helpers := node_modules/.bin/babel-external-helpers
istanbul := node_modules/.bin/istanbul


SCRIPT_FILES = $(wildcard scripts/*.js)
SCRIPTS = $(patsubst scripts/%.js,%,$(SCRIPT_FILES))

define SCRIPT

run.$(1):
	@echo
	@echo "Running \033[0;32mscripts/$(1).js\033[0m"
	@echo
	@$(babel-node) ./scripts/$(1).js

endef

all: clean flow lint test check-coverage compile

$(foreach i,$(SCRIPTS), $(eval $(call SCRIPT,$(i))))

define FLOWGEN
var d = require('./flow.json');
var dev = Object.keys(require('./package.json').devDependencies || {});
var test = d.testDependencies || [];

console.log(`
[ignore]
$${(d.ignore || []).join('\n')}
$${dev.filter(d => test.indexOf(d) === -1).map(d => `<PROJECT_ROOT>/node_modules/$${d}/.*`).join('\n')}

[include]
$${(d.include || []).join('\n')}

[libs]
$${(d.libs || []).join('\n')}

[options]
$${(d.options || []).join('\n')}
`);
endef

export FLOWGEN

.flowconfig: flow.json
	@$(node) -e "$$FLOWGEN" > .flowconfig

lint:
	$(eslint) src
	$(jscs) src

flow: .flowconfig
	$(flow) check --no-flowlib

compile:
	@rm -rf src-compiled
	$(babel) src --ignore __tests__ --out-dir src-compiled --copy-files

compile-test:
	@rm -rf src-compiled-test
	$(babel) src --out-dir src-compiled-test --copy-files

compile-cover:
	@rm -rf src-compiled-cover
	$(babel) src --out-dir src-compiled-cover --copy-files --plugins=external-helpers-2

cover: compile-cover
	@rm -rf cover
	$(babel-external-helpers) > ./babel-helpers.js
	$(istanbul) cover $(_mocha) -- --require ./babel-helpers.js src-compiled-cover/**/__tests__/**/*.js
	@rm babel-helpers.js

check-coverage: cover
	$(istanbul) check-coverage

test: compile-test
	$(mocha) src-compiled-test/**/__tests__/**/*.js

clean:
	@rm -rf src-compiled
	@rm -rf src-compiled-test
	@rm -rf src-compiled-cover
	@rm -rf cover

.PHONY: clean test lint flow compile compile-test compile-cover all cover run.%

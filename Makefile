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
	@echo "Running scripts/$(1).js"
	@echo
	@$(babel-node) ./scripts/$(1).js

endef

all: clean flow lint test check-coverage

$(foreach i,$(SCRIPTS), $(eval $(call SCRIPT,$(i))))

lint:
	$(eslint) src
	$(jscs) src

flow:
	$(flow) check --no-flowlib

compile:
	rm -rf src-compiled
	$(babel) src --ignore __tests__ --out-dir src-compiled --copy-files

compile-test:
	rm -rf src-compiled
	$(babel) src --out-dir src-compiled-test --copy-files

compile-cover:
	rm -rf src-compiled-cover
	$(babel) src --out-dir src-compiled-cover --copy-files --plugins=external-helpers-2

cover: compile-cover
	rm -rf cover
	$(babel-external-helpers) > ./babel-helpers.js
	$(istanbul) cover $(_mocha) -- --require ./babel-helpers.js src-compiled-cover/**/__tests__/**/*.js
	rm babel-helpers.js

check-coverage: cover
	$(istanbul) check-coverage

test: compile-test
	$(mocha) src-compiled-test/**/__tests__/**/*.js

clean:
	rm -rf src-compiled
	rm -rf src-compiled-test
	rm -rf src-compiled-cover
	rm -rf cover

.PHONY: clean test lint flow compile compile-test compile-cover all cover run.%

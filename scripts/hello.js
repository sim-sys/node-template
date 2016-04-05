/* @flow */

function print(...str: Array<string>): void {
  console.log(str.join(' '));
}

print('hello', 'world');

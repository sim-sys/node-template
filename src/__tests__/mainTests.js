/* @flow */

import { foo } from '../index.js';
import assert from 'assert';

export default class MainTests {
  async testFoo() {
    const result = await foo();
    assert.equal(result, 'bar');
  }
}

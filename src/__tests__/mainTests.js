/* @flow */

import { expect } from 'chai';
import { foo } from '../main.js';

describe('main', () => {
  describe('foo', () => {
    it('should work', async () => {
      const result = await foo();
      expect(result).to.be.equal('bar');
    });
  });
});

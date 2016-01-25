import should from 'should';
import filters from '../lib/filters.js';

describe('filters', function () {
  describe('mismatchFilter', function () {
    const mismatchFilter = filters.mismatchFilter();
    const model = {
      tags: [
        ['government', 'autocracy', 'monarchy', 'absolute'],
        ['economy', 'tourism'],
        ['decline']
      ]
    };

    it('returns null when there is a mismatch', function () {
      const mismatchingGroup = {
        tags: [
          ['government', 'democracy'],
          ['economy']
        ]
      };
      should(mismatchFilter(mismatchingGroup, model)).be.null();
    });

    it('returns 0 when there is a complete match', function () {
      (mismatchFilter(model, model)).should.equal(0);
    });

    it('returns 0 when there is a partial match', function () {
      const partialMatchingGroup = {
        tags: [
          ['government', 'autocracy', 'monarchy'],
          ['decline']
        ]
      };
      (mismatchFilter(partialMatchingGroup, model)).should.equal(0);
    });
  });
});

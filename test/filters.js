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

  describe('partialBonus and fullBonus', function () {
    const model = {
      tags: [
        ['government', 'monarchy', 'constitutional'],
        ['war', 'civil']
      ]
    };

    const partialMatchingGroup = {
      tags: [
        ['government', 'monarchy']
      ]
    };

    const mismatchingGroup = {
      tags: [
        ['government', 'republic']
      ]
    };

    const unrelatedGroup = {
      tags: [
        ['economy', 'export']
      ]
    };

    const fullMatchingGroup = {
      tags: [
        ['government', 'monarchy', 'constitutional']
      ]
    };

    const multiMatchingGroup = {
      tags: [
        ['government', 'monarchy'],
        ['war']
      ]
    };

    const partialBonus = filters.partialBonus(1, false);

    it('returns 0 on no partial match', function () {
      partialBonus(model, mismatchingGroup).should.equal(0);
      partialBonus(model, unrelatedGroup).should.equal(0);
      partialBonus(model, fullMatchingGroup).should.equal(0);
    });

    it('returns 1 on a partial match', function () {
      partialBonus(model, partialMatchingGroup).should.equal(1);
    });

    it('allows the bonus value to be configured', function () {
      const bigPartialBonus = filters.partialBonus(2);
      bigPartialBonus(model, partialMatchingGroup).should.equal(2);
    });

    it('only counts one match by default', function () {
      partialBonus(model, multiMatchingGroup).should.equal(1);
    });

    it('can be created in cumulative mode', function () {
      const cumulativeBonus = filters.partialBonus(1, true);
      const bigCumulativeBonus = filters.partialBonus(2, true);
      cumulativeBonus(model, multiMatchingGroup).should.equal(2);
      bigCumulativeBonus(model, multiMatchingGroup).should.equal(4);
    });

    it('returns 1 on a full match', function () {
      const fullBonus = filters.fullBonus(1);
      fullBonus(model, fullMatchingGroup).should.equal(1);
    });

  });
});

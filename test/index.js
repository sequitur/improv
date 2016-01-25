import 'should';
import Improv from '../lib';
import simple from 'simple-mock';

describe('improv', function () {

  const testImprov = new Improv({
    'test-snippet': {
      groups: [
        {
          phrases: ['dog', 'cat', 'pig']
        }
      ]
    }
  });

  before(function () {
    /*
      Math.random() is, er, random. So we mock that issue away by replacing it
      with a function that always returns 0.5.
    */
    simple.mock(Math, 'random', () => 0.5);
  });

  after(function () { simple.restore(); });

  it('creates an Improv object', function () {
    testImprov.should.be.instanceOf(Improv);
  });

  describe('applyFilters', function () {

    it('produces a scored list of groups', function () {
      (testImprov.applyFilters('test-snippet', {}))
        .should.deepEqual([
          {
            group: {
              phrases: ['dog', 'cat', 'pig']
            },
            score: 0
          }
        ]);
    });

  });

  describe('flattenGroups', function () {

    it('flattens a scored list of groups', function () {
      const testList = [
        {
          group: {
            phrases: ['dog', 'cat', 'pig']
          },
          score: 0
        },
        {
          group: {
            phrases: ['boar', 'deer', 'puma']
          },
          score: 0
        }
      ];

      (testImprov.flattenGroups(testList)).should
        .deepEqual(['dog', 'cat', 'pig', 'boar', 'deer', 'puma']);
    });

  });

  describe('selectPhrase', function () {

    const testList = [
      {
        group: {
          phrases: ['dog', 'cat', 'pig']
        },
        score: 0
      },
      {
        group: {
          phrases: ['boar', 'deer', 'puma']
        },
        score: 0
      }
    ];

    it('selects a phrase at random from a scored list', function () {
      (testImprov.selectPhrase(testList))
        .should.be.a.String().and.equal('boar');
    });
  });

  describe('scoreFilter', function () {
    it('filters a scored list of groups', function () {
      const testList = [
        {
          group: {
            phrases: ['dog', 'cat', 'bat']
          },
          score: 1
        },
        {
          group: {
            phrases: ['mantis', 'shrimp', 'spider']
          },
          score: 1
        },
        {
          group: {
            phrases: ['pig', 'boar']
          },
          score: 0
        }
      ];

      (testImprov.scoreFilter(testList)).should.deepEqual([
        {
          group: {
            phrases: ['dog', 'cat', 'bat']
          },
          score: 1
        },
        {
          group: {
            phrases: ['mantis', 'shrimp', 'spider']
          },
          score: 1
        }
      ]);
    });
  });

  describe('gen', function () {
    it('generates a random phrase after applying all filters', function () {
      (testImprov.gen('test-snippet', {})).should.equal('cat');
    });
  });

});

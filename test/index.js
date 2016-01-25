/* Main Improv file */

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

    it('flattens a scored list of groups into a tuple with tags', function () {
      const testList = [
        {
          group: {
            tags: [['canine']],
            phrases: ['dog']
          },
          score: 0
        },
        {
          group: {
            tags: [['porcine']],
            phrases: ['boar']
          },
          score: 0
        }
      ];

      (testImprov.flattenGroups(testList)).should.eql([
        [
          'dog',
          [['canine']]
        ],
        [
          'boar',
          [['porcine']]
        ]
      ]);
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

describe('with filters', function () {
  const testSet = {
    line: {
      groups: [
        {
          tags: [],
          phrases: 'I love my [:pet].'
        }
      ]
    },
    pet: {
      groups: [
        {
          tags: [['animal', 'dog']],
          phrases: ['dog']
        },
        {
          tags: [['animal', 'cat']],
          phrases: ['cat']
        },
        {
          tags: [],
          phrases: ['pet rock']
        }

      ]
    }
  };
  describe('with mismatch filter', function () {
    const expectedValue = 0;
    const wMismatch = new Improv(testSet,
      { filters: [Improv.filters.mismatchFilter()] });

    before(function () {
      simple.mock(Math, 'random', () => expectedValue);
    });

    after(function () {
      simple.restore();
    });

    it('allows only values that do not mismatch the model', function () {
      const model1 = { tags: [['animal', 'dog']] };
      const model2 = { tags: [['animal', 'cat']] };

      wMismatch.gen('pet', model1).should.equal('dog');
      wMismatch.gen('pet', model2).should.equal('cat');
    });

  });

  describe('with templates', function () {

    const spec = {
      root: {
        groups: [
          {
            phrases: ['Hi, my name is [name], and I own [#1-20] [:pet]s.']
          }
        ]
      },
      pet: {
        groups: [
          {
            phrases: ['cat', 'dog', 'parakeet']
          }
        ]
      }
    };

    const generator = new Improv(spec);

    const model = { name: 'Bob' };

    it('uses the templating engine', function () {
      generator.gen('root', model).should.match(
        /Hi, my name is Bob, and I own [0-9]+ (cat|dog|parakeet)s./);

    });

  });

});

describe('reincorporation', function () {

  const spec = {
    root: {
      groups: [
        {
          tags: [['test']],
          phrases: ['test']
        }
      ]
    },
    tagged: {
      groups: [
        {
          tags: [['foo', 'bar'], ['baz']],
          phrases: ['test']
        }
      ]
    }
  };

  const reincorporater = new Improv(spec, { reincorporate: true });

  it('adds used tags back into the model', function () {
    const model = {
      tags: []
    };

    reincorporater.gen('root', model);
    model.tags.should.eql([['test']]);

  });

  it('merges tags with existing ones', function () {
    const model = {
      tags: [['foo']]
    };

    reincorporater.gen('tagged', model);
    model.tags.should.eql([['foo', 'bar'], ['baz']]);
  });
});

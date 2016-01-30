import 'should';
import template from '../lib/template.js';
import simple from 'simple-mock';

describe('template', function () {

  it('returns a string without directives without touching it', function () {
    const str = 'This is a test string.';
    template(str).should.equal(str);
  });

  describe('directives', function () {
    const model = {
      animal: 'dog',
      nested: {
        bird: 'sparrow',
        deep: {
          cave: 'bat'
        }
      },
      mytext: 'I have a [animal].'
    };

    it('throws an error if a close bracket is missing', function () {
      (function () {
        template('bad[text');
      }).should.throw('Missing close bracket in phrase: bad[text');
    });

    it('can look at the underlying model', function () {
      const text = 'I took my [animal] for a walk.';
      template(text, model).should.equal('I took my dog for a walk.');
    });

    it('redirects :directives to the given callback', function () {
      const cb = function (text) { return `!!${text}!!`; };
      const text = 'Here is some [:text].';

      template(text, model, cb).should.equal('Here is some !!text!!.');

    });

    it('accesses nested properties of the model', function () {
      const textA = 'My [nested.bird] flew away.';
      const textB = 'My [nested.deep.cave] died.';

      template(textA, model).should.equal('My sparrow flew away.');
      template(textB, model).should.equal('My bat died.');
    });

    describe('random number directive', function () {
      let expectedValue = 0;

      before(function () {
        simple.mock(Math, 'random', () => expectedValue);
      });

      afterEach(function () {
        expectedValue = 0;
      });

      after(function () {
        simple.restore();
      });

      it('generates random numbers in a range', function () {
        const text = '[#1-20]';
        expectedValue = 0;
        template(text).should.equal('1');
        expectedValue = 0.5;
        template(text).should.equal('10');
        expectedValue = 1;
        template(text).should.equal('20');
      });
    });

    it('can recur through model results', function () {
      const text = '[mytext]';

      template(text, model).should.equal('I have a dog.');
    });

    it('can recur through callback results', function () {
      const text = '[:mygen]';
      const cb = function () { return '[animal]'; };

      template(text, model, cb).should.equal('dog');
    });

    it('keeps the model going through callback recursions', function () {
      const text = '[:foo]';
      const cb = function (text) {
        if (text === 'foo') return '[:bar]';
        return '[animal]';
      };

      template(text, model, cb).should.equal('dog');
    });

  });

  describe('chained directives', function () {
    const model = {
      myFunc (text) {
        return `!!${text}!!`;
      },

      foo: 'foo'
    };

    it('takes the rightmost directive as a function', function () {
      template('[myFunc foo]', model).should.equal('!!foo!!');
    });

    it('allows recursion', function () {
      template('[myFunc myFunc foo]', model).should.equal('!!!!foo!!!!');
    });

    it('allows literals', function () {
      template('[myFunc \'bar\']', model).should.equal('!!bar!!');
    });

    it('has builtins', function () {
      template('[a \'dog\']', model).should.equal('a dog');
      template('[a \'ant\']', model).should.equal('an ant');
      template('[A \'dog\']', model).should.equal('A dog');
      template('[An \'dog\']', model).should.equal('A dog');
      template('[cap \'foo\']', model).should.equal('Foo');
    });
  });
});

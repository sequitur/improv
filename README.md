# Improv

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status](https://david-dm.org/sequitur/improv.svg)](https://david-dm.org/sequitur/improv) [![Documentation Status](https://readthedocs.org/projects/improv/badge/?version=latest)](http://improv.readthedocs.org/en/latest/?badge=latest)


A model-backed generative text grammar tool for javascript. Improv is similar to Tracery in that it can generate random, procedurally generated text recursively. Also like Tracery, Improv includes some basic templating functionality.

Unlike Tracery, however, Improv generators refer to *models* to build text. This allows for more sophisticated text generation by referencing an underlying world model.

## Installation

Improv is an npm module, but it should work fine in a browser environment through Webpack or Browserify.

```sh
$ npm install --save improv
```

## Quick Example

```js
import Improv from './lib/index.js';

const spec = {
  animal: {
    groups: [
      {
        tags: [['class', 'mammal']],
        phrases: ['dog', 'cat']
      },
      {
        tags: [['class', 'bird']],
        phrases: ['parrot']
      }
    ]
  },
  root: {
    groups: [
      {
        tags: [],
        phrases: [
          '[name]: I have a [:animal] who is [#2-7] years old.'
        ]
      }
    ]
  }
};

const improv = new Improv(spec, {
  filters: [Improv.filters.mismatchFilter()]
});

const bob = { name: 'Bob' };
const alice = { name: 'Alice', tags: [['class', 'mammal']] };
const carol = { name: 'Carol', tags: [['class', 'bird']] };

const lines = [
  improv.gen('root', bob),
  improv.gen('root', alice),
  improv.gen('root', carol)
];

/* Should produce something like:
  Bob: I have a dog who is 3 years old.
  Alice: I have a cat who is 2 years old.
  Carol: I have a parrot who is 5 years old.
*/

console.log(lines.join('\n'));
```

## Documentation

Full API documentation at [Read the Docs].

## Caveats and Known Issues

Improv does absolutely no validation or security checking of anything, so for the love of God don't pass user-submitted data into it.

Improv is still in active development and the API will change in the future as the library evolves.

## License

MIT © [Bruno Dias](http://segue.pw/)


[npm-image]: https://badge.fury.io/js/improv.svg
[npm-url]: https://npmjs.org/package/improv
[travis-image]: https://travis-ci.org/sequitur/improv.svg?branch=master
[travis-url]: https://travis-ci.org/sequitur/improv
[daviddm-image]: https://david-dm.org/sequitur/improv.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/sequitur/improv
[Read the Docs]:http://improv.readthedocs.org/en/latest/

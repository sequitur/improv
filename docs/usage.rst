Usage
=====

.. note By convention, we use EcmaScript 6 in this documentation, sticking to the same style that the Improv sources use themselves. For the most part, in code examples, we will only be using the ``const`` and ``let`` keywords that are already supported by modern implelmentations, under strict mode.

Installation
------------

Improv is an npm module, meant to be used both on Node.js and on browser environments through the use of a module bundler such as Browserify or Webpack. Adding Improv to your project is therefore done in the usual way with `npm install --save improv`.

Quick Example
-------------

  A brief usage example::

  const Improv = require('improv'); // import Improv from 'improv';

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
            "[name]: I have a [:animal] who is [#2-7] years old."
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

  console.log(lines.join('\n'));

This script, when run, should produce something like:

  Bob: I have a dog who is 6 years old.
  Alice: I have a cat who is 4 years old.
  Carol: I have a parrot who is 7 years old.

The output isn't completely random; it obeys certain rules. Alice always has a dog or a cat; Carol always has a parrot. Bob might have either animal. This is simplistic, but this model can be composed to express fairly complex rules.

This example be found in the improv source distribution, under ``demo/pets.js``. Another, more elaborate example is also included, ``demo/hms.js``. You can build both demos by doing ``gulp demo`` from the root folder of the source distribution; this should transpile them and make it possible to run them by doing ``node demo_build/pets.js``.

Read the API documentation for information on how to create Improv generators and use them.

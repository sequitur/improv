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

console.log(lines.join('\n'));

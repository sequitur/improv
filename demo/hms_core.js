import Improv from './lib/index.js';
import jetpack from 'fs-jetpack';

function loadSpec () {
  const spec = {};
  const snippetFiles = jetpack.find(`${__dirname}/hms_data`, {
    matching: '*.json'
  });
  snippetFiles.forEach(function (filename) {
    const snippet = jetpack.read(filename, 'json');
    if (typeof snippet.groups === 'undefined') {
      snippet.groups = [];
    }
    if (snippet.phrases) {
      snippet.groups.push({
        tags: [],
        phrases: snippet.phrases
      });
    }
    spec[snippet.name] = snippet;
  });
  return spec;
}

const shipMate = new Improv(loadSpec(), {
  filters: [
    Improv.filters.mismatchFilter(),
    Improv.filters.unmentioned(1),
    Improv.filters.partialBonus(),
    Improv.filters.fullBonus(),
    Improv.filters.dryness()
  ],
  persistence: false,
  reincorporate: true,
  audit: true
});

function newModel () {
  const model = {
    get gengraph () {
      /*
        A hack that means the initial intro sentence doesn't count as
        "mentioning" a tag.
      */
      shipMate.clearTagHistory();
      return '[:graph]';
    },
    tags: []
  };
  model.name = shipMate.gen('name', model);
  return model;
}

export default function shipDesc () {
  return shipMate.gen('root', newModel());
}

shipDesc.generator = shipMate;
shipDesc.newModel = newModel;

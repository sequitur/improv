class Improv {
  constructor (snippets, options = {}) {
    this.snippets = snippets;
    this.filters = options.filters ? options.filters : [];
  }

  gen (snippet, model) {
    return this.selectPhrase(this.scoreFilter(this.applyFilters(snippet, model)));
  }

  selectPhrase (groups) {
    const phrases = this.flattenGroups(groups);
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  applyFiltersToGroup (group, model) {
    const output = { group, score: 0 };
    this.filters.forEach(function (cb) {
      if (output.score === null) return;
      const scoreOffset = cb(group, model);
      if (scoreOffset === null) {
        output.score = null;
        return;
      }
      output.score += scoreOffset;
    });
    return output;
  }

  applyFilters (snippetName, model) {
    return this.snippets[snippetName].groups
      .map(group => this.applyFiltersToGroup(group, model))
      .filter(o => o.score !== null);
  }

  scoreFilter (groups) {
    const maxScore = groups.reduce(
      (currentMax, b) => b.score > currentMax ? b.score : currentMax,
      Number.NEGATIVE_INFINITY);
    return groups.filter(o => o.score >= maxScore);
  }

  flattenGroups (groups) {
    return groups
      .map(o => o.group.phrases)
      .reduce((a, b) => a.concat(b), []);
  }
}

import filters from './filters.js';

Improv.filters = filters;

export default Improv;

import template from './template.js';

class Improv {
  constructor (snippets, options = {}) {
    this.snippets = snippets;
    this.filters = options.filters ? options.filters : [];
    this.reincorporate = Boolean(options.reincorporate);
  }

  gen (snippet, model) {
    const chosenPhrase =
      this.selectPhrase(this.scoreFilter(this.applyFilters(snippet, model)), model);
    return template(chosenPhrase, model, this.gen.bind(this));
  }

  mergeTags (model, groupTags) {
    groupTags.forEach(function (a) {
      const site = model.tags.findIndex(b => a[0] === b[0]);
      if (site === -1) {
        model.tags = model.tags.concat([a]);
      } else {
        model.tags[site] = a;
      }
    });
  }

  selectPhrase (groups, model) {
    const phrases = this.flattenGroups(groups);
    console.log(phrases);
    const chosen = phrases[Math.floor(Math.random() * phrases.length)];
    if (this.reincorporate) this.mergeTags(model, chosen[1]);
    return chosen[0];
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
      .map(o => o.group.phrases.map(i => [i, o.group.tags]))
      .reduce((a, b) => a.concat(b), []);
  }
}

import filters from './filters.js';

Improv.filters = filters;

export default Improv;

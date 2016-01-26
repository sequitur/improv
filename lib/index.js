import template from './template.js';

class Improv {
  constructor (snippets, options = {}) {
    this.snippets = snippets;
    this.filters = options.filters ? options.filters : [];
    this.reincorporate = Boolean(options.reincorporate);
    if (typeof options.persistence === 'undefined') options.persistence = true;
    this.persistence = Boolean(options.persistence);
    this.history = [];
    this.tagHistory = [];
  }

  __gen (snippet, model) {
    this.__currentSnippet = snippet;
    const chosenPhrase =
      this.selectPhrase(this.scoreFilter(this.applyFilters(snippet, model)), model);
    this.history.unshift(chosenPhrase);

    return template(chosenPhrase, model, this.__gen.bind(this));
  }

  gen (snippet, model) {
    const output = this.__gen(snippet, model);
    if (!this.persistence) {
      this.clearHistory(); this.clearTagHistory();
    }
    return output;
  }

  mergeTags (model, groupTags) {
    const mergeTag = function (a, b) {
      if (a.length < b.length) return b;
      return a;
    };
    groupTags.forEach(function (a) {
      const site = model.tags.findIndex(b => a[0] === b[0]);
      if (site === -1) {
        model.tags = model.tags.concat([a]);
      } else {
        model.tags[site] = mergeTag(model.tags[site], a);
      }
    });
  }

  selectPhrase (groups, model) {
    const phrases = this.flattenGroups(groups);
    if (phrases.length === 0) {
      console.log(groups);
      throw new Error(
        `Unable to select a phrase out of ${groups} while generating ${this.__currentSnippet}`);
    }
    const chosen = phrases[Math.floor(Math.random() * phrases.length)];
    if (this.reincorporate) this.mergeTags(model, chosen[1]);
    if (Array.isArray(chosen[1])) {
      this.tagHistory = chosen[1].concat(this.tagHistory);
    }
    return chosen[0];
  }

  applyFiltersToGroup (group, model) {
    const that = this;
    let currentGroup = group;
    const output = { score: 0 };
    this.filters.forEach(function (cb) {
      if (output.score === null) return;
      const cbOutput = cb.call(that, currentGroup, model);
      let scoreOffset;
      if (Array.isArray(cbOutput)) {
        // We got a tuple, meaning the filter wants to modify the group before
        // moving on.
        scoreOffset = cbOutput[0];
        currentGroup = cbOutput[1];
      } else {
        scoreOffset = cbOutput;
      }
      if (scoreOffset === null) {
        output.score = null;
        return;
      }
      output.score += scoreOffset;
    });
    output.group = currentGroup;
    return output;
  }

  applyFilters (snippetName, model) {
    return this.snippets[snippetName].groups
      .map(group => this.applyFiltersToGroup(group, model))
      .filter(o => o.score !== null);
  }

  scoreFilter (groups) {
    // Filter out groups emptied out by dryness()
    const validGroups = groups.filter(g => g.group.phrases.length > 0);
    const maxScore = validGroups
      .reduce((currentMax, b) => b.score > currentMax ? b.score : currentMax,
      Number.NEGATIVE_INFINITY);
    return validGroups.filter(o => o.score >= maxScore);
  }

  flattenGroups (groups) {
    return groups
      .map(o => o.group.phrases.map(i => [i, o.group.tags]))
      .reduce((a, b) => a.concat(b), []);
  }

  clearHistory () { this.history = []; }
  clearTagHistory () { this.tagHistory = []; }
}

import filters from './filters.js';

Improv.filters = filters;

export default Improv;

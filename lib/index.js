import template from './template.js';
import { merge } from 'lodash';

const defaults = {
  filters: [],
  reincorporate: false,
  persistence: true,
  audit: false,
  salienceFormula  (a) { return a; }
};

class Improv {

  constructor (snippets, options = {}) {
    /* Constructor for Improv generators. */
    /* We don't want to mutate the options object we've been given; we don't know
    where it's been. */
    const spec = {}; merge(spec, defaults, options);
    this.snippets = snippets;
    this.filters = spec.filters;
    this.reincorporate = Boolean(spec.reincorporate);
    this.persistence = Boolean(spec.persistence);
    this.audit = Boolean(spec.audit);
    this.salienceFormula = spec.salienceFormula;
    this.history = [];
    this.tagHistory = [];

    if (this.audit) this.instantiateAuditData();
  }

  __gen (snippet, model) {
    /*
      Actually generate text. Separate from #gen() because we don't want to clear
      history or error-handling data while a call to #gen() hasn't finished
      returning
    */
    /* For the sake of better error handling, we try to keep an accurate record
       of what snippet is being generated at any given time. */
    const previousSnippet = this.currentSnippet;
    this.__currentSnippet = snippet;
    const chosenPhrase =
      this.selectPhrase(this.scoreFilter(this.applyFilters(snippet, model)), model);
    this.history.unshift(chosenPhrase);

    this.__currentSnippet = previousSnippet;
    if (this.audit) {
      const phraseTotal = this.__phraseAudit.get(snippet).get(chosenPhrase);
      this.__phraseAudit.get(snippet).set(chosenPhrase, phraseTotal + 1);
    }
    return template(chosenPhrase, model, this.__gen.bind(this));
  }

  get phraseAudit () {
    /* This is a getter so that the internals of how auditing data is stored
       and calculated can change without changing the API. */
    if (!this.audit) throw new Error('Tried retriving audit from generator not in auditing mode.');
    return this.__phraseAudit;
  }

  gen (snippet, model = {}) {
    // Make sure the model has a tag property.
    if (typeof model.tags === 'undefined') model.tags = [];
    if (typeof this.snippets[snippet] === 'undefined') {
      throw new Error(`Tried generating snippet "${snippet}", but no such snippet exists in spec`);
    }
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
      throw new Error(`Unable to select a phrase out of ${groups} while generating ${this.__currentSnippet}`);
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
    const scoreThreshold = this.salienceFormula(maxScore);
    return validGroups.filter(o => o.score >= scoreThreshold);
  }

  flattenGroups (groups) {
    return groups
      .map(o => o.group.phrases.map(i => [i, o.group.tags]))
      .reduce((a, b) => a.concat(b), []);
  }

  clearHistory () { this.history = []; }

  clearTagHistory () { this.tagHistory = []; }

  instantiateAuditData () {
    /*
      Create and fill audit maps with starter data, ie zeroes.
    */
    this.__phraseAudit = new Map();
    const self = this;

    Object.keys(this.snippets).forEach(function (key) {
      self.phraseAudit.set(key, new Map());
      self.snippets[key].groups.forEach(function (group) {
        group.phrases.forEach(function (phrase) {
          self.__phraseAudit.get(key).set(phrase, 0);
        });
      });
    });
  }
}

import filters from './filters.js';

Improv.filters = filters;

export default Improv;

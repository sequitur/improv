import { isEqual, partial } from 'lodash';

const TAG_COMPARISON = {
  TOTAL: Symbol(),
  PARTIAL: Symbol(),
  MISMATCH: Symbol()
};

function compareTags (a, b) {
  /* Returns a TAG_COMPARISON value */
  if (isEqual(a, b)) return TAG_COMPARISON.TOTAL;
  // If the tags are unequal but have the same length, it stands to reason
  // there is a mismatch.
  if (a.length === b.length) return TAG_COMPARISON.MISMATCH;
  const [shorter, longer] = a < b ? [a, b] : [b, a];
  if (shorter.find((x, i) => x !== longer[i])) return TAG_COMPARISON.MISMATCH;
  return TAG_COMPARISON.PARTIAL;
}

function mismatchFilterSub (group, model) {
  /* Ensures that the group and model don't have any mismatched tags */
  const result = group.tags.find(function (groupTag) {
    // Look for a mismatch.
    const matched = model.tags.find(modelTag => modelTag[0] === groupTag[0]);
    if (matched === undefined) return false;
    if (compareTags(groupTag, matched) === TAG_COMPARISON.MISMATCH) return true;
    return false;
  });
  if (result === undefined) return 0;
  return null;
}

function bonusCompare (mode, bonus = 1, cumulative = false) {
  return function (group, model) {
    const results = group.tags.filter(function (groupTag) {
      const matched = model.tags.find(modelTag => modelTag[0] === groupTag[0]);
      if (matched === undefined) return false;
      if (compareTags(groupTag, matched) === mode) return true;
      return false;
    });
    if (results.length) return cumulative ? bonus * results.length : bonus;
    return 0;
  };
}

export default {
  mismatchFilter () { return mismatchFilterSub; },

  partialBonus: partial(bonusCompare, TAG_COMPARISON.PARTIAL),

  fullBonus: partial(bonusCompare, TAG_COMPARISON.TOTAL),

  dryness () {
    return function (group) {
      const that = this;
      const newPhrases = group.phrases.map(function (phrase) {
        if (that.history.indexOf(phrase) !== -1) {
          return null;
        }
        return phrase;
      }).filter(i => i !== null);
      const newGroup = Object.create(group);
      newGroup.phrases = newPhrases;
      return [0, newGroup];
    };
  },

  unmentioned (bonus = 1) {
    return function (group) {
      if (!Array.isArray(group.tags)) return 0;
      if (group.tags.length === 0) return 0;
      const that = this;
      const result = group.tags.find(function (t) {
        // Return true if we have a matching tag in the tag history.
        const found = that.tagHistory.find(u => u[0] === t[0]);
        return (typeof found !== 'undefined');
      });
      if (typeof result === 'undefined') return bonus;
      return 0;
    };
  }
};

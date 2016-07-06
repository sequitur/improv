const TEMPLATE_BUILTINS = {
  a (text) {
    if (text.match(/^[aeioAEIO]/)) return `an ${text}`;
    return `a ${text}`;
  },

  an (text) { return this.a(text); },

  cap (text) { return `${text[0].toUpperCase()}${text.slice(1)}`; },

  A (text) { return this.cap(this.a(text)); },

  // eslint-disable-next-line babel/new-cap
  An (text) { return this.A(text); }
};

function dieRoll (min, max) {
  return (Math.floor(Math.random() * (max - min)) + min);
}

function mergeInTag (tags, tag) {
  // Find the matching tag...

  const i = tags.findIndex(t => t[0] === tag[0]);

  if (i === -1) return tags.concat([tag]);

  // Otherwise:
  // This is supposed to be a non-destructive operation
  const newTags = tags.concat();
  newTags[i] = tag;
  return newTags;
}

function processDirective (rawDirective, model, cb, generator) {
  const directive = rawDirective.trim();

  if (directive[0] === directive.slice(-1) && directive[0] === '\'') {
    // This is a literal directive.
    return directive.slice(1, -1);
  }

  if (directive.indexOf(' ') !== -1) {
    // The directive contains a space, which means it's a chained directive.
    const funcName = directive.split(' ')[0];
    const rest = directive.slice(directive.indexOf(' ') + 1);
    // eslint-disable-next-line no-prototype-builtins
    if (TEMPLATE_BUILTINS.hasOwnProperty(funcName)) {
      return `${TEMPLATE_BUILTINS[funcName](processDirective(rest, model, cb, generator))}`;
    }
    if (generator && generator.builtins && generator.builtins[funcName]) {
      return `${generator.builtins[funcName](processDirective(rest, model, cb, generator))}`;
    }
    if (typeof model[funcName] !== 'function') {
      throw new Error(`Builtin or model property "${funcName}" is not a function.`);
    }
    return `${model[funcName](processDirective(rest, model, cb, generator))}`;
  }

  if (directive[0] === '|') {
    const [tagStr, snippet] = directive.split(':');
    // Disregard the first |
    const newTag = tagStr.slice(1).split('|');
    const newModel = Object.create(model);

    newModel.tags = mergeInTag(model.tags, newTag);

    return cb(snippet, newModel);
  }
  if (directive[0] === ':') {
    return cb(directive.slice(1), model);
  }
  if (directive[0] === '#') {
    return dieRoll(...directive.slice(1).split('-').map(n => parseInt(n, 10)));
  }
  if (directive.indexOf('.') !== -1) {
    const propChain = directive.split('.');
    return propChain.reduce((obj, prop) => obj[prop], model);
  }
  return `${model[directive]}`;
}

export default function template (phrase, model, cb, generator) {
  const [openBracket, closeBracket] = [phrase.indexOf('['), phrase.indexOf(']')];
  if (openBracket === -1) return phrase;
  if (closeBracket === -1) {
    throw new Error(`Missing close bracket in phrase: ${phrase}`);
  }
  const before = phrase.slice(0, openBracket);
  const after = phrase.slice(closeBracket + 1);
  const directive = phrase.substring(openBracket + 1, closeBracket);
  return template(
    `${before}${processDirective(directive, model, cb, generator)}${after}`,
    model,
    cb,
    generator
  );
}

const TEMPLATE_BUILTINS = {
  a (text) {
    if (text.match(/^[aeioAEIO]/)) return `an ${text}`;
    return `a ${text}`;
  },

  an (text) { return this.a(text); },

  cap (text) { return `${text[0].toUpperCase()}${text.slice(1)}`; },

  A (text) { return this.cap(this.a(text)); },

  An (text) { return this.A(text); }
};

function dieRoll (min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function processDirective (rawDirective, model, cb) {
  const directive = rawDirective.trim();

  if (directive[0] === directive.slice(-1) && directive[0] === '\'') {
    // This is a literal directive.
    return directive.slice(1, -1);
  }

  if (directive.indexOf(' ') !== -1) {
    // The directive contains a space, which means it's a chained directive.
    const funcName = directive.split(' ')[0];
    const rest = directive.slice(directive.indexOf(' ') + 1);
    if (TEMPLATE_BUILTINS.hasOwnProperty(funcName)) {
      return `${TEMPLATE_BUILTINS[funcName](processDirective(rest, model, cb))}`;
    }
    return `${model[funcName](processDirective(rest, model, cb))}`;
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

export default function template (phrase, model, cb) {
  const [openBracket, closeBracket] = [phrase.indexOf('['), phrase.indexOf(']')];
  if (openBracket === -1) return phrase;
  if (closeBracket === -1) {
    throw new Error(`Missing close bracket in phrase: ${phrase}`);
  }
  const before = phrase.slice(0, openBracket);
  const after = phrase.slice(closeBracket + 1);
  const directive = phrase.substring(openBracket + 1, closeBracket);
  return template(
    `${before}${processDirective(directive, model, cb)}${after}`,
    model,
    cb
  );
}

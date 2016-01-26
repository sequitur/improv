function dieRoll (min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function processDirective (directive, model, cb) {
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

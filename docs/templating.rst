Templating
==========

Improv includes some basic templating functionality. For the most part, this is
used so that snippets can be nested, allowing one phrase to include the output
from a different snippet.

..warning Improv's templating engine is very simple, and it doesn't do any sort
of validation or checking. As a result, do not pass "dirty" user-submitted data
into Improv; there is not guarantee that this is safe.

When Improv generates a phrase, that phrase gets run by the templating engine,
from the start to the end of the phrase. It leaves everything alone other than
*directives*, substrings wrapped in [brackets]. Directives are substituted
in place by their results.

Directives are resolved *before* the rest of the phrase is parsed. This means
that if you write a phrase thusly:

  ``'[:statement] [:statement] [:statement] [:statement]'``

Each subsequent ``[:statement]`` directive will be run in order. So if
reincorporation is on for this generator, subsequent statements will "see" the
changes to the model produced by earlier ones. This makes it relatively easy
to build paragraphs out of a single snippet that calls several other snippets.

Literal Directive
-----------------

Directives wrapped in ``'single quotes'`` will be treated as a string literal.
That is, they will produce whatever text is inside the quotes. Ordinarily, this
is useless, but it can be used to pass a literal text argument into a chained
directive function.

Property Directive
-----------------

Directives that don't start with a special character (# or :) will produce a
stringified form of the model's property corresponding to the directive's text.
So for example, ``[name]`` will look for a property in the model object called
"name", and substitute in the content of that.

You can look up nested properties using the normal dot notation: ``[name.full]``
for example. Note that if one of the intervening properties is undefined, this
will throw an error, and it can have unexpected results if the property does not
convert gracefully into a string.

Number Directive
----------------

Directives starting with a ``#``, such as ``[#1-20]``, will produce a random
(Integer) number. The content of the directive should be two integers separated
by a hyphen (``-``); the number will be between the first and the second one,
inclusive.

Recursion Directive
-------------------

Directives starting with ``:`` will treat the directive text as a snippet to be
called from the same generator. This allows composing snippets together, so
that a single snippet can be used to generate an entire paragraph or description
of something.

Note that by the time this recursion happens and the "inner snippet" is called,
the phrase for the "outer snippet" has already been selected, and so have
phrases for any preceding snippet. When using reincorporation and filters, this
means that decisions about the model are made roughly in the same order as the
text.


Chained Directives
------------------

Directives that have spaces in them (other than trailing or leading spaces) will
be treated as a chain of methods to be called in order from the model object.
Which is to say, this: ``[funcA funcB propA]`` will produce output equivalent to
this: ``model.funcA(model.funcB(model.propA))``. This allows endowing a model
with functions to transform text and applying them from within templates.

Note that each individual word inside the directive is, itself, treated as an
individual directive and expanded, so it is possible to use ``:``, for instance.

The templating module includes a handful of built-in functions that supercede the model's own methods and can be used as linguistic conveniences.

- ``cap`` capitalises the first character in text.
- ``a`` will prefix the text with either "a" or "an", roughly in accordance with normal English grammar.
- ``an`` is an alias for ``a``.
- ``An`` and ``A`` are equivalent to ``cap a``.

You can therefore write phrases such as ``In this county, it is forbidden to sell [an :animal] for less than twelve shillings.`` and get appropriate results: "a dog", but "an aardvark."

Note that the algorithm currently used to produce a/an is fairly naive, and
doesn't take into consideration most corner cases; it assumes that words
starting in a, e, i, or o all take "an", while words starting in other letters
take "a."

You can add your own builtins to a generator by specifying the ``builtins`` property in
the generator options, as an object. For example::

	const generator = new Improv(snippetData, {
    builtins: {
    upcap (str) { return str.toUpperCase(); }
    }
  });

Will allow you to call ``upcap`` as a built-in function from within templates.
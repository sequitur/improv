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

Default Directive
-----------------

Directives that don't start with a special character (# or :) will produce a stringified
form of the model's property corresponding to the directive's text. So for
example, ``[name]`` will look for a property in the model object called "name",
and substitute in the content of that.

You can look up nested properties using the normal dot notation: ``[name.full]``
for example. Note that if one of the intervening properties is undefined, this
will throw an error.

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

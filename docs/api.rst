Improv API Reference
====================

Constructor
-----------

.. js:class:: Improv(spec, options)

  :param object spec: The spec object containing a set of snippets.
  :param object options: An options object.
  :returns: An Improv generator.

Creates a generator according to the given spec. The options object is used to set its behavior.

Spec
::::

The spec is a plain javascript object that defines all of the snippets that the generator has access to. It should follow this structure::

  {
    snippetName: {
      groups: [
        {
          tags: [['individual', 'tag']],
          phrases: ['individual phrase']
        }
      ]
    }
  }

That is, a plain object with keys corresponding to the names of snippets and values corresponding to snippet objects. Each snippet object has one property, ``groups``, which itself is an array of group objects. Group objects have two properties, ``tags``(an array of arrays, where each array is an individual tag) and ``phrases`` (an array of strings, with each string being a potential phrase that the snippet can produce).

Binding
.......

Optionally, a snippet object can have it's ``bind`` property set to ``true``. When the generator is run, that snippet will be chosen randomly only the first time it is called; afterwards, the output of that snippet (including any template directives) will be resolved and "frozen." This is useful, for instance, if you want the name of something to be consistent in the text but you're not sure when or where that name will show up first and have to be generated.

Note that binding is done *per model*; bindings are added to the model as properties of a ``bindings`` object.

Options
:::::::

The options object defines the behavior of the generator. The default options are::

  {
    filters: [],
    reincorporate: false,
    persistence: true,
    salienceFormula: function (a) { return a; },
    audit: false,
    rng: undefined,
    builtins: {},
    submodeler: function () { return {}; }
  }

Filters
.......

The ``filters`` option (default: empty array) should be an Array of functions that are applied as filters to select and rank phrases; see the filter API documentation.

Reincorporation
...............

The ``reincorporate`` option (default: false) defines whether or not the generator should reincorporate used tags. If set to true, the generator will mutate given model objects, merging any tags of used phrases with the object's own tags. This is not done by simply concatenating the model's tags with the phrase's tags. Rather, any corresponding tags in the model are updated to reflect the tags in the phrase (where "corresponding" means the the first element in the tag is the same), while new tags are added to the end of the model's tag list.

Reincorporation means that Improv can make decisions about the model it's working with and that those decisions will be referenced by future phrase generation.

Persistence
...........

The ``persistence`` option (default: true) defines whether the generator will save history and tag history.

Salience formula
................

The ``salienceFormula`` option (default: identity function) is a callback that is used to calculate the salience threshold. After Improv applies filters and removes inappropriate phrases from the list of potential phrases, it then calculates the maximum salience score among possible phrases. This value is passed to ``salienceFormula``, and the return value from that function is used as the salience threshold. Improv will only use phrases with a salience score equal to or greater than the salience threshold.

What this means is that, by default, Improv will use only the phrases that score highest on salience, as given by the filters that it applied. Using a different formula allows for fuzzier ranking of phrases, or simply slightly more randomness in Improv's phrase choice.

Auditing
........

The ``audit`` option (default: false) sets whether or not to turn on audit logging for this generator. Audit logging is done without any regard for memory or processing efficiency; it's meant as a tool to help you find "lumps" in your generator corpora (ie, things that come up too often or too rarely, biases and so on) and so it slows things down significantly.

Currently, the following audit data is available:

.. js:attribute:: Improv.prototype.phraseAudit

A property of generator objects with audit turned on. The phrase audit is a Map object where the keys are strings (snippet names) and the values are themselves Maps. Each inner map has a key for each phrase that is a valid result for the snippet, and a value of an integer that corresponds to how often this phrase was used. This map is supposed to be comprehensive, meaning that phrases that don't show up at all will be there, with a value of zero.

This tally is run regardless of history saving. The intention is that you can run your generator thousands of times then dump this map data to whatever data format you prefer and look at the aggregate results to see if there are phrases that are never being used (because their salience is always too low), phrases that come up disproportionately often, and so on.

Using a custom RNG
....................

The ``rng`` option (default: undefined) allows for supplying a custom random number generator, for instance if you want to use a seeded generator or if, for some deranged reason, you want your random text generated with cryptographically secure pseudorandom numbers.

The rng should be a function that supplies the same interface as Math.random(), that is, it should return a floating-point number between 0 (inclusive) and 1 (exclusive). When the generator object is created, the function is bound to it, so inside the rng function, ``this`` refers to the generator itself.

Builtins
........

See the section on :ref:`templating`.

Submodeler
..........

See the section on :ref:`submodels`.

Methods
-------

.. js:function:: Improv#gen(snippet[, model = {}])

  :param string snippet: The name of the snippet to be generated.
  :param object model: A model object.

Generates text according to a given snippet. Returns the generated text. Note that this is **not** a pure function; it can mutate the model object, attaching bindings to it and tags (if reincorporation is turned on).

.. js:function:: Improv#clearHistory()

Clears the generator's phrase history.

.. js:function:: Improv#clearTagHistory()

Clears the generator's tag history.

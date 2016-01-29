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

Options
:::::::

The options object defines the behavior of the generator. The default options are::

  {
    filters: [],
    reincorporate: false,
    persistence: true,
    salienceFormula: function (a) { return a; }
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

Methods
-------

.. js:function:: Improv#gen(snippet[, model = {}])

  :param string snippet: The name of the snippet to be generated.
  :param object model: A model object.

Generates text according to a given snippet.

.. js:function:: Improv#clearHistory()

Clears the generator's phrase history.

.. js:function:: Improv#clearTagHistory()

Clears the generator's tag history.

Filtering API
=============

The filtering API is the backbone of Improv's world model; it allows for groups of phrases to be selected according to certain rules.

A filter is just a function that supplies a specific API:

.. js:function:: filter(group, model)

  :param object group: The group of phrases being considered.
  :param object model: The model object being used.

The model object in this instance is the same one passed to :js:func:`Improv#gen`, and the group object is one of the groups included in the group list for the given snippet, in the spec used to create the generator.

When :js:func:`Improv#gen` is called, the generator's filters are called in order on each group of phrases to be considered, to calculate that group's salience score. Note that, if a filter earlier in the generator's filter list has excluded a group, then that group will never be passed to subsequent filters.

A filter is supposed to return one of three kinds of values:

- A number, which is treated as a score offset; it's added to the score for the group being tested.
- ``null``, in which case the group is excluded from the list and won't be passed to other filters or used.
- An Array. In this case, element 0 of the array is treated as a score offset, while element 1 is treated as a modified group that is to be used instead of the original group. Note that this should be a new object, to avoid mutating the original group!

Standard filters
---------------

.. js:attribute Improv.filters

The object Improv.filters, imported as part of Improv, includes a number of standard filters. Note that the attributes of Improv.filters are *factories* that return a filter callback, not filters themselves. So to define a generator with all four standard filters::

  const generator = new Improv(spec, {
    filters: [
      mismatchFilter(),
      partialBonus(),
      fullBonus(),
      dryness()
    ]
  });

Note that ``mismatchFilter()`` itself returns a callback that is used as the actual filter in this instance. For the sake of consistency, every property of Improv.filters is one such factory, even if they don't take options.

.. js:function:: Improv.filters.mismatchFilter()

The mismatch filter excludes from consideration (returns ``null``) any group that has a tag which is mismatched against the model. What this means is that the tags are a matched pair (they have the same first element), but they different subsequent elements. ``['animal', 'dog']`` and ``['animal', 'cat']`` are mismatched.

This filter can be used to prevent contradictory statements; in the ``hms.js`` demo, for instance, ships can either be sailing vessels or have engines, and some ships with engines are electric while others use a combustion engine; the mismatch filter ensures that statements that apply to an electric vessel won't be used for a sailing vessel, while some statements can apply to both kinds of vessels with engines.

.. js:function:: Improv.filters.partialBonus([bonus = 1, cumulative = false])

  :param number bonus: The bonus to be given for matches.
  :paran boolean cumulative: Whether to apply that bonus for every match found.

A partial match is a set of two tags where one tag is shorter, but all elements of the shorter tag match their corresponding elements in the longer tag; this filter gives a salience score bonus to groups that have at least one partial match with the model's tags. If ``cumulative`` is true, this bonus is multiplied by the number of matches.

.. js:function:: Improv.filters.fullBonus([bonus = 1, cumulative = false])

Identical to :js:func:`Improv.filters.partialBonus`, except it gives a bonus to full matches. A full match is a set of two tags where both tags are identical.

.. js:function:: Improv.filters.dryness()

Removes phrases that are already present in the generator's history. DRY in this instance stands for "don't repeat yourself." Keep in mind that when using the dryness filter, it's important to carefully design the corpus and program so that Improv doesn't run out of valid phrases to say.

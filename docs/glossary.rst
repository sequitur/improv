Glossary
========

generator
  An Improv object created by :js:class:`Improv`

group
  An object consisting of two properties, ``tags`` and ``phrases``. ``phrases`` is just
  a list of potential phrases the group's parent snippet might produce. ``tags`` is a
  list of tags associated with this group, for use in filtering.

phrase
  An individual section of text (a string) that can be produced by a given snippet,
  included in one of the snippet's groups.

snippet
  A specific class of texts intended to be fulfill similar textual role. Each property
  of a generator's ``spec`` object is treated as a snippet, consisting of an object
  with a ``groups`` property that is itself an array of groups.

tag
  In Improv, tags are hierarchical markers; the "world model" is defined in terms of
  a list of tags. Each individual tag is an array of strings, arranged as an
  increasingly specific list of categories. The ``tags`` property of models and groups
  is itself an array of arrays.

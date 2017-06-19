.. _submodels:

Submodels
=========

Submodels are a powerful feature that allows Improv models to be nested. For
example, a model representing a story could contain several underlying submodels
describing individual character roles within that story. Each submodel maintains its own
independent set of tags and bindings.

To use a submodel, use the ``[>submodel:snippet]`` templating directive. The
directive starts with a ``>``, followed by the name of the submodel, followed by a
``:``,followed by the name of the snippet to generate using that submodel.

Programmatically, submodels are just own properties of models that happen to be objects. You can populate a model with submodels ahead of time, if you want; otherwise, Improv will create them as necessary.

Submodelers
-----------

The submodeler is the function used to create submodels. You can set the submodeler when
you create an Improv instance, through the ``submodeler`` option. By default, the
submodeler is just a function that returns an empty object, but you can set a custom one
to perform housekeeping tasks related to setting up the submodel. For example, maybe you
want to copy the overarching model's tags to the submodel.

The submodeler takes two arguments: The model that is receiving a submodel, and the
name of the submodel being created (as given in the templating directive). It should
return a plain object that will be attached to the model as a submodel.

Note that the submodeler is only called if a given submodel doesn't exist already.
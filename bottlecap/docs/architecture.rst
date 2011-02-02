:mod:`bottlecap` Architecture
=============================

User Interface Operations
-------------------------

:mod:`bottlecap` aims to be a generic content management UI for applications,
based on a "containment" model.  The main :mod:`bottlecap` view presetnts a
container-plus items view on the current context, including the following
features:

- The container's items are presented in a batchable grid.

- The grid can be sorted and filtered based on a set of standard criteria.

- Each item in the grid exposes a set of user-selectable "actions", where
  an action can represent a display of additional information, an edit
  form, an immediately-triggered event, or an external URL (opening in
  a new window).

- Items may be themselves usable as :mod:`bottlecap` containers;  such
  items provide a link which re-focuses the :mod:`bottlecap` UI on the
  item.

- Existing items can be removed from their containers.

- Existing items can be "renamed" within their containers.

- Items can be moved from one container to another.

- Items can be copied from one container to another.

- The container exposes a set of "factories", representing items
  which can be created within the container.  Selectint a factory
  typically prompts the user for form input before creating the new
  item.

- Like items, containers expose a set of actions which can be triggered
  by the user.

- Conainers may be themselves be items in another :mod:`bottlecap` container;
  such items provide a link which re-focuses the :mod:`bottlecap` UI on the
  "parent".


Mapping :mod:`bottlecap` Onto an Application
--------------------------------------------

The :mod:`bottlecap` views expect that their contexts can be adapted to
:class:`bottlecap.interfaces.IContainerInfo`.  Making your application work
with :mod:`bottlecap` requires implementing and registering an appropriate
adapter for each "container" type you expose.  See
:ref:`implementing_icontainerinfo` and :ref:`registering_adapters`
for an example.

Implementing the `IContainerInfo` adapter requires that you implement and
register :class:`bottlecap.interfaces.IItemInfo` adapters for the various
items in your containers.  See :ref:`implementing_iiteminfo` and
:ref:`registering_adapters` for an example.

You also need to implement :class:`bottlecap.interfaces.IActionInfo` objects
as needed for each of your items and containers.  See
:ref:`implementing_iactioninfo` and :ref:`registering_adapters` for examples.

You also need to implement :class:`bottlecap.interfaces.IFactoryInfo` objects
as needed for each of your containers.  See :ref:`implementing_ifactoryinfo`
and :ref:`registering_adapters` for an example.


Example:  Simple RAM-based Tree
-------------------------------

Base Application
::::::::::::::::

Imagine that your application is built using :mod:`pyramid` in "traversal"
style.  In thie application, the resource tree is made up of ``Folder``
objects,  which are thin wrappers over standard ``dict`` objects.  The root
of the tree is held at module scope by your application:

.. literalinclude:: examples/resources.py

Before adapting your application for use with the :mod:`bottlecap` UI, 
its startup code registers whatever views you have written:

.. literalinclude:: examples/__init__.py


.. _implementing_icontainerinfo:

Implementing ``IContainerInfo``
:::::::::::::::::::::::::::::::

Enabling this application for management via the :mod:`bottlecap` UI
requires defining an :class:`bottlecap.interfaces.IContainerInfo` adapter
for your ``Folder`` objects:

.. literalinclude:: examples/bottlecap.py
   :pyobject: FolderContainerInfo
   :linenos:

lines 1 - 2
    The class declares that it implements `IContainerInfo`

lines 4 - 5
    As an adapter, the class is instantiated with its ``context`` (the
    folder).

lines 7 - 23
    We implment the attributes required by `IContainerInfo` as
    properties (computed using ``context``) or static values.

    Note that we set both ``filter_schema`` and ``sort_schema`` to ``None``
    in order to tell the :mod:`bottlecap` UI that we don't support filtering
    or sorting.

lines 25 - 31
    Because computing URLs requires access to the ``request``, ``parent_url``
    and ``icon_url`` are methods, not simple attributes.

lines 33 - 49
    We implement ``listItems`` by first "slicing" the values in ``context``
    and then wrapping each one in an adapter which provides ``IItemInfo``.
    (We skip doing the actual adapter lookup, because we know that
    the items can only be folders).

lines 51 - 75
    ``__call__`` creates and returns a dictionary describing the container:
    this dictionary is going to be converted to JSON and returned to the
    Javascript in the :mod:`bottlecap` UI.  Note that we convert the
    items, ``actions`` and ``factories`` to mappings by calling them.


.. _implementing_iiteminfo:

Implementing ``IItemInfo``
::::::::::::::::::::::::::

:func:`IContainerInfo.listItems` requires that the values returned by
its implementations must implement :class:`bottlecap.interfaces.IItemInfo`,
We implement that interface for our ``Folder`` class as follows:

.. literalinclude:: examples/bottlecap.py
   :pyobject: FolderItemInfo
   :linenos:

lines 1 - 2
    The class declares that it implements `IItemInfo`

lines 4 - 5
    As an adapter, the class is instantiated with its ``context`` (the
    folder).

lines 7 - 17
    We implment the attributes required by `IItemInfo` as properties,
    computed using ``context``.

lines 19 - 23
    Because computing URLs requires access to the ``request``, ``item_url``
    and ``icon_url`` are methods, not simple attributes.

lines 25 - 37
    ``__call__`` creates and returns a dictionary describing the item: 
    this dictionary is going to be converted to JSON and returned to the
    Javascript in the :mod:`bottlecap` UI.  Note that we convert the
    objects for ``actions`` to mappings by calling them.


.. _implementing_iactioninfo:

Implementing ``IActionInfo``
::::::::::::::::::::::::::::

:attr:`bottlecap.interfaces.IContainerInfo.actions` and
:attr:`bottlecap.interfaces.IItemInfo.actions` are required to be sequences
of values implementing :class:`bottlecap.interfaces.IActionInfo`.  In
our example, we provide one "external" action, which opens the normal
(non-:mod:`bottlecap`) view of the folder in a new window:

.. literalinclude:: examples/bottlecap.py
   :pyobject: ViewActionInfo
   :linenos:

lines 1 - 4
    The class declares that it implements `IViewInfo`

lines 6 - 7
    As an adapter, the class is instantiated with its ``context`` (the
    folder).

lines 8 - 12
    We implment the attributes required by `IViewInfo` as  static values.
    ``action_type`` is set to ``"external"`` to indicate that the
    action opens its URL in a new, non-:mod:``bottlecap`` window.

lines 14 - 19
    Because computing URLs requires access to the ``request``, ``icon_url``
    and ``action_urls`` are methods, not simple attributes.

lines 21 - 28
    ``__call__`` creates and returns a dictionary describing the action: 
    this dictionary is going to be converted to JSON and returned to the
    Javascript in the :mod:`bottlecap` UI.


We also provide one "overlay" action, which opens an edit form in an overlay:

.. literalinclude:: examples/bottlecap.py
   :pyobject: FolderEditActionInfo
   :linenos:

lines 1 - 4
    The class declares that it implements `IViewInfo`

lines 6 - 7
    As an adapter, the class is instantiated with its ``context`` (the
    folder).

lines 8 - 12
    We implment the attributes required by `IViewInfo` as  static values.
    ``action_type`` is set to ``"form"`` to indicate that the
    action opens its URL as a form in a :mod:``bottlecap`` overlay.

lines 14 - 19
    Because computing URLs requires access to the ``request``, ``icon_url``
    and ``action_urls`` are methods, not simple attributes.

lines 21 - 28
    ``__call__`` creates and returns a dictionary describing the action: 
    this dictionary is going to be converted to JSON and returned to the
    Javascript in the :mod:`bottlecap` UI.


.. _implementing_ifactoryinfo:

Implementing ``IFactoryInfo``
:::::::::::::::::::::::::::::

:attr:`bottlecap.interfaces.IContainerInfo.factories` is required to be
a sequence of values implementing :class:`bottlecap.interfaces.IActionInfo`.
In our example, we provide one factory, which creates sub-folders:

.. literalinclude:: examples/bottlecap.py
   :pyobject: FolderFactoryInfo
   :linenos:

lines 1 - 2
    The class declares that it implements `IFactoryInfo`

lines 4 - 5
    As an adapter, the class is instantiated with its ``context`` (the
    folder).

lines 7 - 9
    We implment the attributes required by `IFactoryInfo` as static values.

lines 19 - 23
    Because computing URLs requires access to the ``request``, ``icon_url``
    and ``factory_urls`` are methods, not simple attributes.

lines 18 - 24
    ``__call__`` creates and returns a dictionary describing the factory: 
    this dictionary is going to be converted to JSON and returned to the
    Javascript in the :mod:`bottlecap` UI.


.. _registering_adapters:

Registering the Adapters
::::::::::::::::::::::::

In order for the views of the :mod:`bottlecap` UI to use the adapters we have
created, we must register them:

.. literalinclude:: examples/bottlecap.py
   :pyobject: registerBottlecapAdapters
   :linenos:

lines 1 - 4
    We register our ``FolderContainerInfo`` class as the ``IContainerInfo``
    adapter for our ``Folder`` resource class.  This registration is required,
    becuase the :mod:`bottlecap` UI views all expect to adapt their
    ``context`` to ``IContainerInfo``.

lines 5 - 12
    We *don't* register the remaining adapters, because the implementation
    of ``FolderContainerInfo`` and ``FolderItemInfo`` don't use the adapter
    registry to look up adapters for anything:  they are hard-wired, bsed
    on the assumption that all items are ``Folder`` objects.  A real-world
    application would likely register them, with an implementation that
    used the registry to look them up.

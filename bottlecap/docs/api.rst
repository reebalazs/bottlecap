:mod:`bottlecap` API Reference
==============================

Interfaces
----------

.. automodule:: bottlecap.interfaces

  .. autodata:: ACTION_TYPE_URLS

  .. autointerface:: IActionInfo
     :members:
        action_type
        token
        title
        description
        icon_url
        action_urls
        __call__

  .. autointerface:: IItemInfo
     :members:
        key
        item_url
        title
        icon_url
        modified
        creator
        actions
        __call__

  .. autointerface:: IFactoryInfo
     :members:
        token
        title
        description
        icon_url
        factory_urls
        __call__

  .. autointerface:: IContainerInfo
     :members:
        parent_url
        title
        icon_url
        modified
        creator
        actions
        factories
        __call__

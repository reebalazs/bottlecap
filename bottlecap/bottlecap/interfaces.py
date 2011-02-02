from zope.interface import Attribute
from zope.interface import Interface

class IBottlecap(Interface):
    """ Marker / API for root object.
    """

ACTION_TYPE_URLS = {
    'display':          # read-only, show as overlay
        ['GET',         # (required) fetch HTML fragment to display in overlay
        ],
   'form':              # show form, handle POST
        ['GET',         # (required) fetch HTML fragment to display in overlay
         'POST',        # (optional) target for intercepted form post
         'on_error',    # (optional) fetch HTML on non-200 response
         'on_success',  # (optional) fetch HTML on 200 response
        ],
   'external':          # open in a new window
        ['url',         # (required) URL to be opened
        ],
   'immediate':         # trigger the action without prompt
        ['url',         # (required) URL to be triggered
         'on_error',    # (optional) fetch overlay HTML on non-200 response
         'on_success',  # (optional) fetch overlay HTML on 200 response
        ],
}
""" Map an 'action_type' key onto the keys in 'action_urls'."""


class IActionInfo(Interface):
    """ Represent a single action visible in the :mod:`bottlecap` UI.
    """
    action_type = Attribute(u"Discriminator\n\n"
                             "Must come from 'ACTION_TYPE_URLS'")
    token = Attribute(u"Short name\n\n"
                       "Must be unique among actions of a given set.")
    title = Attribute(u"Display title\n\n"
                       "Shown next to icon, or as popover")
    description = Attribute(u"Longer explanation\n\n"
                             "Shown in help text")
    icon_url = Attribute(u"URL of icon\n\n"
                          "Must be sized to fit bottlecap UI requirements")
    action_urls = Attribute(u"Mapping of URLs relevant to the action\n\n"
                             "Relevant keys are dictated by 'action_type' ")

    def __call__():
        """ -> mapping of attributes.
        """


class IItemInfo(Interface):
    """ Represent a single container item in the :mod:`bottlecap` UI.
    """
    key = Attribute(u"Uniquely identify item within its container\n\n"
                     "Must be a string suitable for use as value of an input")
    item_url = Attribute(u"Item URL\n\n"
                          "Must be :mod:`bottlecap` view of item, or None")
    title = Attribute(u"Display title\n\n"
                       "Shown in item list")
    icon_url = Attribute(u"URL of icon\n\n"
                          "Must be sized to fit bottlecap UI requirements")
    modified = Attribute(u"Modification timestamp\n\n"
                          "Must be in UTC zone")
    creator = Attribute(u"Creator\n\n"
                         "Login name of item creator")
    actions = Attribute(u"Actions list\n\n"
                         "Sequence of 'IActionInfo'")

    def __call__(include_actions=True):
        """ -> mapping of attributes.

        Map the item's actions onto a sequence of mappings, one per
        'IActionInfo', under the key 'actions'.

        Omit 'actions' if 'include_actions' is False.
        """


class IFactoryInfo(Interface):
    """ Represent a single kind of content addable in the :mod:`bottlecap` UI.
    """
    token = Attribute(u"Short name\n\n"
                       "Must be unique among factories for a given container.")
    title = Attribute(u"Display title\n\n"
                       "Shown next to icon, or as popover")
    description = Attribute(u"Longer explanation\n\n"
                             "Shown in help text")
    icon_url = Attribute(u"URL of icon\n\n"
                          "Must be sized to fit bottlecap UI requirements")
    factory_urls = Attribute(u"Mapping of URLs relevant to the action\n\n"
                              "Keys same as 'ACTION_TYPE_URLS[\"form\"]'")

    def __call__():
        """ -> mapping of attributes.
        """


class IContainerInfo(Interface):
    """ Represent a single container item in the :mod:`bottlecap` UI.
    """
    parent_url = Attribute(u"Parent URL\n\n"
                            "Must be :mod:`bottlecap` view of parent, or None")
    title = Attribute(u"Display title\n\n"
                       "Shown in header")
    icon_url = Attribute(u"URL of icon\n\n"
                          "Must be sized to fit bottlecap UI requirements")
    modified = Attribute(u"Modification timestamp\n\n"
                          "Must be in UTC zone")
    creator = Attribute(u"Creator\n\n"
                         "Login name of item creator")
    actions = Attribute(u"Actions list\n\n"
                         "Sequence of 'IActionInfo'")
    factories = Attribute(u"Factories list\n\n"
                           "Sequence of 'IFactoryInfo'")
    filter_schema = Attribute(u"Schema for filtering items\n\n"
                               "Must be a :mod:`colander` schema")
    sort_schema = Attribute(u"Schema for filtering items\n\n"
                               "Must be a :mod:`colander` schema, typically a "
                               "single multi-choice field")

    def listItems(filter_spec=None,
                  sort_spec=None,
                  batch_start=None,
                  batch_size=None,
                 ):
        """ -> sequence of 'IItemInfo'

        'filter_spec' is a :mod:`colander` appstruct, corresponding to
        the container's 'filter_schema', or None.  If not None, the container
        returns only items which match the supplied filter.

        'sort_spec' is a :mod:`colander` appstruct, corresponding to
        the container's 'sort_schema', or None.  If not None, the container
        sorts the returned items accordingly.

        'batch_start', if supplied, must be a non-negative integer which
        is the index of the first item returned in the (filtered/sorted)
        sequence.

        'batch_size', if supplied, must be a positive integer which
        is the maximum number of items returned from the (filtered/sorted)
        sequence.
        """

    def __call__(filter_spec=None,
                 sort_spec=None,
                 batch_start=None,
                 batch_size=None,
                 include_actions=True,
                 include_factories=True,
                ):
        """ -> mapping of attributes.

        The container's items are returned as a sequence of mappings under
        the key 'items'.  They may be filtered, sorted, and batched.

        Each of 'filter_spec', 'sort_spec', 'batch_start', and 'batch_size'
        have the same semantics as they do for 'listItems()'.

        Map the container's actions onto a sequence of mappings, one per
        'IActionInfo', under the key 'actions'.

        Omit 'actions' if 'include_actions' is False.

        Map the factories usable in the container onto a sequence of
        mappings, one per 'IFactoryInfo', under the key 'factories'.

        Omit 'factories' if 'include_factories' is False.
        """

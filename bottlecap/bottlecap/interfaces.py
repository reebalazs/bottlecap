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
    def icon_url(request):
        """ -> URL of icon

            Must be sized to fit bottlecap UI requirements.
        """

    def action_urls(request):
        """ -> mapping of URLs relevant to the action


            Relevant keys are dictated by 'action_type'.
        """

    def __call__(request):
        """ -> mapping of attributes.
        """


class IItemInfo(Interface):
    """ Represent a single container item in the :mod:`bottlecap` UI.
    """
    key = Attribute(u"Uniquely identify item within its container\n\n"
                     "Must be a string suitable for use as value of an input")
    title = Attribute(u"Display title\n\n"
                       "Shown in item list")
    modified = Attribute(u"Modification timestamp\n\n"
                          "Must be in UTC zone")
    creator = Attribute(u"Creator\n\n"
                         "Login name of item creator")

    def item_url(request):
        """ -> item URL

           Must be :mod:`bottlecap` view of item, or None.
        """

    def icon_url(requst):
        """ -> URL of icon

            Must be sized to fit bottlecap UI requirements.
        """

    def actions(registry):
        """ -> sequence of ``IActionInfo``
        
        List of actions apropos to the item.
        """

    def __call__(request, include_actions=True):
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

    def icon_url(requst):
        """ -> URL of icon

            Must be sized to fit bottlecap UI requirements.
        """
    def factory_urls(request):
        """ -> mapping of URLs relevant to the action

            Keys same as 'ACTION_TYPE_URLS["form"]'.
        """

    def __call__(request):
        """ -> mapping of attributes.
        """


class IContainerInfo(Interface):
    """ Represent a single container item in the :mod:`bottlecap` UI.
    """
    title = Attribute(u"Display title\n\n"
                       "Shown in header")
    modified = Attribute(u"Modification timestamp\n\n"
                          "Must be in UTC zone")
    creator = Attribute(u"Creator\n\n"
                         "Login name of item creator")
    filter_schema = Attribute(u"Schema for filtering items\n\n"
                               "Must be a :mod:`colander` schema")
    sort_schema = Attribute(u"Schema for filtering items\n\n"
                               "Must be a :mod:`colander` schema, typically a "
                               "single multi-choice field")
    def parent_url(request):
        """ -> Parent URL

            Must be :mod:`bottlecap` view of parent, or None.
        """

    def icon_url(request):
        """ -> URL of icon

            Must be sized to fit bottlecap UI requirements.
        """

    def actions(registry):
        """ -> sequence of ``IActionInfo``
        
        List of actions apropos to the container.
        """

    def factories(registry):
        """ -> sequence of ``IFactoryInfo``

        Factories apropos to the container.
        """

    def listItems(registry,
                  filter_spec=None,
                  sort_spec=None,
                  batch_start=None,
                  batch_size=None,
                 ):
        """ -> sequence of 'IItemInfo'

        'registry' will be the current componetn registry.

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

    def __call__(request,
                 filter_spec=None,
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

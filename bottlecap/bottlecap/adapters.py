import datetime

from pyramid.url import resource_url
from pyramid.url import static_url
from zope.interface import implements

from bottlecap.interfaces import IActionInfo
from bottlecap.interfaces import IContainerInfo
from bottlecap.interfaces import IItemInfo

_NOW = None
def _now():
    if _NOW is not None:
        return _NOW
    return datetime.datetime.now()


class FolderContainerInfo(object):
    implements(IContainerInfo)

    def __init__(self, context):
        self.context = context

    title = property(lambda self: _get_title(self.context))

    modified = property(lambda self: _get_modified(self.context))

    creator = property(lambda self: getattr(self.context, 'creator', None))

    def _get_actions(self):
        #return [ViewActionInfo(self.context)]
        return []
    actions = property(_get_actions)

    def _get_factories(self):
        #return [FolderFactoryInfo(self.context)]
        return []
    factories = property(_get_factories)

    # We don't currently support filtering or sorting
    filter_schema = None
    sort_schema = None

    def parent_url(self, request):
        """ See IContainerInfo.
        """
        parent = self.context.__parent__
        if parent is not None:
           return resource_url(parent, request)

    def icon_url(self, request):
        """ See IContainerInfo.
        """
        return static_url('bottlecap:static/folder_icon.png', request)

    def listItems(self,
                  registry,
                  filter_spec=None,
                  sort_spec=None,
                  batch_start=None,
                  batch_size=None,
                 ):
        """ See IContainerInfo.
        """
        if filter_spec is not None:
            raise ValueError("'filter_spec' unsupported")
        if sort_spec is not None:
            raise ValueError("'sort_spec' unsupported")
        if batch_size is not None:
            if batch_start is None:
                raise ValueError("'batch_size' requires also 'batch_start")
        else:
            if batch_start is not None:
                batch_size = 20
        values = self.context.values()
        if batch_start is not None:
            values = values[batch_start:batch_start+batch_size]
        return filter(None, [registry.queryAdapter(x, IItemInfo)
                                for x in values])

    def __call__(self,
                 request,
                 filter_spec=None,
                 sort_spec=None,
                 batch_start=None,
                 batch_size=None,
                 include_actions=True,
                 include_factories=True,
                ):
        """ See IContainerInfo.
        """
        result = {'title': self.title,
                  'modified': self.modified,
                  'creator': self.creator,
                  'parent_url': self.parent_url(request),
                  'icon_url': self.icon_url(request),
                 }
        registry = request.registry
        items = result['items'] = [x(request) for x in
                                    self.listItems(registry,
                                                   filter_spec, sort_spec,
                                                   batch_start, batch_size)]
        if include_actions:
            result['actions'] = [x(request) for x in self.actions]

        if include_factories:
            result['factories'] = [x(request) for x in self.actions]

        return result


class FolderItemInfo(object):
    implements(IItemInfo)

    def __init__(self, context):
        self.context = context

    key = property(lambda self: self.context.__name__)

    title = property(lambda self: _get_title(self.context))

    modified = property(lambda self: _get_modified(self.context))

    creator = property(lambda self: getattr(self.context, 'creator', None))

    def _get_actions(self):
        #return [ViewActionInfo(self.context)]
        return []
    actions = property(_get_actions)

    def item_url(self, request):
        """ See IItemInfo.
        """
        return resource_url(self.context, request)

    def icon_url(self, request):
        """ See IItemInfo.
        """
        return static_url('bottlecap:static/folder_icon.png', request)

    def __call__(self,
                 request,
                 include_actions=True,
                ):
        """ See IItemInfo.
        """
        result = {'key': self.key,
                  'title': self.title,
                  'modified': self.modified,
                  'creator': self.creator,
                  'item_url': self.item_url(request),
                  'icon_url': self.icon_url(request),
                 }

        if include_actions:
            result['actions'] = [x(request) for x in self.actions]

        return result


class RetailViewActionInfo(object):
    implements(IActionInfo)

    def __init__(self, context):
        self.context = context

    action_type = 'external'
    token = 'view'
    title = 'View'
    description = 'Retail (non-bottlecap) view'

    def icon_url(self, request):
        return static_url('bottlecap_core:static/view_icon.png', request)

    def action_urls(self, request):
        return {'url': resource_url(self.context, request)}

    def __call__(self, request):
        return {'action_type': self.action_type,
                'token': self.token,
                'title': self.title,
                'description': self.description,
                'icon_url': self.icon_url(request),
                'action_urls': self.action_urls(request),
               }


def _get_title(context):
     result = getattr(context, 'title', context)
     if result is context:
         result = context.__name__ or 'Root'
     return result


def _get_modified(context):
    result = getattr(context, 'modified', context)
    if result is context:
        result = _now()
    return result

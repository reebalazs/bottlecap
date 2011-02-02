# yourapp/bottlecap.py
import datetime

from bottlecap.interfaces import IActionInfo
from bottlecap.interfaces import IContainerInfo
from bottlecap.interfaces import IFactoryInfo
from bottlecap.interfaces import IItemInfo
from pyramid.url import resource_url
from zope.interface import implements


FOLDER_ICON = '/static/folder_icon.png'
VIEW_ICON = '/static/view_icon.png'
EDIT_ICON = '/static/edit_icon.png'


class FolderContainerInfo(object):
    implements(IContainerInfo)

    def __init__(self, context):
        self.context = context

    title = property(lambda self: _get_title(self.context))

    modified = property(lambda self: _get_modified(self.context))

    creator = property(lambda self: getattr(self.context, 'creator', None))

    def _get_actions(self):
        return [ViewActionInfo(self.context)]
    actions = property(_get_actions)

    def _get_factories(self):
        return [FolderFactoryInfo(self.context)]
    factories = property(_get_factories)

    # We don't currently support filtering or sorting
    filter_schema = None
    sort_schema = None

    def parent_url(self, request):
        parent = self.context.__parent__
        if parent is not None:
           return resource_url(parent, '@@bottlecap')

    def icon_url(self, request):
        return FOLDER_ICON

    def listItems(self,
                  filter_spec=None,
                  sort_spec=None,
                  batch_start=None,
                  batch_size=None,
                 ):
        assert(filter_spec is None) # unsupported
        assert(sort_spec is None)   # unsupported
        if batch_size is not None:
            assert(batch_start is not None)
        else:
            if batch_start is not None:
                batch_size = 20
        values = self.context.values()
        if batch_start is not None:
            values = values[batch_start:batch_start+batch_size]
        return [FolderItemInfo(x) for x in values]

    def __call__(self,
                 request,
                 filter_spec=None,
                 sort_spec=None,
                 batch_start=None,
                 batch_size=None,
                 include_actions=True,
                 include_factories=True,
                ):
        result = {'title': self.title,
                  'modified': self.modified,
                  'creator': self.creator,
                  'parent_url': self.parent_url(request),
                  'icon_url': self.icon_url(request),
                 }
        items = result['items'] = [x(request) for x in
                                    self.listItems(filter_spec, sort_spec,
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
        return [ViewActionInfo(self.context)]
    actions = property(_get_actions)

    def item_url(self, request):
        return resource_url(self.context, request, '@@bottlecap')

    def icon_url(self, request):
        return FOLDER_ICON

    def __call__(self, request, include_actions=True):
        result = {'key': self.key,
                  'title': self.title,
                  'modified': self.modified,
                  'creator': self.creator,
                  'item_url': self.item_url(request),
                  'icon_url': self.icon_url(request),
                 }

        if include_actions:
            result['actions'] = [x() for x in self.actions]

        return result


class ViewActionInfo(object):
    """ Action for the 'retail view' of a folder (new window).
    """
    implements(IActionInfo)

    def __init__(self, context):
        self.context = context

    action_type = 'external'
    token = 'view'
    title = 'View'
    description = 'Main (non-bottlecap) view'

    def icon_url(self, request):
        return VIEW_ICON

    def action_urls(self, request):
        url = resource_url(self.context, request)
        return {'url': url}

    def __call__(self, request):
        return {'action_type': self.action_type,
                'token': self.token,
                'title': self.title,
                'description': self.description,
                'icon_url': self.icon_url(request),
                'action_urls': self.action_urls(request),
               }


class FolderEditActionInfo(object):
    """ Action for the folder edit viwe (bottlecap overlay).
    """
    implements(IActionInfo)

    def __init__(self, context):
        self.context = context

    action_type = 'form'
    token = 'edit'
    title = 'Edit'
    description = 'Edit the folder'

    def icon_url(self, request):
        return EDIT_ICON

    def action_urls(self, request):
        url = resource_url(self.context, request, '@@edit')
        return {'GET': url, 'POST': url}

    def __call__(self, request):
        return {'action_type': self.action_type,
                'token': self.token,
                'title': self.title,
                'description': self.description,
                'icon_url': self.icon_url(request),
                'action_urls': self.action_urls(request),
               }


class FolderFactoryInfo(object):
    implements(IFactoryInfo)

    def __init__(self, context, request):
        self.context = context

    token = 'Folder'
    title = 'Folder'
    description = 'Folders are contaners for other content'

    def icon_url(self, request):
        return FOLDER_ICON

    def factory_urls(self, request):
        url = resource_url(self.context, request, '@@add_folder')
        return {'GET': url, 'POST': url}

    def __call__(self, request):
        return {'token': self.token,
                'title': self.title,
                'description': self.description,
                'icon_url': self.icon_url(request),
                'factory_urls': self.factory_urls(request),
               }


def _get_title(context):
     result = getattr(context, 'title', context)
     if result is context:
         result = context.__name__ or 'Root'
     return result


def _get_modified(context):
    result = getattr(context, 'modified', context)
    if result is context:
        result = datetime.datetime.now()
    return result


def registerBottlecapAdapters(config):
    from yourapp.resources import Folder
    reg = config.registry
    reg.registerAdapter(FolderContainerInfo, Folder)
    #-------------------------------------------------------------------
    # We don't register these because our implementation short-circuits
    # any adapter lookups once we have the IContainerInfo adapter.
    #-------------------------------------------------------------------
    #reg.registerAdapter(FolderItemInfo, Folder)
    #reg.registerAdapter(ViewActionInfo, Folder, name='view')
    #reg.registerAdapter(FolderEditActionInfo, Folder, name='edit')
    #reg.registerAdapter(FolderFactoryInfo, Folder, name='folder')


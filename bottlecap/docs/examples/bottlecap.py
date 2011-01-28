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

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def _get_parent_url(self):
        parent = self.context.__parent__
        if parent is not None:
           return resource_url(parent, self.request, '@@bottlecap')
    parent_url = property(_get_parent_url,)

    title = property(lambda self: _get_title(self.context))

    icon_url = FOLDER_ICON

    modified = property(lambda self: _get_modified(self.context))

    creator = property(lambda self: getattr(self.context, 'creator', None))

    def _get_actions(self):
        return [ViewActionInfo(self.context, self.request)]
    actions = property(_get_actions)

    def _get_factories(self):
        return (FolderFactoryInfo(self.context, self.request),)
    factories = property(_get_factories,)

    # We don't currently support filtering or sorting
    filter_schema = None
    sort_schema = None

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
        return [FolderItemInfo(x, self.request) for x in values]

    def __call__(self,
                 filter_spec=None,
                 sort_spec=None,
                 batch_start=None,
                 batch_size=None,
                 include_actions=True,
                 include_factories=True,
                ):
        result = {'parent_url': self.parent_url,
                  'title': self.title,
                  'icon_url': self.icon_url,
                  'modified': self.modified,
                  'creator': self.creator,
                 }
        items = result['itmms'] = [x() for x in
                                    self.listItems(filter_spec, sort_spec,
                                                    batch_start, batch_size)]
        if include_actions:
            result['actions'] = [x() for x in self.actions]

        if include_factories:
            result['factories'] = [x() for x in self.actions]

        return result


class FolderItemInfo(object):
    implements(IItemInfo)

    def __init__(self, context, request):
        self.context = context
        self.request = request

    key = property(lambda self: self.context.__name__)

    item_url = property(lambda self: resource_url(self.context,
                                                  self.request,
                                                  '@@bottlecap'))

    title = property(lambda self: _get_title(self.context))

    icon_url = FOLDER_ICON

    modified = property(lambda self: _get_modified(self.context))

    creator = property(lambda self: getattr(self.context, 'creator', None))

    def _get_actions(self):
        return [ViewActionInfo(self.context, self.request)]
    actions = property(_get_actions)

    def __call__(self, include_actions=True):
        result = {'key': self.key,
                  'item_url': self.item_url,
                  'title': self.title,
                  'icon_url': self.icon_url,
                  'modified': self.modified,
                  'creator': self.creator,
                 }

        if include_actions:
            result['actions'] = [x() for x in self.actions]

        return result


class ViewActionInfo(object):
    """ Action for the 'retail view' of a folder.
    """
    implements(IActionInfo)

    action_type = 'external'
    token = 'view'
    title = 'View'
    description = 'Main (non-bottlecap) view'
    icon_url = VIEW_ICON

    def _get_action_urls(self):
        url = resource_url(self.context, self.request)
        return {'url': url}
    action_urls = property(_get_action_urls)

    def __call__(self):
        return {'action_type': self.action_type,
                'token': self.token,
                'title': self.title,
                'description': self.description,
                'icon_url': self.icon_url,
                'action_urls': self.action_urls,
               }


class FolderEditActionInfo(object):
    """ Action for the folder edit viwe (bottlecap overly).
    """
    implements(IActionInfo)

    action_type = 'form'
    token = 'edit'
    title = 'Edit'
    description = 'Edit the folder'
    icon_url = EDIT_ICON

    def _get_action_urls(self):
        url = resource_url(self.context, self.request, '@@edit')
        return {'GET': url, 'POST': url}
    action_urls = property(_get_action_urls)

    def __call__(self):
        return {'action_type': self.action_type,
                'token': self.token,
                'title': self.title,
                'description': self.description,
                'icon_url': self.icon_url,
                'action_urls': self.action_urls,
               }


class FolderFactoryInfo(object):
    implements(IFactoryInfo)

    def __init__(self, context, request):
        self.context = context
        self.request = request

    token = 'Folder'
    title = 'Folder'
    description = 'Folders are contaners for other content'
    icon_url = FOLDER_ICON

    def _get_factory_urls(self):
        url = resource_url(self.context, self.request, '@@add_folder')
        return {'GET': url, 'POST': url}
    factory_urls = property(_get_factory_urls)

    def __call__(self):
        return {'token': self.token,
                'title': self.title,
                'description': self.description,
                'icon_url': self.icon_url,
                'factory_urls': self.factory_urls,
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


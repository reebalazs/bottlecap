from datetime import datetime

from pyramid.renderers import get_renderer
from pyramid.response import Response
from pyramid.url import resource_url
from pyramid.view import view_config
from repoze.folder import Folder

from bottlecap.interfaces import IBottlecap

_NOW = None
def _now(): # hook for unit testing
    if _NOW is not None:
        return _NOW
    return datetime.now() #pragma NO COVERAGE

ADD_FILE_INVALID = """
<fieldset>
 <input name="title"/>
 <label for="title">Title</label>
</fieldset>
<fieldset>
 <input name="author"/>
 <label for="author">Author</label>
</fieldset>
<input type="submit" value="add"/>
"""

class BottlecapViews(object):

    def __init__(self, context, request):
        self.context = context
        self.request = request
        self.main = get_renderer('templates/main.pt').implementation()

    @view_config(context=Folder, renderer="templates/index_html.pt")
    def index_view(self):
        return {'name': 99, 'main': self.main}

    @view_config(context=IBottlecap, name="about",
                 renderer="templates/about_view.pt")
    def about_view(self):
        page_title = 'About Bottlecap'
        return {'page_title': page_title, 'main': self.main}

    @view_config(name="add_folder", context=Folder)
    def add_folder(self):
        title = self.request.POST.get('title')
        author = self.request.POST.get('author')
        if (not title) or (not author):
            # Invalid form
            response_html = ADD_FILE_INVALID
        else:
            # Valid form, add some data
            folder = Folder()
            folder.title = title
            folder.author = author
            folder.type = 'folder'
            folder.modified = _now()
            self.context[_title_to_name(title, self.context)] = folder
            response_html = 'ok'

        return Response(response_html)

    @view_config(name="add_file", context=Folder)
    def add_file(self):
        #XXX this needs to change to use a real File type, with an uploaded
        #    body.
        title = self.request.POST.get('title')
        author = self.request.POST.get('author')
        if (not title) or (not author):
            # Invalid form
            response_html = ADD_FILE_INVALID
        else:
            # Valid form, add some data
            folder = Folder()
            folder.title = title
            folder.author = author
            folder.type = 'folder'
            folder.modified = _now()
            self.context[_title_to_name(title, self.context)] = folder
            response_html = 'ok'

        return Response(response_html)

def _title_to_name(title, container):
    return title.lower().replace(' ', '-') # TODO:  check for dupes

class BottlecapJSON_API(object):

    def __init__(self, context, request):
        self.context = context
        self.request = request

    @view_config(name='list_items', context=Folder, renderer='json')
    def list_items(self):
        return [{'id': key,
                 'title': getattr(value, 'title', key),
                 'type': 'folder',
                 'modified': value.modified.date().isoformat(),
                 'author':  getattr(value, 'author', 'unknown'),
                 'href': resource_url(value, self.request),
                } for key, value in self.context.items()]

    @view_config(name='change_title', context=Folder, renderer='json')
    def change_title(self):
        target_id = str(self.request.POST['resource_id'])
        new_title = self.request.POST['value']
        self.context[target_id].title = new_title
        return True

    @view_config(name='delete_items', context=Folder, renderer="json")
    def delete_items(self):
        target_ids = self.request.POST.getall("target_ids[]")
        for t in target_ids:
            del self.context[t]

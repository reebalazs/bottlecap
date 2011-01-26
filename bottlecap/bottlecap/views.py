from datetime import datetime

from pyramid.renderers import get_renderer
from pyramid.response import Response
from pyramid.url import model_url
from pyramid.view import view_config
from repoze.folder import Folder

from bottlecap.models import Bottlecap

form1_invalid = """
<fieldset>
            <input name="title"/>
            <label for="title">Title ******</label>
        </fieldset>
        <fieldset>
            <input name="author"/>
            <label for="author">Author</label>
        </fieldset>
        <input type="submit" value="add"/>
"""

class BottlecapViews(object):

    def __init__(self, request):
        self.request = request
        self.context = request.context
        self.main = get_renderer('templates/main.pt').implementation()
        #self.content = self.context.sitecontent


    @view_config(context=Folder, renderer="templates/index_html.pt")
    def index_view(self):
        return {'name': 99, 'main': self.main}

    @view_config(context=Bottlecap, name="about",
                 renderer="templates/about_view.pt")
    def about_view(self):
        page_title = 'About Bottlecap'
        return {'page_title': page_title, 'main': self.main}

    @view_config(name="add_file", context=Folder)
    def add_file(self):
        title = self.request.POST.get('title')
        author = self.request.POST.get('author')
        if (not title) or (not author):
            # Invalid form
            response_html = form1_invalid
        else:
            # Valid form, add some data
            folder = Folder()
            folder.title = title
            folder.type = 'folder',
            folder.modified = datetime.now()
            folder.author = 'paule'
            self.context[_title_to_name(title, self.context)] = folder
            response_html = 'ok'

        return Response(response_html)

def _title_to_name(title, container):
    return title.lower().replace(' ', '-') # TODO:  check for dupes

class BottlecapJSON_API(object):

    def __init__(self, request):
        self.request = request
        self.context = request.context

    @view_config(name='list_items', context=Folder, renderer='json')
    def list_items(self):
        return [{'id': key,
                 'title': getattr(value, 'title', key),
                 'type': 'folder',
                 'modified': value.modified.date().isoformat(),
                 'author':  'repaul',
                 'href': model_url(value, self.request),
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

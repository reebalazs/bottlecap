from datetime import datetime

from pyramid.renderers import get_renderer
from pyramid.response import Response
from repoze.folder import Folder


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

    def default_view(self):
        return {}

    def bottlecap_view(self):
        return {'name': 99, 'main': self.main}

    def about_view(self):
        page_title = 'About Bottlecap'
        return {'page_title': page_title, 'main': self.main}

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

from pyramid.renderers import get_renderer
from pyramid.response import Response
from pyramid.view import view_config

from resources import Bottlecap

class BottlecapViews(object):

    def __init__(self, request):
        self.request = request
        self.context = request.context
        self.main = get_renderer('templates/main.pt').implementation()
        self.content = self.context.sitecontent


    @view_config(context=Bottlecap, renderer="templates/index_html.pt")
    def index_view(self):
        return {'name': 99, 'main': self.main}

    @view_config(context=Bottlecap, name="about", renderer="templates/about_view.pt")
    def about_view(self):
        page_title = 'About Bottlecap'
        return {'page_title': page_title, 'main': self.main}

    @view_config(name='list_items', context=Bottlecap, renderer='json')
    def list_items(self):
        resource_id = self.request.params['resource_id']
        root = self.content[resource_id]
        return root['items'].values()

    @view_config(name='change_title', context=Bottlecap, renderer='json')
    def change_title(self):
        resource_id = str(self.request.params['resource_id'])
        new_title = self.request.params['value']
        self.content['root']['items'][resource_id]['title'] = new_title
        return True

    @view_config(name='sitemodel', context=Bottlecap, renderer="json")
    def sitemodel(self):

        return self.context.sitemodel

from pyramid.response import Response
from pyramid.view import view_config

from models import Bottlecap

import yaml

@view_config(context=Bottlecap, renderer="templates/index_html.pt")
def index_view(request):
    return {'name': 99}

@view_config(name='data1.json', context=Bottlecap, renderer='json')
def data1(request):
    return     [
                {"id": "id_001", "type": "folder", "modified": "01/02/2011", "author": "repaul",
                 "href": "http://www.google.com/", "title": "Some Title 1"},
                {"id": "id_2", "type": "folder", "modified": "11/02/2011", "author": "repaul",
                 "href": "http://www.google.com/", "title": "Some Title 2"}
    ]

@view_config(name='sitemodel', context=Bottlecap, renderer="json")
def sitemodel(request):
    fn = 'sitemodel.yaml'
    model_data = yaml.load(open(fn))

    return model_data


if __name__ == '__main__':
    print sitemodel(None)
from os.path import join, split

from pyramid.config import Configurator
from pyramid.response import Response
from paste.httpserver import serve
from pyramid.view import view_config

def get_base():
    return split(__file__)[0]

@view_config(renderer="json")
def sitemodel(request):
    return [1,2,3]

def hello_world(request):
    return Response('Hello world!')

def goodbye_world(request):
    return Response('Goodbye world!')

if __name__ == '__main__':
    config = Configurator()
    config.add_view(hello_world)
    config.add_view(goodbye_world, name='goodbye')
    config.add_route('sitemodel', '/static/bc.grid/sitemodel.json', view=sitemodel, view_renderer="json")
    static_path = split(get_base())[0]
    config.add_static_view(name='static', path=static_path)
    app = config.make_wsgi_app()
    serve(app, host='0.0.0.0')
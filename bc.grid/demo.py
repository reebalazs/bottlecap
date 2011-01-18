from os.path import abspath, join, split

from pyramid.config import Configurator
from pyramid.response import Response
from paste.httpserver import serve
from pyramid.view import view_config

from models import Bottlecap
from views import sitemodel, hello

def get_base():
    return split(abspath(__file__))[0]

if __name__ == '__main__':
    config = Configurator()

    # The bottlecap entry point, some URL which can be introspected.
    # We want to preserve Ajax dev using filesystem, so intercept
    # a longer URL path.
    config.add_route('sitemodel', '/static/bc.grid/sitemodel.json',
                     view=sitemodel, view_renderer="json")

    # Static resources
    static_path = split(get_base())[0]
    config.add_static_view(name='static', path=static_path)

    # Now our Bottlecap views
    #config.scan()
    app = config.make_wsgi_app()
    serve(app, host='0.0.0.0')
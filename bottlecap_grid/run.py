from pyramid.config import Configurator
from pyramid.response import Response
from paste.httpserver import serve
from pyramid.view import view_config

from resources import Bottlecap

if __name__ == '__main__':
    config = Configurator(root_factory=Bottlecap)

    # Static resources
    config.add_static_view(name='/bcgstatic/images', path='bcgstatic/images')
    config.add_static_view(name='bcgstatic', path='bcgstatic')

    # Now our Bottlecap views
    config.scan(package="views")

    # Start the app
    app = config.make_wsgi_app()
    serve(app, host='0.0.0.0')
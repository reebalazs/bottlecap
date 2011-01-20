from pyramid.config import Configurator
from repoze.zodbconn.finder import PersistentApplicationFinder
from bottlecap.models import appmaker

def main(global_config, **settings): #pragma NO COVER
    """ This function returns a Pyramid WSGI application.
    """
    zodb_uri = settings.get('zodb_uri')
    if zodb_uri is None:
        raise ValueError("No 'zodb_uri' in application configuration.")

    finder = PersistentApplicationFinder(zodb_uri, appmaker)
    def get_root(request):
        return finder(request.environ)
    config = Configurator(root_factory=get_root, settings=settings)
    config.add_static_view('static', 'bottlecap:static')
    config.scan('bottlecap')
    return config.make_wsgi_app()

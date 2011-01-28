# yourapp/__init__.py
from pyramid.config import Configurator
from yourapp.models import appmaker

def main(global_config):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(root_factory=appmaker)
    config.scan('yourapp')
    return config.make_wsgi_app()

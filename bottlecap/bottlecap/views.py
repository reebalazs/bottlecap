from pyramid.view import view_config
from bottlecap.models import Bottlecap

@view_config(context=Bottlecap, renderer='bottlecap:templates/mytemplate.pt')
def my_view(request):
    return {'project':'bottlecap'}


import yaml
sm = yaml.load(open('sitemodel.yaml'))
sc = yaml.load(open('sitecontent.yaml'))

class Bottlecap(object):

    def __init__(self, request):
        self.sitemodel = sm
        self.sitecontent = sc
        
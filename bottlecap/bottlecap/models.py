from repoze.folder import Folder
from zope.interface import implements

from bottlecap.interfaces import IBottlecap

class Bottlecap(Folder):
    implements(IBottlecap)
    __parent__ = __name__ = None

def appmaker(zodb_root):
    root = zodb_root.get('bottlecap')
    if root is None:
        root = Bottlecap()
        zodb_root['bottlecap'] = root
        import transaction
        transaction.commit()
    return root

from repoze.folder import Folder
from zope.interface import directlyProvides

from bottlecap.interfaces import IBottlecap


def appmaker(zodb_root):
    root = zodb_root.get('bottlecap')
    if root is None:
        root = Folder()
        directlyProvides(root, IBottlecap)
        zodb_root['bottlecap'] = root
        import transaction
        transaction.commit()
    return root

# yourapp/resources.py
class Folder(dict):
    __parent__ = __name__ = None

_ROOT = None
def appmaker(zodb_root):
    global _ROOT
    if _ROOT is None:
        _ROOT = Folder()
    return _ROOT

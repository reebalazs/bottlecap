import unittest


class Test_appmaker(unittest.TestCase):

    def _callFUT(self, zodb_root):
        from bottlecap.models import appmaker
        return appmaker(zodb_root)

    def test_w_existing_root(self):
        BOTTLECAP = object()
        zodb_root = {'bottlecap': BOTTLECAP}
 
        root = self._callFUT(zodb_root)

        self.failUnless(root is BOTTLECAP)
        self.assertEqual(list(zodb_root), ['bottlecap'])
        self.failUnless(zodb_root['bottlecap'] is root)

    def test_wo_existing_root(self):
        from repoze.folder import Folder
        from bottlecap.interfaces import IBottlecap
        zodb_root = {}
 
        root = self._callFUT(zodb_root)

        self.failUnless(isinstance(root, Folder))
        self.failUnless(IBottlecap.providedBy(root))
        self.assertEqual(list(zodb_root), ['bottlecap'])
        self.failUnless(zodb_root['bottlecap'] is root)

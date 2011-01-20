import unittest


class BottlecapTests(unittest.TestCase):

    def _getTargetClass(self):
        from bottlecap.models import Bottlecap
        return Bottlecap

    def _makeOne(self):
        return self._getTargetClass()()

    def test_class_conforms_to_IBottlecap(self):
        from zope.interface.verify import verifyClass
        from bottlecap.interfaces import IBottlecap
        verifyClass(IBottlecap, self._getTargetClass())

    def test_instance_conforms_to_IBottlecap(self):
        from zope.interface.verify import verifyObject
        from bottlecap.interfaces import IBottlecap
        verifyObject(IBottlecap, self._makeOne())


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

    def test_wo_existing_root(self):
        from bottlecap.models import Bottlecap
        zodb_root = {}
 
        root = self._callFUT(zodb_root)

        self.failUnless(isinstance(root, Bottlecap))
        self.assertEqual(list(zodb_root), ['bottlecap'])

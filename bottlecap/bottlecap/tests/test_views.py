import unittest

from pyramid import testing

class BottlecapViewsTests(unittest.TestCase):

    _old_NOW = None

    def setUp(self):
        self.config = testing.setUp()

    def tearDown(self):
        testing.tearDown()
        self._set_NOW(None)

    def _getTargetClass(self):
        from bottlecap.views import BottlecapViews
        return BottlecapViews

    def _makeOne(self, context=None, request=None):
        if context is None:
            context = self._makeContext()
        if request is None:
            request = self._makeRequest()
        return self._getTargetClass()(context, request)

    def _makeContext(self, **kw):
        from pyramid.testing import DummyModel
        return DummyModel(**kw)

    def _makeRequest(self, **kw):
        from pyramid.testing import DummyRequest
        return DummyRequest(**kw)

    def _set_NOW(self, when):
        from bottlecap import views
        self._old_NOW, views._NOW = views._NOW, when

    def test_default_view(self):
        view = self._makeOne()

        info = view.default_view()

        self.assertEqual(info, {})

    def test_bottlecap_view(self):
        from chameleon.zpt.template import PageTemplate
        view = self._makeOne()

        info = view.bottlecap_view()

        self.assertEqual(info['name'], 99)
        main = info['main']
        self.failUnless(isinstance(main, PageTemplate))

    def test_about_view(self):
        from chameleon.zpt.template import PageTemplate
        view = self._makeOne()

        info = view.about_view()

        self.assertEqual(info['page_title'], 'About Bottlecap')
        main = info['main']
        self.failUnless(isinstance(main, PageTemplate))

    def test_add_folder_no_title(self):
        from bottlecap.views import ADD_FILE_INVALID
        context = self._makeContext()
        request = self._makeRequest(POST={'author': 'J. Phredd Bloggs'})
        view = self._makeOne(context, request)

        response = view.add_folder()

        self.assertEqual(response.body, ADD_FILE_INVALID)

    def test_add_folder_no_author(self):
        from bottlecap.views import ADD_FILE_INVALID
        context = self._makeContext()
        request = self._makeRequest(POST={'title': 'My Life in Kenya'})
        view = self._makeOne(context, request)

        response = view.add_folder()

        self.assertEqual(response.body, ADD_FILE_INVALID)

    def test_add_folder_w_author_and_title(self):
        from repoze.folder import Folder
        WHEN = object()
        self._set_NOW(WHEN)
        context = self._makeContext()
        request = self._makeRequest(POST={'title': 'My Life in Kenya',
                                          'author': 'J. Phredd Bloggs'})
        view = self._makeOne(context, request)

        response = view.add_folder()

        self.assertEqual(response.body, 'ok')
        added = context['my-life-in-kenya']
        self.failUnless(isinstance(added, Folder))
        self.assertEqual(added.title, 'My Life in Kenya')
        self.assertEqual(added.author, 'J. Phredd Bloggs')
        self.assertEqual(added.type, 'folder')
        self.assertEqual(added.modified, WHEN)

    def test_add_file_no_title(self):
        from bottlecap.views import ADD_FILE_INVALID
        context = self._makeContext()
        request = self._makeRequest(POST={'author': 'J. Phredd Bloggs'})
        view = self._makeOne(context, request)

        response = view.add_file()

        self.assertEqual(response.body, ADD_FILE_INVALID)

    def test_add_file_no_author(self):
        from bottlecap.views import ADD_FILE_INVALID
        context = self._makeContext()
        request = self._makeRequest(POST={'title': 'My Life in Kenya'})
        view = self._makeOne(context, request)

        response = view.add_file()

        self.assertEqual(response.body, ADD_FILE_INVALID)

    def test_add_file_w_author_and_title(self):
        from repoze.folder import Folder
        WHEN = object()
        self._set_NOW(WHEN)
        context = self._makeContext()
        request = self._makeRequest(POST={'title': 'My Life in Kenya',
                                          'author': 'J. Phredd Bloggs'})
        view = self._makeOne(context, request)

        response = view.add_file()

        self.assertEqual(response.body, 'ok')
        added = context['my-life-in-kenya']
        self.failUnless(isinstance(added, Folder))
        self.assertEqual(added.title, 'My Life in Kenya')
        self.assertEqual(added.author, 'J. Phredd Bloggs')
        self.assertEqual(added.type, 'folder')
        self.assertEqual(added.modified, WHEN)

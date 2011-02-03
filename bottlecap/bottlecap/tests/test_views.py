import unittest

from pyramid import testing

class _Base(object):

    _old_NOW = None

    def setUp(self):
        self.config = testing.setUp()

    def tearDown(self):
        testing.tearDown()
        self._set_NOW(None)

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

    def _registerContainerInfo(self, items=()):
        from zope.interface import implements
        from bottlecap.interfaces import IContainerInfo
        class _Info(object):
            implements(IContainerInfo)
            def __init__(self, context):
                pass
            def __call__(self, request):
                return {'items': items}
        self.config.registry.registerAdapter(_Info, (None,), IContainerInfo)

class BottlecapViewsTests(_Base, unittest.TestCase):

    def _getTargetClass(self):
        from bottlecap.views import BottlecapViews
        return BottlecapViews

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


class BottlecapJSON_API_Tests(_Base, unittest.TestCase):

    def _getTargetClass(self):
        from bottlecap.views import BottlecapJSON_API
        return BottlecapJSON_API

    def test_list_items_empty(self):
        view = self._makeOne()
        self._registerContainerInfo()
        self.assertEqual(list(view.list_items()), [])

    def test_list_items_non_empty(self):
        from datetime import datetime
        KEYS = ['foo', 'bar', 'baz']
        TITLES = [x.upper() for x in KEYS]
        URLS = ['http://example.com/%s/' % x for x in KEYS]
        WHEN = datetime(2011, 2, 1, 23, 45)
        infos = []
        for key in KEYS:
            infos.append({'key': key,
                          'title': key.upper(),
                          'modified': WHEN,
                          'creator': 'phred',
                          'item_url': 'http://example.com/%s/' % key,
                         })
        self._registerContainerInfo(infos)
        view = self._makeOne()

        items = view.list_items()

        self.assertEqual(len(items), len(KEYS))
        for item in items:
            self.failUnless(item['title'] in TITLES)
            self.assertEqual(item['modified'], '2011-02-01')
            self.assertEqual(item['author'], 'phred')
            self.assertEqual(item['type'], 'folder')
            self.failUnless(item['href'] in URLS)

    def test_change_title_hit(self):
        context = self._makeContext()
        context['target'] = target = self._makeContext(title='BEFORE')
        request = self._makeRequest(POST={'resource_id': 'target',
                                          'value': 'AFTER'})
        view = self._makeOne(context=context, request=request)

        result = view.change_title()

        self.assertEqual(result, True)
        self.assertEqual(target.title, 'AFTER')

    def test_delete_items_non_empty(self):
        from datetime import datetime
        KEYS = ['foo', 'bar', 'baz']
        TITLES = [x.upper() for x in KEYS]
        URLS = ['http://example.com/%s/' % x for x in KEYS]
        WHEN = datetime(2011, 2, 1, 23, 45)
        context = self._makeContext()
        for key in KEYS:
            context[key] = self._makeContext(title=key.upper(),
                                             modified=WHEN,
                                             author='phred')
        class DummyPost:
            def getall(self, key):
                assert key == 'target_ids[]' # WTF?
                return ['bar', 'baz']
        request = self._makeRequest(POST=DummyPost())
        view = self._makeOne(context=context, request=request)

        items = view.delete_items()

        self.assertEqual(list(context.keys()), ['foo'])

import unittest

from pyramid import testing

class BottlecapJSON_API_Tests(unittest.TestCase):

    def setUp(self):
        self.config = testing.setUp()

    def tearDown(self):
        testing.tearDown()

    def _getTargetClass(self):
        from bottlecap_grid.views import BottlecapJSON_API
        return BottlecapJSON_API

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

    def _registerContainerInfo(self, items=(), when=None):
        from zope.interface import implements
        from bottlecap_grid.interfaces import IContainerInfo
        if when is None:
            import datetime
            when = datetime.datetime.now()
        class _Info(object):
            implements(IContainerInfo)
            def __init__(self, context):
                pass
            def __call__(self, request):
                return {'title': 'DUMMY CONTAINER',
                        'modified': when,
                        'creator': 'Dummy Author',
                        'parent_url': 'http://example.com/parent',
                        'icon_url': 'http://example.com/static/folder_icon.png',
                        'items': items,
                       }
        self.config.registry.registerAdapter(_Info, (None,), IContainerInfo)

    def test_container_info_empty(self):
        import datetime
        WHEN = datetime.datetime(2011, 2, 8, 15, 45)
        view = self._makeOne()
        self._registerContainerInfo(when=WHEN)
        info = view.container_info()
        self.assertEqual(info['title'], 'DUMMY CONTAINER')
        self.assertEqual(info['modified'], '2011-02-08')
        self.assertEqual(info['author'], 'Dummy Author')
        self.assertEqual(info['parent_url'], 'http://example.com/parent')
        self.assertEqual(info['icon_url'],
                              'http://example.com/static/folder_icon.png')
        self.assertEqual(list(info['items']), [])

    def test_container_info_non_empty(self):
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

        info = view.container_info()
        items = info['items']

        self.assertEqual(len(items), len(KEYS))
        for item in items:
            self.failUnless(item['title'] in TITLES)
            self.assertEqual(item['modified'], '2011-02-01')
            self.assertEqual(item['author'], 'phred')
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

import unittest


class _Base(object):

    def setUp(self):
        from pyramid.testing import setUp
        self.config = setUp()
        self._set_NOW(None)

    def tearDown(self):
        from pyramid.testing import tearDown
        self._set_NOW(None)
        tearDown()

    def _makeOne(self, context=None):
        if context is None:
            context = self._makeContext()
        return self._getTargetClass()(context)

    def _makeContext(self, **kw):
        from pyramid.testing import DummyModel
        return DummyModel(**kw)

    def _makeRequest(self, **kw):
        from pyramid.testing import DummyRequest
        return DummyRequest(**kw)

    def _set_NOW(self, value):
        from bottlecap import adapters
        adapters._NOW = value

    def _registerItemInfoAdapter(self):
        from zope.interface import implements
        from bottlecap.interfaces import IItemInfo
        class _ItemInfo(object):
            implements(IItemInfo)
            def __init__(self, context):
                self.context = context
            def __call__(self, request):
                return {'for': 'testing only'}
        self.config.registry.registerAdapter(_ItemInfo, (None,), IItemInfo)
        return _ItemInfo


class FolderContainerInfoTests(_Base, unittest.TestCase):

    def _getTargetClass(self):
        from bottlecap.adapters import FolderContainerInfo
        return FolderContainerInfo

    def test_class_conforms_to_IContainerInfo(self):
        from zope.interface.verify import verifyClass
        from bottlecap.interfaces import IContainerInfo
        verifyClass(IContainerInfo, self._getTargetClass())

    def test_instance_conforms_to_IContainerInfo(self):
        from zope.interface.verify import verifyObject
        from bottlecap.interfaces import IContainerInfo
        verifyObject(IContainerInfo, self._makeOne())

    def test_title_context_wo_title_or_name(self):
        adapter = self._makeOne()
        self.assertEqual(adapter.title, 'Root')

    def test_title_context_wo_title_w_name(self):
        context = self._makeContext(__name__='testing')
        adapter = self._makeOne(context)
        self.assertEqual(adapter.title, 'testing')

    def test_title_context_w_title_w_name(self):
        context = self._makeContext(__name__='testing', title='TITLE')
        adapter = self._makeOne(context)
        self.assertEqual(adapter.title, 'TITLE')

    def test_modified_context_wo_modified(self):
        import datetime
        WHEN = datetime.datetime(2011, 2, 2, 8, 1)
        self._set_NOW(WHEN)
        adapter = self._makeOne()
        self.assertEqual(adapter.modified, WHEN)

    def test_modified_context_w_modified(self):
        import datetime
        WHEN = datetime.datetime(2011, 2, 2, 8, 1)
        context = self._makeContext(modified=WHEN)
        adapter = self._makeOne(context)
        self.assertEqual(adapter.modified, WHEN)

    def test_creator_context_wo_creator(self):
        adapter = self._makeOne()
        self.assertEqual(adapter.creator, None)

    def test_creator_context_w_creator(self):
        context = self._makeContext(creator='phred')
        adapter = self._makeOne(context)
        self.assertEqual(adapter.creator, 'phred')

    def test_actions(self):
        adapter = self._makeOne()
        self.assertEqual(len(adapter.actions), 0) # XXX

    def test_factories(self):
        adapter = self._makeOne()
        self.assertEqual(len(adapter.factories), 0) # XXX

    def test_filter_schema(self):
        adapter = self._makeOne()
        self.assertEqual(adapter.filter_schema, None) # XXX

    def test_sort_schema(self):
        adapter = self._makeOne()
        self.assertEqual(adapter.sort_schema, None) # XXX

    def test_parent_url_wo_parent(self):
        adapter = self._makeOne()
        request = self._makeRequest()
        self.assertEqual(adapter.parent_url(request), None)

    def test_parent_url_w_parent(self):
        root = self._makeContext()
        parent = root['parent'] = self._makeContext()
        context = parent['context'] = self._makeContext()
        adapter = self._makeOne(context)
        request = self._makeRequest()
        self.assertEqual(adapter.parent_url(request),
                         'http://example.com/parent/')

    def test_icon_url(self):
        self.config.add_static_view('static', 'bottlecap:static')
        adapter = self._makeOne()
        request = self._makeRequest()
        self.assertEqual(adapter.icon_url(request),
                         'http://example.com/static/folder_icon.png')

    def test_listItems_filter_spec_unsupported(self):
        adapter = self._makeOne()
        self.assertRaises(ValueError, adapter.listItems,
                          self.config.registry, filter_spec=object())

    def test_listItems_sort_spec_unsupported(self):
        adapter = self._makeOne()
        self.assertRaises(ValueError, adapter.listItems,
                          self.config.registry, sort_spec=object())

    def test_listItems_batch_size_wo_batch_start(self):
        adapter = self._makeOne()
        self.assertRaises(ValueError, adapter.listItems,
                          self.config.registry, batch_size=10)

    def test_listItems_empty_context(self):
        adapter = self._makeOne()
        self.assertEqual(len(adapter.listItems(self.config.registry)), 0)

    def test_listItems_non_empty_context(self):
        _ItemInfo = self._registerItemInfoAdapter()
        registry = self.config.registry
        context = self._makeContext()
        for i in range(10):
            context['item_%d' % i] = self._makeContext()
        adapter = self._makeOne(context)
        items = adapter.listItems(registry)
        self.assertEqual(len(items), 10)
        for item in items:
            self.failUnless(isinstance(item, _ItemInfo))

    def test_listItems_batch_start_wo_batch_size(self):
        _ItemInfo = self._registerItemInfoAdapter()
        registry = self.config.registry
        context = self._makeContext()
        for i in range(30):
            context['item_%d' % i] = self._makeContext()
        adapter = self._makeOne(context)
        items = adapter.listItems(registry, batch_start=0)
        self.assertEqual(len(items), 20)

    def test___call___defaults_no_items(self):
        import datetime
        WHEN = datetime.datetime(2011, 2, 2, 8, 1)
        self._set_NOW(WHEN)
        self.config.add_static_view('static', 'bottlecap:static')
        adapter = self._makeOne()
        request = self._makeRequest()
        info = adapter(request)
        self.assertEqual(info['title'], 'Root')
        self.assertEqual(info['modified'], WHEN)
        self.assertEqual(info['parent_url'], None)
        self.assertEqual(info['icon_url'], 
                         'http://example.com/static/folder_icon.png')
        self.assertEqual(len(info['items']),  0)
        self.assertEqual(len(info['actions']),  0)      # XXX
        self.assertEqual(len(info['factories']),  0)    # XXX

    def test___call___w_items(self):
        self._registerItemInfoAdapter()
        self.config.add_static_view('static', 'bottlecap:static')
        context = self._makeContext()
        for i in range(10):
            context['item_%d' % i] = self._makeContext()
        adapter = self._makeOne(context)
        request = self._makeRequest(registry=self.config.registry)
        info = adapter(request)
        items = info['items']
        self.assertEqual(len(items), 10)
        for item in items:
            self.assertEqual(item['for'], 'testing only')

    def test___call___wo_include_actions(self):
        self.config.add_static_view('static', 'bottlecap:static')
        adapter = self._makeOne()
        request = self._makeRequest()
        info = adapter(request, include_actions=False)
        self.failIf('actions' in info)

    def test___call___wo_include_factories(self):
        self.config.add_static_view('static', 'bottlecap:static')
        adapter = self._makeOne()
        request = self._makeRequest()
        info = adapter(request, include_factories=False)
        self.failIf('factories' in info)


class FolderItemInfoTests(_Base, unittest.TestCase):

    def _getTargetClass(self):
        from bottlecap.adapters import FolderItemInfo
        return FolderItemInfo

    def test_class_conforms_to_IItemInfo(self):
        from zope.interface.verify import verifyClass
        from bottlecap.interfaces import IItemInfo
        verifyClass(IItemInfo, self._getTargetClass())

    def test_instance_conforms_to_IItemInfo(self):
        from zope.interface.verify import verifyObject
        from bottlecap.interfaces import IItemInfo
        verifyObject(IItemInfo, self._makeOne())

    def test_key_context_is_root(self):
        adapter = self._makeOne()
        self.assertEqual(adapter.key, None)

    def test_key_context_is_notroot(self):
        root = self._makeContext()
        context = root['context'] = self._makeContext()
        adapter = self._makeOne(context)
        self.assertEqual(adapter.key, 'context')

    def test_title_context_wo_title_or_name(self):
        adapter = self._makeOne()
        self.assertEqual(adapter.title, 'Root')

    def test_title_context_wo_title_w_name(self):
        context = self._makeContext(__name__='testing')
        adapter = self._makeOne(context)
        self.assertEqual(adapter.title, 'testing')

    def test_title_context_w_title_w_name(self):
        context = self._makeContext(__name__='testing', title='TITLE')
        adapter = self._makeOne(context)
        self.assertEqual(adapter.title, 'TITLE')

    def test_modified_context_wo_modified(self):
        import datetime
        WHEN = datetime.datetime(2011, 2, 2, 8, 1)
        self._set_NOW(WHEN)
        adapter = self._makeOne()
        self.assertEqual(adapter.modified, WHEN)

    def test_modified_context_w_modified(self):
        import datetime
        WHEN = datetime.datetime(2011, 2, 2, 8, 1)
        context = self._makeContext(modified=WHEN)
        adapter = self._makeOne(context)
        self.assertEqual(adapter.modified, WHEN)

    def test_creator_context_wo_creator(self):
        adapter = self._makeOne()
        self.assertEqual(adapter.creator, None)

    def test_creator_context_w_creator(self):
        context = self._makeContext(creator='phred')
        adapter = self._makeOne(context)
        self.assertEqual(adapter.creator, 'phred')

    def test_actions(self):
        adapter = self._makeOne()
        self.assertEqual(len(adapter.actions), 0) # XXX

    def test_item_url_context_is_root(self):
        adapter = self._makeOne()
        request = self._makeRequest()
        self.assertEqual(adapter.item_url(request), 'http://example.com/')

    def test_item_url_context_is_not_root(self):
        root = self._makeContext()
        parent = root['parent'] = self._makeContext()
        context = parent['context'] = self._makeContext()
        adapter = self._makeOne(context)
        request = self._makeRequest()
        self.assertEqual(adapter.item_url(request),
                         'http://example.com/parent/context/')

    def test_icon_url(self):
        self.config.add_static_view('static', 'bottlecap:static')
        adapter = self._makeOne()
        request = self._makeRequest()
        self.assertEqual(adapter.icon_url(request),
                         'http://example.com/static/folder_icon.png')

    def test___call___defaults(self):
        import datetime
        WHEN = datetime.datetime(2011, 2, 2, 8, 1)
        self._set_NOW(WHEN)
        self.config.add_static_view('static', 'bottlecap:static')
        adapter = self._makeOne()
        request = self._makeRequest()
        info = adapter(request)
        self.assertEqual(info['key'], None)
        self.assertEqual(info['title'], 'Root')
        self.assertEqual(info['modified'], WHEN)
        self.assertEqual(info['item_url'], 'http://example.com/')
        self.assertEqual(info['icon_url'], 
                         'http://example.com/static/folder_icon.png')
        self.assertEqual(len(info['actions']),  0)      # XXX

    def test___call___wo_include_actions(self):
        self.config.add_static_view('static', 'bottlecap:static')
        adapter = self._makeOne()
        request = self._makeRequest()
        info = adapter(request, include_actions=False)
        self.failIf('actions' in info)

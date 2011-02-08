
from bottlecap_grid.interfaces import IContainerInfo


class BottlecapJSON_API(object):

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def container_info(self):
        registry = self.request.registry
        adapter = registry.getAdapter(self.context, IContainerInfo)
        info = adapter(self.request)
        return _morph_container_info(info)

    def change_title(self):
        target_id = str(self.request.POST['resource_id'])
        new_title = self.request.POST['value']
        self.context[target_id].title = new_title
        return True

    def delete_items(self):
        target_ids = self.request.POST.getall("target_ids[]")
        for t in target_ids:
            del self.context[t]

def _morph_container_info(info):
    result = {'title': info['title'],
              'modified': info['modified'].date().isoformat(),
              'author': info['creator'],
              'parent_url': info['parent_url'],
              'icon_url': info['icon_url'],
              'actions': info['actions'],
              'factories': info['factories'],
             }
    result['items'] = [_morph_item_info(x) for x in info['items']]
    return result

def _morph_item_info(info):
    return {'id': info['key'],
            'title': info['title'],
            'modified': info['modified'].date().isoformat(),
            'author': info['creator'],
            'href': info['item_url'],
           }

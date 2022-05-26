from collections import OrderedDict
from django.db import connections

def check(request):
    dbs = []

    for con in connections:
        db_info = OrderedDict()
        db = connections[con]

        db_info['label'] = con
        db_info['name'] = db.settings_dict.get('NAME')
        db_info['engine'] = db.settings_dict.get('ENGINE')
        db_info['host'] = db.settings_dict.get('HOST')
        db_info['port'] = db.settings_dict.get('PORT')

        dbs.append(db_info)
    
    return dbs
    
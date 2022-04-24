from django.contrib import admin
from .models import CommonInfo


class CommonAdmin(admin.ModelAdmin):
    list_display = ('creator', 'modifiedBy', 'lastModified')
    ordering = ('creator', 'modifiedBy', 'lastModified')
    search_fields = ('creator__username', 'modifiedBy__username')


admin.site.register(CommonInfo, CommonAdmin)

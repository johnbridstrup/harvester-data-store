from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin

from .models import Fruit, Harvester


class FruitAdmin(admin.ModelAdmin):
    list_display = ("name",)
    ordering = ("name",)
    search_fields = ("name",)


class HarvesterAdmin(SimpleHistoryAdmin):
    list_display = ("harv_id", "fruit", "location", "name")
    ordering = ("harv_id", "fruit", "location", "name")
    search_fields = ("fruit", "location", "name")


admin.site.register(Fruit, FruitAdmin)
admin.site.register(Harvester, HarvesterAdmin)

from django.contrib import admin
from .models import HarvesterAsset, HarvesterAssetReport, HarvesterAssetType


class HarvesterAssetReportAdmin(admin.ModelAdmin):
    list_display = ('reportTime', 'location', 'harvester', 'creator', 'created')
    ordering = ('location', 'harvester', 'reportTime', 'creator', 'modifiedBy')
    search_fields = ('location__ranch', 'harvester__name', 'creator__username',)


class HarvesterAssetAdmin(admin.ModelAdmin):
    list_display = ('harvester', 'asset', 'index', 'serial_number', 'version', 'creator', 'created', 'modifiedBy', 'lastModified')
    ordering = ('-created',)


class HarvesterAssetTypeAdmin(admin.ModelAdmin):
    list_disaply = ('name', 'created', 'createdBy')


admin.site.register(HarvesterAssetReport, HarvesterAssetReportAdmin)
admin.site.register(HarvesterAsset, HarvesterAssetAdmin)
admin.site.register(HarvesterAssetType, HarvesterAssetTypeAdmin)

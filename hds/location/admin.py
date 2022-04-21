from django.contrib import admin

from .models import Distributor, Location

class DistributorAdmin(admin.ModelAdmin):
    list_display = ('name',)
    ordering = ('name',)
    search_fields = ('name',)

class LocationAdmin(admin.ModelAdmin):
    list_display = ('distributor', 'ranch', 'country', 'region')
    ordering = ('distributor', 'ranch', 'country', 'region')
    search_fields = ('distributor', 'ranch', 'country', 'region')


admin.site.register(Distributor, DistributorAdmin)
admin.site.register(Location, LocationAdmin)

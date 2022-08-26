from django.contrib import admin
from .models import Event


class EventAdmin(admin.ModelAdmin):
    list_display = ('created', 'UUID')
    ordering = ('created',)
    search_fields = ('created', 'UUID')


admin.site.register(Event, EventAdmin)

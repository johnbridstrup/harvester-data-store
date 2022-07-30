from django.contrib import admin

from .models import Notification


class NotificationAdmin(admin.ModelAdmin):
    list_display = ('trigger_on', 'criteria')
    ordering = ('trigger_on',)
    search_fields = ('trigger_on', 'criteria')


admin.site.register(Notification, NotificationAdmin)

from django.contrib import admin

from .models import AFTExceptionCode


class AFTExceptionCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'name')
    ordering = ('code',)
    search_fields = ('code', 'name')


admin.site.register(AFTExceptionCode, AFTExceptionCodeAdmin)
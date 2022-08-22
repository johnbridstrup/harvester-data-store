from django.contrib import admin
from .models import UserProfile


class UserProfileAdmin(admin.ModelAdmin):
    def get_username(self, obj):
        return obj.user.username
    
    get_username.short_description = 'user'
    get_username.admin_order_field = 'user__username'

    list_display = ('get_username', 'slack_id')
    ordering = ('user__username',)
    search_fields = ('get_username',)


admin.site.register(UserProfile, UserProfileAdmin)


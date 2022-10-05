from django.contrib import admin 

from .models import JobType, JobSchema, JobResults, Job


class JobSchemaInline(admin.TabularInline):
    model = JobSchema


class JobTypeAdmin(admin.ModelAdmin):
    list_display = ('created', 'name')
    ordering = ('created',)
    search_fields = ('created', 'name')
    inlines = [JobSchemaInline]
    

class JobSchemaAdmin(admin.ModelAdmin):
    list_display = ('created', 'get_jobtype', 'version', 'schema')
    ordering = ('created',)
    search_fields = ('created', 'get_jobtype', 'version')

    @admin.display(ordering='name', description='job type')
    def get_jobtype(self, obj):
        return obj.jobtype.name


class JobResultsAdmin(admin.ModelAdmin):
    list_display = ('created', 'report')
    ordering = ('created',)
    search_fields = ('created', 'status')


class JobAdmin(admin.ModelAdmin):
    list_display = ('created', 'get_jobtype', 'get_target', 'jobstatus')

    @admin.display(ordering='harv_id', description='Harv ID')
    def get_target(self, obj):
        return obj.target.harv_id

    @admin.display(ordering='name', description='job type')
    def get_jobtype(self, obj):
        return obj.schema.jobtype.name

admin.site.register(JobType, JobTypeAdmin)
admin.site.register(JobSchema, JobSchemaAdmin)
admin.site.register(JobResults, JobResultsAdmin)
admin.site.register(Job, JobAdmin)
from django.contrib import admin
from .models import CompleteDatas, LoginDatas, MessageDatas

# Register your models here.


class MessageAdmin(admin.ModelAdmin):
    list_display = ('PhotoPath', 'Email', 'Status',)
    search_fields = ('PhotoPath', 'Email',)
    list_filter = ('Status',)
    actions = ['resetToNotDistributed']

    def resetToNotDistributed(self, request, queryset):
        queryset.update(Status='00')
    resetToNotDistributed.short_description = "Reset selected photos as not distributed"


class CompleteDatasAdmin(admin.ModelAdmin):
    """docstring for CompleteDatasAdmin"""
    list_display = ('Email', 'Count', 'CurrentImg',)
    search_fields = ('Email',)


admin.site.register(CompleteDatas, CompleteDatasAdmin)
admin.site.register(MessageDatas, MessageAdmin)
admin.site.register(LoginDatas)

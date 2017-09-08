from django.contrib import admin
from .models import CompleteDatas, LoginDatas, MessageDatas
from .tools import getNextPhoto

# Register your models here.


class MessageAdmin(admin.ModelAdmin):
    list_display = ('PhotoPath', 'Email', 'Status',)
    search_fields = ('PhotoPath', 'Email',)
    list_filter = ('Status',)
    actions = ['resetToNotDistributed']

    def resetToNotDistributed(self, request, queryset):
        queryset.update(Status='00')
        for obj in queryset:
            cmpltData = CompleteDatas.objects.get(CurrentImg=obj.PhotoPath)
            if cmpltData:
                cmpltData.CurrentImg = '-1'
                cmpltData.save()
    resetToNotDistributed.short_description = "Reset selected photos as not distributed"


class CompleteDatasAdmin(admin.ModelAdmin):
    """docstring for CompleteDatasAdmin"""
    list_display = ('Email', 'Count', 'CurrentImg',)
    search_fields = ('Email', 'CurrentImg',)
    actions = ['retrieveDataFromUser',
               'distribNewDataToUser', ]

    def retrieveDataFromUser(self, request, queryset):
        for obj in queryset:
            md = MessageDatas.objects.get(PhotoPath=obj.CurrentImg)
            if md:
                md.Status = '00'
                md.save()
            obj.CurrentImg = '-1'
            obj.save()
        # queryset.update(CurrentImg='-1')
    retrieveDataFromUser.short_description = "Retrieve data from selected user"

    def distribNewDataToUser(self, request, queryset):
        # queryset.update(CurrentImg=getNextPhoto(' '))
        for obj in queryset:
            obj.CurrentImg = getNextPhoto('')
            obj.save()
    distribNewDataToUser.short_description = "Distribute new data to selected user"


admin.site.register(CompleteDatas, CompleteDatasAdmin)
admin.site.register(MessageDatas, MessageAdmin)
admin.site.register(LoginDatas)

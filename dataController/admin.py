from django.contrib import admin
from .models import CompleteDatas, LoginDatas, MessageDatas

# Register your models here.

class MessageAdmin(admin.ModelAdmin):
    list_display = ('PhotoPath', 'Email', 'Status',)
    search_fields = ('PhotoPath','Email',)
    list_filter = ('Status',)

admin.site.register(CompleteDatas)
admin.site.register(MessageDatas, MessageAdmin)
admin.site.register(LoginDatas)

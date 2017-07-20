from django.conf.urls import patterns, include, url
from dataController import views as dc_views

from django.contrib import admin
admin.autodiscover()


urlpatterns = patterns('',
                       # Examples:
                       # url(r'^$', 'TextMarkTool.views.home', name='home'),
                       # url(r'^blog/', include('blog.urls')),

                       url(r'^admin/', include(admin.site.urls)),
                       url(r'^$', dc_views.index, name='index'),
                       url(r'^selfCheck/$', dc_views.selfCheck,
                           name='selfCheck'),
                       url(r'^introduction/$', dc_views.introduction,
                           name='introduction'),
                       url(r'^login/$', dc_views.login, name='login'),
                       url(r'^login/(?P<state>\w{1})/$',
                           dc_views.login, name='login_with_args'),
                       url(r'^CheckLogin/$', dc_views.checkLogin,
                           name='checkLogin'),
                       url(r'^register/$', dc_views.register, name='register'),
                       url(r'^register/(?P<state>\w{1})/$',
                           dc_views.register, name='register_with_args'),
                       url(r'^CheckRegister/$', dc_views.checkRegister,
                           name='checkRegister'),
                       url(r'^Error/$', dc_views.error, name='error'),
                       url(r'^setMessage/$', dc_views.setMessage,
                           name='setMessage'),
                       url(r'^setCheckMessage/$', dc_views.setCheckMessage,
                           name='setCheckMessage'),
                       url(r'^getCheckedDetail/$', dc_views.getCheckedDetail,
                           name='getCheckedDetail'),
                       url(r'^getTodoList/$', dc_views.getTodoList,
                           name="getTodoList"),
                       url(r'^getAllChecked/$', dc_views.getAllChecked,
                           name='getAllChecked'),
                       # other test
                       url(r'^displayMeta/$', dc_views.display_meta,
                           name='display_meta'),
                       url(r'^search_form/$', dc_views.search_form,
                           name='search_form'),
                       url(r'^search/$', dc_views.search, name='search'),
                       )

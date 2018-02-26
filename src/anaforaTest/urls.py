from django.conf.urls import url
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
		url(r'^(?P<testFuncName>[^\/]+)$', views.index),
		url(r'^$', views.index)
	]  + static(settings.STATIC_URL, documeent_root=settings.STATIC_ROOT)

from django.conf.urls import url
from . import views

urlpatterns = [
		url(r'^(?P<testFuncName>[^\/]+)$', views.index),
		url(r'^$', views.index)
	]
	#]  + static(settings.STATIC_URL, document_root='/Users/wtchen/Research/anaforaFileDevelop/anaforaProjectFile/')

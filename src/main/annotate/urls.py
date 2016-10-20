from django.conf.urls import url
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
	url(r'^getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))/view(?:/(?P<crossDoc>_crossDoc))?/?$', views.getAllTask),
	#views.getAllTask),
	url(r'^getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/\.]+)\.Adjudication/?$', views.getAdjudicationTaskFromProjectCorpusName),
	url(r'^getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?(?:/(?P<crossDoc>_crossDoc))?/?$', views.getTaskFromProjectCorpusName),
	url(r'^getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<parentTaskName>[^\/]+)/_cross/?$', views.getSubTaskFromProjectCorpusTaskName),
	url(r'^getDir/(?P<projectName>[^\/]+)/?$', views.getCorpusFromProjectName),
	url(r'^getDir/?$', views.getProject),
	url(r'^xml/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)(?:/_sub_(?P<subTaskName>[^\/]+))?/?$', views.getAnaforaXMLFile),
	url(r'^xml/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)/(?P<annotatorName>[^\/]+)(?:/_sub_(?P<subTaskName>[^\/]+))?/?$', views.getAnaforaXMLFile),
	url(r'^completeAnnotator/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/]+)/?$', views.getCompleteAnnotator),
	url(r'^inprogressAnnotator/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/]+)/?$', views.getInprogressAnnotator),
	url(r'^annotator/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))/?$', views.getAnnotator),
	url(r'^schema/(?P<schema>[^\/]+)/(?P<schemaIdx>[0-9]+)/?$', views.getSchema),
	url(r'^schema/(?P<schema>[^\/]+)/?$', views.getSchema),
	url(r'^saveFile/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/]+)(?:\.(?P<schemaMode>[^\/\.]+))(?:\.(?P<isAdj>Adjudication))?/?$', views.writeFile),
	url(r'^setCompleted/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?(?:\.(?P<isAdj>Adjudication))?/?$', views.setCompleted),
#	url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)\.(?P<schemaMode>Adjudication)/preannotation(?:/(?P<crossDoc>_crossDoc))?/$', annotate.views.index),
#	url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)/preannotation(?:/(?P<crossDoc>_crossDoc))?/$', annotate.views.index),
#	url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)\.(?P<schemaMode>Adjudication)(?:/(?P<crossDoc>_crossDoc))?/$', annotate.views.index),
#	url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)\.(?P<schemaMode>Adjudication)/(?P<annotatorName>[^\/]+)(?:/(?P<crossDoc>_crossDoc))?/$', annotate.views.index),
#	url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)\.(?P<schemaMode>Adjudication)/(?P<annotatorName>[^\/]+)(?:/(?P<crossDoc>_crossDoc))?/$', annotate.views.index),
#	url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)/(?P<annotatorName>[^\/]+)(?:/(?P<crossDoc>_crossDoc))/?$', annotate.views.index),
#	url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)(?:/(?P<crossDoc>_crossDoc))?/$', annotate.views.index),
#	url(r'(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/\.]+)(?:\.?P<schemaMode>[^\/\.]+)(?:\.?P<view>view)(?:/(?P<optionVar>[^\/]+))/?$', views.annotateNormal),
	url(r'^(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?(?:\/(?P<view>view))?(?:\/(?P<crossDoc>_crossDoc))?(?:\/(?P<adjudication>Adjudication))?(?:\/(?P<annotator>[^\/]+))?/?$', views.annotateNormal),
	url(r'^(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/?$', views.selectCorpus),
	url(r'^(?P<projectName>[^\/]+)/?$', views.selectProject),
	url(r'^/?$', views.index),
] + static(settings.STATIC_URL, documeent_root=settings.STATIC_ROOT)

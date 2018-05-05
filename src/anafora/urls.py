from django.conf.urls import url
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
	url(r'^getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?(?:\.(?P<isAdj>Adjudication))?/view(?:/(?P<crossDoc>_crossDoc))?/?$', views.getAllTask),
	#views.getAllTask),
	#url(r'^getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?\.Adjudication(?:/(?P<crossDoc>_crossDoc))?/?$', views.getAdjudicationTaskFromProjectCorpusName),
	url(r'^getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?\.Adjudication(?:/(?P<crossDoc>_crossDoc))?/?$', views.getAdjudicationTaskFromProjectCorpusName),
	#url(r'^getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?\.Adjudication/?$', views.getAdjudicationTaskFromProjectCorpusName),
	url(r'^getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<parentTaskName>[^\/]+)/_cross/?$', views.getSubTaskFromProjectCorpusTaskName),
	url(r'^getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?(?:/(?P<crossDoc>_crossDoc))?/?$', views.getTaskFromProjectCorpusName),
	url(r'^getDir/(?P<projectName>[^\/]+)/?$', views.getCorpusFromProjectName),
	url(r'^getDir/?$', views.getProject),
	url(r'^xml/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^.]*))?\.(?P<isAdj>Adjudication)(?:/_sub_(?P<subTaskName>[^\/]+))?/?$', views.getAnaforaXMLFile),
	url(r'^xml/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^.]*))?\.(?P<isAdj>Adjudication)/(?P<annotatorName>[^\/]+)(?:/_sub_(?P<subTaskName>[^\/]+))?/?$', views.getAnaforaXMLFile),
	url(r'^xml/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?(?:/_sub_(?P<subTaskName>[^\/]+))?/?$', views.getAnaforaXMLFile),
	url(r'^xml/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?/(?P<annotatorName>[^\/]+)(?:/_sub_(?P<subTaskName>[^\/]+))?/?$', views.getAnaforaXMLFile),
	url(r'^completeAnnotator/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?(?:\.(?P<isAdj>Adjudication))?/?$', views.getCompleteAnnotator),
	url(r'^inprogressAnnotator/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?(?:\.(?P<isAdj>Adjudication))?/?$', views.getInprogressAnnotator),
	url(r'^annotator/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?(?:\.(?P<isAdj>Adjudication))?/?$', views.getAnnotator),
	url(r'^schema/(?P<schema>[^\/]+)/(?P<schemaIdx>[0-9]+)/?$', views.getSchema),
	url(r'^schema/(?P<schema>[^\/]+)/?$', views.getSchema),
	url(r'^saveFile/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<isAdj>Adjudication))?/?$', views.writeFile),
	url(r'^saveFile/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?(?:\.(?P<isAdj>Adjudication))?/?$', views.writeFile),
	url(r'^setCompleted/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<isAdj>Adjudication))?/?$', views.setCompleted),
	url(r'^setCompleted/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?(?:\.(?P<isAdj>Adjudication))?/?$', views.setCompleted),
	url(r'^logging/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?(?:\.(?P<isAdj>Adjudication))?/?$', views.saveLogging),
	url(r'^(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/\.]+)(?:\.(?P<schemaMode>[^\/A-Za-z0-9\.]*))?(?:\.(?P<adjudication>Adjudication))?(?:\/(?P<view>view))?(?:/(?P<crossDoc>_crossDoc))?(?:\/(?P<logging>_logging_))?(?:\/(?P<annotator>[^\/]+))?/?$', views.annotateNormal),
	url(r'^(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/\.]+)(?:\.(?P<schemaMode>[^\/\.]+))?(?:\.(?P<adjudication>Adjudication))?(?:\/(?P<view>view))?(?:/(?P<crossDoc>_crossDoc))?(?:\/(?P<logging>_logging_))?(?:\/(?P<annotator>[^\/]+))?/?$', views.annotateNormal),
	url(r'^(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/?$', views.selectCorpus),
	url(r'^(?P<projectName>[^\/]+)/?$', views.selectProject),
	url(r'^$', views.index),
]
#+ static(settings.STATIC_URL, documeent_root=settings.STATIC_ROOT)
#+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
#from django.conf import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'^testAnnotate/$', 'testAnnotate.views.index'),
    url(r'^markFalsePositive/listTask/$', 'markFalsePositive.views.getFileList',{}, "listTask" ),
    url(r'^markFalsePositive/displayTask/(?P<taskName>.+)$', 'markFalsePositive.views.displayTask',{}, 'displayTask' ),
    url(r'^markFalsePositive/getHeadword/(?P<taskName>.+)$', 'markFalsePositive.views.getHeadword',{}, 'getHeadword' ),
    url(r'^markFalsePositive/$', 'markFalsePositive.views.index'),
    url(r'^showFalsePositive/listTask/$', 'showFalsePositive.views.getFileList',{}, "listTask" ),
    url(r'^showFalsePositive/displayTask/(?P<taskName>.+)$', 'showFalsePositive.views.displayTask',{}, 'displayTaskInShow' ),
    url(r'^showFalsePositive/getPreAnnotation/(?P<taskName>.+)$', 'showFalsePositive.views.getPreAnnotation',{}, 'getPreAnnotation' ),
    url(r'^annotate/getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/]+)/view/$', 'annotate.views.getAllTask'),
    url(r'^annotate/getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/]+)\.Adjudication/$', 'annotate.views.getAdjudicationTaskFromProjectCorpusName'),
    url(r'^annotate/getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/]+)/$', 'annotate.views.getTaskFromProjectCorpusName'),
    url(r'^annotate/getDir/(?P<projectName>[^\/]+)/$', 'annotate.views.getCorpusFromProjectName'),
    url(r'^annotate/getDir/$', 'annotate.views.getProject'),
    url(r'^annotate/xml/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)/$', 'annotate.views.getAnaforaXMLFile'),
    url(r'^annotate/xml/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)/(?P<annotatorName>[^\/]+)/$', 'annotate.views.getAnaforaXMLFile'),
    url(r'^annotate/completeAnnotator/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/]+)/$', 'annotate.views.getCompleteAnnotator'),
    url(r'^annotate/inprogressAnnotator/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/]+)/$', 'annotate.views.getInprogressAnnotator'),
    url(r'^annotate/annotator/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/]+)/$', 'annotate.views.getAnnotator'),
    url(r'^annotate/schema/(?P<schema>[^\/]+)/(?P<schemaIdx>[0-9]+)/$', 'annotate.views.getSchema'),
    url(r'^annotate/schema/(?P<schema>[^\/]+)/$', 'annotate.views.getSchema'),
    url(r'^annotate/saveFile/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/]+)/$', 'annotate.views.writeFile'),
    url(r'^annotate/setCompleted/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/]+)/$', 'annotate.views.setCompleted'),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)\.(?P<schemaMode>Adjudication)/preannotation/$', 'annotate.views.index'),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)/preannotation/$', 'annotate.views.index'),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)\.(?P<schemaMode>Adjudication)/$', 'annotate.views.index'),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)\.(?P<schemaMode>Adjudication)/(?P<annotatorName>[^\/]+)/$', 'annotate.views.index'),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)\.(?P<schemaMode>Adjudication)/(?P<annotatorName>[^\/]+)/$', 'annotate.views.index'),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)/(?P<annotatorName>[^\/]+)/$', 'annotate.views.index'),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)/$', 'annotate.views.index'),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/$', 'annotate.views.index'),
    url(r'^annotate/(?P<projectName>[^\/]+)/$', 'annotate.views.index'),
    url(r'^annotate/$', 'annotate.views.index'),
    url(r'^$', 'annotate.views.index'),
#    url(r'^' + settings.STATIC_URL + '(?P<path>.*)$','django.views.static.serve', {'document_root': settings.STATIC_ROOT}  ),
    # Examples:
    # url(r'^$', 'web.views.home', name='home'),
    # url(r'^web/', include('web.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    #url(r'^admin/', include(admin.site.urls)),
)

urlpatterns += staticfiles_urlpatterns()

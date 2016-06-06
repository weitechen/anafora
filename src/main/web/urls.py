from django.conf.urls import patterns, include, url
import annotate.views
from django.conf import settings
from django.conf.urls.static import static

#import views
#from django.contrib.staticfiles.urls import staticfiles_urlpatterns
#from django.conf import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = [

    #url(r'^annotate/getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/]+)/view/crossDoc/$', annotate.views.getAllTask),
    #url(r'^annotate/getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/]+)(/crossDoc)/$', annotate.views.getCrossTask),
    url(r'^annotate/getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/]+)/view/$', annotate.views.getAllTask),
    #annotate.views.getAllTask),
    url(r'^annotate/getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/]+)\.Adjudication/$', annotate.views.getAdjudicationTaskFromProjectCorpusName),
    #url(r'^annotate/getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/]+)/$', annotate.views.getTaskFromProjectCorpusName),
    url(r'^annotate/getDir/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<schemaName>[^\/]+)(?:/(?P<crossDoc>_crossDoc))?/$', annotate.views.getTaskFromProjectCorpusName),
    url(r'^annotate/getDir/(?P<projectName>[^\/]+)/$', annotate.views.getCorpusFromProjectName),
    url(r'^annotate/getDir/$', annotate.views.getProject),
    url(r'^annotate/xml/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)/$', annotate.views.getAnaforaXMLFile),
    url(r'^annotate/xml/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)/(?P<annotatorName>[^\/]+)/$', annotate.views.getAnaforaXMLFile),
    url(r'^annotate/completeAnnotator/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/]+)/$', annotate.views.getCompleteAnnotator),
    url(r'^annotate/inprogressAnnotator/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/]+)/$', annotate.views.getInprogressAnnotator),
    url(r'^annotate/annotator/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/]+)/$', annotate.views.getAnnotator),
    url(r'^annotate/schema/(?P<schema>[^\/]+)/(?P<schemaIdx>[0-9]+)/$', annotate.views.getSchema),
    url(r'^annotate/schema/(?P<schema>[^\/]+)/$', annotate.views.getSchema),
    url(r'^annotate/saveFile/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/]+)/$', annotate.views.writeFile),
    url(r'^annotate/setCompleted/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schemaName>[^\/]+)/$', annotate.views.setCompleted),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)\.(?P<schemaMode>Adjudication)/preannotation(?:/(?P<crossDoc>_crossDoc))?/$', annotate.views.index),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)/preannotation(?:/(?P<crossDoc>_crossDoc))?/$', annotate.views.index),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)\.(?P<schemaMode>Adjudication)(?:/(?P<crossDoc>_crossDoc))?/$', annotate.views.index),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)\.(?P<schemaMode>Adjudication)/(?P<annotatorName>[^\/]+)(?:/(?P<crossDoc>_crossDoc))?/$', annotate.views.index),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)\.(?P<schemaMode>Adjudication)/(?P<annotatorName>[^\/]+)(?:/(?P<crossDoc>_crossDoc))?/$', annotate.views.index),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)/(?P<annotatorName>[^\/]+)(?:/(?P<crossDoc>_crossDoc))/?$', annotate.views.index),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/(?P<taskName>[^\/]+)/(?P<schema>[^\/]+)(?:/(?P<crossDoc>_crossDoc))?/$', annotate.views.index),
    url(r'^annotate/(?P<projectName>[^\/]+)/(?P<corpusName>[^\/]+)/$', annotate.views.index),
    url(r'^annotate/(?P<projectName>[^\/]+)/$', annotate.views.index),
    url(r'^annotate/$', annotate.views.index),
    url(r'^$', annotate.views.index),
#    url(r'^' + settings.STATIC_URL + '(?P<path>.*)$','django.views.static.serve', {'document_root': settings.STATIC_ROOT}  ),
    # Examples:
    # url(r'^$', 'web.views.home', name='home'),
    # url(r'^web/', include('web.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    #url(r'^admin/', include(admin.site.urls)),
] + static(settings.STATIC_URL, documeent_root=settings.STATIC_ROOT)

#urlpatterns += staticfiles_urlpatterns()

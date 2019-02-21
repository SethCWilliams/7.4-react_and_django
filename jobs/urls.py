from django.contrib import admin
from django.urls import path

from .api import JobViewSet

urlpatterns = [
    path('api/job/', JobViewSet.as_view({
       'get': 'list',
       'post': 'create',
    }), name='job_api'),
]

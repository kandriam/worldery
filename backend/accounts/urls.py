from django.urls import path
from .views import current_user

urlpatterns = [
    path('user/', current_user, name='current_user'),
]

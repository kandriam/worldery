from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorldViewSet, CharacterViewSet, LocationViewSet, EventViewSet, StoryViewSet, RelationshipViewSet

router = DefaultRouter()
router.register(r'worlds', WorldViewSet, basename='world')
router.register(r'characters', CharacterViewSet, basename='character')
router.register(r'locations', LocationViewSet, basename='location')
router.register(r'events', EventViewSet, basename='event')
router.register(r'stories', StoryViewSet, basename='story')
router.register(r'relationships', RelationshipViewSet, basename='relationship')

urlpatterns = [
    path('', include(router.urls)),
]
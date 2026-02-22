from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorldViewSet, CharacterViewSet, LocationViewSet, EventViewSet, StoryViewSet, RelationshipViewSet

router = DefaultRouter()
router.register(r'worlds', WorldViewSet)
router.register(r'characters', CharacterViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'events', EventViewSet)
router.register(r'stories', StoryViewSet)
router.register(r'relationships', RelationshipViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
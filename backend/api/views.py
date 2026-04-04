from rest_framework import viewsets, permissions
from .models import Character, Event, Location, Story, World, CharacterRelationship
from .serializers import CharacterSerializer, EventSerializer, LocationSerializer, StorySerializer, WorldSerializer, RelationshipSerializer

# Create your views here.
class WorldViewSet(viewsets.ModelViewSet):
    serializer_class = WorldSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return World.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class CharacterViewSet(viewsets.ModelViewSet):
    serializer_class = CharacterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Character.objects.filter(owner=self.request.user)
        world_id = self.request.query_params.get('world')
        if world_id:
            qs = qs.filter(world_id=world_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class LocationViewSet(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Location.objects.filter(owner=self.request.user)
        world_id = self.request.query_params.get('world')
        if world_id:
            qs = qs.filter(world_id=world_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Event.objects.filter(owner=self.request.user)
        world_id = self.request.query_params.get('world')
        if world_id:
            qs = qs.filter(world_id=world_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class StoryViewSet(viewsets.ModelViewSet):
    serializer_class = StorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Story.objects.filter(owner=self.request.user)
        world_id = self.request.query_params.get('world')
        if world_id:
            qs = qs.filter(world_id=world_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class RelationshipViewSet(viewsets.ModelViewSet):
    serializer_class = RelationshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CharacterRelationship.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    serializer_class = RelationshipSerializer
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

    def perform_update(self, serializer):
        old_stories = set(serializer.instance.stories.values_list('id', flat=True))
        instance = serializer.save()
        new_stories = set(instance.stories.values_list('id', flat=True))
        # Sync Story.characters to match Character.stories
        for story in Story.objects.filter(id__in=(new_stories - old_stories)):
            story.characters.add(instance)
        for story in Story.objects.filter(id__in=(old_stories - new_stories)):
            story.characters.remove(instance)

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

    def perform_update(self, serializer):
        old_stories = set(serializer.instance.stories.values_list('id', flat=True))
        instance = serializer.save()
        new_stories = set(instance.stories.values_list('id', flat=True))
        # Sync Story.locations to match Location.stories
        for story in Story.objects.filter(id__in=(new_stories - old_stories)):
            story.locations.add(instance)
        for story in Story.objects.filter(id__in=(old_stories - new_stories)):
            story.locations.remove(instance)

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

    def perform_update(self, serializer):
        old_chars = set(serializer.instance.characters.values_list('id', flat=True))
        old_locs = set(serializer.instance.locations.values_list('id', flat=True))
        instance = serializer.save()
        new_chars = set(instance.characters.values_list('id', flat=True))
        new_locs = set(instance.locations.values_list('id', flat=True))
        # Sync Character.stories to match Story.characters
        for char in Character.objects.filter(id__in=(new_chars - old_chars)):
            char.stories.add(instance)
        for char in Character.objects.filter(id__in=(old_chars - new_chars)):
            char.stories.remove(instance)
        # Sync Location.stories to match Story.locations
        for loc in Location.objects.filter(id__in=(new_locs - old_locs)):
            loc.stories.add(instance)
        for loc in Location.objects.filter(id__in=(old_locs - new_locs)):
            loc.stories.remove(instance)

class RelationshipViewSet(viewsets.ModelViewSet):
    serializer_class = RelationshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CharacterRelationship.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    serializer_class = RelationshipSerializer
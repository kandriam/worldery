
from rest_framework import serializers
from .models import World, Character, CharacterRelationship, Location, Event, Story

class WorldSerializer(serializers.ModelSerializer):
    class Meta:
        model = World
        fields = '__all__'
        read_only_fields = ('owner',)

class CharacterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Character
        fields = '__all__'
        read_only_fields = ('owner',)

class RelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = CharacterRelationship
        fields = '__all__'
        read_only_fields = ('owner',)

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'
        read_only_fields = ('owner',)

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('owner',)

class StorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Story
        fields = '__all__'
        read_only_fields = ('owner',)

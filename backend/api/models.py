
from django.db import models

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    def __str__(self):
        return self.name

class World(models.Model):
    title = models.CharField(max_length=100, blank=True)
    description = models.TextField(null=True, blank=True)
    characters = models.ManyToManyField('Character', related_name='worlds', blank=True)
    locations = models.ManyToManyField('Location', related_name='worlds', blank=True)
    events = models.ManyToManyField('Event', related_name='worlds', blank=True)
    stories = models.ManyToManyField('Story', related_name='worlds', blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    genres = models.JSONField(default=list, blank=True)
    def __str__(self):
        return self.title

class Story(models.Model):
    title = models.CharField(max_length=100, blank=True)
    description = models.TextField(null=True, blank=True)
    characters = models.ManyToManyField('Character', related_name='story_set', blank=True)
    locations = models.ManyToManyField('Location', related_name='story_set', blank=True)
    substories = models.ManyToManyField('self', symmetrical=False, related_name='parent_stories', blank=True)
    tags = models.JSONField(default=list, blank=True)
    # tags = models.ManyToManyField(Tag, blank=True)
    genres = models.JSONField(default=list, blank=True)
    def __str__(self):
        return self.title

class Location(models.Model):
    name = models.CharField(max_length=100, blank=True)
    description = models.TextField(null=True, blank=True)
    characters = models.ManyToManyField('Character', related_name='location_set', blank=True)
    stories = models.ManyToManyField(Story, related_name='location_stories', blank=True)
    related_locations = models.ManyToManyField('self', symmetrical=True, related_name='related_locations', blank=True)
    tags = models.JSONField(default=list, blank=True)
    # tags = models.ManyToManyField(Tag, blank=True)
    def __str__(self):
        return self.name

class Event(models.Model):
    name = models.CharField(max_length=100, blank=True)
    description = models.TextField(null=True, blank=True)
    date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    locations = models.ManyToManyField(Location, related_name='events', blank=True)
    characters = models.ManyToManyField('Character', related_name='events', blank=True)
    stories = models.ManyToManyField(Story, related_name='event_stories', blank=True)
    tags = models.JSONField(default=list, blank=True)
    # tags = models.ManyToManyField(Tag, blank=True)
    def __str__(self):
        return self.name

class Character(models.Model):
    personal_name = models.CharField(max_length=100, blank=True)
    family_name = models.CharField(max_length=100, blank=True)
    alt_names = models.JSONField(default=list, blank=True)
    physical_description = models.TextField(blank=True, null=True)
    non_physical_description = models.TextField(blank=True, null=True)
    pronouns = models.CharField(max_length=50, blank=True, null=True)
    birthdate = models.DateField(null=True, blank=True)
    deathdate = models.DateField(null=True, blank=True)
    birth_event = models.ForeignKey(Event, null=True, blank=True, on_delete=models.SET_NULL, related_name='birth_characters')
    death_event = models.ForeignKey(Event, null=True, blank=True, on_delete=models.SET_NULL, related_name='death_characters')
    roles = models.JSONField(default=list, blank=True)
    affiliations = models.JSONField(default=list, blank=True)
    stories = models.ManyToManyField(Story, related_name='character_set', blank=True)
    tags = models.JSONField(default=list, blank=True)
    # tags = models.ManyToManyField(Tag, blank=True)
    def __str__(self):
        return f"{self.personal_name} {self.family_name}"

class CharacterRelationship(models.Model):
    primary_character = models.ForeignKey(Character, related_name='relationships', on_delete=models.CASCADE)
    secondary_character = models.ForeignKey(Character, related_name='related_relationships', on_delete=models.CASCADE)
    has_relationship = models.BooleanField(default=False)
    relationship_type = models.JSONField(default=list, blank=True)
    relationship_description = models.TextField(blank=True)
    def __str__(self):
        return f"{self.primary_character} and {self.secondary_character}"
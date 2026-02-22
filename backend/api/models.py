from django.db import models

# Create your models here.
class World(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    characters = models.ManyToManyField('Character', related_name='worlds')
    locations = models.ManyToManyField('Location', related_name='worlds')
    events = models.ManyToManyField('Event', related_name='worlds')
    stories = models.ManyToManyField('Story', related_name='worlds')

# Characters
class Character(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=50)
    character_description = models.TextField()
    physical_description = models.TextField()
    nonphysical_description = models.TextField()
    # Story 
    story_role = models.CharField(max_length=100)
    # Related
    relationships = models.ManyToManyField('self', through='Relationship', symmetrical=False, related_name='related_characters')


class Relationship(models.Model):
    character1 = models.ForeignKey(Character, related_name='character1', on_delete=models.CASCADE)
    character2 = models.ForeignKey(Character, related_name='character2', on_delete=models.CASCADE)
    relationship_type = models.CharField(max_length=100)
    description = models.TextField()

class Location(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    related_locations = models.ManyToManyField('self', symmetrical=True, related_name='related_locations')

class Event(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()

    related_characters = models.ManyToManyField(Character, related_name='events')
    related_locations = models.ManyToManyField(Location, related_name='events')

class Story(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    parent_story = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='sub_stories')
from django.contrib import admin
from .models import World, Location, Character, CharacterRelationship, Event, Story, Tag

# Register your models here.
admin.site.register(World)
admin.site.register(Location)
admin.site.register(Character)
admin.site.register(CharacterRelationship)
admin.site.register(Event)
admin.site.register(Story)
admin.site.register(Tag)

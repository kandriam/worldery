from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import UserProfile


# Serializer for registering a new user
class RegistrationSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
	password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

	class Meta:
		model = User
		fields = ('username', 'email', 'password', 'password2')

	def validate(self, data):
		if data['password'] != data['password2']:
			raise serializers.ValidationError({"password": "Passwords must match."})
		return data

	def create(self, validated_data):
		validated_data.pop('password2')
		user = User.objects.create_user(**validated_data)
		return user


# Serializer for logging in a user
class LoginSerializer(serializers.Serializer):
	username = serializers.CharField()
	password = serializers.CharField(write_only=True, style={'input_type': 'password'})

	def validate(self, data):
		user = authenticate(username=data['username'], password=data['password'])
		if user and user.is_active:
			return user
		raise serializers.ValidationError("Invalid credentials.")


# Serializer for basic user identity (used in login response + auth guard)
class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ('id', 'username', 'email')


# Full profile serializer — flat, combines User fields + UserProfile fields
class UserProfileSerializer(serializers.Serializer):
	id = serializers.IntegerField(read_only=True)
	username = serializers.CharField(max_length=150)
	email = serializers.EmailField(allow_blank=True, required=False)
	first_name = serializers.CharField(max_length=150, allow_blank=True, required=False)
	last_name = serializers.CharField(max_length=150, allow_blank=True, required=False)
	display_name = serializers.CharField(max_length=100, allow_blank=True, required=False)
	pronouns = serializers.CharField(max_length=50, allow_blank=True, required=False)
	bio = serializers.CharField(allow_blank=True, required=False)

	# Pull profile sub-fields up to the top level on read
	def to_representation(self, instance):
		profile, _ = UserProfile.objects.get_or_create(user=instance)
		return {
			'id': instance.id,
			'username': instance.username,
			'email': instance.email,
			'first_name': instance.first_name,
			'last_name': instance.last_name,
			'display_name': profile.display_name,
			'pronouns': profile.pronouns,
			'bio': profile.bio,
		}

	def update(self, instance, validated_data):
		# Update User model fields
		instance.username = validated_data.get('username', instance.username)
		instance.email = validated_data.get('email', instance.email)
		instance.first_name = validated_data.get('first_name', instance.first_name)
		instance.last_name = validated_data.get('last_name', instance.last_name)
		instance.save()

		# Update UserProfile fields
		profile, _ = UserProfile.objects.get_or_create(user=instance)
		profile.display_name = validated_data.get('display_name', profile.display_name)
		profile.pronouns = validated_data.get('pronouns', profile.pronouns)
		profile.bio = validated_data.get('bio', profile.bio)
		profile.save()

		return instance

	def validate_username(self, value):
		request = self.context.get('request')
		# Allow keeping the same username; reject if taken by another user
		if request and User.objects.exclude(pk=request.user.pk).filter(username=value).exists():
			raise serializers.ValidationError("A user with that username already exists.")
		return value

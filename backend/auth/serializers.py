from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate

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

# Serializer for user profile
class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ('id', 'username', 'email')

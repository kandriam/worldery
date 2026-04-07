from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegistrationSerializer, LoginSerializer, UserSerializer, UserProfileSerializer

# User Registration View
class RegisterView(generics.CreateAPIView):
	queryset = User.objects.all()
	serializer_class = RegistrationSerializer

# User Login View (returns JWT)
class LoginView(APIView):
	permission_classes = (permissions.AllowAny,)

	def post(self, request):
		serializer = LoginSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.validated_data
		refresh = RefreshToken.for_user(user)
		return Response({
			'refresh': str(refresh),
			'access': str(refresh.access_token),
			'user': UserSerializer(user).data
		})

# Basic user identity endpoint (used for auth guard)
class UserView(generics.RetrieveAPIView):
	serializer_class = UserSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_object(self):
		return self.request.user

# Full profile view — GET + PATCH
class ProfileView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		serializer = UserProfileSerializer(request.user, context={'request': request})
		return Response(serializer.data)

	def patch(self, request):
		serializer = UserProfileSerializer(
			request.user,
			data=request.data,
			partial=True,
			context={'request': request}
		)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

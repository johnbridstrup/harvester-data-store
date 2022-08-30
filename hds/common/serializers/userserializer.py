from django.contrib.auth.models import User
from rest_framework import serializers
from common.models import UserProfile


class LoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']


class ProfileSerializer(serializers.ModelSerializer):
    """serializer for the user profile model"""

    class Meta:
        model = UserProfile
        fields = ('__all__')
        read_only_fields = ['id']


class UserSerializer(serializers.ModelSerializer):
    """serializer for the user model"""
    profile = ProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name',
            'username', 'email', 'is_active', 'is_staff',
            'is_superuser', 'last_login', 'profile',
            'password'
        ]
        extra_kwargs = {'password': {'write_only': True, 'min_length': 5}}
        read_only_fields = ['id']

    def update(self, instance, validated_data):
        """update and return the user"""
        password = validated_data.pop("password", None)
        profile = validated_data.pop("profile", None)
        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
            user.save()

        if profile:
            user_profile = UserProfile.objects.get(user=user)
            user_profile.slack_id = profile.get("slack_id")
            user_profile.save()

        return user

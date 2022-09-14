from django.contrib.auth.models import User
from django.utils.translation import gettext as _
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
        validated_data.pop("password", None)
        profile = validated_data.pop("profile", None)
        request = self.context.get("request")

        if instance.pk != request.user.pk and not request.user.is_superuser:
            msg = _("Unable to authorize user for update action")
            raise serializers.ValidationError(msg, code="authorization")

        user = super().update(instance, validated_data)

        if profile:
            profile['user'] = user.pk
            serializer = ProfileSerializer(instance=user.profile, data=profile)
            if serializer.is_valid(raise_exception=True):
                serializer.save()

        return user


class UserCreateSerializer(UserSerializer):
    """user creation serializer.
    it overrides the required UserProfile.user attr
    """
    profile = serializers.JSONField(required=False)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields

    def create(self, validated_data):
        """create and return the user"""
        password = validated_data.pop("password", None)
        profile = validated_data.pop("profile", None)
        request = self.context.get("request")

        if not request.user.is_superuser:
            msg = _("Unable to authorize user for create action")
            raise serializers.ValidationError(msg, code="authorization")

        user = super().create(validated_data)

        if password:
            user.set_password(password)
            user.save()

        if not profile:
            profile = {}

        profile['user'] = user.pk
        serializer = ProfileSerializer(data=profile)
        if serializer.is_valid(raise_exception=True):
            serializer.save()

        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['profile'] = {
            'id': instance.profile.id,
            'slack_id': instance.profile.slack_id,
            'user': instance.pk
        }
        return data

# Generated manually to create profiles for existing users

from django.db import migrations
from django.contrib.auth.models import User


def create_profiles_for_existing_users(apps, schema_editor):
    """Tworzy profile dla wszystkich istniejących użytkowników z domyślną rolą 'both'"""
    UserProfile = apps.get_model('api', 'UserProfile')
    User = apps.get_model('auth', 'User')
    
    for user in User.objects.all():
        UserProfile.objects.get_or_create(
            user=user,
            defaults={'preferred_role': 'both'}
        )


def reverse_create_profiles(apps, schema_editor):
    """Usuwa wszystkie profile (opcjonalne, dla rollback)"""
    UserProfile = apps.get_model('api', 'UserProfile')
    UserProfile.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_userprofile'),
    ]

    operations = [
        migrations.RunPython(create_profiles_for_existing_users, reverse_create_profiles),
    ]








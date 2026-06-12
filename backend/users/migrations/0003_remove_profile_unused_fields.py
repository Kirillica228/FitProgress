from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_profile_calorie_goal_profile_carbs_goal_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='first_name',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='last_name',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='height',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='weight',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='age',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='goal',
        ),
    ]

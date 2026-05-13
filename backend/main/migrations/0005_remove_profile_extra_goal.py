from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0004_profile_refactor'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='extra_goal',
        ),
    ]

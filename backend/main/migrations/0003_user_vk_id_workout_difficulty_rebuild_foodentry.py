import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_food_bodymeasurement_foodentry_goal'),
    ]

    operations = [
        # 1. Добавляем vk_id к User
        migrations.AddField(
            model_name='user',
            name='vk_id',
            field=models.BigIntegerField(blank=True, null=True, unique=True),
        ),

        # 2. Добавляем difficulty к Workout
        migrations.AddField(
            model_name='workout',
            name='difficulty',
            field=models.CharField(
                choices=[
                    ('beginner', 'Beginner'),
                    ('intermediate', 'Intermediate'),
                    ('advanced', 'Advanced'),
                ],
                default='beginner',
                max_length=20,
            ),
        ),

        # 3. Удаляем старую FoodEntry (она ссылается на Food через FK)
        migrations.DeleteModel(
            name='FoodEntry',
        ),

        # 4. Удаляем модель Food
        migrations.DeleteModel(
            name='Food',
        ),

        # 5. Создаём новую FoodEntry без FK на Food
        migrations.CreateModel(
            name='FoodEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('food_name', models.CharField(max_length=150)),
                ('off_product_id', models.CharField(blank=True, max_length=100)),
                ('grams', models.FloatField()),
                ('calories', models.FloatField()),
                ('protein', models.FloatField()),
                ('fats', models.FloatField()),
                ('carbs', models.FloatField()),
                ('meal_type', models.CharField(
                    choices=[
                        ('breakfast', 'Breakfast'),
                        ('lunch', 'Lunch'),
                        ('dinner', 'Dinner'),
                        ('snack', 'Snack'),
                    ],
                    max_length=20,
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),
    ]

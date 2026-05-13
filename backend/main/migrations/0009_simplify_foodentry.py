from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0008_seed_articles"),
    ]

    operations = [
        # Удаляем лишние поля
        migrations.RemoveField(model_name="foodentry", name="off_product_id"),
        migrations.RemoveField(model_name="foodentry", name="grams"),
        migrations.RemoveField(model_name="foodentry", name="protein"),
        migrations.RemoveField(model_name="foodentry", name="fats"),
        migrations.RemoveField(model_name="foodentry", name="carbs"),
    ]

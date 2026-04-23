from django.db import migrations


def seed_default_categories(apps, schema_editor):
    Category = apps.get_model('messaging', 'Category')

    default_categories = [
        {'name': 'Inbox', 'route': 'inbox'},
        {'name': 'Sent', 'route': 'sent'},
        {'name': 'Spam', 'route': 'spam'},
    ]

    for category_data in default_categories:
        Category.objects.update_or_create(
            route=category_data['route'],
            defaults={'name': category_data['name']}
        )


def unseed_default_categories(apps, schema_editor):
    Category = apps.get_model('messaging', 'Category')
    Category.objects.filter(route__in=['inbox', 'sent', 'spam']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('messaging', '0006_alter_category_id_alter_message_id_thread_and_more'),
    ]

    operations = [
        migrations.RunPython(seed_default_categories, unseed_default_categories),
    ]

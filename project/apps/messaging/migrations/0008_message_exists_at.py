from django.db import migrations, models


def populate_exists_at(apps, schema_editor):
    Message = apps.get_model('messaging', 'Message')

    for message in Message.objects.all():
        user_ids = [message.sender_id]
        user_ids.extend(message.recipients.values_list('id', flat=True))
        user_ids.extend(message.copy_recipients.values_list('id', flat=True))
        message.exists_at = list(dict.fromkeys(user_ids))
        message.save(update_fields=['exists_at'])


def clear_exists_at(apps, schema_editor):
    Message = apps.get_model('messaging', 'Message')
    Message.objects.update(exists_at=[])


class Migration(migrations.Migration):

    dependencies = [
        ('messaging', '0007_seed_default_categories'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='exists_at',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.RunPython(populate_exists_at, clear_exists_at),
    ]

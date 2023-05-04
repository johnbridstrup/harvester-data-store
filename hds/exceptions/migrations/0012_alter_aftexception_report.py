# Generated by Django 4.1 on 2023-05-04 18:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('errorreport', '0009_errorreport_pick_session'),
        ('exceptions', '0011_alter_aftexception_primary'),
    ]

    operations = [
        migrations.AlterField(
            model_name='aftexception',
            name='report',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='exceptions', to='errorreport.errorreport'),
        ),
    ]

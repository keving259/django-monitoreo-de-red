import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model

User = get_user_model()
ROLES = ["Administrador", 'Sistema', 'Solo monitoreo']

class Command(BaseCommand):
    def handle(self, *args, **options):
        for nombre in ROLES:
            _, created = Group.objects.get_or_create(name=nombre)
            if created:
                self.stdout.write(f"Grupo creado: {nombre}")
                
        username = os.environ.get("ADMIN_USERNAME")
        password = os.environ.get('ADMIN_PASSWORD')
        
        if username and password and not User.objects.filter(username=username).exists():
            user = User.objects.create_superuser(username=username, email='', password=password)
            user.groups.add(Group.objects.get(name="Administrador"))
            self.stdout.write(f'Superusuario creado: {username}')
        else:
            self.stdout.write("Usuario ya existe o faltan variables de entorno, se omite")

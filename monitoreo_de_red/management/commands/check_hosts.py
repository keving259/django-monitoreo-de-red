from django.core.management.base import BaseCommand
from monitoreo_de_red.services.checks import ejecutar_revision_hosts

class Command(BaseCommand):
    def handle(self, *args, **options):
        total = ejecutar_revision_hosts()
        self.stdout.write(f'Hosts revisados: {total}')
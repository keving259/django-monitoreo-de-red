from django.core.management.base import BaseCommand
from network_checks.services.checks import check_all_hosts

class Command(BaseCommand):
    def handle(self, *args, **options):
        check_all_hosts()

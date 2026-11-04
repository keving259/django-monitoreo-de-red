from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie

# Create your views here.
@login_required(login_url='/login/')
@ensure_csrf_cookie
def hosts(request):
    return render(request, 'hosts.html')

from django.shortcuts import render

# Create your views here.
def hosts(request):
    return render(request, 'hosts.html')
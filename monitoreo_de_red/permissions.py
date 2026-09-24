from rest_framework.permissions import BasePermission, SAFE_METHODS

def is_admin(user):
    return user.groups.filter(name='Administrador').exists()

def is_system(user):
    return user.groups.filter(name='Sistema').exists()


class HostPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return is_admin(request.user) or is_system(request.user)
    
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if is_admin(request.user):
            return True
        if is_system(request.user):
            return obj.propietario == request.user
        return False

class OnlyAdminManagesUsers(BasePermission):
    def has_permission(self, request, view):
        return is_admin(request.user)

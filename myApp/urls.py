from . import views
from django.urls import path

urlpatterns = [
    path("", views.index, name='index'),
    path('subscribe/', views.subscribe, name='subscribe'),
    path('contact/', views.contact, name='contact'),
    path('api/orders', views.create_order, name='create_order'),
    path('api/orders/<str:order_id>/capture', views.capture_order, name='capture_order'),
    
]
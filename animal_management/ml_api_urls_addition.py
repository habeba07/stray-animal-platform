
# Add these to adoptions/urls.py

from django.urls import path
from . import views

api_urlpatterns = [
    path('api/predict-adoption/', views.api_predict_adoption, name='api_predict_adoption'),
    path('api/collaborative-recommendations/', views.api_collaborative_recommendations, name='api_collaborative_recommendations'),
    path('api/ml-status/', views.api_ml_status, name='api_ml_status'),
    path('api/behavioral-cluster/', views.api_behavioral_cluster, name='api_behavioral_cluster'),
]

# Add api_urlpatterns to your main urlpatterns

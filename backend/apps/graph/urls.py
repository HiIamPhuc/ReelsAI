from django.urls import path
from . import views

app_name = 'graph'

urlpatterns = [
    # Video summarization processing
    path('process-video-summarization/', views.process_video_summarization, name='process_video_summarization'),
    
    # Request management
    path('requests/<int:request_id>/', views.get_processing_status, name='get_processing_status'),
    path('requests/', views.list_user_requests, name='list_user_requests'),
    
    # Knowledge graph queries
    path('statistics/', views.get_graph_statistics, name='get_graph_statistics'),
    path('search/', views.search_entities, name='search_entities'),
    path('videos/<str:video_id>/graph/', views.get_video_knowledge_graph, name='get_video_knowledge_graph'),
    
    # Utilities
    path('test-connection/', views.test_neo4j_connection, name='test_neo4j_connection'),
]
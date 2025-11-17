from django.urls import path
from apps.video_tiktok.views import GetVideoTikTokView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path( 'video-tiktok/', GetVideoTikTokView.as_view(), name='get_video_tiktok' ),
]
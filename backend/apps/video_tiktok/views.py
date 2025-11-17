from rest_framework.views import APIView
from drf_spectacular.utils import (
    extend_schema, OpenApiExample, OpenApiParameter, OpenApiResponse
)
from django.http import JsonResponse
from supabase import create_client, Client
from dotenv import load_dotenv
import os
from rest_framework.permissions import IsAuthenticated

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class GetVideoTikTokView(APIView):
    permission_classes = [IsAuthenticated]  

    @extend_schema(
        tags=["Video TikTok"],
        summary="Get TikTok videos by hashtag",
        description="Retrieve TikTok videos based on a given hashtag.",
        parameters=[
            OpenApiParameter(name="hashtag", required=True, location=OpenApiParameter.QUERY, type=str),
        ],
        responses={
            200: OpenApiResponse(description="List of TikTok videos")
        },
    )
    def get(self, request):
        try:
            hashtag = request.GET.get('hashtag')
            if not hashtag:
                return JsonResponse({"error": "hashtag is required"}, status=400)

            response = supabase.table("video_crawling").select("*").ilike("hashtags", f"%{hashtag}%").range(0, 100).execute()
            videos = response.data

            user_id = request.user.id
            for video in videos:
                video["user_id"] = user_id

            return JsonResponse(videos, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
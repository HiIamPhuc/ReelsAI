"""
Django admin configuration for the chatbot application.
"""

from django.contrib import admin
from .models import ChatSession, ChatMessage


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    """Admin interface for ChatSession model"""
    list_display = ['session_id', 'user', 'title', 'created_at', 'updated_at', 'message_count']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['session_id', 'user__username', 'title']
    readonly_fields = ['session_id', 'created_at', 'updated_at']
    ordering = ['-updated_at']
    
    def message_count(self, obj):
        """Display the number of messages in this session"""
        return obj.messages.count()
    message_count.short_description = 'Messages'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """Admin interface for ChatMessage model"""
    list_display = ['id', 'session', 'message_type', 'content_preview', 'timestamp', 'used_rag_tool', 'confidence']
    list_filter = ['message_type', 'used_rag_tool', 'tool_calls_made', 'timestamp']
    search_fields = ['session__session_id', 'content', 'task_type']
    readonly_fields = ['id', 'timestamp']
    ordering = ['-timestamp']
    raw_id_fields = ['session']
    
    def content_preview(self, obj):
        """Display a preview of the message content"""
        return obj.content[:100] + "..." if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content Preview'
    
    def get_queryset(self, request):
        """Optimize queryset by selecting related session"""
        return super().get_queryset(request).select_related('session')

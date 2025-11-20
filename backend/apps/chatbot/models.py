from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class ChatSession(models.Model):
    """Chat session model to group messages by conversation"""
    session_id = models.CharField(max_length=100, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=200, blank=True, null=True)  # Optional session title
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Session {self.session_id} - {self.user.username}"


class ChatMessage(models.Model):
    """Chat message model for storing conversation history"""
    MESSAGE_TYPES = [
        ('human', 'Human'),
        ('ai', 'AI'),
        ('system', 'System'),
        ('tool', 'Tool'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES)
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    
    # Metadata fields
    used_rag_tool = models.BooleanField(default=False)
    tool_calls_made = models.BooleanField(default=False)
    confidence = models.FloatField(null=True, blank=True)
    task_type = models.CharField(max_length=50, blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)  # For additional data
    
    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['session', 'timestamp']),
            models.Index(fields=['message_type']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"{self.message_type.title()} message in {self.session.session_id}"

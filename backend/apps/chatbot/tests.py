"""
Test the chatbot API endpoints to ensure they work correctly.
"""

import json
import logging
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import ChatSession, ChatMessage


class ChatbotAPITestCase(APITestCase):
    """Test case for chatbot API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Get JWT token
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        
        # Set authentication header
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
    
    def test_send_message_new_session(self):
        """Test sending a message to create a new session"""
        data = {
            'message': 'Hello, this is a test message'
        }
        
        response = self.client.post('/api/chat/send-message/', data)
        
        # Check response status (Note: might fail if chatbot service is not available)
        # We expect either success (200) or service unavailable (503)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_503_SERVICE_UNAVAILABLE])
        
        if response.status_code == status.HTTP_200_OK:
            # Verify response structure
            response_data = response.json()
            self.assertIn('session_id', response_data)
            self.assertIn('message', response_data)
            self.assertIn('user_message_id', response_data)
            
            # Verify session was created
            session_id = response_data['session_id']
            session = ChatSession.objects.get(session_id=session_id, user=self.user)
            self.assertEqual(session.user, self.user)
            
            # Verify user message was saved
            user_message = ChatMessage.objects.get(
                session=session,
                message_type='human',
                content='Hello, this is a test message'
            )
            self.assertEqual(user_message.session, session)
    
    def test_send_message_existing_session(self):
        """Test sending a message to an existing session"""
        # Create a session first
        session = ChatSession.objects.create(
            session_id='test_session_123',
            user=self.user,
            title='Test Session'
        )
        
        data = {
            'message': 'This is a follow-up message',
            'session_id': 'test_session_123'
        }
        
        response = self.client.post('/api/chat/send-message/', data)
        
        # Check response status
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_503_SERVICE_UNAVAILABLE])
        
        if response.status_code == status.HTTP_200_OK:
            response_data = response.json()
            self.assertEqual(response_data['session_id'], 'test_session_123')
    
    def test_send_message_invalid_session(self):
        """Test sending a message to a non-existent session"""
        data = {
            'message': 'Test message',
            'session_id': 'non_existent_session'
        }
        
        response = self.client.post('/api/chat/send-message/', data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_session_messages(self):
        """Test retrieving messages from a session"""
        # Create session and messages
        session = ChatSession.objects.create(
            session_id='test_session_456',
            user=self.user,
            title='Test Session'
        )
        
        # Create some test messages
        ChatMessage.objects.create(
            session=session,
            message_type='human',
            content='Hello'
        )
        ChatMessage.objects.create(
            session=session,
            message_type='ai',
            content='Hi there! How can I help you?',
            confidence=0.9
        )
        
        response = self.client.get(f'/api/chat/sessions/{session.session_id}/messages/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = response.json()
        
        self.assertEqual(response_data['session_id'], 'test_session_456')
        self.assertEqual(response_data['message_count'], 2)
        self.assertEqual(len(response_data['messages']), 2)
        
        # Check message order (chronological)
        messages = response_data['messages']
        self.assertEqual(messages[0]['content'], 'Hello')
        self.assertEqual(messages[1]['content'], 'Hi there! How can I help you?')
    
    def test_get_messages_invalid_session(self):
        """Test retrieving messages from a non-existent session"""
        response = self.client.get('/api/chat/sessions/invalid_session/messages/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_list_sessions(self):
        """Test listing all user sessions"""
        # Create multiple sessions
        session1 = ChatSession.objects.create(
            session_id='session_1',
            user=self.user,
            title='Session 1'
        )
        session2 = ChatSession.objects.create(
            session_id='session_2', 
            user=self.user,
            title='Session 2'
        )
        
        # Add some messages
        ChatMessage.objects.create(
            session=session1,
            message_type='human',
            content='Message in session 1'
        )
        
        response = self.client.get('/api/chat/sessions/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = response.json()
        
        self.assertEqual(response_data['session_count'], 2)
        self.assertEqual(len(response_data['sessions']), 2)
        
        # Check session data
        sessions = response_data['sessions']
        session_ids = [s['session_id'] for s in sessions]
        self.assertIn('session_1', session_ids)
        self.assertIn('session_2', session_ids)
    
    def test_delete_session(self):
        """Test deleting a session and its messages"""
        # Create session with messages
        session = ChatSession.objects.create(
            session_id='delete_test_session',
            user=self.user,
            title='Delete Test'
        )
        
        ChatMessage.objects.create(
            session=session,
            message_type='human',
            content='Test message 1'
        )
        ChatMessage.objects.create(
            session=session,
            message_type='ai',
            content='Test response 1'
        )
        
        # Verify session exists
        self.assertTrue(ChatSession.objects.filter(session_id='delete_test_session').exists())
        self.assertEqual(ChatMessage.objects.filter(session=session).count(), 2)
        
        # Delete session
        response = self.client.delete(f'/api/chat/sessions/{session.session_id}/delete/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_data = response.json()
        
        self.assertTrue(response_data['success'])
        self.assertEqual(response_data['deleted_messages'], 2)
        
        # Verify session and messages are deleted
        self.assertFalse(ChatSession.objects.filter(session_id='delete_test_session').exists())
        self.assertEqual(ChatMessage.objects.filter(session_id=session.id).count(), 0)
    
    def test_delete_invalid_session(self):
        """Test deleting a non-existent session"""
        response = self.client.delete('/api/chat/sessions/invalid_session/delete/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_unauthorized_access(self):
        """Test that endpoints require authentication"""
        # Remove authentication
        self.client.credentials()
        
        # Test all endpoints
        endpoints = [
            '/api/chat/send-message/',
            '/api/chat/sessions/',
            '/api/chat/sessions/test_session/messages/',
            '/api/chat/sessions/test_session/delete/',
        ]
        
        for endpoint in endpoints:
            if 'send-message' in endpoint:
                response = self.client.post(endpoint, {'message': 'test'})
            elif 'delete' in endpoint:
                response = self.client.delete(endpoint)
            else:
                response = self.client.get(endpoint)
            
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

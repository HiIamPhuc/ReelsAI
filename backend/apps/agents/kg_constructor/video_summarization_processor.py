"""
Video Summarization to Knowledge Graph processor.

This module handles the complete pipeline from video summarization JSON
to Neo4j knowledge graph storage.
"""

import json
import logging
from typing import Dict, Any, List
from datetime import datetime
from django.conf import settings
from langchain_openai import ChatOpenAI

from .kg_constructor import run_knowledge_graph_pipeline
from .neo4j_client import Neo4jClient

logger = logging.getLogger(__name__)


class VideoSummarizationProcessor:
    """
    Processes video summarization data and converts it to a Neo4j knowledge graph.
    """
    
    def __init__(self, neo4j_client: Neo4jClient = None, llm=None):
        """
        Initialize the processor.
        
        Args:
            neo4j_client: Optional Neo4j client instance
            llm: Optional LLM instance for knowledge extraction
        """
        self.neo4j_client = neo4j_client or Neo4jClient()
        self.llm = llm or ChatOpenAI(
            api_key=getattr(settings, 'OPENAI_API_KEY', ''),
            model="gpt-4o-mini",
            temperature=0.0
        )
        
        # Ensure indexes are created
        self.neo4j_client.create_indexes()
    
    def validate_payload(self, payload: Dict[str, Any]) -> bool:
        """
        Validate the incoming video summarization payload.
        
        Args:
            payload: The video summarization payload
            
        Returns:
            True if valid, False otherwise
        """
        required_fields = ['user', 'video', 'topic', 'source', 'summarization']
        
        for field in required_fields:
            if field not in payload:
                logger.error(f"Missing required field: {field}")
                return False
        
        # Validate user data
        user = payload.get('user', {})
        if not user.get('user_id'):
            logger.error("User must have user_id")
            return False
        
        # Validate video data
        video = payload.get('video', {})
        if not video.get('video_id'):
            logger.error("Video must have video_id")
            return False
        
        # Validate summarization text
        if not payload.get('summarization', '').strip():
            logger.error("Summarization text cannot be empty")
            return False
        
        return True
    
    def extract_knowledge_graph(self, topic: str, summarization: str) -> Dict[str, Any]:
        """
        Extract knowledge graph from summarization text.
        
        Args:
            topic: The main topic/subject
            summarization: The summarization text
            
        Returns:
            Knowledge graph result from pipeline
        """
        try:
            result = run_knowledge_graph_pipeline(
                topic=topic,
                raw_text=summarization,
                llm=self.llm
            )
            
            logger.info(f"Extracted {len(result['entities'])} entities and "
                       f"{len(result['resolved_relations'])} relations")
            
            return result
        
        except Exception as e:
            logger.error(f"Failed to extract knowledge graph: {e}")
            # Return empty result structure
            return {
                'entities': [],
                'resolved_relations': [],
                'graph': None,
                'validation': {}
            }
    
    def upsert_metadata_nodes(self, payload: Dict[str, Any]) -> Dict[str, str]:
        """
        Upsert metadata nodes (User, Video, Topic, Source) to Neo4j.
        
        Args:
            payload: The video summarization payload
            
        Returns:
            Dictionary mapping node types to their IDs
        """
        node_ids = {}
        
        try:
            # Upsert User node
            user_data = payload['user'].copy()
            user_data.setdefault('name', f"User_{user_data['user_id']}")
            user_data.setdefault('email', '')
            user_data.setdefault('created_at', datetime.now().isoformat())
            
            node_ids['user'] = self.neo4j_client.upsert_user(user_data)
            logger.info(f"Upserted user: {node_ids['user']}")
            
            # Upsert Video node
            video_data = payload['video'].copy()
            video_data.setdefault('title', f"Video_{video_data['video_id']}")
            video_data.setdefault('description', '')
            video_data.setdefault('duration', 0)
            video_data.setdefault('upload_date', datetime.now().isoformat())
            video_data.setdefault('url', '')
            
            node_ids['video'] = self.neo4j_client.upsert_video(video_data)
            logger.info(f"Upserted video: {node_ids['video']}")
            
            # Upsert Topic node
            topic_data = payload['topic'].copy()
            if isinstance(topic_data, str):
                topic_data = {'name': topic_data}
            topic_data.setdefault('description', f"Topic about {topic_data['name']}")
            topic_data.setdefault('category', 'General')
            
            node_ids['topic'] = self.neo4j_client.upsert_topic(topic_data)
            logger.info(f"Upserted topic: {node_ids['topic']}")
            
            # Upsert Source node
            source_data = payload['source'].copy()
            if isinstance(source_data, str):
                source_data = {'name': source_data}
            source_data.setdefault('type', 'Unknown')
            source_data.setdefault('url', '')
            source_data.setdefault('description', f"Source: {source_data['name']}")
            
            node_ids['source'] = self.neo4j_client.upsert_source(source_data)
            logger.info(f"Upserted source: {node_ids['source']}")
            
        except Exception as e:
            logger.error(f"Failed to upsert metadata nodes: {e}")
            raise
        
        return node_ids
    
    def upsert_entities(self, entities: List[Dict[str, str]]) -> List[str]:
        """
        Upsert extracted entities to Neo4j.
        
        Args:
            entities: List of extracted entities
            
        Returns:
            List of entity names that were upserted
        """
        entity_names = []
        
        for entity in entities:
            try:
                entity_data = {
                    'name': entity['name'],
                    'type': entity['type'],
                    'description': f"{entity['type']}: {entity['name']}",
                    'confidence': 1.0  # Default confidence
                }
                
                entity_name = self.neo4j_client.upsert_entity(entity_data)
                entity_names.append(entity_name)
                
            except Exception as e:
                logger.error(f"Failed to upsert entity {entity}: {e}")
        
        logger.info(f"Upserted {len(entity_names)} entities")
        return entity_names
    
    def create_metadata_relationships(self, node_ids: Dict[str, str]):
        """
        Create relationships between metadata nodes.
        
        Args:
            node_ids: Dictionary mapping node types to their IDs
        """
        try:
            # User CARES Video
            self.neo4j_client.create_user_cares_video_relationship(
                node_ids['user'], 
                node_ids['video'],
                {'relationship_type': 'engagement', 'weight': 1.0}
            )
            
            # Video ABOUT Topic
            self.neo4j_client.create_video_about_topic_relationship(
                node_ids['video'], 
                node_ids['topic'],
                {'relevance_score': 1.0}
            )
            
            # Video FROM Source
            self.neo4j_client.create_video_from_source_relationship(
                node_ids['video'], 
                node_ids['source'],
                {'original_source': True}
            )
            
            logger.info("Created metadata relationships")
            
        except Exception as e:
            logger.error(f"Failed to create metadata relationships: {e}")
            raise
    
    def create_entity_relationships(self, video_id: str, entities: List[Dict[str, str]], 
                                   relations: List[tuple]):
        """
        Create relationships between video and entities, and between entities.
        
        Args:
            video_id: Video identifier
            entities: List of extracted entities
            relations: List of relationships between entities
        """
        try:
            # Create Video MENTIONS Entity relationships
            for entity in entities:
                self.neo4j_client.create_video_mentions_entity_relationship(
                    video_id,
                    entity['name'],
                    {'entity_type': entity['type'], 'extraction_confidence': 1.0}
                )
                print(f"Linked video {video_id} to entity {entity['name']}")
            
            # Create relationships between entities
            entity_relations = []
            for subject, relation, obj in relations:
                entity_relations.append({
                    'subject': subject,
                    'relation': relation,
                    'object': obj
                })
            
            if entity_relations:
                self.neo4j_client.create_entity_relationships(entity_relations)
            
            logger.info(f"Created {len(entities)} entity mentions and "
                       f"{len(entity_relations)} inter-entity relationships")
            
        except Exception as e:
            logger.error(f"Failed to create entity relationships: {e}")
            raise
    
    def process_video_summarization(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Complete pipeline to process video summarization and create knowledge graph.
        
        Args:
            payload: Video summarization payload
            
        Returns:
            Processing result with statistics and status
        """
        start_time = datetime.now()
        
        try:
            # Validate payload
            if not self.validate_payload(payload):
                raise ValueError("Invalid payload structure")
            
            # Extract basic info
            topic_name = payload['topic']['name'] if isinstance(payload['topic'], dict) else payload['topic']
            summarization = payload['summarization']
            
            logger.info(f"Processing video summarization for topic: {topic_name}")
            
            # Step 1: Extract knowledge graph from summarization
            kg_result = self.extract_knowledge_graph(topic_name, summarization)
            
            # Step 2: Upsert metadata nodes
            node_ids = self.upsert_metadata_nodes(payload)
            
            # Step 3: Upsert entities
            entity_names = self.upsert_entities(kg_result['entities'])
            
            # Step 4: Create metadata relationships
            self.create_metadata_relationships(node_ids)
            
            # Step 5: Create entity relationships
            self.create_entity_relationships(
                node_ids['video'], 
                kg_result['entities'], 
                kg_result['resolved_relations']
            )
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Get final statistics
            graph_stats = self.neo4j_client.get_graph_stats()
            
            result = {
                'status': 'success',
                'processing_time_seconds': processing_time,
                'extracted_entities': len(kg_result['entities']),
                'extracted_relations': len(kg_result['resolved_relations']),
                'upserted_entities': len(entity_names),
                'node_ids': node_ids,
                'graph_statistics': graph_stats,
                'kg_validation': kg_result['validation']
            }
            
            logger.info(f"Successfully processed video summarization in {processing_time:.2f}s")
            return result
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            error_result = {
                'status': 'error',
                'error_message': str(e),
                'processing_time_seconds': processing_time,
            }
            logger.error(f"Failed to process video summarization: {e}")
            return error_result


def process_video_summarization_json(json_payload: str) -> Dict[str, Any]:
    """
    Convenience function to process video summarization from JSON string.
    
    Args:
        json_payload: JSON string containing video summarization data
        
    Returns:
        Processing result
    """
    try:
        payload = json.loads(json_payload)
    except json.JSONDecodeError as e:
        return {
            'status': 'error',
            'error_message': f"Invalid JSON: {e}"
        }
    
    processor = VideoSummarizationProcessor()
    return processor.process_video_summarization(payload)


def process_video_summarization_dict(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convenience function to process video summarization from dictionary.
    
    Args:
        payload: Dictionary containing video summarization data
        
    Returns:
        Processing result
    """
    processor = VideoSummarizationProcessor()
    return processor.process_video_summarization(payload)


# Example payload structure for reference
EXAMPLE_PAYLOAD = {
    "user": {
        "user_id": "user_123",
        "name": "John Doe",
        "email": "john@example.com"
    },
    "video": {
        "video_id": "video_456",
        "title": "Introduction to Machine Learning",
        "description": "A comprehensive guide to ML basics",
        "duration": 1800,  # seconds
        "upload_date": "2025-11-10T10:00:00Z",
        "url": "https://example.com/video/456"
    },
    "topic": {
        "name": "Machine Learning",
        "description": "Artificial intelligence and data science topic",
        "category": "Technology"
    },
    "source": {
        "name": "TechEd Platform",
        "type": "Educational Platform",
        "url": "https://teched.example.com",
        "description": "Online learning platform for technology courses"
    },
    "summarization": """
    Machine Learning is a subset of Artificial Intelligence that enables computers to learn 
    without being explicitly programmed. The video covers fundamental concepts including 
    supervised learning, unsupervised learning, and reinforcement learning. Popular algorithms 
    discussed include linear regression, decision trees, and neural networks. Companies like 
    Google and Microsoft use machine learning extensively in their products. Key programming 
    languages for ML include Python and R, with libraries such as TensorFlow and scikit-learn 
    being widely adopted.
    """
}
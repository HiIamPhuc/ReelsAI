"""
Neo4j client for Knowledge Graph integration.

This module provides functionality to connect to Neo4j and upsert knowledge graphs
from video summarization data.
"""

import logging
from typing import Dict, List, Any, Optional
from neo4j import GraphDatabase, Driver
from django.conf import settings
import json

logger = logging.getLogger(__name__)


class Neo4jClient:
    """
    Neo4j database client for knowledge graph operations.
    """
    
    def __init__(self, uri: str = None, username: str = None, password: str = None):
        """
        Initialize Neo4j client.
        
        Args:
            uri: Neo4j URI (defaults to settings.NEO4J_URI)
            username: Neo4j username (defaults to settings.NEO4J_USERNAME)
            password: Neo4j password (defaults to settings.NEO4J_PASSWORD)
        """
        self.uri = uri or getattr(settings, 'NEO4J_URI', 'bolt://localhost:7687')
        self.username = username or getattr(settings, 'NEO4J_USERNAME', 'neo4j')
        self.password = password or getattr(settings, 'NEO4J_PASSWORD', 'password')
        
        self._driver: Optional[Driver] = None
        self._connect()
    
    def _connect(self):
        """Establish connection to Neo4j database."""
        try:
            self._driver = GraphDatabase.driver(
                self.uri, 
                auth=(self.username, self.password)
            )
            # Test connection
            with self._driver.session() as session:
                session.run("RETURN 1")
            logger.info(f"Successfully connected to Neo4j at {self.uri}")
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {e}")
            raise
    
    def close(self):
        """Close the Neo4j connection."""
        if self._driver:
            self._driver.close()
            logger.info("Neo4j connection closed")
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
    
    def test_connection(self) -> bool:
        """
        Test if connection to Neo4j is working.
        
        Returns:
            True if connection is successful, False otherwise
        """
        try:
            with self._driver.session() as session:
                result = session.run("RETURN 1 as test")
                return result.single()["test"] == 1
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return False
    
    def clear_database(self):
        """
        Clear all nodes and relationships from the database.
        WARNING: This deletes all data!
        """
        with self._driver.session() as session:
            session.run("MATCH (n) DETACH DELETE n")
            logger.warning("Database cleared - all nodes and relationships deleted")
    
    def create_indexes(self):
        """Create necessary indexes for better performance."""
        indexes = [
            "CREATE INDEX user_id_index IF NOT EXISTS FOR (u:User) ON (u.user_id)",
            "CREATE INDEX video_id_index IF NOT EXISTS FOR (v:Video) ON (v.video_id)",
            "CREATE INDEX topic_name_index IF NOT EXISTS FOR (t:Topic) ON (t.name)",
            "CREATE INDEX source_name_index IF NOT EXISTS FOR (s:Source) ON (s.name)",
            "CREATE INDEX entity_name_index IF NOT EXISTS FOR (e:Entity) ON (e.name)",
        ]
        
        with self._driver.session() as session:
            for index_query in indexes:
                try:
                    session.run(index_query)
                    logger.info(f"Created index: {index_query}")
                except Exception as e:
                    logger.warning(f"Index creation failed (may already exist): {e}")
    
    def upsert_user(self, user_data: Dict[str, Any]) -> str:
        """
        Upsert a User node.
        
        Args:
            user_data: Dictionary containing user information
            
        Returns:
            User ID
        """
        query = """
        MERGE (u:User {user_id: $user_id})
        SET u.name = $name,
            u.email = $email,
            u.created_at = $created_at,
            u.updated_at = datetime()
        RETURN u.user_id as user_id
        """
        
        with self._driver.session() as session:
            result = session.run(query, **user_data)
            return result.single()["user_id"]
    
    def upsert_video(self, video_data: Dict[str, Any]) -> str:
        """
        Upsert a Video node.
        
        Args:
            video_data: Dictionary containing video information
            
        Returns:
            Video ID
        """
        query = """
        MERGE (v:Video {video_id: $video_id})
        SET v.title = $title,
            v.description = $description,
            v.duration = $duration,
            v.upload_date = $upload_date,
            v.url = $url,
            v.updated_at = datetime()
        RETURN v.video_id as video_id
        """
        
        with self._driver.session() as session:
            result = session.run(query, **video_data)
            return result.single()["video_id"]
    
    def upsert_topic(self, topic_data: Dict[str, Any]) -> str:
        """
        Upsert a Topic node.
        
        Args:
            topic_data: Dictionary containing topic information
            
        Returns:
            Topic name
        """
        query = """
        MERGE (t:Topic {name: $name})
        SET t.description = $description,
            t.category = $category,
            t.updated_at = datetime()
        RETURN t.name as name
        """
        
        with self._driver.session() as session:
            result = session.run(query, **topic_data)
            return result.single()["name"]
    
    def upsert_source(self, source_data: Dict[str, Any]) -> str:
        """
        Upsert a Source node.
        
        Args:
            source_data: Dictionary containing source information
            
        Returns:
            Source name
        """
        query = """
        MERGE (s:Source {name: $name})
        SET s.type = $type,
            s.url = $url,
            s.description = $description,
            s.updated_at = datetime()
        RETURN s.name as name
        """
        
        with self._driver.session() as session:
            result = session.run(query, **source_data)
            return result.single()["name"]
    
    def upsert_entity(self, entity_data: Dict[str, Any]) -> str:
        """
        Upsert an Entity node.
        
        Args:
            entity_data: Dictionary containing entity information
            
        Returns:
            Entity name
        """
        query = """
        MERGE (e:Entity {name: $name})
        SET e.type = $type,
            e.description = $description,
            e.confidence = $confidence,
            e.updated_at = datetime()
        RETURN e.name as name
        """
        
        with self._driver.session() as session:
            result = session.run(query, **entity_data)
            return result.single()["name"]
    
    def create_user_cares_video_relationship(self, user_id: str, video_id: str, 
                                           properties: Dict[str, Any] = None):
        """
        Create CARES relationship between User and Video.
        
        Args:
            user_id: User identifier
            video_id: Video identifier
            properties: Optional relationship properties
        """
        query = """
        MATCH (u:User {user_id: $user_id})
        MATCH (v:Video {video_id: $video_id})
        MERGE (u)-[r:CARES]->(v)
        SET r.created_at = datetime(),
            r += $properties
        RETURN r
        """
        
        with self._driver.session() as session:
            session.run(query, 
                       user_id=user_id, 
                       video_id=video_id, 
                       properties=properties or {})
    
    def create_video_about_topic_relationship(self, video_id: str, topic_name: str,
                                            properties: Dict[str, Any] = None):
        """
        Create ABOUT relationship between Video and Topic.
        
        Args:
            video_id: Video identifier
            topic_name: Topic name
            properties: Optional relationship properties
        """
        query = """
        MATCH (v:Video {video_id: $video_id})
        MATCH (t:Topic {name: $topic_name})
        MERGE (v)-[r:ABOUT]->(t)
        SET r.created_at = datetime(),
            r += $properties
        RETURN r
        """
        
        with self._driver.session() as session:
            session.run(query,
                       video_id=video_id,
                       topic_name=topic_name,
                       properties=properties or {})
    
    def create_video_mentions_entity_relationship(self, video_id: str, entity_name: str,
                                                properties: Dict[str, Any] = None):
        """
        Create MENTIONS relationship between Video and Entity.
        
        Args:
            video_id: Video identifier
            entity_name: Entity name
            properties: Optional relationship properties
        """
        query = """
        MATCH (v:Video {video_id: $video_id})
        MATCH (e:Entity {name: $entity_name})
        MERGE (v)-[r:MENTIONS]->(e)
        SET r.created_at = datetime(),
            r += $properties
        RETURN r
        """
        
        with self._driver.session() as session:
            session.run(query,
                       video_id=video_id,
                       entity_name=entity_name,
                       properties=properties or {})
    
    def create_video_from_source_relationship(self, video_id: str, source_name: str,
                                            properties: Dict[str, Any] = None):
        """
        Create FROM relationship between Video and Source.
        
        Args:
            video_id: Video identifier
            source_name: Source name
            properties: Optional relationship properties
        """
        query = """
        MATCH (v:Video {video_id: $video_id})
        MATCH (s:Source {name: $source_name})
        MERGE (v)-[r:FROM]->(s)
        SET r.created_at = datetime(),
            r += $properties
        RETURN r
        """
        
        with self._driver.session() as session:
            session.run(query,
                       video_id=video_id,
                       source_name=source_name,
                       properties=properties or {})
    
    def create_entity_relationships(self, relations: List[Dict[str, Any]]):
        """
        Create relationships between entities based on extracted relations.
        
        Args:
            relations: List of relationship dictionaries with 'subject', 'relation', 'object'
        """
        for relation in relations:
            query = """
            MATCH (e1:Entity {name: $subject})
            MATCH (e2:Entity {name: $object})
            CALL apoc.create.relationship(e1, $relation_type, {
                created_at: datetime(),
                source: 'kg_extraction'
            }, e2) YIELD rel
            RETURN rel
            """
            
            with self._driver.session() as session:
                try:
                    session.run(query,
                               subject=relation['subject'],
                               object=relation['object'],
                               relation_type=relation['relation'].upper())
                except Exception as e:
                    # Fallback to creating a generic RELATED relationship if APOC is not available
                    fallback_query = """
                    MATCH (e1:Entity {name: $subject})
                    MATCH (e2:Entity {name: $object})
                    MERGE (e1)-[r:RELATED]->(e2)
                    SET r.relation_type = $relation_type,
                        r.created_at = datetime(),
                        r.source = 'kg_extraction'
                    RETURN r
                    """
                    session.run(fallback_query,
                               subject=relation['subject'],
                               object=relation['object'],
                               relation_type=relation['relation'])
    
    def get_graph_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the graph database.
        
        Returns:
            Dictionary containing graph statistics
        """
        queries = {
            'total_nodes': "MATCH (n) RETURN count(n) as count",
            'total_relationships': "MATCH ()-[r]->() RETURN count(r) as count",
            'users': "MATCH (n:User) RETURN count(n) as count",
            'videos': "MATCH (n:Video) RETURN count(n) as count",
            'topics': "MATCH (n:Topic) RETURN count(n) as count",
            'sources': "MATCH (n:Source) RETURN count(n) as count",
            'entities': "MATCH (n:Entity) RETURN count(n) as count",
        }
        
        stats = {}
        with self._driver.session() as session:
            for stat_name, query in queries.items():
                result = session.run(query)
                stats[stat_name] = result.single()["count"]
        
        return stats
    
    def search_entities(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for entities by name.
        
        Args:
            query: Search query
            limit: Maximum number of results
            
        Returns:
            List of entity dictionaries
        """
        search_query = """
        MATCH (e:Entity)
        WHERE toLower(e.name) CONTAINS toLower($query)
        RETURN e.name as name, e.type as type, e.description as description
        ORDER BY e.name
        LIMIT $limit
        """
        
        with self._driver.session() as session:
            result = session.run(search_query, query=query, limit=limit)
            return [dict(record) for record in result]
    
    def get_video_knowledge_graph(self, video_id: str) -> Dict[str, Any]:
        """
        Get the complete knowledge graph for a specific video.
        
        Args:
            video_id: Video identifier
            
        Returns:
            Dictionary containing nodes and relationships
        """
        query = """
        MATCH (v:Video {video_id: $video_id})-[r]-(n)
        RETURN v, r, n
        """
        
        nodes = []
        relationships = []
        
        with self._driver.session() as session:
            result = session.run(query, video_id=video_id)
            
            for record in result:
                # Add video node
                video_node = dict(record["v"])
                video_node["labels"] = ["Video"]
                if video_node not in nodes:
                    nodes.append(video_node)
                
                # Add connected node
                connected_node = dict(record["n"])
                connected_node["labels"] = list(record["n"].labels)
                if connected_node not in nodes:
                    nodes.append(connected_node)
                
                # Add relationship
                rel = dict(record["r"])
                rel["type"] = record["r"].type
                rel["start"] = video_node
                rel["end"] = connected_node
                relationships.append(rel)
        
        return {
            "nodes": nodes,
            "relationships": relationships
        }
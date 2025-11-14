"""
Knowledge Graph Constructor Module

LLM-powered knowledge graph construction pipeline using LangGraph and NetworkX.
"""

from .kg_constructor import (
    run_knowledge_graph_pipeline,
    build_kg_graph,
    visualize_graph,
    KGState,
    ENTITY_TYPES,
    ENTITY_EXTRACTOR_PROMPT,
    RELATION_EXTRACTOR_PROMPT,
    ENTITY_RESOLVER_PROMPT,
)

__version__ = "2.0.0"

__all__ = [
    "run_knowledge_graph_pipeline",
    "build_kg_graph",
    "visualize_graph",
    "KGState",
    "ENTITY_TYPES",
    "ENTITY_EXTRACTOR_PROMPT",
    "RELATION_EXTRACTOR_PROMPT",
    "ENTITY_RESOLVER_PROMPT",
]

from qdrant_client import QdrantClient, models

client = QdrantClient(host="qdrant",port=6333)

def create_collection():

    if client.collection_exists(collection_name="image_embeddings"):
        return
    else:
        client.create_collection(
            collection_name="image_embeddings",
            vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE)
        )

def check_collection_exists():
    return client.collection_exists(collection_name="image_embeddings")
from qdrant_client import QdrantClient, models

client = QdrantClient(host="qdrant", port=6333)


def insert_vector(vector, metadata):

    client.upsert(
        collection_name="image_embeddings",
        points=[
            models.PointStruct(
                id=metadata["id"],
                payload=metadata,
                vector=vector
            )
        ]
    )


def delete_vector(vector, metadata):

    client.delete(
        collection_name="image_embeddings",
        points_selector=models.PointIdsList(
            points=[metadata["id"]]
        )
    )

def search_similar(vector,metadata):

    category = "lost" if metadata["category"] == "found" else "found"

    response = client.query_points(
        collection_name="image_embeddings",
        query=vector,
        limit=5,
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="category",match=models.MatchValue(value=category)
                )
            ]
        ),
        with_payload=True,
        with_vectors=False
    )
    return response
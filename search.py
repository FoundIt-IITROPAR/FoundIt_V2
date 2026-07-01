from config import *

def search(index,embeddings,paths):

    for i,path in enumerate(paths):

        query = embeddings[i].reshape(1,-1)

        similarity,indexes = index.search(query,TOP_K)

        print()

        print("Query:",path)

        for score,idx in zip(similarity[0],indexes[0]):

            if idx==i:
                continue

            print(paths[idx],f"{score*100:.2f}%")
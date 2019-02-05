import sys
import json
from sklearn.cluster import KMeans
import numpy as np

if (len(sys.argv) > 1):

    # handle arguments
    inputDataFileName = sys.argv[1]
    outputDataFileName = sys.argv[2]
    nClusters = int(sys.argv[3])

    # read input file
    inputDataFile = open(inputDataFileName, "r")
    inputDataStr = inputDataFile.read()
    inputDataFile.close()
    inputData = json.loads(inputDataStr)

    # do computations
    X=np.array(inputData)
    kmeans = KMeans(n_clusters=nClusters, random_state=0).fit(X)
    labels = kmeans.labels_.tolist()

    # write output file
    outputDataStr = json.dumps(labels)
    outputDataFile = open(outputDataFileName, "w")
    outputDataFile.write(outputDataStr)
    outputDataFile.close()

sys.stdout.flush()

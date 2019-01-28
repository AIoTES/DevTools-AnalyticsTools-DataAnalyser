function kmeans(data, options) {
    var points = data.map(d => options.attributes.map(a => d[a]));
    console.log(points);

    console.log({
        numClusters: options.nClusters,
        distanceType: "euclidean",
        maxIterations: 100
    });

    return d3.json('http://160.40.50.209:8282/Var_Lab_Services/clustering/kmeans', {
        method:"POST",
        body: JSON.stringify({
            points: points,
            options: {
                numClusters: options.nClusters,
                distanceType: "euclidean",
                maxIterations: 100
            }
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(res => {
        console.log(res);
        var dataEnhanced = data.map((d, i) => ({
            ...d,
            clusterLabel: res.clusterLabels[i]
        }));
        return dataEnhanced;
    });
}
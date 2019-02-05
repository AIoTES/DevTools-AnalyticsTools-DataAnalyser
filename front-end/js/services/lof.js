function lof(data, options) {
	console.log(options);
	var points = data.map(d => options.attributes.map(a => d[a]));
	var lofData = points
		.map(p => lofSingle(p, options.nNeigh, points));
	var dataEnhanced = data.map((d, i) => ({
		...d,
		anomalyScore: lofData[i],
		anomalyLabel: lofData[i] > 1.5 ? "Outlier" : "Regular"
	}));
	return Promise.resolve(dataEnhanced);
}
		
function dist(p1, p2) {
	var d = 0;
	for (var i=0; i<p1.length; i++) {
		d += (p1[i] - p2[i]) * (p1[i] - p2[i])
	}
	return Math.sqrt(d);
}

function kDistance(p, k, points) {
	var distances = points.map((d, i) => ({index: i, distance: dist(p, d)}));
	distances = distances.sort(function(x, y) {
		// return d3.ascending(x.distance, y.distance);
		return x.distance > y.distance;
	});			
	return distances[k - 1].distance;
}

function reachabilityDistance(p1, p2, k, points) {
	return Math.max(kDistance(p2, k, points), dist(p1, p2));
}

function lrd(p, k, points) {
	var distances = points.map((d, i) => ({index: i, distance: dist(p, d)}));
	distances = distances.sort(function(x, y) {
		// return d3.ascending(x.distance, y.distance);
		return x.distance > y.distance;
	});
	var sum = 0;
	for (var i=0; i<k; i++) {
		sum += reachabilityDistance(p, points[distances[i].index], k, points);
	}
	return k / sum;
}

function lofSingle(p, k, points) {
	var distances = points.map((d, i) => ({index: i, distance: dist(p, d)}));
	distances = distances.sort(function(x, y) {
		// return d3.ascending(x.distance, y.distance);
		return x.distance > y.distance;
	});
	var sum = 0;
	for (var i=0; i<k; i++) {
		sum += lrd(points[distances[i].index], k, points);
	}
	return sum / (k * lrd(p, k, points));
}

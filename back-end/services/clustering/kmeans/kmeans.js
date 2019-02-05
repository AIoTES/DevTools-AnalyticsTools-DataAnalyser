const utilities = require("../../../utilities");

module.exports = {

	kmeans: async function(data, options) {
        let points = data.map(d => options.attributes.map(a => d[a]));
        let labels = await utilities.runPythonScript(__dirname + '/kmeans.py', points, [options.nClusters]);
        let dataEnhanced = data.map((d, i) => ({...d, clusterLabel: labels[i]}));
        return dataEnhanced;
	}

};

var rawData;
var currentData;

var rawDataTable;
var outputTable;

var outputRecords;
var outputColumns;
var outputArr;

var dataLoaders = {
	"application/json": file => d3.json(file),
	"application/vnd.ms-excel": file => {
		return d3.csv(file).then(data => {
			var dataParsed = data.map(d => {
				var obj = {};
				for (key in d) {
					if (+d[key]) {
						obj[key] = +d[key];
					}
					else {
						obj[key] = d[key];
					}
				}
				return obj;
			});
			return dataParsed;
		});
	}
};

function uploadFile() {	
	var fileInfo = document.getElementById("fileToUpload").files[0];
	var file = "data/" + fileInfo.name;
	
	document.getElementById("spinner").style.visibility = "visible";

	dataLoaders[fileInfo.type](file).then(data => {
		// rawData = data.map(d => {
        //     if (d.room)
        //         return d;
        //     else {
        //         d.room = "no_room";
        //         return d;
        //     }
		// });
		rawData = data;
		currentData = data;
		if (rawDataTable && $.fn.DataTable.isDataTable(rawDataTable.table().node())) {
			rawDataTable.destroy();
		}
		$("#analyticsResultsDiv #dataTable").html("");
		if (outputTable && $.fn.DataTable.isDataTable(outputTable.table().node())) {
			outputTable.destroy();
		}
		$("#analyticsResultsDiv #outputTable").html("");
		rawDataTable = $('#dataTable').DataTable( {
			data: data.map(d => Object.values(d)),
			columns: Object.keys(data[0]).map(d => ({title: d}))
		} );		
		document.getElementById("spinner").style.visibility = "hidden";
		document.getElementById("rawDataDiv").style.visibility = "visible";
		document.getElementById("analysisTypeDiv").style.visibility = "visible";

		closeAllAnalyses();
	});
}

var populateMethods = {
	summarization: populateSummarization,
	histogram: populateHistogram,
	lof: populateLof,
	kmeans: populateKmeans
}


// Summarization

function populateSummarization() {
	fillSelectInput("#summarizationAttrSelect", Object.keys(currentData[0]));
}

function generateSummarization() {
	var summarizationAttr = document.querySelector("#summarizationAttrSelect").value;

	var serviceCall = summary(currentData, {attribute: summarizationAttr});	
	serviceCall.then(output => {
		
		var columns = Object.keys(output);
		var arr = [Object.values(output).map(d => Math.round(d * 100) / 100)];
		
		outputRecords = output;
		outputColumns = columns;
		outputArr = arr;
		
		if (outputTable && $.fn.DataTable.isDataTable(outputTable.table().node())) {
			outputTable.destroy();
		}
		$("#analyticsResultsDiv #outputTable").html("");
		outputTable = $('#outputTable').DataTable( {
			data: arr,
			columns: columns.map(d => ({title: d}))
		} );
		
		document.getElementById("analyticsResultsDiv").style.visibility = "visible";

		resetSelectBoxes();
	});
}


// Histogram

function populateHistogram() {
	fillSelectInput("#histogramEntitySelect", Object.keys(currentData[0]));
	fillSelectInput("#histogramAttributeSelect", Object.keys(currentData[0]));
}

function generateHistograms() {	
	var entityAttr = document.querySelector("#histogramEntitySelect").value;
	var histogramAttr = document.querySelector("#histogramAttributeSelect").value;
	
	var bins = [... new Set(currentData.map(d => d[histogramAttr]))];

	// main logic
	var groups = d3.nest().key(d => d[entityAttr]).entries(currentData);
	outputRecords = groups.map(g => ({
		group: g.key,
		feature: computeHistogram(g.values.map(d => d[histogramAttr]), bins)
	}));
	
	var columns = ["entity"].concat(bins);
	var arr = outputRecords.map(d => [d.group].concat(d.feature));

	console.log(columns);
	console.log(arr);
	
	outputColumns = columns;
	outputColumns = arr;
	
	if (outputTable && $.fn.DataTable.isDataTable(outputTable.table().node())) {
		outputTable.destroy();
	}
	$("#analyticsResultsDiv #outputTable").html("");
	outputTable = $('#outputTable').DataTable( {
		data: arr,
		columns: columns.map(d => ({title: d}))
	} );
	
	document.getElementById("analyticsResultsDiv").style.visibility = "visible";

	resetSelectBoxes();
}

function computeHistogram(values, bins) {
	var histogram = bins.map(bin => values.filter(d => d == bin).length);
	return histogram;
}




// LOF

function populateLof() {
	fillSelectInput("#lofAttrSelect", Object.keys(currentData[0]));
	document.getElementById("lofNneighText").value = 3;
}

function generateLof() {
	console.log(currentData);
	// document.getElementById("lofSpinner").style.visibility = "visible";

	// var lofAttr = document.querySelector("#lofAttrSelect").value;
	var lofAttrs = $('#lofAttrSelect').val();
	var nNeigh = parseInt(document.getElementById("lofNneighText").value);

	var serviceCall = lof(currentData, {
		// attributes: [lofAttr],
		attributes: lofAttrs,
		nNeigh: nNeigh
	});
	serviceCall.then(output => {

		// console.log(output);
		
		var columns = Object.keys(output[0]);
		var arr = output.map(d => Object.values(d));
		
		outputRecords = output;
		outputColumns = columns;
		outputArr = arr;
		
		// // document.getElementById("spinner").style.visibility = "hidden";
		// if (outputTable) {
		// 	console.log("Destroying output table", outputTable);
		// 	outputTable.destroy();
		// 	$("#analyticsResultsDiv #outputTable").html("");
		// }
		if (outputTable && $.fn.DataTable.isDataTable(outputTable.table().node())) {
			outputTable.destroy();
		}
		$("#analyticsResultsDiv #outputTable").html("");
		console.log(arr);
		console.log(columns);
		outputTable = $('#outputTable').DataTable( {
			data: arr,
			columns: columns.map(d => ({title: d}))
		} );
		console.log("Created output table", outputTable);
		
		document.getElementById("analyticsResultsDiv").style.visibility = "visible";

		resetSelectBoxes();
	});
}


// K-means

function populateKmeans() {
	fillSelectInput("#kmeansAttrSelect", Object.keys(currentData[0]));
	fillSelectInput("#kmeansNclustersSelect", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
}

function generateKmeans() {
	// console.log(currentData);
	// document.getElementById("lofSpinner").style.visibility = "visible";

	var kmeansAttrs = $('#kmeansAttrSelect').val();
	var nClusters = parseInt($('#kmeansNclustersSelect').val());
	console.log(nClusters);

	// var lofAttr = document.querySelector("#lofAttrSelect").value;

	var serviceCall = kmeans(currentData, {
		attributes: kmeansAttrs,
		nClusters: nClusters
	});
	serviceCall.then(output => {
		
		var columns = Object.keys(output[0]);
		var arr = output.map(d => Object.values(d));
		
		outputRecords = output;
		outputColumns = columns;
		outputArr = arr;
		
		if (outputTable && $.fn.DataTable.isDataTable(outputTable.table().node())) {
			outputTable.destroy();
		}
		$("#analyticsResultsDiv #outputTable").html("");
		outputTable = $('#outputTable').DataTable( {
			data: arr,
			columns: columns.map(d => ({title: d}))
		} );
		
		document.getElementById("analyticsResultsDiv").style.visibility = "visible";

		resetSelectBoxes();
	});
}




function useHistogramResults() {
	currentData = outputRecords;
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function exportResults(selectID) {
	// var select = document.getElementById("exportFormatSelect");
	var select = document.getElementById(selectID);
	console.log(select);
	console.log(select.selectedIndex);

	var method = select.options[select.selectedIndex].value;
	console.log(method);
	
	if (method == "csv") {
		var header = outputColumns.join();
		var rows = outputArr.map(d => d.join());
		var str = header + "\r\n" + rows.join("\r\n");
		download("results.csv", str);
	}
	else if (method == "json") {
		download("results.json", JSON.stringify(outputRecords));
	}
	else if (method == "nvd3_json") {
		var nvd3Data = [{
			key: "Results",
			values: outputRecords
		}];
		download("results.json", JSON.stringify(nvd3Data));
	}
}

function featureExtractionSelected() {
	var select = document.getElementById("featureExtractionSelect");
	var method = select.options[select.selectedIndex].value;
	openAnalysis(method);
	populateMethods[method]();
}

function featureSelectionSelected() {
	var select = document.getElementById("featureSelectionSelect");
	var method = select.options[select.selectedIndex].value;	
	openAnalysis(method);
}

function anomalyDetectionSelected() {
	var select = document.getElementById("anomalyDetectionSelect");
	var method = select.options[select.selectedIndex].value;	
	openAnalysis(method);
	populateMethods[method]();
}

function probabilisticPredictionSelected() {
	var select = document.getElementById("probabilisticPredictionSelect");
	var method = select.options[select.selectedIndex].value;	
	openAnalysis(method);
}

function timeseriesPredictionSelected() {
	var select = document.getElementById("timeseriesPredictionSelect");
	var method = select.options[select.selectedIndex].value;	
	openAnalysis(method);
}

function clusteringSelected() {
	var select = document.getElementById("clusteringSelect");
	var method = select.options[select.selectedIndex].value;	
	openAnalysis(method);
	populateMethods[method]();
}

function hypothesisTestingSelected() {
	var select = document.getElementById("hypothesisTestingSelect");
	var method = select.options[select.selectedIndex].value;	
	openAnalysis(method);
}

function fillSelectInput(selector, values) {
	let options = d3.select(selector).selectAll("option")
		.data(values);
	options
		.attr("value", d => d)
		.text(d => d);
	options.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	options.exit().remove();
}

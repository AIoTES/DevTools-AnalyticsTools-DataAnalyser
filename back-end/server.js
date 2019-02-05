var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var showdown = require('showdown');
var showdownMath = require('showdown-math');
var Ajv = require('ajv');
var utilities = require('./utilities');
var cors = require('cors');


// Initialize application and libraries
// -----------------------------------------------------------------------------------

var app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

showdown.extension('showdown-math', showdownMath);
var showdownConverter = new showdown.Converter({extensions: ['showdown-math']});

var ajv = new Ajv();


// Load service definitions
// -----------------------------------------------------------------------------------

var servicesFile = './services/services.json';
if (!fs.existsSync(servicesFile)) {
	console.log("ERROR: services.json does not exist.");
	process.exit(1);
}
var services = JSON.parse(fs.readFileSync(servicesFile).toString());


// Create API
// -----------------------------------------------------------------------------------

// Single service
services.forEach(service => {
	// Actual service call
	app.post('/' + service.name, function (req, res) {
		let input = req.body;
		runService(service.name, input).then(output => {
			res.set('Content-Type', "application/json");
			res.end(JSON.stringify(output));
		});
	});
	// Service description (schema and examples)
	app.get('/' + service.name + '/desc', function (req, res) {
		let descFile = __dirname + '/' + service.path + '/desc.json';
		if (fs.existsSync(descFile)) {
			res.sendFile('desc.json', {root: __dirname + '/' + service.path});
		}
		else {
			res.end("No service description available.");
		}
	});
	// Theoretical information about service
	app.get('/' + service.name + '/info', function (req, res) {
		let infoFile = __dirname + '/' + service.path + '/info.md';
		if (fs.existsSync(infoFile)) {
			let markdownStr = fs.readFileSync(infoFile).toString();
			let str = `
				<html>
					<head>
						<meta charset="utf-8">
						<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.9.0/dist/katex.min.css" integrity="sha384-TEMocfGvRuD1rIAacqrknm5BQZ7W7uWitoih+jMNFXQIbNl16bO8OZmylH/Vi/Ei" crossorigin="anonymous">
						<link rel="stylesheet" href="${req.protocol}://${req.get('host')}/css/markdown.css">
					</head>
					<body>
						<div id="mainContent">
							${showdownConverter.makeHtml(markdownStr)}
						</div>
					</body>
				</html>
			`;
			res.end(str);
		}
		else {
			res.end("No service information available.");
		}
	});
});

// Complete analysis
app.post('/analysis', function (req, res) {
	let analysis = req.body;
	runAnalysis(analysis).then(output => {
		res.set('Content-Type', 'application/json');		
		res.end(JSON.stringify(output));
	});
});

// single step
app.post('/step/:stepID', function (req, res) {
	let analysis = req.body;
	let step = analysis.find(d => d.id == req.params.stepID);
	runStep(analysis, step).then(output => {
		res.set('Content-Type', 'application/json');		
		res.end(JSON.stringify(analysis));
	});
});

module.exports = app;		// for testing


// Start server
// -----------------------------------------------------------------------------------

var server = app.listen(8081, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("Data analysis server listening at http://%s:%s", host, port);
});


// Functions
// -----------------------------------------------------------------------------------

// Runs a service after validating input and returns a promise with the result (either actual result or error).
async function runService(serviceName, input) {
	let service = services.find(d => d.name == serviceName);
	if (!service) {
		return {error: "Service '" + serviceName + "' does not exist."}
	}
	
	let descFile = __dirname + '/' + service.path + '/desc.json';

	let output = {};
	try {
		// check if input is valid according to input schema
		let descStr = await utilities.readFilePromise(descFile);
		let descJSON = JSON.parse(descStr);
		let inputIsValid = ajv.validate(descJSON.inputSchema, input);
		if (!inputIsValid) {
			return {error: "Input uses invalid schema.", source: service.name, details: ajv.errors}
		}
		// run service
		let serviceMod = require(service.path + '/' + service.name);
		output = await serviceMod[service.name](input.data, input.options);
	} catch(e) {
		console.log(`[${serviceName}] ERROR:`);
		console.log(e);
	}	
	return output;
}

// Executes a non-sequential analysis
async function runAnalysis(analysis) {
	for (step of analysis) {
		await runStep(analysis, step);
	}
	return analysis;
}

// Executes a step of an analysis
async function runStep(analysis, step) {
	if (step.output) {
		return step.output;
	}
	
	if (!step.service) {
		step.output = {error: "No service provided to run.", source: step.id};
		return step.output;
	}

	let replacements = await resolveDependencies(analysis, step.input);
	for (key in replacements) {
		if (replacements[key] == null) {
			step.output = {error: `Step reference '${key}' does not exist.`, source: step.id};
			return step.output;
		}
	}

	let input = JSON.stringify(step.input).replace(/"&(.+?)"/g, (match, p1) => {
		return replacements[p1];
	});
	step.output = await runService(step.service, JSON.parse(input));
	return step.output;
}

// Resolves dependencies of step input
async function resolveDependencies(analysis, input) {
	let refs = [];
	let matches = JSON.stringify(input).match(/"&(.+?)"/g);
	if (matches) {
		refs = [... new Set(matches.map(d => d.replace(/["&]/g, "")))];
	}
	// let refs = [... new Set(
	// 	JSON.stringify(input)
	// 	.match(/"&(.+?)"/g)
	// 	.map(d => d.replace(/["&]/g, ""))
	// )];
	let replacements = {};
	for (let ref of refs) {
		let refStep = analysis.find(d => d.id == ref);
		if (refStep) {
			let dep = await runStep(analysis, refStep);
			replacements[ref] = JSON.stringify(dep);
		}
		else {
			replacements[ref] = null;
		}
	}
	return replacements;
}

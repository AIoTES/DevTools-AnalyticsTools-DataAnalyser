function summary(data, options) {
    var values = data.map(d => d[options.attribute]);

    let output = {
        count: values.length,
        min: d3.min(values),
        max: d3.max(values),
        mean: d3.mean(values),
        median: d3.median(values),
        perc25: d3.quantile(values, 0.25),
        perc75: d3.quantile(values, 0.75),
        stdev: d3.deviation(values),
        skewness: moment(values, 3),
        kyrtosis: moment(values, 4)
    }

    return Promise.resolve(output);
}

// Computes a standardized moment of a set of values.
function moment(values, degree) {
    let mu = d3.mean(values);
    let sigma = d3.deviation(values);
    let powered = values.map(d => Math.pow((d - mu) / sigma, degree));
    return d3.mean(powered);
}

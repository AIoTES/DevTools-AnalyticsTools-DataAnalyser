module.exports = {

    line: function(data, options) {            
        var colorAttr = null;
        if (options.color.startsWith("$")) {
            colorAttr = options.color.substr(1);
        }

        var vegaDesc = `
            {
                "$schema": "https://vega.github.io/schema/vega/v4.json",
                "width": ${options.width},
                "height": ${options.height},
                "padding": 5,
            
                "data": [
                    {
                        "name": "source",
                        "values": ${JSON.stringify(data)}
                    }
                ],
            
                "scales": [
                    {
                        "name": "x",
                        "type": "linear",
                        "range": "width",
                        "nice": true,
                        "zero": true,
                        "domain": {"data": "source", "field": "${options.xAttr}"}
                    },
                    {
                        "name": "y",
                        "type": "linear",
                        "range": "height",
                        "nice": true,
                        "zero": true,
                        "domain": {"data": "source", "field": "${options.yAttr}"}
                    }${colorAttr ? `,
                    {
                        "name": "color",
                        "type": "ordinal",
                        "domain": {"data": "source", "field": "${colorAttr}", "sort": true},
                        "range": {"scheme": "category10"}
                    }
                    ` : ``}
                ],
            
                "axes": [
                    {"orient": "bottom", "scale": "x"},
                    {"orient": "left", "scale": "y"}
                ],

                ${colorAttr ? `
                "legends": [
                    {
                        "fill": "color",
                        "title": "${colorAttr}",
                        "padding": 4,
                        "encode": {
                            "symbols": {
                                "enter": {
                                    "size": {"value": 50}
                                }
                            }
                        }
                    }
                ],
                ` : ``}
            
                "marks": [
                    {
                        "type": "line",
                        "from": {"data": "source"},
                        "encode": {
                            "enter": {
                                "x": {"scale": "x", "field": "${options.xAttr}"},
                                "y": {"scale": "y", "field": "${options.yAttr}"},
                                "stroke": {"value": "gray"},
                                "strokeWidth": {"value": 1}
                            },
                            "update": {
                                "fillOpacity": {"value": 1}
                            },
                            "hover": {
                                "fillOpacity": {"value": 0.5}
                            }
                        }
                    },
                    {
                        "name": "marks",
                        "type": "symbol",
                        "from": {"data": "source"},
                        "encode": {
                            "update": {
                                "x": {"scale": "x", "field": "${options.xAttr}"},
                                "y": {"scale": "y", "field": "${options.yAttr}"},
                                "shape": {"value": "circle"},
                                "strokeWidth": {"value": 1},
                                ${colorAttr ? `
                                "stroke": {"scale": "color", "field": "${colorAttr}"}
                                ` : `
                                "stroke": {"value": "${options.color}"}
                                `},
                                "fill": "white"
                            }
                        }
                    }
                ]
            }
        `;

        return Promise.resolve(JSON.parse(vegaDesc));
    }

};
    
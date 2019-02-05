module.exports = {
    
        // data: array of label-value objects
        // options: {
        //		color: bar color
        // }
        bar2: function(data, options) {
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
                                
                    "signals": [
                        {
                            "name": "tooltip",
                            "value": {},
                            "on": [
                                {"events": "rect:mouseover", "update": "datum"},
                                {"events": "rect:mouseout",  "update": "{}"}
                            ]
                        }
                        ${options.linkedFiltering.map(f => `
                            ,{
                                "name": "${f.signal}",
                                "value": [0, 0]
                            }
                        `.trim()).join('')}
                    ],

                    "data": [
                        {
                            "name": "table",
                            "values": ${JSON.stringify(data)},
                            "transform": [
                                ${options.linkedFiltering.map(f => `
                                    {
                                        "type": "filter",
                                        "expr": "${f.signal}[1] == ${f.signal}[0] ? 1 : datum.${f.attribute} >= min(${f.signal}[0], ${f.signal}[1]) && datum.${f.attribute} <= max(${f.signal}[0], ${f.signal}[1])"
                                    },
                                `.trim()).join('')}
                                {
                                    "type": "bin",
                                    "field": "${options.attribute}",
                                    "extent": ${JSON.stringify(options.domain)},
                                    "maxbins": ${options.bins}
                                },
                                {
                                    "type": "aggregate",
                                    "key": "bin0", "groupby": ["bin0", "bin1"],
                                    "fields": ["bin0"], "ops": ["count"], "as": ["count"]
                                }
                            ]
                        }
                    ],
                
                    "scales": [
                        {
                            "name": "xscale",
                            "type": "linear",
                            "domain": ${JSON.stringify(options.domain)},
                            "range": "width"
                        },
                        {
                            "name": "yscale",
                            "domain": {"data": "table", "field": "count"},
                            "nice": true,
                            "range": "height"
                        }${colorAttr ? `,
                        {
                            "name": "color",
                            "type": "ordinal",
                            "domain": {"data": "table", "field": "${colorAttr}", "sort": true},
                            "range": {"scheme": "category10"}
                        }
                        ` : ``}
                    ],
                
                    "axes": [
                        { "orient": "bottom", "scale": "xscale" },
                        { "orient": "left", "scale": "yscale" }
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
                            "type": "rect",
                            "from": {"data": "table"},
                            "encode": {
                                "update": {
                                    "x": {"scale": "xscale", "field": "bin0"},
                                    "x2": {"scale": "xscale", "field": "bin1"},
                                    "y": {"scale": "yscale", "field": "count"},
                                    "y2": {"scale": "yscale", "value": 0},
                                    "stroke": {"value": "white"},
                                    ${colorAttr ? `
                                    "fill": {"scale": "color", "field": "${colorAttr}"}
                                    ` : `
                                    "fill": {"value": "${options.color}"}
                                    `}
                                },
                                "hover": {
                                    "fill": {"value": "red"}
                                }
                            }
                        },
                        {
                            "type": "text",
                            "encode": {
                                "enter": {
                                    "align": {"value": "center"},
                                    "baseline": {"value": "bottom"},
                                    "fill": {"value": "#333"}
                                },
                                "update": {
                                    "x": {"scale": "xscale", "signal": "tooltip.bin0", "band": 0.5},
                                    "y": {"scale": "yscale", "signal": "tooltip.count", "offset": -2},
                                    "text": {"signal": "tooltip.count"},
                                    "fillOpacity": [
                                        {"test": "datum === tooltip", "value": 0},
                                        {"value": 1}
                                    ]
                                }
                            }
                        }
                    ]
                }
            `;

            return Promise.resolve(JSON.parse(vegaDesc));
        }
    
    };
    
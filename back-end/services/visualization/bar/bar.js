module.exports = {
    
        // data: array of label-value objects
        // options: {
        //		color: bar color
        // }
        bar: function(data, options) {
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
                            "name": "table",
                            "values": ${JSON.stringify(data)}
                        }
                    ],
                
                    "signals": [
                        {
                            "name": "tooltip",
                            "value": {},
                            "on": [
                                {"events": "rect:mouseover", "update": "datum"},
                                {"events": "rect:mouseout",  "update": "{}"}
                            ]
                        }
                    ],
                
                    "scales": [
                        {
                            "name": "xscale",
                            "type": "band",
                            "domain": {"data": "table", "field": "${options.xAttr}"},
                            "range": "width",
                            "padding": 0.05,
                            "round": true
                        },
                        {
                            "name": "yscale",
                            "domain": {"data": "table", "field": "${options.yAttr}"},
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
                                "enter": {
                                    "x": {"scale": "xscale", "field": "${options.xAttr}"},
                                    "width": {"scale": "xscale", "band": 1},
                                    "y": {"scale": "yscale", "field": "${options.yAttr}"},
                                    "y2": {"scale": "yscale", "value": 0}
                                },
                                "update": {
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
                                    "x": {"scale": "xscale", "signal": "tooltip.${options.xAttr}", "band": 0.5},
                                    "y": {"scale": "yscale", "signal": "tooltip.${options.yAttr}", "offset": -2},
                                    "text": {"signal": "tooltip.${options.yAttr}"},
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
    
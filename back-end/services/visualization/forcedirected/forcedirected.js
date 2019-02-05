module.exports = {
    
        // data: graph object (nodes and edges)
        // options: {
        //		color: node color
        // }
        forcedirected: function(data, options) {
            // {"name": "nodeRadius", "value": 8, "bind": {"input": "range", "min": 1, "max": 50, "step": 1} },
            // {"name": "nodeCharge", "value": -10, "bind": {"input": "range", "min":-100, "max": 10, "step": 1} },
            // {"name": "linkDistance", "value": 5, "bind": {"input": "range", "min": 5, "max": 100, "step": 1} },
            // {"name": "static", "value": false, "bind": {"input": "checkbox"} },
            
            // {"name": "nodeRadius", "value": 5},
            // {"name": "nodeCharge", "value": -3},
            // {"name": "linkDistance", "value": 1},

            // {"force": "collide", "radius": {"signal": "nodeRadius"}},
            
            var colorAttr = null;
            if (options.color.startsWith("$")) {
                colorAttr = options.color.substr(1);
            }

            var sizeFactor = 1.0 / data.nodes.length * 240;
            
            var vegaDesc = `
                {
                    "$schema": "https://vega.github.io/schema/vega/v4.json",
                    "width": ${options.width},
                    "height": ${options.height},
                    "padding": 0,
                    "autosize": "none",
                
                    "signals": [
                        {"name": "cx", "update": "width / 2" },
                        {"name": "cy", "update": "height / 2" },
                        {"name": "nodeRadius", "value": ${5 * Math.max(sizeFactor / 10, 1)}},
                        {"name": "nodeCharge", "update": "-width/300 * ${sizeFactor}"},
                        {"name": "linkDistance", "value": 1},
                        {"name": "linkStrength", "value": 1},
                        {"name": "static", "value": false},
                        {
                            "description": "State variable for active node fix status.",
                            "name": "fix", "value": false,
                            "on": [
                                {
                                    "events": "symbol:mouseout[!event.buttons], window:mouseup",
                                    "update": "false"
                                },
                                {
                                    "events": "symbol:mouseover",
                                    "update": "fix || true"
                                },
                                {
                                    "events": "[symbol:mousedown, window:mouseup] > window:mousemove!",
                                    "update": "xy()",
                                    "force": true
                                }
                            ]
                        },
                        {
                            "description": "Graph node most recently interacted with.",
                            "name": "node", "value": null,
                            "on": [
                                {
                                    "events": "symbol:mouseover",
                                    "update": "fix === true ? item() : node"
                                }
                            ]
                        },
                        {
                            "description": "Flag to restart Force simulation upon data changes.",
                            "name": "restart", "value": false,
                            "on": [
                                {"events": {"signal": "fix"}, "update": "fix && fix.length"}
                            ]
                        }
                    ],
                
                    "data": [
                        {
                            "name": "node-data",
                            "values": ${JSON.stringify(data.nodes)}
                        },
                        {
                            "name": "link-data",
                            "values": ${JSON.stringify(data.edges)}
                        }
                    ],
                
                    "scales": [
                        ${colorAttr ? `
                        {
                            "name": "color",
                            "type": "ordinal",
                            "domain": {"data": "node-data", "field": "${colorAttr}", "sort": true},
                            "range": {"scheme": "category10"}
                        }
                        ` : ``}
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
                            "name": "nodes",
                            "type": "symbol",
                            "zindex": 1,
                
                            "from": {"data": "node-data"},
                            "on": [
                                {
                                    "trigger": "fix",
                                    "modify": "node",
                                    "values": "fix === true ? {fx: node.x, fy: node.y} : {fx: fix[0], fy: fix[1]}"
                                },
                                {
                                    "trigger": "!fix",
                                    "modify": "node", "values": "{fx: null, fy: null}"
                                }
                            ],
                
                            "encode": {
                                "enter": {
                                    ${colorAttr ? `
                                    "fill": {"scale": "color", "field": "${colorAttr}"}
                                    ` : `
                                    "fill": {"value": "${options.color}"}
                                    `},
                                    "stroke": {"value": "white"}
                                },
                                "update": {
                                    "size": {"signal": "2 * nodeRadius * nodeRadius"},
                                    "cursor": {"value": "pointer"}
                                }
                            },
                
                            "transform": [
                                {
                                    "type": "force",
                                    "iterations": 800,
                                    "restart": {"signal": "restart"},
                                    "static": {"signal": "static"},
                                    "forces": [
                                        {"force": "center", "x": {"signal": "cx"}, "y": {"signal": "cy"}},
                                        {"force": "collide", "radius": {"signal": "nodeRadius"}},
                                        {"force": "nbody", "strength": {"signal": "nodeCharge"}},
                                        {"force": "link", "links": "link-data", "distance": {"signal": "linkDistance"}, "strength": {"signal": "linkStrength"}}
                                    ]
                                }
                            ]
                        },
                        {
                            "type": "path",
                            "from": {"data": "link-data"},
                            "interactive": false,
                            "encode": {
                                "update": {
                                    "stroke": {"value": "#ccc"},
                                    "strokeWidth": {"value": 0.5}
                                }
                            },
                            "transform": [
                                {
                                    "type": "linkpath", "shape": "line",
                                    "sourceX": "datum.source.x", "sourceY": "datum.source.y",
                                    "targetX": "datum.target.x", "targetY": "datum.target.y"
                                }
                            ]
                        }
                    ]
                }
            `;
            
            return Promise.resolve(JSON.parse(vegaDesc));
        }
    
    };
    
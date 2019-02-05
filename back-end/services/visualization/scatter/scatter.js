module.exports = {
    
    scatter: function(data, options) {            
        var colorAttr = null;
        if (options.color.startsWith("$")) {
            colorAttr = options.color.substr(1);
		}
		
		let size = options.size ? options.size : 20;

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

                ${options.brush ? `
                "signals": [
					{
						"name": "brushX",
						"value": 0,
						"on": [
							{
								"events": "@cell:mousedown",
								"update": "[x(), x()]"
							},
							{
								"events": "[@cell:mousedown, window:mouseup] > window:mousemove",
								"update": "[brushX[0], clamp(x(), 0, width)]"
							},
							{
								"events": {
									"signal": "delta"
								},
								"update": "clampRange([anchorX[0] + delta[0], anchorX[1] + delta[0]], 0, width)"
							}
						]
					},
					{
						"name": "brushY",
						"value": 0,
						"on": [
							{
								"events": "@cell:mousedown",
								"update": "[y(), y()]"
							},
							{
								"events": "[@cell:mousedown, window:mouseup] > window:mousemove",
								"update": "[brushY[0], clamp(y(), 0, height)]"
							},
							{
								"events": {
									"signal": "delta"
								},
								"update": "clampRange([anchorY[0] + delta[1], anchorY[1] + delta[1]], 0, height)"
							}
						]
					},
					{
						"name": "down",
						"value": [
							0,
							0
						],
						"on": [
							{
								"events": "@brush:mousedown",
								"update": "[x(), y()]"
							}
						]
					},
					{
						"name": "anchorX",
						"value": null,
						"on": [
							{
								"events": "@brush:mousedown",
								"update": "slice(brushX)"
							}
						]
					},
					{
						"name": "anchorY",
						"value": null,
						"on": [
							{
								"events": "@brush:mousedown",
								"update": "slice(brushY)"
							}
						]
					},
					{
						"name": "delta",
						"value": [
							0,
							0
						],
						"on": [
							{
								"events": "[@brush:mousedown, window:mouseup] > window:mousemove",
								"update": "[x() - down[0], y() - down[1]]"
							}
						]
					},
					{
						"name": "rangeX",
						"value": [
							0,
							0
						],
						"on": [
							{
								"events": "@cell:mouseup",
								"update": "invert('xScale', brushX)"
							},
							{
								"events": "@brush:mouseup",
								"update": "invert('xScale', brushX)"
							}
						]
					},
					{
						"name": "rangeY",
						"value": [
							0,
							0
						],
						"on": [
							{
								"events": "@cell:mouseup",
								"update": "invert('yScale', brushY)"
							},
							{
								"events": "@brush:mouseup",
								"update": "invert('yScale', brushY)"
							}
						]
					},
					{
						"name": "cursor",
						"value": "'default'",
						"on": [
							{
								"events": "[@cell:mousedown, window:mouseup] > window:mousemove!",
								"update": "'nwse-resize'"
							},
							{
								"events": "@brush:mousemove, [@brush:mousedown, window:mouseup] > window:mousemove!",
								"update": "'move'"
							},
							{
								"events": "@brush:mouseout, window:mouseup",
								"update": "'default'"
							}
						]
					}
				],
                ` : ``}
            
                "scales": [
                    {
                        "name": "xScale",
                        "type": "linear",
                        "round": true,
                        "nice": true,
                        "zero": true,
                        "domain": {"data": "source", "field": "${options.xAttr}"},
                        "range": "width"
                    },
                    {
                        "name": "yScale",
                        "type": "linear",
                        "round": true,
                        "nice": true,
                        "zero": true,
                        "domain": {"data": "source", "field": "${options.yAttr}"},
                        "range": "height"
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
                    {
                        "scale": "xScale",
                        "grid": true,
                        "domain": false,
                        "orient": "bottom",
                        "tickCount": 5,
                        "title": "${options.xAttr}"
                    },
                    {
                        "scale": "yScale",
                        "grid": true,
                        "domain": false,
                        "orient": "left",
                        "titlePadding": 5,
                        "title": "${options.yAttr}"
                    }
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
                    ${options.brush ? `
                    {
						"type": "rect",
						"encode": {
							"enter": {
								"fill": {
									"value": "#eee"
								}
							},
							"update": {
								"opacity": {
									"signal": "1"
								},
								"x": {
									"signal": "brushX[0]"
								},
								"x2": {
									"signal": "brushX[1]"
								},
								"y": {
									"signal": "brushY[0]"
								},
								"y2": {
									"signal": "brushY[1]"
								}
							}
						}
					},
					{
						"name": "cell",
						"type": "group",
						"encode": {
							"enter": {
								"x": {"value": 0},
								"y": {"value": 0},
								"width": {
									"signal": "width"
								},
								"height": {
									"signal": "height"
								},
								"fill": {
									"value": "transparent"
								},
								"stroke": {
									"value": "#ddd"
								}
							}
						}
					},
                    ` : ``}
                    {
                        "name": "marks",
                        "type": "symbol",
                        "from": {"data": "source"},
                        "encode": {
                            "update": {
                                "x": {"scale": "xScale", "field": "${options.xAttr}"},
                                "y": {"scale": "yScale", "field": "${options.yAttr}"},
                                "shape": {"value": "circle"},
                                "size": {"value": ${size}},
                                "strokeWidth": {"value": 2},
                                ${colorAttr ? `
                                "fill": {"scale": "color", "field": "${colorAttr}"}
                                ` : `
                                "fill": {"value": "${options.color}"}
                                `}
                            }
                        }
                    }
                    ${options.brush ? `,
                    {
						"type": "rect",
						"name": "brush",
						"encode": {
							"enter": {
								"fill": {
									"value": "transparent"
								}
							},
							"update": {
								"x": {
									"signal": "brushX[0]"
								},
								"x2": {
									"signal": "brushX[1]"
								},
								"y": {
									"signal": "brushY[0]"
								},
								"y2": {
									"signal": "brushY[1]"
								}
							}
						}
					}
                    ` : ``}
                ]
            }
        `;

        return Promise.resolve(JSON.parse(vegaDesc));
    }

};
    
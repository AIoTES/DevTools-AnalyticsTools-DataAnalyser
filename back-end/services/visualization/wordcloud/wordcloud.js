module.exports = {
    
    wordcloud: function(data, options) {            
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
                        "name": "color",
                        "type": "ordinal",
                        "domain": {"data": "source", "field": "${options.wordAttr}"},
                        "range": ["#d5a928", "#652c90", "#939597"]
                    }
                ],
            
                "marks": [
                    {
                        "name": "marks",
                        "type": "text",
                        "from": {"data": "source"},
                        "encode": {
                            "update": {
                                "text": {"field": "${options.wordAttr}"},
                                "align": {"value": "center"},
                                "baseline": {"value": "alphabetic"},
                                ${colorAttr ? `
                                "fill": {"scale": "color", "field": "${colorAttr}"}
                                ` : `
                                "fill": {"value": "${options.color}"}
                                `},
                                "fillOpacity": {"value": 1}
                            },
                            "hover": {
                                "fillOpacity": {"value": 0.5}
                            }
                        },
                        "transform": [
                            {
                                "type": "wordcloud",
                                "size": [${options.width}, ${options.height}],
                                "text": {"field": "${options.wordAttr}"},
                                "font": "Helvetica Neue, Arial",
                                "fontSize": {"field": "datum.${options.countAttr}"},
                                "fontSizeRange": [12, 56],
                                "padding": 2
                            }
                        ]
                    }
                ]
            }
        `;

        return Promise.resolve(JSON.parse(vegaDesc));
    }

};

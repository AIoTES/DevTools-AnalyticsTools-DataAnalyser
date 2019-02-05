var services = [
    {
        "id": "summarization",
        "name": "Summarization",
        "category": "Feature extraction",
        "options": [
            {
                "name": "attribute",
                "title": "Compute summary of",
                "type": "select_col"
            }
        ]
    },
    {
        "id": "histogram",
        "name": "Histogram",
        "category": "Feature extraction",
        "options": [
            {
                "name": "entity",
                "title": "Each entity is a",
                "type": "select_col"
            },
            {
                "name": "attribute",
                "title": "Compute histogram based on",
                "type": "select_col"
            },
            {
                "name": "bins",
                "title": "Number of bins",
                "type": "textbox",
                "default": 10
            }
        ]
    },
    {
        "id": "lof",
        "name": "Local Outlier Factor",
        "category": "Anomaly detection",
        "options": [
            {
                "name": "attributes",
                "title": "Attributes to use",
                "type": "select_mult_col"
            }
        ]
    }
]

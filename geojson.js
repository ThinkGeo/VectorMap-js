var geosjonStyle =
    {
        "id": "thinkgeo-world-streets-light",
        "version": 1.3,
        "owner": "ThinkGeo LLC",
        "time": "2018/06/09",
        "background": "#aac6ee",
        "variables": {
        },
        "styles": [{
            "id": "country",
            "style": [{
                "line-color": "#f0eee8",
                "line-width": 10
            }
            ]
        }],
        "sources": [{
            "id": "countries_source",
            "url": "http://openlayers.org/en/latest/examples/data/kml/2012-02-10.kml",
            "type": "WKT",
            "dataProjection":"EPSG:3857"
        }],
        "layers": [{
            "id": "worldstreets_layers",
            "source": "countries_source",
            "styles": [
                "country"
            ]
        }]
    }
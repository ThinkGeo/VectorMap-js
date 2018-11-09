var geosjonStyle = {
    "id": "thinkgeo-world-streets-light",
    "version": 1.3,
    "owner": "ThinkGeo LLC",
    "time": "2018/06/09",
    "background": "#aac6ee",
    "variables": {},
    "styles": [],
    "sources": [ {
        "id": "worldstreets_source_test",
        "url": "https://openlayers.org/en/latest/examples/data/geojson/countries.geojson",
        "type": "GeoJSON"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "worldstreets_source_test",
        "styles": [
            "country"
        ]
    }]
}

export default geosjonStyle;
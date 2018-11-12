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
            "filter": "zoom>=0;zoom<=3;",
            "polygon-fill": "#f0eee8"
        },
        {
            "filter": "zoom>=4;zoom<=22;",
            "polygon-fill": "#cccccc"
        }]
    }],
    "sources": [{
        "id": "countries_source",
        "url": "esrijson.txt",
        "type": "EsriJSON"
    }],
    "layers": [{
        "id": "worldstreets_layers",
        "source": "countries_source",
        "styles": [
            "country"
        ]
    }]
}

export default geosjonStyle;
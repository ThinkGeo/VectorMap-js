/*===========================================================================*/
// Transform Projection
// Sample map by ThinkGeo
// 
//   1. ThinkGeo Cloud API Key
/*===========================================================================*/


/*---------------------------------------------*/
// 1. ThinkGeo Cloud API Key
/*---------------------------------------------*/

// First, let's define our ThinkGeo Cloud API key, which we'll use to
// authenticate our requests to the ThinkGeo Cloud API.  Each API key can be
// restricted for use only from a given web domain or IP address.  To create your
// own API key, you'll need to sign up for a ThinkGeo Cloud account at
// https://cloud.thinkgeo.com.
const apiKey = 'WPLmkj3P39OPectosnM1jRgDixwlti71l8KYxyfP2P0~';


/*---------------------------------------------*/
// 2. Default Polygon Setup
/*---------------------------------------------*/

// Now, define a default area which is a rectangle around the ThinkGeo U.S. office park.  
const defaultWkt = "POLYGON((-96.81058934136763 33.129382039876546,-96.80844357415572 33.129382039876546,-96.80844357415572 33.12814213686314,-96.81058934136763 33.12814213686314,-96.81058934136763 33.129382039876546))";


/*---------------------------------------------*/
// 3. Map Control Setup
/*---------------------------------------------*/

// Now we'll create the base layer for our map.  The base layer uses the ThinkGeo
// Cloud Maps Vector Tile service to display a detailed street map.  For more
// info, see our wiki:
// https://wiki.thinkgeo.com/wiki/thinkgeo_cloud_maps_vector_tiles
const defaultLayer = new ol.mapsuite.VectorTileLayer('https://cdn.thinkgeo.com/worldstreets-styles/3.0.0/light.json', {
    apiKey: apiKey,
    layerName: 'light'
});

const boundingBoxStyle = style = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: [0, 0, 255, 0.5],
        width: 1
    }),
    fill: new ol.style.Fill({
        color: [0, 0, 255, 0.1]
    })
})

const projectionLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: []
    }),
    style: boundingBoxStyle
})

const view = new ol.View({
    center: ol.proj.fromLonLat([-96.79620, 32.79423]),
    maxResolution: 40075016.68557849 / 512,
    zoom: 3,
    minZoom: 2,
    maxZoom: 19
});

let map;
const initializeMap = () => {
    map = new ol.Map({
        renderer: 'webgl',
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        layers: [defaultLayer, projectionLayer],
        target: 'map',
        view: view
    });
    map.addControl(new ol.control.FullScreen());
    addWktToMap(defaultWkt);
}

const addWktToMap = (wkt) => {
    const format = new ol.format.WKT();
    const feature = format.readFeature(wkt, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
    });
    projectionLayer.getSource().addFeature(feature);
    view.fit(feature.getGeometry(), {
        padding: [20, 20, 20, 20]
    })
}

const projectionClient = new tg.ProjectionClient(apiKey);

const performTransform = (wkt) => {
    const fromProj = 4326;
    const toProj = 3857;
    projectionClient.projectForGeometry(wkt, fromProj, toProj, (status, res) => {
        if (status !== 200) {
            document.querySelector('.loading').classList.add('hide');
            if(res.data){
                document.querySelector('.spherical-mercator textarea').value = `${res.status}: ${res.data.wkt}`;
            }else{
                document.querySelector('.spherical-mercator textarea').value = `${res.status}: ${res.error.message}`;
            }            
        } else {
            document.querySelector('.loading').classList.add('hide');
            document.querySelector('.spherical-mercator textarea').value = res.data.wkt;
            addWktToMap(wkt);
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('transform').addEventListener('click', () => {
        projectionLayer.getSource().clear();
        document.querySelector('.loading').classList.remove('hide');
        document.querySelector('.spherical-mercator textarea').value = '';
        const wkt = document.querySelector('.decimal-degree textarea').value;
        performTransform(wkt);
    });
    document.querySelector('.decimal-degree textarea').value = defaultWkt;
})


WebFont.load({
    custom: {
        families: ["vectormap-icons"],
        urls: ["https://cdn.thinkgeo.com/vectormap-icons/2.0.0/vectormap-icons.css"]
    },
    active: initializeMap
});
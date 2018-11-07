
## MapSuite

The __mapsuite-vectormap.js__ is an open-source JavaScript SDK and an extension of [OpenLayers](https://openlayers.org/ "OpenLayers") to create maps for web and mobile devices. With the help of Map Suite vector styling schema - [StyleJSON](https://thinkgeo.gitbooks.io/map-suite-stylejson-specification/content/), you can easily create beautiful maps for your application.

With Map Suite VectorMap.js, you will have full access to [OpenLayers](https://openlayers.org/ "OpenLayers"), as well as any plugins or extensions created based on [OpenLayers](https://openlayers.org/ "OpenLayers"), for example, the "[3rd party libraries](http://openlayers.org/3rd-party/)" published on https://openlayers.org. With the help of them, you can easily create any styled map and put it anywhere, and build a customized geocoding or routings from other providers.

## Documentation:

* [Getting Started](https://thinkgeo.gitbooks.io/map-suite-vector-map-js/get-started/quickstart.html)
* [Community & Support](https://github.com/ThinkGeo/VectorMap-js/issues)
* [API Documentation](https://thinkgeo.gitbooks.io/map-suite-vector-map-js/api-reference.html)
* [Vector StyleJSON Specification](https://thinkgeo.gitbooks.io/map-suite-stylejson-specification/)
* [World Streets Vector Tile Schema](https://thinkgeo.gitbooks.io/map-suite-world-streets-data-schema)
* [Wolrd Street Predefined](https://github.com/ThinkGeo/WorldStreets-Styles/tree/develop), including:

__Light Map__

<img src="https://thinkgeo.com/image/gallery/LightMap.png">

__Dark Map__

<img src="https://thinkgeo.com/image/gallery/DarkMap.png">

__Hybrid Map__

<img src="https://thinkgeo.com/image/gallery/HybridMap.png">

## Install

> The official guide assumes intermediate level knowledge of HTML, CSS, and JavaScript, and have some experience of any front-end development editor, such as [Visual Studio Code](https://code.visualstudio.com/), [Webstorm](https://www.jetbrains.com/webstorm/), [Sublime Text](https://www.sublimetext.com/) or some similars. if you are totally new to frontend development, the easiest way to try out this library is using the "[OpenCodePen Hello World exampleLayers]()". Feel free to open it in another tab and follow along as we go through some features.

### CDN
Load from CDN in your project:

```html
  	<!-- style sheet for vectormap.js -->
	<link rel="stylesheet" href="https://cdn.thinkgeo.com/vectormap/1.0.2/vectormap.css"></link>
	
	<!-- latest minified version of vectormap.js -->
  	<script src="https://cdn.thinkgeo.com/vectormap/1.0.2/vectormap.js"></script>
```

### NPM

- Install the package:
```
npm i vectormap-js
``` 

Development Version
```
npm i vectormap-js-dev
``` 
- Include it to your page:
```html
  	<!-- style sheet for vectormap.js -->
	<link rel="stylesheet" href="path/to/dist/vectormap.css"></link>
	
	<!-- latest minified version of vectormap.js -->
  	<script src="path/to/dist/vectormap.js"></script>
```
 
## How to use
Set up a basic map with VectorMap.js in 6 steps (here take [Visual Studio Code](https://code.visualstudio.com/) for example).

__Step 1__. Create a html page with name "index.html "

__Step 2__. In the `<head>`of your HTML page, import the vectormap.js and related css file.

```html
  	<!-- style sheet for vectormap.js -->
	<link rel="stylesheet" href="https://cdn.thinkgeo.com/vectormap/1.0.2/vectormap.css"></link>
	
	<!-- latest minified version of vectormap.js -->
  	<script src="https://cdn.thinkgeo.com/vectormap/1.0.2/vectormap.js"></script>
```
 
__Step 3__. In the `<body>` of your HTML page, add a div with "id=`"map"`".
```html
<div id="map" style="width:800px;height=600px;"></div>
```

__Step 4__. At the bottom of the html page, add a JavaScript section to create an instance of map control with one vector layer created. 
```javascript
<script>
    var worldstreets = new ol.mapsuite.VectorTileLayer("thinkgeo-world-streets-light.json", 
        {
            'apikey':'your-thinkgeo-gis-service-vector-tile-key'
        });
    let map = new ol.Map({
        layers: [worldstreets],
        target: 'map',
        view: new ol.View({
            center: ol.proj.fromLonLat([-96.79620, 32.79423]),
            zoom: 2,
        }),
    });
</script>
```
 
 __NOTE:__  Please check [here](https://thinkgeo.gitbooks.io/map-suite-vector-map-js/content/sign-up-thinkgeo-account.html) on how to create your own `ThinkGeo GIS Service Vector Tile key`.
 
__Step 5__. Download one of [Predefined open source styles](https://github.com/ThinkGeo/WorldStreets-Styles/tree/develop) and copy it to the directory where the index.html is. For example, we can call it "thinkgeo-world-streets-light.json".

After all the above steps completed, your HTML page should be:

```
<!DOCTYPE html>
<html>
    <head>
        <title>Sample Map</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <!-- style sheet for vectormap.js -->
        <link rel="stylesheet" href="https://cdn.thinkgeo.com/vectormap/1.0.2/vectormap.css"></link>
        
        <!-- latest minified version of vectormap.js -->
        <script src="https://cdn.thinkgeo.com/vectormap/1.0.2/vectormap.js"></script>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var worldstreets = new ol.mapsuite.VectorTileLayer("thinkgeo-world-streets-light.json", 
            {
                'apikey':'your-thinkgeo-gis-service-vector-tile-key'
            });
            let map = new ol.Map({
                layers: [worldstreets],
                target: 'map',
                view: new ol.View({
                    center: ol.proj.fromLonLat([-96.79620, 32.79423]),
                    zoom: 2,
                }),
            });
        </script>
    </body>
</html>
```

__Step 6__. Run the page and a beautiful map there.

__NOTE:__ 

__[ThinkGeo Icon FontSet](http://maptest.thinkgeo.com/maps/icon-editor/index.html)__ is an icon set, which is used in "[Predefined open source styles]()" as POI icons. If you are using ready-to-go predefined styleJSON file downloaded, please add following code in `"<Head>"`.

```
<script src="https://cdn.thinkgeo.com/vectormap-icons/0.1.0/webfontloader.js"></script>
<script>
    WebFont.load({
        custom: {
            families: ["ThinkgeoFont"],
            urls: ["https://cdn.thinkgeo.com/vectormap-icons/0.1.0/thinkgeo-font.css"]
        }
    });
</script>
```

## Vector Tiles

Besides loading the traditional KML, GeoJSON, bitmap tiles etc., Map Suite vectormap.js draws its own tiles from vector tiles that contains the source data. 

[Map Suite GIS Service](https://thinkgeo.com/gisserver) provides a free vector tile service (*.mvt) based on open data from [OpenStreetMap](https://openstreetmap.org/), [Natural Earth](http://www.naturalearthdata.com/) and some other data providers, with global  coverage updated continuously. - sign up for an [API Key here](https://gisserverbeta.thinkgeo.com/).

## Styling

Map Suite vector styling schema - [Vector StyleJSON](https://thinkgeo.gitbooks.io/map-suite-stylejson-specification/content/) is designed for you to specify data sources, layers and how to define and apply styles to layers. Please check the demo from "[Predefined open source styles](https://github.com/ThinkGeo/WorldStreets-Styles)" or check related documentation at https://thinkgeo.gitbooks.io/map-suite-stylejson-specification/content/. 


## Browser Suport
__mapsuite-vectormap.js__ is officially supported and tested on the last two versions of these browsers:

* __Mac OS__: Chrome, Firefox, and Safari
* __Windows__: Chrome, Firefox, IE11, and IE Edge
* __iOS__: Safari, Chrome, Firefox
* __Android__: Chrome

__mapsuite-vectormap.js__ should also run in any brower with HTML5 support.

## License
__mapsuite-vectormap.js__ is licensed under the [Apache 2.0](https://github.com/ThinkGeo/MapSuiteGisEditor/blob/master/LICENSE). 


![Alt ThinkGeo](https://thinkgeo.com/thinkgeo.png)

## MapSuite

The __mapsuite-vectormap.js__ is an open-source JavaScript SDK and an extension of [OpenLayers](https://openlayers.org/ "OpenLayers") to create maps for web and mobile devices. With the help of Map Suite vector styling schema - [StyleJSON](https://thinkgeo.gitbooks.io/map-suite-stylejson-specification/content/), you can easily create beautiful maps for your application.

With Map Suite VectorMap.js, you will have full access to [OpenLayers](https://openlayers.org/ "OpenLayers"), as well as any plugins or extensions created based on [OpenLayers](https://openlayers.org/ "OpenLayers"), for example, the "[3rd party libraries](http://openlayers.org/3rd-party/)" published on https://openlayers.org. With the help of them, you can easily create any styled map and put it anywhere, and build a customized geocoding or routings from other providers.

Wiki Documentation: http://wiki.thinkgeo.com/wiki/map_suite_api

* [Getting started with Map Suite VectorMap.js](https://thinkgeo.gitbooks.io/map-suite-vector-map-js/get-started/quickstart.html)
* [Community & Support](https://github.com/ThinkGeo/VectorMap-js/issues)
* [API documentation](https://thinkgeo.gitbooks.io/map-suite-vector-map-js/api-reference.html)
* [Predefined open source styles](https://github.com/ThinkGeo/WorldStreets-Styles/tree/develop)
* [Map Suite Vector StyleJSON Specification](https://thinkgeo.gitbooks.io/map-suite-stylejson-specification/)
* [World Streets Data Schema](https://thinkgeo.gitbooks.io/map-suite-world-streets-data-schema)

__Light Map Style__

![Alt ThinkGeo](https://thinkgeo.com/image/gallery/LightMap.png)

__Dark Map Style__

![Alt ThinkGeo](https://thinkgeo.com/image/gallery/DarkMap.png)

__Hybrid Map Style__

![Alt ThinkGeo](https://thinkgeo.com/image/gallery/HybridMap.png)

## Install

> The official guide assumes intermediate level knowledge of HTML, CSS, and JavaScript, and have some experience of any front-end development editor, such as [Visual Studio Code](https://code.visualstudio.com/), [Webstorm](https://www.jetbrains.com/webstorm/), [Sublime Text](https://www.sublimetext.com/) or some similars. if you are totally new to frontend development, the easiest way to try out this library is using the "[OpenCodePen Hello World exampleLayers]()". Feel free to open it in another tab and follow along as we go through some features.

2 options of installing Map Suite VectorMap.js:
   * Use NPM install 

    npm install vectormap-js
	
	or 
	
    npm install vectormap-js-dev

   * Include related in <header>

  	// or latest version for release
  	<script src="https://cdn.thinkgeo.com/vectormap/0.1.0/mapsuite-vectormap.js"></script>
 
  	// style sheet for mapsuite.vectormap.js
	<link rel="stylesheet" href="https://cdn.thinkgeo.com/vectormap/0.1.0/mapsuite-vectormap.css"></link>

## Quickstart
You can create a beautiful map by following these steps:

1. Create a new folder in which you initialize a pacage.json file with 

    npm init
2. Under the current directory, the mapsuite module is installed through 

    npm install vectormap-js

3. Download one of [Predefined open source styles](https://github.com/ThinkGeo/WorldStreets-Styles/tree/develop) and copy it to the directory where the index.html is. For example, we can call it "thinkgeo-world-streets-light.json".

4. Create an index.html in any editor you wanna, here take [Visual Studio Code](https://code.visualstudio.com/) for example, and paste the code below:
    
```
<!DOCTYPE html>
<html>
    <head>
        <title>Sample Map (mapbox vector tile)</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://cdn.thinkgeo.com/vectormap/0.1.0/mapsuite-vectormap.css" type="text/css">
        <script src="https://cdn.thinkgeo.com/vectormap/0.1.0/mapsuite-vectormap.js"></script>
    </head>
    <body>
        <div id="map"></div>
        <script>
            var worldStreetsLayer = new ol.mapsuite.VectorTileLayer("thinkgeo-world-streets-light.json");
            let map = new ol.Map({
                layers: [vectortilelayer],
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

5. Run the page and a beautiful map there.

__NOTE:__ 

__[ThinkGeo Icon FontSet](http://maptest.thinkgeo.com/maps/icon-editor/index.html)__ is an icon set, which is used in "[Predefined open source styles]()" as POI icons. To load it in the map, please add following code in "<Head>".

```
<script src="https://cdn.thinkgeo.com/icons-font/0.1.0/webfontloader.js"></script>
<script>
    WebFont.load({
        custom: {
            families: ["ThinkgeoFont"],
            urls: ["https://cdn.thinkgeo.com/icons-font/0.1.0/thinkgeo-font.css"]
        }
    });
</script>
```

## Vector Tiles

Besids loading the traditional KML, GeoJSON, bitmap tiles etc., Map Suite vectormap.js draws its own tiles from vector tiles that contains the source data. 

[Map Suite GIS Service](https://thinkgeo.com/gisserver) provides a free vector tile service (*.mvt) based on open data from [OpenStreetMap](https://openstreetmap.org/), [Natural Earth](http://www.naturalearthdata.com/) and some other data providers, with global  coverage updated continuously. - sign up for an [API Key here](https://gisserverbeta.thinkgeo.com/).

## Styling

Map Suite vector styling schema - [Vector StyleJSON](https://thinkgeo.gitbooks.io/map-suite-stylejson-specification/content/) is designed for you to specify data sources, layers and how to define and apply styles to layers. Please check the demo from "[Predefined open source styles]()" or check related documentation at https://thinkgeo.gitbooks.io/map-suite-stylejson-specification/content/. 


## Browser Suport
__mapsuite-vectormap.js__ is officially supported and tested on the last two versions of these browsers:

* __Mac OS__: Chrome, Firefox, and Safari
* __Windows__: Chrome, Firefox, IE11, and IE Edge
* __iOS__: Safari, Chrome, Firefox
* __Android__: Chrome

__mapsuite-vectormap.js__ should also run in any brower with HTML5 support.

## License
__mapsuite-vectormap.js__ is licensed under the [Apache 2.0](https://github.com/ThinkGeo/MapSuiteGisEditor/blob/master/LICENSE). 

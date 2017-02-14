// debug mode controls console log messages
var debugMode = true;
var smallWin = false;
// intial extent
var XMax = -8769247;
var XMin = -8808994;
var YMax = 4188023;
var YMin = 4159130;
// geo extent (MAX)
var geoXMax = -8769247;
var geoXMin = -8808994;
var geoYMax = 4188023;
var geoYMin = 4159130;
// intial extent
//var XMin = 1947990;
//var YMin = 476907;
//var XMax = 2092286;
//var YMax = 519886;
var SR = 102100;
// geo extent (MAX)
//var geoXMin = 1947990;
//var geoYMin = 476907;
//var geoXMax = 2092286;
//var geoYMax = 519886;


var geoLayers = null;
var shiftObj = null;

var clusterLayer = null;

// admin SOE
var adminSOE = 'http://darkside:6080/arcgis/rest/services/MARVLIS_Admin/Fayetteville_Admin/MapServer/exts/FLE_Admin/';
// admin event service
var adminMap = '//darkside:6080/arcgis/rest/services/MARVLIS_Admin/Fayetteville_Admin/MapServer';
// geometry service service
var geoService = "http://darkside.com:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer";
// use local or esri basemaps
var useESRIBaseMaps = true;
// if using local, define below
var baseMapLayers = [{
    key: 'vector',
    thumbnail: 'img/PublicAccess.png',
    name: 'Road Map',
    url: 'https://maps.yorkcountygov.com/arcgis/rest/services/cached/Primary5/MapServer'
}, {
    key: 'image',
    thumbnail: 'img/ImageryHybrid.png',
    name: 'Imagery',
    url: 'https://maps.yorkcountygov.com/arcgis/rest/services/cached/orthophotos_2009/MapServer'
}];


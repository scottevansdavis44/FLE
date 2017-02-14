//system variables
var startDate = null;
var endDate = null;
var map = null;
var popup = null;
var layersToAdd = [];
var geometryService;
var refScale;
var eventLayer = null;
var drawtoolbar = null;
var measuretoolbar = null;
var dataConfig = null;
var isMobile = false;
// debug mode controls console log messages
var debugMode = false;
// define which window is being used
var isMain = null;
var childWindow = null;

var portal, portalUrl, groupGrid, esriLang;

var useESRIBaseMaps = true;

var reportDays = 0;
var startDayOfWeek = 0;

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

// system settings
var proxyUrl = '';
var alwaysUseProxy = false;
var soeURL = '';

// overlay map service
var overlayMapSevice = null;

// location layers - put in order to be shown
// these layers must be in the base map service
// displayName - what user sees
// layerIndex - layer index in the map document
// queryField - field to get list (case sensitive)
// fieldType - string field type use S, number field type use a N
// do not use alias field names in map document
var quickZoomLayer = null;

var locatorSources = null;
var searchSources = [{
  layer : 0,
  searchFields : ['SBNM'],
  displayField : 'SBNM',
  exactMatch : false,
  outFields : ['SBNM'],
  name : 'Subdivisions',
  placeholder : 'Holywood Estates',
  maxResults : 6,
  maxSuggestions : 6,
  infoTemplateTitle : 'Subdivision',
  infoTemplate : 'Name: ${SBNM}',
  enableSuggestions : true,
  minCharacters : 0
}, {
  layer : 2,
  searchFields : ['zone'],
  displayField : 'zone',
  exactMatch : false,
  outFields : ['zone'],
  name : 'Patrol Zones',
  placeholder : '01',
  maxResults : 6,
  maxSuggestions : 6,
  infoTemplateTitle : 'Patrol Zones',
  infoTemplate : 'Zone: ${zone}',
  enableSuggestions : true,
  minCharacters : 0
}];


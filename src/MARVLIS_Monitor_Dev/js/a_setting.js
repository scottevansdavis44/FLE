// Site options: PSAP or MFLE
var siteType = 'PSAP';


var map = null, cookie = null, arcgisUtils = null, urlUtils = null;

// debug mode controls console log messages
var debugMode = false;

overlayMap = 'http://aws.bcs-gis.com/arcgis/rest/services/MARVLIS_Ops/Ops_Monitor_Fayetteville_Overlay/MapServer';
eventMap = 'http://aws.bcs-gis.com/arcgis/rest/services/MARVLIS_Ops/Ops_Event_Stagging/MapServer';
geoService = 'http://aws.bcs-gis.com/arcgis/rest/services/Utilities/Geometry/GeometryServer';

var tabResponse;
var tabResponseURL = 'http://aws.bcs-gis.com/arcgis/rest/services/MARVLIS_Ops/MARVLIS_Response_Times/MapServer/1';

var vehicleLayer;
var vehicleLayerURL = 'http://aws.bcs-gis.com:6080/arcgis/rest/services/vehicle-stream/StreamServer';
var vehicleOutFields = ['bcs_id', 'bcs_name', 'bcs_status', 'bcs_incidentid', 'bcs_responsenumber', 'bcs_direction', 'bcs_velocity', 'bcs_division', 'bcs_agency'];
var vehicleTrackIdField = 'bcs_name';
var vehicleLabel = "{bcs_name}";
var vehicleInfoTemplateTitle = "${bcs_name}";
var vehicleInfoTemplate = "Status: ${bcs_status}</br>Incident: ${bcs_incidentid}</br>District: ${bcs_division}</br>Speed: ${bcs_velocity} mph</br>Direction: ${bcs_direction:formatDirection}";
var vehicleStatusColorField = 'bcs_status';
var vehicleStatusColorDefault = { text: 'Available', value: ['Available'], color: '#EFC700', fontcolor: '#111111' };
var vehicleStatusColor = [
    { text: 'At Destination', value: ['At Destination'], color: '#CC0000', fontcolor: '#F0F0F0' },
    { text: 'Available', value: ['Available'], color: '#EFC700', fontcolor: '#111111' },
    { text: 'Dispatched', value: ['Dispatched'], color: '#FF6A00', fontcolor: '#111111' },
    { text: 'Enroute', value: ['Enroute To Destination'], color: '#00CC00', fontcolor: '#111111' },
    { text: 'At Post', value: ['At Post'], color: '#22B8CC', fontcolor: '#111111' }
];

var emsLayer;
var emsLayerURL = 'http://MARVLISWEB.fayps.local/arcgis/rest/services/ems-stream/StreamServer';
var emsOutFields = ['bcs_id', 'bcs_name', 'bcs_status', 'bcs_incidentid', 'bcs_service', 'bcs_groupcode', 'bcs_updated', 'bcs_color', 'bcs_direction', 'bcs_status', 'bcs_avstatus'];
var emsTrackIdField = 'bcs_name';
var emsLabel = "{bcs_name}";
var emsInfoTemplateTitle = "${bcs_name}";
var emsInfoTemplate = "UID: ${bcs_id}</br>Status: ${bcs_status}</br>Incident ID: ${bcs_incidentid}</br>Service: ${bcs_service}</br>Group: ${bcs_groupcode}</br>Updated: ${bcs_updated:formatDate}";

var fireLayer;
var fireLayerURL = 'http://MARVLISWEB.fayps.local/arcgis/rest/services/fire-stream/StreamServer';
var fireOutFields = ['bcs_id', 'bcs_name', 'bcs_status', 'bcs_incidentid', 'bcs_service', 'bcs_groupcode', 'bcs_updated', 'bcs_color', 'bcs_direction', 'bcs_status', 'bcs_avstatus'];
var fireTrackIdField = 'bcs_name';
var fireLabel = "{bcs_name}";
var fireInfoTemplateTitle = "${bcs_name}";
var fireInfoTemplate = "UID: ${bcs_id}</br>Status: ${bcs_status}</br>Incident ID: ${bcs_incidentid}</br>Service: ${bcs_service}</br>Group: ${bcs_groupcode}</br>Updated: ${bcs_updated:formatDate}";

var incidentLayer;
var incidentLayerURL = 'http://aws.bcs-gis.com:6080/arcgis/rest/services/incident-stream/StreamServer';

//feeds
var feedLayerTOC = [];
var trafficLayer = null;
var trafficWebMap = "69ac725e255f4861aa68ddaaea3c3c44";
var trafficLegendLayer = null;

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

var p1_color = 'rgb(0, 148, 255)';
var p2_color = 'rgb(255, 106, 0)';
var p3_color = 'rgb(255, 216, 0)';
var p4_color = 'rgb(76, 255, 0)';

var avlDistricts = ['1', '2', '3', '4','5','F'];
var avlIncidents = ['1', '2', '3', '4', '5', 'F'];
//avlIncidents.reverse();

// search parameters
//var locatorSources = null;
var locatorSources = [{
    locator: '//aws.bcs-gis.com/arcgis/rest/services/MARVLIS_General/F_Locator_Suggest/GeocodeServer',
    singleLineFieldName: 'SingleLine',
    outFields: 'Match_addr',
    name: 'Address/Intersection',
    placeholder: 'Enter address'
}];


var searchSources = [{
    layer: '//aws.bcs-gis.com/arcgis/rest/services/MARVLIS_Ops/Ops_Monitor_Fayetteville_Overlay/MapServer/0',
    searchFields: ['SBNM'],
    displayField: 'SBNM',
    exactMatch: false,
    outFields: ['SBNM'],
    name: 'Subdivisions',
    placeholder: 'Holywood Estates',
    maxResults: 6,
    maxSuggestions: 6,
    infoTemplateTitle: 'Subdivision',
    infoTemplate: 'Name: ${SBNM}',
    enableSuggestions: true,
    minCharacters: 0
}, {
    layer: '//aws.bcs-gis.com/arcgis/rest/services/MARVLIS_Ops/Ops_Monitor_Fayetteville_Overlay/MapServer/2',
    searchFields: ['zone'],
    displayField: 'zone',
    exactMatch: false,
    outFields: ['zone'],
    name: 'Patrol Zones',
    placeholder: '01',
    maxResults: 6,
    maxSuggestions: 6,
    infoTemplateTitle: 'Patrol Zones',
    infoTemplate: 'Zone: ${zone}',
    enableSuggestions: true,
    minCharacters: 0
}];
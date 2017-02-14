// Site options: PSAP or MFLE
var siteType = 'PSAP';

var marvlis = "http://bcslab9.bcs-gis.com:22334";
//var marvlis = "http://devweb.bcs-gis.com:22334";

var map = null, cookie = null, arcgisUtils = null, urlUtils = null, layersToAdd = [], startExtent = null, webMercatorUtils;

// debug mode controls console log messages
var debugMode = false;

overlayMap = 'http://aws.bcs-gis.com/arcgis/rest/services/MARVLIS_Ops/Ops_Monitor_Fayetteville_Overlay/MapServer';
eventMap = 'http://aws.bcs-gis.com/arcgis/rest/services/MARVLIS_Ops/Ops_Event_Stagging/MapServer';
geoService = 'http://aws.bcs-gis.com/arcgis/rest/services/Utilities/Geometry/GeometryServer';

var tabResponse;
var tabResponseURL = 'http://aws.bcs-gis.com:6080/arcgis/rest/services/MARVLIS_Ops/Ops_Monitor_Fayetteville_Overlay/MapServer/5';

var vehicleLayer;
var vehicleLabelLayer;
var vehicleLayerURL = 'http://aws.bcs-gis.com:6080/arcgis/rest/services/vehicle-stream/StreamServer';
var vehicleOutFields = ['id', 'unitName', 'status', 'incidentID', 'responsenumber', 'heading', 'speed', 'lastReportTime', 'agency', 'division'];
var vehicleTrackIdField = 'unitName';
var vehicleLabel = "unitName";
var vehicleInfoTemplateTitle = "${unitName}";
var vehicleInfoTemplate = "Status: ${status}</br>Incident: ${incidentID}</br>Agency: ${agency}</br>Division: ${division}</br>Speed: ${speed} mph</br>Direction: ${heading:formatDirection}";
var vehicleStatusColorField = 'status';
var vehicleStatusColorDefault = { text: 'Available', value: ['Available'], color: '#282828', fontcolor: '#C8C8C8', outlinecolor: null, size: 8, path: 'M 7.6875,4 A 3.71875,3.71875 0 0 1 3.96875,7.71875 3.71875,3.71875 0 0 1 0.25,4 3.71875,3.71875 0 0 1 3.96875,0.28125 3.71875,3.71875 0 0 1 7.6875,4 Z' };
var vehicleStatusColor = [
    { text: 'At Destination', value: ['At Destination', 'At Scene'], color: '#CC0000', fontcolor: '#F0F0F0', outlinecolor: '#333333', size: 16, path: 'M30.967,29.874h0.029l-13.004-29.1l-13.004,29.1h0.045c-0.291,0.558-0.464,1.245-0.464,1.992c0,1.856,1.06,3.36,2.368,3.36c0.108,0,0.215-0.014,0.319-0.033l0.011,0.033l0.091-0.055c0.367-0.094,0.702-0.307,0.989-0.611l7.604-4.687h3.806l8.73,5.32l0.018-0.063c0.18,0.06,0.365,0.096,0.557,0.096c1.309,0,2.367-1.504,2.367-3.36C31.43,31.119,31.258,30.432,30.967,29.874z' },
    { text: 'Available', value: ['Available'], color: '#282828', fontcolor: '#C8C8C8', outlinecolor: null, size: 8, path: 'M 7.6875,4 A 3.71875,3.71875 0 0 1 3.96875,7.71875 3.71875,3.71875 0 0 1 0.25,4 3.71875,3.71875 0 0 1 3.96875,0.28125 3.71875,3.71875 0 0 1 7.6875,4 Z' },
    { text: 'Dispatched', value: ['Dispatched'], color: '#FF6A00', fontcolor: '#111111', outlinecolor: '#333333', size: 16, path: 'M30.967,29.874h0.029l-13.004-29.1l-13.004,29.1h0.045c-0.291,0.558-0.464,1.245-0.464,1.992c0,1.856,1.06,3.36,2.368,3.36c0.108,0,0.215-0.014,0.319-0.033l0.011,0.033l0.091-0.055c0.367-0.094,0.702-0.307,0.989-0.611l7.604-4.687h3.806l8.73,5.32l0.018-0.063c0.18,0.06,0.365,0.096,0.557,0.096c1.309,0,2.367-1.504,2.367-3.36C31.43,31.119,31.258,30.432,30.967,29.874z' },
    { text: 'Enroute', value: ['Enroute To Destination', 'Enroute To Incident', 'Enroute To Post'], color: '#00CC00', fontcolor: '#111111', outlinecolor: '#333333', size: 16, path: 'M30.967,29.874h0.029l-13.004-29.1l-13.004,29.1h0.045c-0.291,0.558-0.464,1.245-0.464,1.992c0,1.856,1.06,3.36,2.368,3.36c0.108,0,0.215-0.014,0.319-0.033l0.011,0.033l0.091-0.055c0.367-0.094,0.702-0.307,0.989-0.611l7.604-4.687h3.806l8.73,5.32l0.018-0.063c0.18,0.06,0.365,0.096,0.557,0.096c1.309,0,2.367-1.504,2.367-3.36C31.43,31.119,31.258,30.432,30.967,29.874z' },
    { text: 'At Post', value: ['At Post'], color: '#22B8CC', fontcolor: '#111111', outlinecolor: '#333333', size: 16, path: 'M30.967,29.874h0.029l-13.004-29.1l-13.004,29.1h0.045c-0.291,0.558-0.464,1.245-0.464,1.992c0,1.856,1.06,3.36,2.368,3.36c0.108,0,0.215-0.014,0.319-0.033l0.011,0.033l0.091-0.055c0.367-0.094,0.702-0.307,0.989-0.611l7.604-4.687h3.806l8.73,5.32l0.018-0.063c0.18,0.06,0.365,0.096,0.557,0.096c1.309,0,2.367-1.504,2.367-3.36C31.43,31.119,31.258,30.432,30.967,29.874z' },
    { text: 'Other', value: ['Off Duty', 'Out Of Service', 'Connected', 'Disconnected', 'Emergency'], color: '#CECECE', fontcolor: '#111111', outlinecolor: '#333333', size: 16, path: 'M30.967,29.874h0.029l-13.004-29.1l-13.004,29.1h0.045c-0.291,0.558-0.464,1.245-0.464,1.992c0,1.856,1.06,3.36,2.368,3.36c0.108,0,0.215-0.014,0.319-0.033l0.011,0.033l0.091-0.055c0.367-0.094,0.702-0.307,0.989-0.611l7.604-4.687h3.806l8.73,5.32l0.018-0.063c0.18,0.06,0.365,0.096,0.557,0.096c1.309,0,2.367-1.504,2.367-3.36C31.43,31.119,31.258,30.432,30.967,29.874z' },
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
var incidentLabelLayer;
var incidentLayerURL = 'http://aws.bcs-gis.com:6080/arcgis/rest/services/incident-stream/StreamServer';
var incidentOutFields = ["responseDate", "incidentNumber", "problem", "address", "locationName", "priorityDescription", "assignedVehicles", "agency", "jurisdiction"];
var incidentTrackIdField = 'incidentNumber';
var incidentLabel = "incidentNumber";
var incidentInfoTemplateTitle = "${incidentNumber}";
var incidentInfoTemplate = "Date: ${responseDate:formatDate}</br>Problem: ${problem}</br>Address: ${address}</br>Division: ${jurisdiction}</br>Priorty: ${priorityDescription}</br>Assigned: ${assignedVehicles}</br>Agency: ${agency}";
var incidentStatusColorField = 'priorityDescription';
var incidentStatusColorDefault = { text: 'PO', value: ['P4', 'P5', 'P6', 'None'], color: '#4CFF00', fontcolor: '#111111' };
var incidentStatusColor = [
    { text: 'P1', value: ['P1'], color: '#0094FF', fontcolor: '#F0F0F0' },
    { text: 'P2', value: ['P2'], color: '#FF6A00', fontcolor: '#111111' },
    { text: 'P3', value: ['P3'], color: '#FFD800', fontcolor: '#111111' },
    { text: 'PO', value: ['P4', 'P5', 'P6', 'None'], color: '#4CFF00', fontcolor: '#111111' }
];

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

var avlDistricts = ['1', '2', '3', '4', '5'];
var avlIncidents = ['1', '2', '3', '4', '5'];
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

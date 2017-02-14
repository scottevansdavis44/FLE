require(['dojo/parser', 'dojo/_base/event', 'dojo/ready', 'dojo/dom', 'dojo/window', 'dojo/cookie', 'dojo/_base/unload', 'esri/arcgis/utils', 'esri/urlUtils', 'dojo/_base/array', 'esri/urlUtils', 'esri/map', 'esri/dijit/HomeButton',
'esri/dijit/LocateButton', 'esri/layers/FeatureLayer', 'esri/tasks/query', 'esri/layers/LabelLayer', 'esri/dijit/Popup', 'esri/layers/LabelClass', 'esri/symbols/SimpleFillSymbol',
'esri/symbols/TextSymbol', 'esri/renderers/UniqueValueRenderer', 'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol', 'esri/symbols/SimpleFillSymbol', 'esri/symbols/PictureMarkerSymbol', 'esri/layers/StreamLayer', 'esri/layers/TimeInfo', 'esri/layers/CSVLayer', 'esri/layers/GraphicsLayer',
'esri/dijit/BasemapToggle', 'esri/dijit/OverviewMap', 'esri/layers/osm', 'esri/dijit/BasemapGallery', 'esri/tasks/query', 'esri/tasks/geometry', 'esri/InfoTemplate', 'esri/dijit/PopupTemplate',
'esri/toolbars/navigation', 'dojo/promise/all', 'dojo/DeferredList', 'dojo/Deferred', 'dojo/date/locale', 'dojo/_base/json', 'dijit/registry',
'dijit/popup', 'dijit/Dialog', 'dijit/Tooltip', 'dijit/form/FilteringSelect', 'dijit/Menu', 'dijit/MenuItem', 'dijit/CheckedMenuItem',
'dijit/form/Button', 'dijit/form/DropDownButton', 'dijit/layout/BorderContainer', 'dijit/layout/ContentPane', 'dijit/layout/TabContainer', 'dojox/layout/FloatingPane',
'dijit/layout/LayoutContainer', 'dijit/form/TextBox', 'dijit/form/ComboBox', 'dijit/form/CheckBox', 'dijit/form/Select', 'dijit/form/MultiSelect',
'dijit/form/Textarea', 'dojo/cookie', 'dojo/data/ItemFileReadStore', 'dojox/layout/ScrollPane', 'dojox/lang/functional', 'dojox/lang/functional/lambda',
'dojox/lang/functional/curry', 'dojox/lang/functional/fold', 'dojox/grid/DataGrid', 'dojo/data/ItemFileReadStore', 'dojox/grid/EnhancedGrid',
'dijit/form/HorizontalSlider', 'dojox/grid/enhanced/plugins/IndirectSelection', 'dojox/grid/enhanced/plugins/NestedSorting',
'dojox/grid/enhanced/plugins/DnD', 'dojox/charting/Chart', 'dojox/charting/plot2d/Pie', 'dojox/charting/plot2d/Columns', 'dojox/charting/plot2d/Lines',
'dojox/charting/action2d/Magnify', 'dojox/charting/themes/CubanShirts', 'dojox/charting/themes/Chris', 'dojox/charting/themes/Tom',
'dojox/charting/themes/Electric', 'dojox/charting/DataChart', 'dojox/charting/action2d/Highlight', 'dojox/charting/action2d/Tooltip',
'dojo/data/ItemFileWriteStore', 'dijit/ProgressBar', 'dojox/charting/action2d/MoveSlice', 'dojox/charting/widget/Legend', 'dojox/gfx/gradutils',
'dojox/charting/widget/SelectableLegend', 'dojox/layout/GridContainerLite', 'dijit/TitlePane'], function (parser, event, ready, dom, win, cok, baseUnload, aUtils, uUtils) {
    ready(function () {
        parser.parse();
        cookie = cok;
        arcgisUtils = aUtils;
        urlUtils = uUtils;
        if (siteType === 'PSAP') {
            dojo.byId('imageHeader').src = 'img/PSAPMon_Logo.png';
            dojo.byId('titleHeader').innerHTML = 'PSAP Monitor';
        } else {
            dojo.byId('imageHeader').src = 'img/MFLE_Logo.png';
            dojo.byId('titleHeader').innerHTML = 'Operations Monitor';
        }
        mapInit();

        // pass a function pointer
        baseUnload.addOnWindowUnload(window, 'unLoad');
    });
});

var unLoad = function () {
    // do some unload stuff
    alert("unloading...");
};

function mapInit() {
    try {
        showWorking('loading application ...');


        window.addEventListener(onbeforeunload, function () {
            var p1 = dojo.byId('P1');
            if (p1) {
                dojo.cookie(evt.target.parentElement.id, dojo.toJson(p1.style.left + '|' + p1.style.bottom + '|max'), {
                    expires: 365
                });
            }
        }, false);

        supportsOrientationChange = 'onorientationchange' in window, orientationEvent = supportsOrientationChange ? 'orientationchange' : 'resize';
        window.addEventListener(orientationEvent, function () {
            //log('Orientation changed: ' + window.orientation);
            if (map) {
                map.infoWindow.hide();
                map.reposition();
                map.resize();
            }
        }, false);
        //resize map function
        dojo.connect(dijit.byId('map'), 'resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (map) {
                    map.infoWindow.hide();
                    map.reposition();
                    map.resize();
                }
            }, 500);
        });

        //urlUtils.addProxyRule({
        //    urlPrefix: "mesonet.agron.iastate.edu",
        //    proxyUrl: "/MARVLIS_Monitor/proxy.ashx"
        //});

        esri.config.defaults.io.proxyUrl = '/MARVLIS_Monitor/proxy.ashx';
        esriConfig.defaults.io.alwaysUseProxy = false;
        var sls = new esri.symbol.SimpleLineSymbol("solid", new esri.Color("#444444"), 3);
        popup = new esri.dijit.Popup({
            offsetX: 0,
            offsetY: 0,
            highlight: true,
            titleInBody: true,
            visibleWhenEmpty: false,
            markerSymbol: new esri.symbol.SimpleMarkerSymbol('circle', 26, null, new esri.Color([0, 0, 0, 0.25])),
            fillSymbol: new esri.symbol.SimpleFillSymbol('solid', sls, new esri.Color([68, 68, 68, 0.25])),
            lineSymbol: null
        }, dojo.create('div'));

        updateWorking('loading online traffic map ...');
        map = new esri.Map('mapDiv', {
            basemap: 'dark-gray',
            logo: true,
            slider: true,
            sliderStyle: 'small',
            nav: false,
            infoWindow: popup,
            autoResize: false,
            showAttribution: false
        });

        map.on('layers-add-result', layers_add_result);
        map.on('extent-change', function (evt) {
            if (map.infoWindow.isShowing) {
                map.infoWindow.hide();
                //log('map extent-change');
            }
        });
        geometryService = new esri.tasks.GeometryService(geoService);
        layersToAdd = [];
        overlayMapServiceLayer = new esri.layers.ArcGISDynamicMapServiceLayer(overlayMap, {
            id: 'Overlay_Map',
            opacity: 0.4,
            visible: true
        });
        layersToAdd.push(overlayMapServiceLayer);

        traf = new esri.layers.ArcGISDynamicMapServiceLayer('http://utility.arcgis.com/usrsvcs/servers/4a9f42a1e7fb487cab709fc4afbd4a8e/rest/services/World/Traffic/MapServer', {
            id: 'traf',
            visible: false
        });
        var _tio = new esri.InfoTemplate();
        _tio.setTitle("${incidenttype}");
        _tio.setContent("${description}<br>Location: ${location}<br><br>Started: ${start_localtime}<br>Expected to end: ${end_localtime}<br><br>Last updated: ${lastupdated_localtime}");
        traf.setInfoTemplates({
            2: { infoTemplate: _tio },
            3: { infoTemplate: _tio },
            4: { infoTemplate: _tio }
        });
        layersToAdd.push(traf);
        feedLayerTOC.push({ id: traf.id, label: 'Traffic', legend: { layer: traf, title: 'Traffic' } });

        //eventMapServiceLayer = new esri.layers.ArcGISDynamicMapServiceLayer(eventMap, {
        //    id: 'Event_Map',
        //    opacity: 0.7,
        //    visible: true,
        //    refreshInterval: 1.0
        //});
        //var _infoTemplateEvent = new esri.InfoTemplate();
        //_infoTemplateEvent.setTitle("Events");
        //_infoTemplateEvent.setContent("Type: ${EVENT_TYPE}<br><br>Name: ${EVENT_NAME}<br>Summary: ${EVENT_DESCRIPTION}<br><br>Started: ${EVENT_STARTDATE:formatDate}<br>Expected to end: ${EVENT_ENDDATE:formatDate}");
        //eventMapServiceLayer.setInfoTemplates({
        //    0: { infoTemplate: _infoTemplateEvent },
        //    1: { infoTemplate: _infoTemplateEvent }
        //});
        //layersToAdd.push(eventMapServiceLayer);
        //feedLayerTOC.push({ id: eventMapServiceLayer.id, label: 'Events', legend: { layer: eventMapServiceLayer, title: 'Events' } });
        updateWorking('loading weather feeds ...');
        //WEATHER FEEDS
        require(['esri/layers/WMSLayer', 'esri/layers/WMSLayerInfo'], function (WMSLayer, WMSLayerInfo) {
            var wmsLayerInfos = new WMSLayerInfo({
                name: 'nexrad-n0r',
                title: 'nexrad-n0r'
            });
            var ext = new esri.geometry.Extent(map.xmin, map.ymin, map.xmax, map.ymax, { wkid: 4326 });
            var resourceInfo = {
                extent: ext,
                layerInfos: [wmsLayerInfos]
            };
            //Request format"
            var wmsLayer = new WMSLayer("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?", {
                id: 'nexradWMSLayer',
                refreshInterval: "3",
                resourceInfo: resourceInfo,
                visibleLayers: ['nexrad-n0r']
            });
            wmsLayer.setOpacity(0.5);
            wmsLayer.hide();
            feedLayerTOC.push({ id: 'nexradWMSLayer', label: 'Weather Radar', legend: null });
            layersToAdd.push(wmsLayer);
        });

        watchWarnLayer = new esri.layers.ArcGISDynamicMapServiceLayer('http://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer', {
            id: 'watchWarn',
            opacity: 0.4,
            refreshInterval: 1,
            visible: false
        });
        _infoTemplate = new esri.InfoTemplate("${msg_type}", "WFO: ${wfo}</br>Event: ${event}</br>Issuance: ${issuance}</br>Expiration: ${expiration}</br>Type: ${prod_type}");
        watchWarnLayer.setInfoTemplates({
            0: { infoTemplate: _infoTemplate },
            1: { infoTemplate: _infoTemplate }
        });
        feedLayerTOC.push({ id: 'watchWarn', label: 'Weather Watch/Warning', legend: { layer: watchWarnLayer, title: 'Weather Watch/Warning' } });
        layersToAdd.push(watchWarnLayer);

        updateWorking('loading connector stream ...');

        gl = new esri.layers.GraphicsLayer({
            displayOnPan: false,
            id: 'glhilite',
            visible: true,
            opacity: 1.0
        });

        layersToAdd.push(gl);

        updateWorking('loading avl stream ...');
        //EMS
        //emsLayer = new esri.layers.StreamLayer(emsLayerURL, {
        //    id: 'avl_ems',
        //    purgeOptions: {
        //        displayCount: 200,
        //        age: 2
        //    },
        //    outFields: emsOutFields,
        //    maximumTrackPoints: 1,
        //    trackIdField: emsTrackIdField,
        //    infoTemplate: new esri.InfoTemplate(emsInfoTemplateTitle, emsInfoTemplate),
        //    visible: false
        //});
        //emsLayer.on("connect", function () {
        //    //var defaultSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, null, new esri.Color([0, 0, 255, 0.9]));
        //    //var renderer3 = new esri.renderer.SimpleRenderer(defaultSymbol);
        //    //emsLayer.setRenderer(renderer3);
        //    // ems = "M 17.5 1 C 15.007 1 13 1.0446094 13 1.0996094 L 13 9.3300781 L 6.1464844 4.53125 C 6.1011034 4.49945 4.9143008 6.1161034 3.484375 8.1582031 C 2.0544491 10.200303 0.93899401 11.870344 0.984375 11.902344 L 9.6738281 17.986328 L 1.0253906 24.042969 C 0.98000957 24.074769 2.0935117 25.74501 3.5234375 27.787109 C 4.9533634 29.829309 6.142119 31.448016 6.1875 31.416016 L 13 26.644531 L 13 34.900391 C 13 34.955391 15.007 35 17.5 35 C 19.993 35 22 34.955391 22 34.900391 L 22 26.617188 L 28.671875 31.289062 C 28.717256 31.320862 29.906012 29.702356 31.335938 27.660156 C 32.765863 25.618056 33.879364 23.949969 33.833984 23.917969 L 25.365234 17.988281 L 33.875 12.029297 C 33.920381 11.997497 32.804926 10.327356 31.375 8.2851562 C 29.945074 6.2430565 28.758271 4.62425 28.712891 4.65625 L 22 9.3574219 L 22 1.0996094 C 22 1.0446094 19.993 1 17.5 1 z ";

        //    ems = "m 42.474289,951.51199 c -11.619152,12.0111 -17.824652,18.2166 -26.062386,26.4208 l 16.511731,0.3526 0,16.94778 -14.176496,-9.92617 c -0.09387,-0.066 -2.548773,3.2783 -5.506573,7.50227 -2.957802,4.2241 -5.2651214,7.67853 -5.1712504,7.74473 l 17.9741334,12.5846 -17.8892924,12.5282 c -0.09387,0.066 2.2094084,3.5206 5.1672104,7.7448 2.9578,4.2243 5.416742,7.5726 5.510612,7.5063 l 14.091656,-9.8697 0,17.0772 c 0,0.114 4.15148,0.2061 9.30825,0.2061 5.156771,0 9.30825,-0.093 9.30825,-0.2061 l 0,-17.1337 13.800774,9.6637 c 0.09387,0.066 2.552813,-3.2821 5.510615,-7.5064 2.957797,-4.224 5.261076,-7.6745 5.167207,-7.7408 l -17.517609,-12.2655 17.602451,-12.3261 c 0.09387,-0.066 -2.213448,-3.52043 -5.17125,-7.74473 -2.957802,-4.22407 -5.412704,-7.57257 -5.506572,-7.50637 l -13.885616,9.72427 0,-16.73768 16.458798,-0.44 c -10.25329,-10.452 -16.45879,-16.6575 -25.524643,-26.6001 z";

        //    creatAVL_RendererClass(ems, emsLayer);
        //    var vLabel = new esri.symbol.TextSymbol().setColor(new esri.Color([0, 0, 255, 0.7]));
        //    vLabel.font.setSize('10pt');
        //    vLabel.font.setFamily('arial');
        //    vLabel.font.setWeight(esri.symbol.Font.WEIGHT_BOLD);
        //    vLabel.setKerning(true);
        //    var vLabelRenderer = new esri.renderer.SimpleRenderer(vLabel);
        //    var vlabels = new esri.layers.LabelLayer({
        //        id: "eLabels",
        //        minScale: 10000
        //    });
        //    vlabels.addFeatureLayer(emsLayer, vLabelRenderer, emsLabel);
        //    map.addLayer(vlabels);
        //});
        //layersToAdd.push(emsLayer);
        //feedLayerTOC.push({ id: 'avl_ems', label: 'EMS', legend: null });
        ////FIRE
        //fireLayer = new esri.layers.StreamLayer(fireLayerURL, {
        //    id: 'avl_fire',
        //    purgeOptions: {
        //        displayCount: 200,
        //        age: 2
        //    },
        //    outFields: fireOutFields,
        //    maximumTrackPoints: 1,
        //    trackIdField: fireTrackIdField,
        //    infoTemplate: new esri.InfoTemplate(fireInfoTemplateTitle, fireInfoTemplate),
        //    visible: false
        //});
        //fireLayer.on("connect", function () {
        //    //var defaultSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, null, new esri.Color([255, 0, 0, 0.9]));
        //    //var renderer3 = new esri.renderer.SimpleRenderer(defaultSymbol);
        //    //fireLayer.setRenderer(renderer3);
        //    tri = "m 19.042561,1050.7438 16,-34 -33.9999997,0 17.9999997,34 z";
        //    creatAVL_RendererClass(tri, fireLayer);

        //    var vLabel = new esri.symbol.TextSymbol().setColor(new esri.Color([0, 0, 255, 0.7]));
        //    vLabel.font.setSize('10pt');
        //    vLabel.font.setFamily('arial');
        //    vLabel.font.setWeight(esri.symbol.Font.WEIGHT_BOLD);
        //    vLabel.setKerning(true);
        //    var vLabelRenderer = new esri.renderer.SimpleRenderer(vLabel);
        //    var vlabels = new esri.layers.LabelLayer({
        //        id: "fLabels",
        //        minScale: 10000
        //    });
        //    vlabels.addFeatureLayer(fireLayer, vLabelRenderer, fireLabel);
        //    map.addLayer(vlabels);
        //});
        //layersToAdd.push(fireLayer);
        //feedLayerTOC.push({ id: 'avl_fire', label: 'Fire', legend: null });
        //LAW
        vehicleLayer = new esri.layers.StreamLayer(vehicleLayerURL, {
            id: 'avl_law',
            purgeOptions: {
                displayCount: 200,
                age: 2
            },
            outFields: vehicleOutFields,
            maximumTrackPoints: 1,
            trackIdField: vehicleTrackIdField,
            infoTemplate: new esri.InfoTemplate(vehicleInfoTemplateTitle, vehicleInfoTemplate)
        });

        vehicleLayer.on("connect", function () {
            //console.log("advancedQueryCapabilities:", vehicleLayer.advancedQueryCapabilities);
            var vLabel = new esri.symbol.TextSymbol().setColor(new esri.Color([0, 0, 0, 1.0]));
            vLabel.font.setSize('12pt');
            vLabel.font.setFamily('arial');
            vLabel.font.setWeight(esri.symbol.Font.WEIGHT_BOLD);
            vLabel.setKerning(true);
            var vLabelRenderer = new esri.renderer.SimpleRenderer(vLabel);
            var vlabels = new esri.layers.LabelLayer({
                id: "vLabels"
            });
            vlabels.addFeatureLayer(vehicleLayer, vLabelRenderer, vehicleLabel);
            map.addLayer(vlabels);
        });

        vehicleLayer.on('update-end', generateFeedRecords);

        //vehicleLayer.on("disconnect", processDisconnect);
        //vehicleLayer.on("attempt-reconnect", processAttemptReconnect);
        vehicleLayer.on("error", function (evt) {
            console.log("Error: ", evt);
        });
        feedLayerTOC.push({ id: 'avl_law', label: 'Law', legend: null });
        layersToAdd.push(vehicleLayer);

        updateWorking('loading cfs stream ...');
        //INCIDENTS
        //definitionExpression: "bcs_assignedvehicles <> ''",
        incidentLayer = new esri.layers.StreamLayer(incidentLayerURL, {
            id: 'cfs',
            outFields: ['bcs_incident', 'bcs_address', 'bcs_assigned', 'bcs_priority', 'bcs_timereceived', 'bcs_complaint', 'bcs_agency', 'bcs_division'],
            maximumTrackPoints: 1,
            trackIdField: 'bcs_incident',
            purgeOptions: {
                displayCount: 25,
                age: 1
            },
            infoTemplate: new esri.InfoTemplate("${bcs_incident}", "Complaint: ${bcs_complaint}</br>District: ${bcs_division}</br>Address: ${bcs_address}</br>Assigned: ${bcs_assigned}</br>Received: ${bcs_timereceived:formatDate}")
        });

        incidentLayer.on("connect", function () {
            // diamond = "M 4.9355237,984.50614 61.144253,928.29741 c 1.859146,-1.85915 4.940463,-1.77103 6.908935,0.19744 l 55.813822,55.81382 c 1.96872,1.96873 2.05661,5.04981 0.19746,6.90896 l -56.208725,56.20877 c -1.859084,1.859 -4.940231,1.7712 -6.908958,-0.1975 L 5.1329677,991.41507 c -1.9684722,-1.96847 -2.0565275,-5.04985 -0.197444,-6.90893 z";
            diamond = "m 256,128 c -44.183,0 -80,35.817 -80,80 0,80 80,176 80,176 0,0 80,-96 80,-176 0,-44.183 -35.8175,-80 -80,-80 z m 0,128 c -26.51,0 -48,-21.49 -48,-48 0,-26.51 21.49,-48 48,-48 26.51,0 48,21.49 48,48 0,26.51 -21.49,48 -48,48 z";
            size = 24;

            var defaultSymbol2 = new esri.symbol.SimpleMarkerSymbol();
            defaultSymbol2.setPath(diamond);
            defaultSymbol2.setColor(new esri.Color([76, 255, 0, 0.9]));
            defaultSymbol2.setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([0, 0, 0]), 3));
            defaultSymbol2.setSize(size);
            var renderer2 = new esri.renderer.UniqueValueRenderer(defaultSymbol2, 'bcs_priority');
            sym = new esri.symbol.SimpleMarkerSymbol();
            sym.setPath(diamond);
            sym.setColor(new esri.Color([0, 148, 255, 0.9]));
            sym.setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([0, 0, 0]), 3));
            sym.setSize(size);
            renderer2.addValue('P1', sym);
            sym = new esri.symbol.SimpleMarkerSymbol();
            sym.setPath(diamond);
            sym.setColor(new esri.Color([255, 106, 0, 0.9]));
            sym.setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([0, 0, 0]), 3));
            sym.setSize(size);
            renderer2.addValue('P2', sym);
            sym = new esri.symbol.SimpleMarkerSymbol();
            sym.setPath(diamond);
            sym.setColor(new esri.Color([255, 216, 0, 0.9]));
            sym.setOutline(new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([0, 0, 0]), 3));
            sym.setSize(size);
            renderer2.addValue('P3', sym);
            incidentLayer.setRenderer(renderer2);
            var iLabel = new esri.symbol.TextSymbol().setColor(new esri.Color([255, 0, 0, 0.7]));
            iLabel.font.setSize('12pt');
            iLabel.font.setFamily('arial');
            iLabel.font.setWeight(esri.symbol.Font.WEIGHT_BOLD);
            iLabel.setKerning(true);
            iLabel.yoffset = -16;
            iLabel.xoffset = 10;
            var iLabelRenderer = new esri.renderer.SimpleRenderer(iLabel);
            var ilabels = new esri.layers.LabelLayer({
                id: 'iLabels',
                minScale: 10000
            });
            ilabels.addFeatureLayer(incidentLayer, iLabelRenderer, "{bcs_incident}");
            map.addLayer(ilabels);
            createIncidentBars();
        });
        incidentLayer.on('update-end', generateIncidentRecords);
        layersToAdd.push(incidentLayer);
        feedLayerTOC.push({ id: 'cfs', label: 'CFS', legend: null });

        tabResponse = new esri.layers.FeatureLayer(tabResponseURL, {
            id: 'Response_Table',
            mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
            outFields: ['*'],
            refreshInterval: 1
        });
        setInterval(function () { response_update_end(); }, 15000);

        tp = new esri.layers.GraphicsLayer({
            id: 'tempGraphicLayer',
            displayOnPan: false,
            opacity: 1.0,
            visible: true
        });
        layersToAdd.push(tp);

        updateWorking('loading all layers ...');
        map.addLayers(layersToAdd);
        //});

    } catch (err) {
        eh(err, 'init');
    }
}

function layers_add_result(evt) {
    try {
        updateWorking('layers loaded, finishing ...');
        //map.reorderLayer(trafficLayer, 2);
        var layerInfo = dojo.map(evt.layers, function (layer, index) {
            return { layer: layer.layer, title: layer.layer.name };
        });

        map.setExtent(new esri.geometry.Extent(XMin, YMin, XMax, YMax, new esri.SpatialReference(102100)));

        sel = new dijit.form.Select({
            id: "selectAVLSort",
            name: "selectAVLSort",
            value: 'District:A',
            options: [{ value: 'Unit:A', label: 'Unit' }, { value: 'District:A', label: 'District', selected: true }, { value: 'Availability:A', label: 'Status' }]
        });
        dojo.byId('tdAVLSort').appendChild(sel.domNode);
        sel.startup();

        sel = new dijit.form.Select({
            id: "selectCFSSort",
            name: "selectCFSSort",
            value: 'Priority:A',
            options: [{ value: 'Priority:A', label: 'Priority', selected: true }, { value: 'District:A', label: 'District' }, { value: 'TimeReceived:D', label: 'Time Received' }]
        });
        dojo.byId('tdCFSSort').appendChild(sel.domNode);
        sel.startup();

        sel = new dijit.form.Select({
            id: "selectPriority",
            name: "selectPriority",
            value: 'P1',
            options: [{ value: 'P1', label: 'P1', selected: true }, { value: 'P2', label: 'P2' }, { value: 'P3', label: 'P3' }, { value: 'P4', label: 'PO' }],
            onChange: function (evt) { response_update_end(); }
        });
        dojo.byId('tdPriority').appendChild(sel.domNode);
        sel.startup();

        dojo.byId('tdChart').appendChild(new dijit.form.ToggleButton({
            id: "btnAVLCFSPanePage",
            label: "",
            iconClass: "chartIcon",
            showLabel: false,
            class: 'btnTools',
            checked:true,
            onClick: function (evt) {
                blur();
                pickTool = null;
                toggleTool(this);
                toggleAVLCall('AVLCFSPanePage');
            }
        }).domNode);
        dojo.byId('tdAVL').appendChild(new dijit.form.ToggleButton({
            id: "btnAVLPanePage",
            label: "",
            iconClass: "avlIcon",
            showLabel: false,
            class: 'btnTools',
            checked: false,
            onClick: function (evt) {
                blur();
                pickTool = null;
                toggleTool(this);
                toggleAVLCall('AVLPanePage');
            }
        }).domNode);
        dojo.byId('tdCFS').appendChild(new dijit.form.ToggleButton({
            id: "btnCFSPanePage",
            label: "",
            iconClass: "cfsIcon",
            showLabel: false,
            class: 'btnTools',
            checked: false,
            onClick: function (evt) {
                blur();
                pickTool = null;
                toggleTool(this);
                toggleAVLCall('CFSPanePage');
            }
        }).domNode);
        dojo.byId('tdLayers').appendChild(new dijit.form.ToggleButton({
            id: "btnLayers",
            label: "",
            iconClass: "layerIcon",
            showLabel: false,
            class: 'btnTools',
            checked: false,
            onClick: function (evt) {
                blur();
                pickTool = null;
                toggleTool(this);
                toggleAVLCall('TOCPanePage');
            }
        }).domNode);
        require(["dojo/on"], function (on) {
            on(dojo.byId('btnBaseMap'), 'click', function (evt) {
                blur();
                //hidePopups("divGallery");
                (dojo.hasClass("divGallery", "visible")) ? dojo.replaceClass("divGallery", "hidden", "visible") : dojo.replaceClass("divGallery", "visible", "hidden");
            });
        });
        var basemapGallery = new esri.dijit.BasemapGallery({
            showArcGISBasemaps: true,
            map: map
        }, 'gallery');
        basemapGallery.startup();
        basemapGallery.on('error', function (evt) {
            myAlert(evt.error);
        });
        basemapGallery.on('selection-change', function () {
            dojo.replaceClass("divGallery", "hidden", "visible");
        });
        dojo.byId('tdFeeds').appendChild(new dijit.form.ToggleButton({
            id: "btnFeeds",
            label: "",
            iconClass: "feedIcon",
            showLabel: false,
            class: 'btnTools',
            checked: false,
            onClick: function (evt) {
                blur();
                pickTool = null;
                toggleTool(this);
                toggleAVLCall('FEEDPanePage');
            }
        }).domNode);
        if (siteType !== 'PSAP') {
            dojo.byId('tdEdit').appendChild(new dijit.form.Button({
                id: "btnEdit",
                label: "",
                iconClass: "editIcon",
                showLabel: false,
                onClick: function (evt) {
                    blur();
                }
            }).domNode);
        }
        var home = new esri.dijit.HomeButton({
            map: map,
            extent: new esri.geometry.Extent(geoXMin, geoYMin, geoXMax, geoYMax, new esri.SpatialReference(102100))
        }, 'btnHome');
        home.startup();
        home.on('home', function (evt) {
            try {
                if (isMain) {
                    if (childWindow && childWindow.window) {
                        childWindow.$(childWindow.document).trigger('childWindow', 'hilite_clear|nothing');
                    }
                }
            } finally {
                map.getLayer('glhilite').clear();
                //map.getLayer('gldraw').clear();
                deactivateToolbars('all');
            }
        });
        require(['esri/dijit/Search','esri/tasks/locator'], function (Search, Locator) {
            var s = new Search({
                enableButtonMode: true, //this enables the search widget to display as a single button
                expanded: true,
                enableLabel: true,
                enableInfoWindow: true,
                showInfoWindowOnSelect: false,
                autoNavigate: false,
                map: map
            }, 'search');
            s.on('select-result', function (evt) {
                (evt.result.feature.geometry.type === 'point') ? map.setExtent(evt.result.extent.expand(2.0), true) : map.setExtent(evt.result.extent, true);
            });
            var sources = [];
            dojo.forEach(locatorSources, function (loc) {
                sources.push({
                    locator: new Locator(loc.locator),
                    singleLineFieldName: loc.singleLineFieldName,
                    outFields: loc.outFields.split(','),
                    name: loc.name,
                    placeholder: loc.placeholder
                });
            });
            dojo.forEach(searchSources, function (src) {
                sources.push({
                    featureLayer: new esri.layers.FeatureLayer(src.layer),
                    searchFields: src.searchFields,
                    displayField: src.displayField,
                    exactMatch: src.exactMatch,
                    outFields: src.outFields,
                    name: src.name,
                    placeholder: src.placeholder,
                    maxResults: src.maxResults,
                    maxSuggestions: src.maxSuggestions,
                    infoTemplate: new esri.InfoTemplate(src.infoTemplateTitle, src.infoTemplate),
                    enableSuggestions: src.enableSuggestions,
                    minCharacters: src.minCharacters,
                    highlightSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0, 0.5]), 2))
                });
            });
            s.set('sources', sources);
            s.startup();
        });
        createNewTOC();
        createFeedTOC();
        buildGauges();
        createToolTips();
        mydragg.onload();
        map.on('resize', function (evt) {
            mydragg.onmapresize(evt.width, evt.height);
        });
        //dijit.byId('GC1').resize();
    } catch (err) {
        eh(err, 'layers_add_result');
    } finally {
        hideWorking();
    }
}

function createToolTips() {
    new dijit.Tooltip({
        connectId: ['imgCloseLeftPane'],
        position: ['below'],
        label: 'Close left page'
    });
    new dijit.Tooltip({
        connectId: ['btnAVLCFSPanePage'],
        position: ['below'],
        label: 'AVL/CFS monitor'
    });
    new dijit.Tooltip({
        connectId: ['btnAVLPanePage'],
        position: ['below'],
        label: 'AVL table listing'
    });
    new dijit.Tooltip({
        connectId: ['btnCFSPanePage'],
        position: ['below'],
        label: 'CFS table listing'
    });
    new dijit.Tooltip({
        connectId: ['btnLayers'],
        position: ['below'],
        label: 'Table of contents'
    });
    //new dijit.Tooltip({
    //    connectId: ['btnBaseMap'],
    //    position: ['below'],
    //    label: 'Base maps'
    //});
    new dijit.Tooltip({
        connectId: ['btnFeeds'],
        position: ['below'],
        label: 'Feeds'
    });
    new dijit.Tooltip({
        connectId: ['btnEdit'],
        position: ['below'],
        label: 'Open event editor'
    });
}
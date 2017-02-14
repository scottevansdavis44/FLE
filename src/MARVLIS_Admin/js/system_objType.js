var mapChart = null;
var shiftOptions = null;

function getVars() {
    updateWorking('loading variables');
    return esri.request({
        url: 'json/fle_admin.json',
        handleAs: 'json'
    });
}

function buildShift() {
    var req = esri.request({
        url: 'json/fle_admin_shift.json',
        handleAs: 'json',
        callbackParamName: 'callback'
    });
    req.then(function (response) {
        shiftObj = response.shifts;
        opts = [];
        opts.push({ value: 'ALL', label: "<div class='geoZoom'>" + response.displayHeader + "</div>", selected: true });
        dojo.forEach(response.shifts, function (s) {
            opts.push({ value: s.code, label: s.label });
        });
        shiftOptions = opts;
        sel = new dijit.form.Select({
            id: "selectShift",
            name: "selectShift",
            options: opts,
            onChange: function (evt) {
                getAnalysisVars();
                setLyrDefs();
                buildSummaryTable('ChartToDateSummary');
                buildPie('ChartPie');
                buildHistogram('MainHistogram');
                toggleLayerVisibility();
                mapChartRenderType_onChange(dijit.byId('mapChartRenderType').get('value'));
            }
        });
        dojo.byId('shiftSelector').appendChild(sel.domNode);
        sel.startup();
    }, function (error) {
        log("Error: ", error.message);
    });
}

function loadTypes(msg) {
    buildShift();
    updateWorking('loading layers ...');
    dataConfig = msg.Configurations;
    //dojo.byId('lblTimeStamp').innerHTML = 'Data Updated: ' + dataConfig[0].timeStamp;
    try {
        opts = [];
        lyrsToAdd = [];
        olyr = new esri.layers.ArcGISDynamicMapServiceLayer(adminMap, {
            id: 'olyr',
            opacity: 0.4,
            visible: true
        });
        olyr.on('update-end', function (evt) {
            e = evt;
        });
        olyr.on('error', function (evt) {
            e = evt;
        });
        lyrsToAdd.push(olyr);
        tbl = dojo.byId('eventGroups');
        bod = dojo.create('tbody', null, tbl);
        row = dojo.create('tr', null, bod, 'last');
        dojo.forEach(dataConfig[0].groups, function (g, zero) {
            td = dojo.create('td', { style: 'text-align: left; vertical-align: middle;' }, row, 'last');
            iname = g.title.split(' ').join('').toLowerCase() + 'Icon';
            btn = new dijit.form.ToggleButton({
                id: 'btnToggle_' + zero,
                title: g.title,
                iconClass: iname,
                showLabel: false,
                class: 'btnMainStats',
                checked: (zero == 0),
                label: g.title,
                value: g.title,
                onClick: function () { toggleCodeCategory(this); }
            });
            td.appendChild(btn.domNode);
            btn.startup();
        });
        dijit.byId('divMainContainer').resize();
        dijit.byId('divMainCenter').resize();
        dojo.forEach(dataConfig, function (item, i) {
            dojo.forEach(item.groups, function (group, j) {
                dojo.forEach(group.codeTable, function (c) {
                    c.codes = c.codes.split(',');
                });
                dojo.forEach(group.events, function (evnt, k) {
                    if (evnt.parent == 'chartPie' && i == 0 && j == 0) {
                        opts.push({
                            value: evnt.eventTitle,
                            label: evnt.eventTitle
                        });
                    }
                    var defaultSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 8, null, new esri.Color([0, 0, 0, 0.9]));
                    if (evnt.eventTitle.indexOf('days') > -1 || evnt.eventTitle.indexOf('weeks') > -1) {
                        flyr = new esri.layers.FeatureLayer(item.eventService + evnt.index, {
                            id: group.title + ' ' + evnt.eventTitle,
                            outFields: ['*'],
                            mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
                            infoTemplate: new esri.InfoTemplate("Info", group.infotemp.split('|').join('<br />')),
                            maxAllowableOffset: 1000,
                            visible: false
                        });
                        //flyr.addPlugin("esri/plugins/FeatureLayerStatistics");
                        var renderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, group.table + '.' + group.codeFieldName);
                        dojo.forEach(group.codeTable, function (cat) {
                            dojo.forEach(cat.codes, function (code) {
                                sym = new esri.symbol.SimpleMarkerSymbol();
                                sym.setPath("m 10.5,6.5 a 4,4 0 0 1 -4,4 4,4 0 0 1 -4,-4 4,4 0 0 1 4,-4 4,4 0 0 1 4,4 z");
                                sym.setColor(cat.color);
                                sym.setOutline(null);
                                sym.setSize(8);
                                renderer.addValue(code, sym);
                            });
                        });
                        dojo.mixin(group, { pinmap: renderer });
                        var heat_renderer = new esri.renderer.HeatmapRenderer({
                            colors: ["rgba(0, 255, 0, 0)", "rgba(0, 255, 0, 0.5)", "rgba(255, 216, 0, 0.5)", "rgba(255, 106, 0, 0.5)", "rgba(255, 0, 0, 0.5)"],
                            blurRadius: 12,
                            maxPixelIntensity: 40,
                            minPixelIntensity: 1
                        });
                        dojo.mixin(group, { heatmap: heat_renderer });
                        flyr.on('update-start', function () {
                           // this.suspend();
                        });
                        flyr.on('update-end', function (evt) {
                            log('layer ' + evt.target.id + ' update ended');
                            if (evt.error) {
                                log('ERROR (update-end): ' + evt.target.id + ' > ' + evt.error.message);
                            }
                        });
                        flyr.on('error', function (evt) {
                            log('ERROR (error): ' + evt.target.id + ' > ' + evt.error.message);
                        });
                        lyrsToAdd.push(flyr);
                    } else if (evnt.eventTitle == 'LYWK' || evnt.eventTitle == 'WTD' || evnt.eventTitle == 'MTD' || evnt.eventTitle == 'YTD') {
                        flyr = new esri.layers.FeatureLayer(item.eventService + evnt.index, {
                            id: group.title + ' ' + evnt.eventTitle,
                            outFields: ['*'],
                            mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
                            visible: false
                        });
                        flyr.setDefinitionExpression(group.table + '.' + group.dateFieldName + ' >= ' + evnt.startDateRange + ' AND ' + group.table + '.' + group.dateFieldName + ' <= ' + evnt.endDateRange);
                        flyr.on('update-end', function (evt) {
                            log('layer ' + evt.target.id + ' update ended');
                            if (evt.error) {
                                log('ERROR (update-end): ' + evt.target.id + ' > ' + evt.error.message);
                            }
                        });
                        flyr.on('error', function (evt) {
                            log('ERROR (error): ' + evt.target.id + ' > ' + evt.error.message);
                        });
                        lyrsToAdd.push(flyr);
                    } else {
                        flyr = new esri.layers.FeatureLayer(item.eventService + evnt.index, {
                            id: group.title + ' ' + evnt.eventTitle,
                            outFields: ['*'],
                            mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
                            visible: false
                        });
                        flyr.on('update-end', function (evt) {
                            log('layer ' + evt.target.id + ' update ended');
                            if (evt.error) {
                                log('ERROR (update-end): ' + evt.target.id + ' > ' + evt.error.message);
                            }
                        });
                        flyr.on('error', function (evt) {
                            log('ERROR (error): ' + evt.target.id + ' > ' + evt.error.message);
                        });
                        lyrsToAdd.push(flyr);
                    }
                });
            });
        });

        sel = new dijit.form.Select({
            id: "selectDay",
            name: "selectDay",
            style: "width: 100px",
            autoWidth: false,
            options: opts,
            value: dataConfig[0].groups[0].events[0].eventTitle,
            onChange: function (evt) {
                getAnalysisVars();
                setLyrDefs();
                buildPie('ChartPie');
                val = dijit.byId('chartHistogram_MainHistogram').get('value');
                if (val == 'BAR_DAY' || val == 'LINE_DAY') {
                    buildLastDays('MainHistogram');
                }
                toggleLayerVisibility();
                mapChartRenderType_onChange(dijit.byId('mapChartRenderType').get('value'));
            }
        });
        dojo.byId('daySelector').appendChild(sel.domNode);
        sel.startup();

        catitems = getCategoriesByPart(dataConfig[0].groups[0].title, dataConfig[0]);
        opts = [];
        dojo.forEach(catitems, function (itm) {
            opts.push({ value: dataConfig[0].groups[0].title + '_' + itm.category + '_' + itm.abbr, label: itm.category, selected: false });
        });
        opts.unshift({ value: dataConfig[0].groups[0].title + '_ALL_' + dataConfig[0].groups[0].title, label: "<div class='geoZoom'>" + dataConfig[0].groups[0].title + "</div>", selected: true });
        sel = new dijit.form.Select({
            id: 'selectCatagory',
            style: "width: 100px",
            autoWidth: false,
            options: opts,
            value: dataConfig[0].groups[0].title + '_ALL',
            onChange: function (evt) {
                try {
                    getAnalysisVars();
                    //log('selectCatagory_OnChange (' + evt + ')');
                    ttl = evt.split('_');
                    if (ttl[1] == 'ALL') {
                        crime_summary_selected_category = null;
                        buildPie('ChartPie');
                        buildSummaryTable('ChartToDateSummary');
                    } else {
                        crime_summary_selected_category = ttl[1];
                        buildSummaryTable('ChartToDateSummary');
                    }
                    setLyrDefs();
                    buildHistogram('MainHistogram');
                    toggleLayerVisibility();
                    //mapChartRenderType_onChange(dijit.byId('mapChartRenderType').get('value'));
                } catch (err) {
                    eh(err, 'selectCategory onChange');
                }
            }
        });
        dojo.byId('catagorySelector').appendChild(sel.domNode);
        sel.startup();

        createTrendTypeMenu('MainHistogram');

        popup = new esri.dijit.Popup({
            offsetX: 0,
            offsetY: 0,
            highlight: true,
            titleInBody: false,
            visibleWhenEmpty: true,
            closestFirst: true,
            marginLeft: 20,
            marginTop: 20,
            markerSymbol: new esri.symbol.SimpleMarkerSymbol('circle', 26, null, new esri.Color([0, 0, 0, 0.25])),
            fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, null, new esri.Color([0, 0, 0, 0.75]))
        }, dojo.create('div'));

        mapChart = new esri.Map('mapChart', {
            extent: new esri.geometry.Extent(XMin, YMin, XMax, YMax, new esri.SpatialReference(SR)),
            logo: true,
            slider: true,
            sliderStyle: 'small',
            infoWindow: popup,
            nav: false,
            autoResize: true,
            showAttribution: false
        });
        mapChart.setBasemap('dark-gray');
        mapChart.on('update-start', function () {
            showLW('divWorking_Map');
        });
        mapChart.on('update-end', function (evt) {
            hideLW('divWorking_Map');
        });
        mapChart.on('zoom-end', function (evt) {
            log('map chart zoom end');
            //mapChart.infoWindow.hide();
            maxOffset = calcOffset();
            mapChart.getLayer(crime_part + ' ' + crime_days).setMaxAllowableOffset(maxOffset);
        });
        //mapChart.setExtent(new esri.geometry.Extent(XMin, YMin, XMax, YMax, new esri.SpatialReference(SR)));
        mapChart.on('extent-change', function (evt) {
            mapChart.infoWindow.hide();
            //log('map chart extent-change');
            if (mapChart.infoWindow.isShowing && (evt.delta.y > 0 || evt.delta.x > 0)) {
                log('map chart extent-change clear popup');
                mapChart.infoWindow.hide();
            }
        });
        geometryService = new esri.tasks.GeometryService(geoService);
        mapChart.on('load', function (evt) {
            try {
                getGeoVars().then(function (rtn) {
                    geoLayers = rtn.zones;
                    dojo.forEach(geoLayers, function (zl) {
                        lyr = new esri.layers.FeatureLayer(adminMap + '/' + zl.layerIndex, {
                            id: 'cb_' + zl.displayName,
                            outFields: ['*'],
                            mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
                            infoTemplate: new esri.InfoTemplate(zl.displayName + " ${" + zl.queryField + "}", "${" + zl.queryField + ":calculate_cb_values} events"),
                            visible: false
                        });
                        if (zl.useInDropDown) {
                            lyr.on('dbl-click', function (evt) {
                                lyrobj = getGeoLayerObject();
                                lyrobj_queryField = lyrobj.queryField;
                                val = evt.graphic.attributes[lyrobj_queryField];
                                filteredArr = dojo.filter(dijit.byId('selectDistrict').getOptions(), function (opt) {
                                    return opt.label == lyrobj.displayName + ': ' + val;
                                });
                                dijit.byId('selectDistrict').set('value', filteredArr[0].value);
                            });
                        }
                        lyrsToAdd.push(lyr);
                    });
                    mapChart.addLayers(lyrsToAdd);
                }, function (err) {
                    log('ERROR: ' + err.message);
                });
            } catch (err) {
                eh(err, 'map load');
            }
        });
        mapChart.on('layers-add-result', function (evt) {
            try {
                log('map chart layers-add-result');
                constructGeos();
                buildInititalCharts();
                var home = new esri.dijit.HomeButton({
                    map: mapChart,
                    extent: new esri.geometry.Extent(XMin, YMin, XMax, YMax, new esri.SpatialReference(SR)) //new esri.geometry.Extent(XMin, YMin, XMax, YMax, new esri.SpatialReference(102100))
                }, 'btnHome');
                home.startup();
                createBaseMaps();
                hideWorking();
            } catch (err) {
                eh(err, 'map chart layers-add-result');
            }
        });
        //mapChart.on("click", cleanUp);
        mapChart.on("key-down", function (e) {
            if (e.keyCode === 27) {
                cleanUp();
            }
        });

    } catch (err) {
        eh(err, 'loadTypes');
    }
}

function createBaseMaps() {
    require(["esri/dijit/BasemapGallery"], function (BasemapGallery) {
        var basemapGallery = new BasemapGallery({
            showArcGISBasemaps: true,
            map: mapChart
        });
        basemapGallery.startup();
        var opts = [];
        basemapGallery.on('load', function (evt) {
            dojo.forEach(basemapGallery.basemaps, function (basemap) {
                opts.push({ selected: (basemap.title == 'Dark Gray Canvas'), value: basemap.id, label: "<img width='16px' height='16px' src='" + basemap.thumbnailUrl + "' style='vertical-align: middle;'/><label style='vertical-align: middle; padding-left: 4px;'>" + basemap.title + "</label>" });
            });
            sel = new dijit.form.Select({
                id: "selectBaseMap",
                name: "selectBaseMap",
                style: "width: 100px",
                maxHeight: 200,
                options: opts,
                onChange: function (evt) {
                    bm = mapChart.getBasemap();
                    basemapGallery.select(evt);
                }
            });
            dojo.byId('tdBaseMaps').appendChild(sel.domNode);
        });
    });
}

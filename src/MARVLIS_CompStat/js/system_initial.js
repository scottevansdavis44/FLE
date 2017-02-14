function showStartDate() {
    //    var max = new Date();
    //    currentDayOfWeek = max.getDay();
    //    diff = currentDayOfWeek - startDayOfWeek;
    //    if (diff < 0) { diff = 7 - diff; }
    //    sDate = new Date();
    //    sDate.setDate(max.getDate() - diff);
    if (!dijit.byId('dttStartDate')) {
        require(['dijit/Calendar'], function (Calendar) {
            new Calendar({
                id: 'dttStartDate',
                value: startDate,
                isDisabledDate: function (d) {
                    var d = new Date(d);
                    d.setHours(0, 0, 0, 0);
                    return d > new Date();
                    //DayOfWeek = d.getDay();
                    //return DayOfWeek != startDayOfWeek || d > new Date();
                },
                getClassForDate: function (d) {
                    var d = new Date(d);
                    d.setHours(0, 0, 0, 0);
                    if (d >= startDate && d <= endDate) {
                        return 'red';
                    }
                },
                onChange: function (evt) {
                    var ssDate = evt;
                    ssDate.setHours(0, 0, 0);
                    var eeDate = new Date(ssDate.getFullYear(), ssDate.getMonth(), ssDate.getDate());
                    add = reportDays - 1;
                    eeDate.setTime(ssDate.getTime() + (add * 24 * 60 * 60 * 1000));
                    today = new Date();
                    if (eeDate > today) {
                        myAlert('Last day of reporting period cannot be greater than today.');
                        return;
                    }
                    dojo.byId('lblDateRangeUser').innerHTML = 'Reporting period will be from ' + convertUTCToDate(ssDate) + ' to ' + convertUTCToDate(eeDate);
                    //                    result = evt;
                    //                    currentDayOfWeek = result.getDay();
                    //                    diff = currentDayOfWeek - startDayOfWeek;
                    //                    if (diff < 0) { diff = reportDays + diff; }
                    //                    var ssDate = new Date();
                    //                    ssDate.setHours(0, 0, 0);
                    //                    ssDate.setTime(result.getTime() - (diff * 24 * 60 * 60 * 1000));
                    //                    var eeDate = new Date(ssDate.getFullYear(), ssDate.getMonth(), ssDate.getDate());
                    //                    eeDate.setHours(0, 0, 0);
                    //                    add = reportDays - 1;
                    //                    eeDate.setTime(ssDate.getTime() + (add * 24 * 60 * 60 * 1000));
                    //                    today = new Date();
                    //                    if (eeDate > today) {
                    //                        myAlert('Last day of reporting period cannot be greater than today.');
                    //                        return;
                    //                    }
                    //                    dojo.byId('lblDateRangeUser').innerHTML = 'Reporting period will be from ' + convertUTCToDate(ssDate) + ' to ' + convertUTCToDate(eeDate);
                }
            }, 'tdStartDate').startup();
        });
    } else {
        dijit.byId('dttStartDate').set('value', startDate);
    }
    dojo.byId('lblDateRangeUser').innerHTML = 'Reporting period will be from ' + convertUTCToDate(startDate) + ' to ' + convertUTCToDate(endDate);

    //    dijit.byId('dttStartDate').isDisabledDate = function (d) {
    //        var d = new Date(d);
    //        d.setHours(0, 0, 0, 0);
    //        DayOfWeek = d.getDay();
    //        return DayOfWeek != startDayOfWeek;
    //    };
    //    dijit.byId('dttStartDate').constraints.max = new Date();
    //    dijit.byId('dttStartDate').set('value', startDate);
    //    dijit.byId('dttStartDate').on('change', function (evt) {
    //        result = evt;
    //        currentDayOfWeek = result.getDay();
    //        diff = currentDayOfWeek - startDayOfWeek;
    //        if (diff < 0) { diff = reportDays + diff; }
    //        var ssDate = new Date();
    //        ssDate.setHours(0, 0, 0);
    //        ssDate.setTime(result.getTime() - (diff * 24 * 60 * 60 * 1000));
    //        var eeDate = new Date(ssDate.getFullYear(), ssDate.getMonth(), ssDate.getDate());
    //        eeDate.setHours(0, 0, 0);
    //        add = reportDays - 1;
    //        eeDate.setTime(ssDate.getTime() + (add * 24 * 60 * 60 * 1000));
    //        today = new Date();
    //        if (eeDate > today) {
    //            myAlert('Last day of reporting period cannot be greater than today.');
    //            return;
    //        }
    //        dojo.byId('lblDateRangeUser').innerHTML = 'Reporting period will be from ' + convertUTCToDate(ssDate) + ' to ' + convertUTCToDate(eeDate);
    //    });
    dijit.byId('divStartDate').show();
}

function cancelStartDate(evt) {
    dojo.byId('lblDateRangeUser').innerHTML = '';
    dijit.byId('divStartDate').hide();
}

function closeStartDate(evt) {
    var sDate = dijit.byId('dttStartDate').get('value');
    sDate.setHours(0, 0, 0);
    var eDate = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
    add = reportDays - 1;
    eDate.setTime(sDate.getTime() + (add * 24 * 60 * 60 * 1000));
    today = new Date();
    if (eDate > today) {
        myAlert('Last day of reporting period cannot be greater than today.');
        return;
    }

    //    var sDate = dijit.byId('dttStartDate').get('value');
    //    sDate.setHours(0, 0, 0);
    //    currentDayOfWeek = sDate.getDay();
    //    diff = currentDayOfWeek - startDayOfWeek;

    //    sDate.setTime(sDate.getTime() - (diff * 24 * 60 * 60 * 1000));
    //    var eDate = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
    //    eDate.setHours(0, 0, 0);
    //    add = reportDays - 1;
    //    eDate.setTime(sDate.getTime() + (add * 24 * 60 * 60 * 1000));
    //    today = new Date();
    //    if (eDate > today) {
    //        myAlert('Last day of reporting period cannot be greater than today.');
    //        return;
    //    }
    map.infoWindow.hide();
    deactivateToolbars('measure');
    map.getLayer('glmeasure').clear();
    if (childWindow && childWindow.window) {
        childWindow.$(childWindow.document).trigger('childWindow', 'draw_clear|glmeasure');
    }
    deactivateToolbars('draw');
    map.getLayer('gldraw').clear();
    if (childWindow && childWindow.window) {
        childWindow.$(childWindow.document).trigger('childWindow', 'draw_clear|gldraw');
    }
    toggleAllEventLayersOff();
    dijit.byId('dialogTable').hide();
    closeChartPane();
    if (childWindow) {
        if (childWindow.window) {
            childWindow.close();
        }
        childWindow = null;
    }
    qz = dijit.byId('dttQuickZoom').getOptions(0);
    dijit.byId('dttQuickZoom').set('value', qz.value);

    //sDate = new Date(dijit.byId('dttStartDate').get('value'));
    //eDate = new Date(dijit.byId('dttStartDate').get('value'));
    //eDate.setDate(eDate.getDate() + reportDays - 1);
    dijit.byId('divStartDate').hide();
    showWorking2();
    var df = getUserVars(sDate, eDate);
    df.then(function (rtn) {
        dataConfig = rtn.groups;
        startDate = new Date(rtn.startDate);
        endDate = new Date(rtn.endDate);
        buildWeekWidget(rtn);
        dttWeek_OnChange([convertUTCToDate(startDate), convertUTCToDate(endDate)]);
        hideWorking2();
    }, function (err) {
        hideWorking2();
        log("Error: ", err.message);
    });
}

function getUserVars(sd, ed) {
    return esri.request({
        url: soeURL + 'getUserVariables',
        content: {
            sdate: convertUTCToDate(sd),
            edate: convertUTCToDate(ed),
            f: 'json'
        },
        callbackParamName: 'callback'
    });
}

function startApp() {
    updateWorking('acquiring variables and summaries ...');
    var df = getVars();
    df.then(function (rtn) {
        dataConfig = rtn.groups;
        proxyUrl = rtn.proxyUrl;
        alwaysUseProxy = rtn.alwaysUseProxy;
        soeURL = rtn.soeURL;
        reportDays = rtn.reportDays;
        startDayOfWeek = rtn.startDayOfWeek;
        overlayMapSevice = rtn.overlayMapSevice;
        quickZoomLayer = rtn.quickZoomLayers;
        locatorSources = rtn.locatorSources;
        endDate = new Date(rtn.endDate);
        startDate = new Date(rtn.startDate);
        buildWeekWidget(rtn);
        create_doc(rtn);
    });
}

function getVars() {
    return esri.request({
        url: './json/compstat.json',
        handleAs: 'json'
    });
}

function create_doc(rtn) {
    try {
        updateWorking('loading application ...');
        var supportsOrientationChange = 'onorientationchange' in window, orientationEvent = supportsOrientationChange ? 'orientationchange' : 'resize';
        window.addEventListener(orientationEvent, function () {
            log('Orientation changed: ' + window.orientation);
            if (map) {
                map.infoWindow.hide();
                map.reposition();
                map.resize();
            }
        }, false);
        esri.config.defaults.io.proxyUrl = proxyUrl;
        esriConfig.defaults.io.alwaysUseProxy = alwaysUseProxy;
        updateWorking('loading popup window ...');
        popup = new esri.dijit.Popup({
            offsetX: 0,
            offsetY: 0,
            highlight: true,
            titleInBody: false,
            visibleWhenEmpty: !isMain,
            closestFirst: true,
            markerSymbol: new esri.symbol.SimpleMarkerSymbol('circle', 26, null, new esri.Color([0, 0, 0, 0.25]))
        }, dojo.create('div'));
        if (!isMain) {
            popup.resize(500, 300);
        }
        popup.on('hide', function () {
            log('popup hide');
            if (isMain) {
                if (childWindow && childWindow.window) {
                    childWindow.$(childWindow.document).trigger('childWindow', 'popupHide|xxx');
                }
            }
        });
        popup.on('show', function () {
            if (isMain) {
                if (childWindow && childWindow.window) {
                    graphic = popup.getSelectedFeature();
                    if (graphic) {
                        numofnum = (popup.features.length > 1) ? ' (' + (popup.selectedIndex + 1) + ' of ' + popup.features.length + ')' : ' ';
                        childWindow.$(childWindow.document).trigger('childWindow', 'popupShow|' + dojo.toJson(graphic.geometry.toJson()) + '|' + graphic.getContent() + '|' + numofnum);
                    }
                }
            }
        });
        popup.on('selection-change', function (evt) {
            if (isMain) {
                if (childWindow && childWindow.window) {
                    if (map.infoWindow.isShowing) {
                        if (evt.target.selectedIndex > -1 && evt.target.features != null) {
                            var graphic = evt.target.getSelectedFeature();
                            if (graphic) {
                                numofnum = (evt.target.features.length > 1) ? ' (' + (evt.target.selectedIndex + 1) + ' of ' + evt.target.features.length + ')' : ' ';
                                childWindow.$(childWindow.document).trigger('childWindow', 'popupMove|' + dojo.toJson(graphic.geometry.toJson()) + '|' + graphic.getContent() + '|' + numofnum);
                            }
                        }
                    }
                }
            }
        });
        updateWorking('loading map ...');
        map = new esri.Map('map', {
            basemap: 'streets',
            logo: true,
            slider: isMain,
            sliderStyle: 'small',
            nav: false,
            infoWindow: popup,
            autoResize: true,
            showAttribution: false,
            extent: (useESRIBaseMaps) ? new esri.geometry.Extent(geoXMin, geoYMin, geoXMax, geoYMax, new esri.SpatialReference(102100)) : new esri.geometry.Extent(geoXMin, geoYMin, geoXMax, geoYMax, new esri.SpatialReference(refScale))
        });
        map.disableRubberBandZoom();
        map.disableClickRecenter();
        map.disableDoubleClickZoom();
        map.disableShiftDoubleClickZoom();
        map.on('layers-add-result', onLayersAddResult);
        map.on('extent-change', function (evt) {
            try {
                if (map.infoWindow.isShowing) {
                    map.infoWindow.hide();
                }
                if (isMain) {
                    deactivateToolbars('all');
                    map.getLayer('glmeasure').clear();
                }
                log('map extent-change');
            } catch (err) {
                eh(err, 'extent-change');
            }
        });
        map.on('zoom-end', function (evt) {
            try {
                if (isMain) {
                    if (childWindow && childWindow.window) {
                        childWindow.$(childWindow.document).trigger('childWindow', 'extent|' + dojo.toJson(evt.extent.toJson()));
                    }
                }
            } catch (err) {
                eh(err, 'zoom-end');
            }
        });
        map.on('pan-end', function (evt) {
            try {
                if (isMain) {
                    if (childWindow && childWindow.window) {
                        childWindow.$(childWindow.document).trigger('childWindow', 'extent|' + dojo.toJson(evt.extent.toJson()));
                    }
                }
            } catch (err) {
                eh(err, 'pan-end');
            }
        });
        map.on('key-up', function (evt) {
            switch (evt.keyIdentifier) {
                case 'Insert': //initial extent
                    (useESRIBaseMaps) ? map.setExtent(new esri.geometry.Extent(XMin, YMin, XMax, YMax, new esri.SpatialReference(102100))) : map.setExtent(new esri.geometry.Extent(XMin, YMin, XMax, YMax, new esri.SpatialReference(refScale)));
                    break;
                case 'U+005A': //zoom in Z
                    map.setLevel(map.getLevel() + 1);
                    break;
                case 'U+0058': //zoom out X
                    map.setLevel(map.getLevel() - 1);
                    break;
            }
        });
        map.on('load', function (evt) {
            log('map loading');
        });
        map.on('update-start', function () {
            log('map update started');
        });
        map.on('update-end', function (evt) {
            log('map update ended');
        });
        overlayMapServiceLayer = new esri.layers.ArcGISDynamicMapServiceLayer(overlayMapSevice, {
            id: 'overlayMapServiceLayer',
            opacity: 0.4,
            visible: true
        });
        layersToAdd.push(overlayMapServiceLayer);
        refScale = (!overlayMapServiceLayer.spatialReference.wkid) ? refScale = overlayMapServiceLayer.spatialReference.wkt : refScale = overlayMapServiceLayer.spatialReference.wkid;
        layersToAdd.push(new esri.layers.GraphicsLayer({
            displayOnPan: false,
            id: 'glhilite',
            visible: true,
            opacity: 0.9
        }));
        layersToAdd.push(new esri.layers.GraphicsLayer({
            displayOnPan: false,
            id: 'gldraw',
            visible: true,
            opacity: 0.9
        }));
        layersToAdd.push(new esri.layers.GraphicsLayer({
            displayOnPan: false,
            id: 'glmeasure',
            visible: true,
            opacity: 0.9
        }));
        if (!isMain) {
            layersToAdd.push(new esri.layers.GraphicsLayer({
                displayOnPan: false,
                id: 'glsearch',
                visible: true,
                opacity: 1.0
            }));
        }
        //Geometry Service
        updateWorking('loading geometry service ...');
        geometryService = new esri.tasks.GeometryService(rtn.geoService);

        updateWorking('loading event types ...');
        var dd = loadTypes();
        dd.then(function (rtn) {
            updateWorking('loading layers ...');
            map.addLayers(layersToAdd);
        });
        if (isMain) {
            $(document).bind('divMainContainer', function (e, message) {
                switch (message) {
                    case 'closeChild':
                        childWindow = null;
                        new dijit.Tooltip({
                            connectId: ['childOnOff'],
                            position: ['below'],
                            label: 'Open child window'
                        });
                        dojo.byId('childOnOff').src = 'img/child_on.png';
                }
            });
            window.onbeforeunload = function () {
                if (childWindow && childWindow.window) {
                    if (dojo.isChrome) {
                        dojo.cookie('holdChildLocation_Chrome', dojo.toJson('holdChildLocation|' + childWindow.screenY + '|' + childWindow.screenX + '|' + childWindow.outerWidth + '|' + childWindow.outerHeight), {
                            expires: 365
                        });
                    }
                    if (dojo.isIE) {
                        dojo.cookie('holdChildLocation_IE', dojo.toJson('holdChildLocation|' + childWindow.screenY + '|' + childWindow.screenX + '|' + childWindow.outerWidth + '|' + childWindow.outerHeight), {
                            expires: 365
                        });
                    }
                    if (dojo.isFF) {
                        dojo.cookie('holdChildLocation_FF', dojo.toJson('holdChildLocation|' + childWindow.screenY + '|' + childWindow.screenX + '|' + childWindow.outerWidth + '|' + childWindow.outerHeight), {
                            expires: 365
                        });
                    }
                    childWindow.close();
                }
            };
        }
    } catch (err) {
        eh(err, 'create_doc');
    }
}

function onLayersAddResult(results) {
    try {
        var layerInfos = dojo.map(results.layers, function (result) {
            if (!result.success) {
                eh(result.error, 'onLayerLoad');
            }
            updateWorking('loaded map layer ' + result.layer.id);
            return result.layer;
        });
        // set max extent
        geoExtent = (useESRIBaseMaps) ? new esri.geometry.Extent(geoXMin, geoYMin, geoXMax, geoYMax, new esri.SpatialReference(102100)) : new esri.geometry.Extent(geoXMin, geoYMin, geoXMax, geoYMax, new esri.SpatialReference(refScale));
        // set intital extent
        //map.setExtent(geoExtent, false);

        if (isMain) {
            createOnLinePane();
            var home = new esri.dijit.HomeButton({
                map: map,
                extent: geoExtent
            }, 'btnHome');
            home.startup();
            home.on('home', function (evt) {
                try {
                    if (isMain) {
                        if (childWindow && childWindow.window) {
                            childWindow.$(childWindow.document).trigger('childWindow', 'hilite_clear|nothing');
                        }
                        if (childWindow && childWindow.window) {
                            childWindow.$(childWindow.document).trigger('childWindow', 'draw_clear|glmeasure');
                        }
                    }
                } finally {
                    map.getLayer('glhilite').clear();
                    //map.getLayer('gldraw').clear();
                    deactivateToolbars('all');
                }
            });

            require(['dojo/on', 'dojo/dom', 'esri/toolbars/draw', 'dojox/widget/ColorPicker'], function (on, dom, Draw, Picker) {
                var picker = new Picker({
                    id: 'pickColor',
                    animatePoint: true,
                    showHex: false,
                    showHsv: false,
                    showRgb: false,
                    value: '#FF0000',
                    onChange: function (evt) {
                        dojo.byId('finalColor').style.backgroundColor = evt;
                    }
                });
                dijit.byId('btnColorPicker').set('dropDown', picker);
                drawtoolbar = new Draw(map);
                drawtoolbar.on('draw-end', function (evt) {
                    //map.getLayer('gldraw').clear();
                    map.infoWindow.hide();
                    symbol = null;
                    r = hexToRgb(dijit.byId('pickColor').get('value'));
                    if (evt.geometry.type === 'point' || evt.geometry.type === 'multipoint') {
                        shadow = "M 20.257396,4.6372091 18.673412,17.629397 5.6382559,18.748537 31.073802,37.152834 20.72224,43.379397 49.448802,49.514162 44.337474,20.586428 37.74763,30.709475 20.257396,4.6372091 Z";
                        ssymbol = new esri.symbol.SimpleMarkerSymbol();
                        ssymbol.setPath(shadow);
                        ssymbol.setColor(new dojo.Color([48, 48, 40, 0.3]));
                        ssymbol.setOutline(null);
                        ssymbol.setSize(50);
                        ssymbol.setOffset(-22, 30);
                        map.getLayer('gldraw').add(new esri.Graphic(evt.geometry, ssymbol));
                        path = "M 20.257396,4.6372091 18.673412,17.629397 5.6382559,18.748537 31.073802,37.152834 20.72224,43.379397 49.448802,49.514162 44.337474,20.586428 37.74763,30.709475 20.257396,4.6372091 Z";
                        symbol = new esri.symbol.SimpleMarkerSymbol();
                        symbol.setPath(path);
                        symbol.setColor(new dojo.Color([r[0], r[1], r[2]]));
                        symbol.setOutline(null);
                        symbol.setSize(50);
                        symbol.setOffset(-25, 25);
                    } else if (evt.geometry.type === 'line' || evt.geometry.type === 'polyline') {
                        symbol = new esri.symbol.CartographicLineSymbol(esri.symbol.CartographicLineSymbol.STYLE_SOLID, new dojo.Color([r[0], r[1], r[2]]), 2, esri.symbol.CartographicLineSymbol.CAP_ROUND, esri.symbol.CartographicLineSymbol.JOIN_ROUND);
                    } else {
                        symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([r[0], r[1], r[2]]), 1), new dojo.Color([r[0], r[1], r[2], 0.4]));
                    }
                    map.getLayer('gldraw').add(new esri.Graphic(evt.geometry, symbol));
                    if (childWindow && childWindow.window) {
                        childWindow.$(childWindow.document).trigger('childWindow', 'draw|' + dojo.toJson(evt.geometry.toJson()) + '|' + r[0] + '|' + r[1] + '|' + r[2]);
                    }
                });
                on(dom.byId('drawTool'), 'click', function (evt) {
                    if (evt.target.id === 'drawTool' || evt.target.id === "") {
                        return;
                    } else if (evt.target.id === 'draw_Cancel') {
                        map.getLayer('gldraw').clear();
                        deactivateToolbars('draw');
                        if (childWindow && childWindow.window) {
                            childWindow.$(childWindow.document).trigger('childWindow', 'draw_clear|gldraw');
                        }
                    } else {
                        //map.getLayer('gldraw').clear();
                        deactivateToolbars('all');
                        dojo.byId(evt.target.id).src = 'img/' + evt.target.id + '_active.png';
                        var tool = evt.target.alt.toLowerCase();
                        switch (tool) {
                            case 'point':
                                esri.bundle.toolbars.draw.addPoint = "Click to show arrow";
                                break;
                            case 'circle':
                                esri.bundle.toolbars.draw.addShape = "Press down at circle center to start";
                                esri.bundle.toolbars.draw.start = "Relaese mouse button to finish circle";
                                break;
                            case 'freehandpolygon':
                                esri.bundle.toolbars.draw.addShape = "Press down to start polygon";
                                esri.bundle.toolbars.draw.start = "Relaese mouse button to finish polygon";
                                break;
                        }
                        map.disableMapNavigation();
                        drawtoolbar.activate(tool);
                    }
                });
                measuretoolbar = new Draw(map);
                measuretoolbar.on('draw-end', onDrawEnd_Measure);
                on(dom.byId('measureTool'), 'click', function (evt) {
                    console.dir(esri.bundle);
                    if (evt.target.id === 'measureTool' || evt.target.id === "") {
                        return;
                    } else if (evt.target.id === 'mea_Cancel') {
                        deactivateToolbars('measure');
                        map.getLayer('glmeasure').clear();
                        map.infoWindow.hide();
                        if (childWindow && childWindow.window) {
                            childWindow.$(childWindow.document).trigger('childWindow', 'draw_clear|glmeasure');
                        }
                    } else {
                        map.getLayer('glmeasure').clear();
                        deactivateToolbars('all');
                        dojo.byId(evt.target.id).src = 'img/' + evt.target.id + '_active.png';
                        var tool = evt.target.alt.toLowerCase();
                        switch (tool) {
                            case 'point':
                                esri.bundle.toolbars.draw.addPoint = "Click to show latitude/longitude";
                                break;
                            case 'polyline':
                                esri.bundle.toolbars.draw.start = "Click to start measure polyline length";
                                esri.bundle.toolbars.draw.finish = "Double-click to finish measure";
                                break;
                            case 'polygon':
                                esri.bundle.toolbars.draw.start = "Click to start measure polygon area";
                                esri.bundle.toolbars.draw.resume = "Click to continue";
                                esri.bundle.toolbars.draw.finish = "Double-click to finish measure";
                                break;
                        }
                        if (childWindow && childWindow.window) {
                            childWindow.$(childWindow.document).trigger('childWindow', 'draw_clear|glmeasure');
                        }
                        map.infoWindow.hide();
                        map.disableMapNavigation();
                        measuretoolbar.activate(tool);
                    }
                });
            });

            require(['esri/dijit/Search'], function (Search) {
                var s = new Search({
                    enableButtonMode: false, //this enables the search widget to display as a single button
                    enableLabel: true,
                    enableInfoWindow: true,
                    showInfoWindowOnSelect: false,
                    autoNavigate: false,
                    map: map
                }, 'search');
                s.on('select-result', function (evt) {
                    (evt.result.feature.geometry.type === 'point') ? map.setExtent(evt.result.extent.expand(2.0), true) : map.setExtent(evt.result.extent, true);
                    if (isMain) {
                        if (childWindow && childWindow.window) {
                            childWindow.$(childWindow.document).trigger('childWindow', 'search|' + evt.result.name + '|' + dojo.toJson(this.labelGraphic.geometry.toJson()) + '|' + dojo.toJson(evt.result.feature.geometry.toJson()));
                        }
                    }
                });
                s.on('clear-search', function () {
                    if (isMain) {
                        if (childWindow && childWindow.window) {
                            childWindow.$(childWindow.document).trigger('childWindow', 'search_clear|nothing');
                        }
                    }
                });
                var sources = [];
                dojo.forEach(locatorSources, function (loc) {
                    sources.push({
                        locator: new esri.tasks.Locator(loc.locator),
                        singleLineFieldName: loc.singleLineFieldName,
                        outFields: loc.outFields.split(','),
                        name: loc.name,
                        placeholder: loc.placeholder
                    });
                });
                dojo.forEach(searchSources, function (src) {
                    sources.push({
                        featureLayer: new esri.layers.FeatureLayer(overlayMapSevice + '/' + src.layer),
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

            constructBasemap();
            createNewTOC();
            createToolTips();
            //quick locations
            var dary = [];
            dojo.forEach(quickZoomLayer, function (zl) {
                zl.geos = [];
                dary.push(quickZoomLayerQuery(zl));
            });
            var opts = [];
            updateWorking('constructing quick zoom items');
            var dl = new dojo.DeferredList(dary);
            dl.then(function (res) {
                dojo.forEach(res, function (r, i) {
                    if (r[0]) {
                        orig = {
                            value: i + '_ALL',
                            label: "<div class='quickZoom'>" + quickZoomLayer[i].displayHeader + "</div>",
                            selected: (i == 0)
                        };
                        quickZoomLayer[i].geos.push({
                            geo: dojo.toJson(new esri.geometry.Extent(XMin, YMin, XMax, YMax, new esri.SpatialReference(102100))),
                            name: 'ALL',
                            qzl: i
                        });
                        opts.push(orig);
                        dojo.forEach(r[1].features, function (feature, f) {
                            opts.push({
                                value: i + '_' + f,
                                label: quickZoomLayer[i].displayName + ': ' + feature.attributes[quickZoomLayer[i].queryField],
                                selected: false
                            });
                            quickZoomLayer[i].geos.push({
                                geo: dojo.toJson(feature.geometry.toJson()),
                                name: feature.attributes[quickZoomLayer[i].queryField],
                                qzl: i
                            });
                        });
                    }
                });
                sel = new dijit.form.Select({
                    id: "dttQuickZoom",
                    name: "dttQuickZoom",
                    style: "width: 150px !important",
                    autoWidth: false,
                    maxHeight: 200,
                    options: opts,
                    value: opts[0].value,
                    onChange: function (evt) {
                        if (evt) {
                            ary_evt = evt.split('_');
                            qk = quickZoomLayer[parseInt(ary_evt[0])];
                            try {
                                if (isMain) {
                                    if (childWindow && childWindow.window) {
                                        if (ary_evt[1] != 'ALL') {
                                            childWindow.$(childWindow.document).trigger('childWindow', 'hilite|' + qk.geos[parseInt(ary_evt[1]) + 1].geo + '|' + qk.geos[parseInt(ary_evt[1]) + 1].name + '|' + ary_evt[0]);
                                        } else {
                                            childWindow.$(childWindow.document).trigger('childWindow', 'hilite|' + qk.geos[0].geo + '|' + qk.geos[0].name + '|' + ary_evt[0]);
                                        }
                                    }
                                    if (dojo.byId('chartPaneMain').style.visibility == 'visible') {
                                        closeChartPane();
                                    }
                                }
                            } finally {
                                var geo = null;
                                map.getLayer('glhilite').clear();
                                var layerDefinitions = [];
                                dlayer = map.getLayer('overlayMapServiceLayer');
                                vislayers = dlayer.visibleLayers;
                                dojo.forEach(quickZoomLayer, function (zl) {
                                    id = zl.layerIndex;
                                    if (id != qk.layerIndex) {
                                        if (vislayers.indexOf(id) > -1) {
                                            vislayers.splice(vislayers.indexOf(id), 1);
                                            dijit.byId('overlayMapServiceLayer-' + id + '-CHK').set('checked', false);
                                        }
                                    } else {
                                        if (vislayers.indexOf(id) == -1) {
                                            vislayers.push(id);
                                            dijit.byId('overlayMapServiceLayer-' + id + '-CHK').set('checked', true);
                                        }
                                    }
                                });
                                dlayer.setVisibleLayers(vislayers, true);
                                if (isMain) {
                                    if (childWindow && childWindow.window) {
                                        childWindow.$(childWindow.document).trigger('childWindow', 'visibleLayers|' + dojo.toJson(vislayers));
                                    }
                                }
                                if (ary_evt[1] != 'ALL') {
                                    geo = esri.geometry.fromJson(dojo.fromJson(qk.geos[parseInt(ary_evt[1]) + 1].geo));
                                    layerDefinitions[qk.layerIndex] = qk.queryField + " = '" + qk.geos[parseInt(ary_evt[1]) + 1].name + "'";
                                    map.getLayer('glhilite').add(new esri.Graphic(geo, new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0, 0.5]), 2), null)));
                                } else {
                                    geo = esri.geometry.fromJson(dojo.fromJson(qk.geos[0].geo));
                                    layerDefinitions[qk.layerIndex] = "1=1";
                                }
                                map.setExtent(geo.getExtent(), true);
                                map.getLayer('overlayMapServiceLayer').setLayerDefinitions(layerDefinitions);
                                if (dojo.byId('selectLocationType')) {
                                    dijit.byId('selectLocationType').set('value', '');
                                    RemoveChildren(dojo.byId('locateList'));
                                }
                            }
                        }
                    }
                });
                dojo.byId('tdQuickZoom').appendChild(sel.domNode);
                sel.startup();
                map.getLayer('glhilite').clear();
                hideWorking();
            });
        } else {
            map.getLayer('glhilite').clear();
            hideWorking();
        }
    } catch (err) {
        eh(err, 'onLayersAddResult');
    }
}

function findLayerId(source, label) {
    for (var i = 0; i < source.length; i++) {
        if (source[i].Label === label) {
            return source[i];
        }
    }
    throw "Couldn't find object with label: " + label;
}

function createToolTips() {
    new dijit.Tooltip({
        connectId: ['basemaps'],
        position: ['below'],
        label: 'Basemaps'
    });
    new dijit.Tooltip({
        connectId: ['childOnOff'],
        position: ['below'],
        label: 'Open child window'
    });
    new dijit.Tooltip({
        connectId: ['imgOnOff'],
        position: ['below'],
        label: 'Toggle all layers off'
    });
    new dijit.Tooltip({
        connectId: ['imgStartDate'],
        position: ['below'],
        label: 'Specify custom reporting period'
    });
    new dijit.Tooltip({
        connectId: ['draw_Arrow'],
        position: ['below'],
        label: 'Draw arrow'
    });
    new dijit.Tooltip({
        connectId: ['draw_Circle'],
        position: ['below'],
        label: 'Draw circle'
    });
    new dijit.Tooltip({
        connectId: ['draw_FreehandPolygon'],
        position: ['below'],
        label: 'Draw freehand polygon'
    });
    new dijit.Tooltip({
        connectId: ['draw_Cancel'],
        position: ['below'],
        label: 'Clear/cancel graphics'
    });
    new dijit.Tooltip({
        connectId: ['mea_Point'],
        position: ['below'],
        label: 'Measure latitude/longitude'
    });
    new dijit.Tooltip({
        connectId: ['mea_Polyline'],
        position: ['below'],
        label: 'Measure polyline length'
    });
    new dijit.Tooltip({
        connectId: ['mea_Polygon'],
        position: ['below'],
        label: 'Measure polygon area'
    });
    new dijit.Tooltip({
        connectId: ['mea_Cancel'],
        position: ['below'],
        label: 'Clear/cancel measure'
    });
}

function quickZoomLayerQuery(zl) {
    var qt = new esri.tasks.QueryTask(overlayMapSevice + '/' + zl.layerIndex);
    var q = new esri.tasks.Query();
    q.returnGeometry = true;
    q.outSpatialReference = map.spatialReference;
    q.outFields = [zl.queryField];
    q.where = zl.queryField + ' IS NOT NULL';
    q.orderByFields = [zl.queryField + ' ASC'];
    return qt.execute(q);
}

function constructBasemap() {
    try {
        var basemapGallery = new esri.dijit.BasemapGallery({
            showArcGISBasemaps: true,
            map: map
        }, 'divMobileBasemap');
        basemapGallery.startup();
        basemapGallery.on('error', function (evt) {
            myAlert(evt.error);
        });
        basemapGallery.on('selection-change', function () {
            var basemap = basemapGallery.getSelected();
            var snd = 'streets';
            switch (basemap.title) {
                case 'Imagery':
                    snd = 'satellite';
                    break;
                case 'Imagery with Labels':
                    snd = 'hybrid';
                    break;
                case 'Streets':
                    snd = 'streets';
                    break;
                case 'Topographic':
                    snd = 'topo';
                    break;
                case 'Dark Gray Canvas':
                    snd = 'dark-gray';
                    break;
                case 'Light Gray Canvas':
                    snd = 'gray';
                    break;
                case 'National Geographic':
                    snd = 'national-geographic';
                    break;
                case 'Oceans':
                    snd = 'oceans';
                    break;
                case 'Terrain with Labels':
                    snd = 'terrain';
                    break;
                case 'OpenStreetMap':
                    snd = 'osm';
                    break;
            }
            map.infoWindow.hide();
            map.getLayer('glmeasure').clear();
            deactivateToolbars('all');
            if (isMain) {
                if (childWindow && childWindow.window) {
                    childWindow.$(childWindow.document).trigger('childWindow', 'basemap|' + snd);
                }
            }
            dijit.byId('dialogMobileBasemap').hide();
            ufocus();
        });
    } catch (err) {
        eh(err, 'constructBasemap');
    }
}

function deactivateToolbars(tb) {
    if (tb == 'measure' || tb == 'all') {
        dojo.byId('mea_Point').src = 'img/mea_Point.png';
        dojo.byId('mea_Polyline').src = 'img/mea_Polyline.png';
        dojo.byId('mea_Polygon').src = 'img/mea_Polygon.png';
        if (measuretoolbar) { measuretoolbar.deactivate(); }
    }
    if (tb == 'draw' || tb == 'all') {
        dojo.byId('draw_Arrow').src = 'img/draw_Arrow.png';
        dojo.byId('draw_Circle').src = 'img/draw_Circle.png';
        dojo.byId('draw_FreehandPolygon').src = 'img/draw_FreehandPolygon.png';
        if (drawtoolbar) { drawtoolbar.deactivate(); }
    }
    map.enableMapNavigation();
}

function enableNavigation() {
    map.infoWindow.hide();
    map.getLayer('glmeasure').clear();
    deactivateToolbars('all');
    if (childWindow && childWindow.window) {
        childWindow.$(childWindow.document).trigger('childWindow', 'draw_clear|glmeasure');
    }
}

function onDrawEnd_Measure(evt) {
    try {
        var symbol = null, lengthParams = null, areasAndLengthParams = null;
        if (evt.geometry.type === 'point' || evt.geometry.type === 'multipoint') {
            map.getLayer('glmeasure').clear();
            symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 8, null, new dojo.Color([255, 0, 0, 0.75]));
        } else if (evt.geometry.type === 'line' || evt.geometry.type === 'polyline') {
            symbol = new esri.symbol.CartographicLineSymbol(esri.symbol.CartographicLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2, esri.symbol.CartographicLineSymbol.CAP_ROUND, esri.symbol.CartographicLineSymbol.JOIN_ROUND);
        } else {
            symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 0, 0, 0.5]));
        }
        if (evt.geometry.type === 'line' || evt.geometry.type === 'polyline') {
            lengthParams = new esri.tasks.LengthsParameters();
            lengthParams.polylines = [evt.geometry];
            lengthParams.lengthUnit = esri.tasks.GeometryService.UNIT_FOOT;
            lengthParams.geodesic = false;
            lengthParams.calculationType = 'preserveShape';
            geometryService.lengths(lengthParams, function (result) {
                map.infoWindow.hide();
                content = 'Length: ' + numberWithCommas(dojo.number.round(result.lengths[0], 2)) + ' ft, ' + numberWithCommas(dojo.number.round(result.lengths[0] / 5280, 2)) + ' mi';
                map.getLayer('glmeasure').add(new esri.Graphic(evt.geometry, symbol, { text: content }, new esri.InfoTemplate('Measurement Result', '${text}')));
                popup.setContent(content);
                popup.setTitle('Measurement Result');
                s = evt.geometry.paths[0][evt.geometry.paths.length - 1];
                pt = new esri.geometry.Point(s[0], s[1], map.spatialReference);
                popup.show(pt);
                if (childWindow && childWindow.window) {
                    childWindow.$(childWindow.document).trigger('childWindow', 'measure|' + dojo.toJson(evt.geometry.toJson()) + '|' + content + '|' + dojo.toJson(pt.toJson()));
                }
            }, function (e) {
                eh(e, 'lengths');
            });
        } else if (evt.geometry.type === 'polygon') {
            areasAndLengthParams = new esri.tasks.AreasAndLengthsParameters();
            areasAndLengthParams.linearUnit = esri.tasks.GeometryService.UNIT_FOOT;
            areasAndLengthParams.areaUnit = esri.tasks.GeometryService.UNIT_ACRES;
            areasAndLengthParams.calculationType = 'preserveShape';
            geometryService.simplify([evt.geometry], function (simplifiedGeometries) {
                areasAndLengthParams.polygons = simplifiedGeometries;
                geometryService.areasAndLengths(areasAndLengthParams, function (result) {
                    map.infoWindow.hide();
                    content = 'Acres: ' + numberWithCommas(dojo.number.round(result.areas[0], 2));
                    map.getLayer('glmeasure').add(new esri.Graphic(evt.geometry, symbol, { text: content }, new esri.InfoTemplate('Measurement Result', '${text}')));
                    popup.setContent(content);
                    popup.setTitle('Measurement Result');
                    popup.show(evt.geometry.getCentroid());
                    if (childWindow && childWindow.window) {
                        childWindow.$(childWindow.document).trigger('childWindow', 'measure|' + dojo.toJson(evt.geometry.toJson()) + '|' + content + '|' + dojo.toJson(evt.geometry.getCentroid().toJson()));
                    }
                }, function (e) {
                    eh(e, 'areasAndLengths');
                });
            });
        } else {
            geometryService.project([evt.geometry], new esri.SpatialReference(4326), function (result) {
                content = ' Decimal Degrees: ' + dojo.number.round(result[0].x, 4) + ', ' + dojo.number.round(result[0].y, 4);
                content += ' <br />Longitude: ' + LocationFormatter.decimalToDMS(result[0].x, 'X');
                content += ' <br />Lattitude: ' + LocationFormatter.decimalToDMS(result[0].y, 'Y');
                map.infoWindow.hide();
                popup.setContent(content);
                map.getLayer('glmeasure').add(new esri.Graphic(evt.geometry, symbol, { text: content }, new esri.InfoTemplate('Measurement Result', '${text}')));
                popup.setTitle('Measurement Result');
                popup.show(evt.geometry);
                if (childWindow && childWindow.window) {
                    childWindow.$(childWindow.document).trigger('childWindow', 'measure|' + dojo.toJson(evt.geometry.toJson()) + '|' + content + '|' + dojo.toJson(evt.geometry.toJson()));
                }
            });
        }
    } catch (e) {
        eh(e, 'onDrawEnd_Measure');
    }
}

function toggleChildOnOff() {
    ufocus();
    if (childWindow) {
        if (childWindow.window) {
            childWindow.close();
        }
        childWindow = null;
    }
    var src = dojo.byId('childOnOff').src;
    if (src.indexOf('img/child_on.png') > -1) {
        new dijit.Tooltip({
            connectId: ['childOnOff'],
            position: ['below'],
            label: 'Close child window'
        });
        dojo.byId('childOnOff').src = 'img/child_off.png';
        opts = '';
        hcl = '';
        ahcl = [];
        if (dojo.isChrome) {
            if (dojo.cookie('holdChildLocation_Chrome')) {
                hcl = dojo.fromJson(dojo.cookie('holdChildLocation_Chrome'));
                ahcl = hcl.split('|');
                opts = 'top=' + ahcl[1] + ', left=' + ahcl[2] + ', width=' + ahcl[3] + ', height=' + ahcl[4] + ', titlebar=no, location=no, menubar=no, scrollbars=no, status=no, toolbar=no, resizable=yes';
            } else {
                opts = 'top=0, left=0, width=1590, height=790, titlebar=no, location=no, menubar=no, scrollbars=no, status=no, toolbar=no, resizable=yes';
            }
        }
        if (dojo.isIE) {
            if (dojo.cookie('holdChildLocation_IE')) {
                hcl = dojo.fromJson(dojo.cookie('holdChildLocation_IE'));
                ahcl = hcl.split('|');
                opts = 'top=' + ahcl[1] + ', left=' + ahcl[2] + ', width=' + ahcl[3] + ', height=' + ahcl[4] + ', titlebar=no, location=no, menubar=no, scrollbars=no, status=no, toolbar=no, resizable=yes';
            } else {
                opts = 'top=0, left=0, width=1590, height=790, titlebar=no, location=no, menubar=no, scrollbars=no, status=no, toolbar=no, resizable=yes';
            }
        }
        if (dojo.isFF) {
            if (dojo.cookie('holdChildLocation_FF')) {
                hcl = dojo.fromJson(dojo.cookie('holdChildLocation_FF'));
                ahcl = hcl.split('|');
                opts = 'top=' + ahcl[1] + ', left=' + ahcl[2] + ', width=' + ahcl[3] + ', height=' + ahcl[4] + ', titlebar=no, location=no, menubar=no, scrollbars=no, status=no, toolbar=no, resizable=yes';
            } else {
                opts = 'top=0, left=0, width=1590, height=790, titlebar=no, location=no, menubar=no, scrollbars=no, status=no, toolbar=no, resizable=yes';
            }
        }
        evt = dijit.byId('dttQuickZoom').get('value');
        ary_evt = evt.split('_');
        qk = quickZoomLayer[parseInt(ary_evt[0])];
        val = (ary_evt[1] != 'ALL') ? qk.geos[parseInt(ary_evt[1]) + 1].name : qk.geos[0].name;
        iext = '?idates=' + startDate + '|' + endDate + '&isector=' + val;
        //childWindow = window.open('index_child.htm' + iext, 'child', opts, true);
        childWindow = window.open('index_child.htm' + iext, 'child', '', true);
    } else {
        new dijit.Tooltip({
            connectId: ['childOnOff'],
            position: ['below'],
            label: 'Open child window'
        });
        dojo.byId('childOnOff').src = 'img/child_on.png';
    }
}

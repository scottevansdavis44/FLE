require(['dojo/parser', 'dojo/_base/event', 'dojo/ready', 'esri/urlUtils', 'esri/tasks/locator', 'esri/map', 'esri/dijit/HomeButton', 'esri/layers/FeatureLayer',
    'esri/tasks/query', 'esri/layers/LabelLayer', 'esri/dijit/Popup', 'esri/layers/LabelClass', 'esri/symbols/TextSymbol', 'esri/renderers/UniqueValueRenderer',
    'esri/renderers/SimpleRenderer', 'esri/tasks/QueryTask', 'esri/symbols/MarkerSymbol', 'esri/layers/osm', 'esri/dijit/BasemapGallery', 'esri/tasks/geometry', 'esri/toolbars/navigation', 'dojo/promise/all', 'dojo/DeferredList', 'dojo/Deferred', 'dojo/dom', 'dojo/date/locale', 'dojo/_base/json', 'dijit/registry', 'dijit/popup', 'dijit/Dialog', 'dijit/Tooltip', 'dijit/layout/BorderContainer', 'dijit/layout/ContentPane', 'dojo/cookie'], function (parser, event, ready) {
        ready(function () {
            parser.parse();
            if (dojo.isIE < 9) {
                window.location = 'ie8.htm';
                return;
            } else {
                showWorking('acquiring variables and summaries ...');
                isMain = false;
                closeChartPane();
                extentParams = document.location.search.substring(1);
                params = extentParams.split('&');
                var startExtent = null;
                if (params.length > 0) {
                    msg = params[0].split('=');
                    iext = unescape(msg[1]);
                    ary = iext.split('|');
                    startDate = new Date(ary[0]);
                    endDate = new Date(ary[1]);
                    buildDateStringLabel();
                    msg2 = params[1].split('=');
                    isector = unescape(msg2[1]);
                    dojo.byId('childSector').innerHTML = (isector == 'Sectors') ? 'ALL' : isector;
                }
                //var df = getVars(startDate, endDate);
                var df = getVars();
                df.then(function (rtn) {
                    dataConfig = rtn.groups;
                    overlayMapSevice = rtn.overlayMapSevice;
                    quickZoomLayer = rtn.quickZoomLayers;
                    dojo.forEach(dataConfig, function (item) {
                        item.eventServiceOpenCloseField.open = item.eventServiceOpenCloseField.open.split(',');
                        item.eventServiceOpenCloseField.closed = item.eventServiceOpenCloseField.closed.split(',');
                        item.eventServiceOpenCloseField.unknown = item.eventServiceOpenCloseField.unknown.split(',');
                        dojo.forEach(item.eventServiceCrimeGroups, function (lyr) {
                            lyr.codeTable = window[lyr.codeTable];
                            lyr.codes = lyr.codes.split(',');
                            lyr.infotemp = lyr.infotemp.replace(/\|/g, '<br />');
                        });
                    });
                    create_doc(rtn);
                    jQueryReady();
                });
            }
        });
    });

function jQueryReady() {

    $(document).bind('childWindow', function (e, message) {
        $("#childMessage").val(message);
        var ary = message.split('|');
        switch (ary[0]) {
            case 'basemap':
                map.setBasemap(ary[1]);
                map.getLayer('glmeasure').clear();
                map.infoWindow.hide();
                break;
            case 'extent':
                map.setExtent(esri.geometry.fromJson(dojo.fromJson(ary[1])), false);
                map.infoWindow.hide();
                break;
            case 'popupShow':
                map.infoWindow.hide();
                popup.setContent(ary[2]);
                popup.setTitle('Information' + ary[3]);
                popup.show(esri.geometry.fromJson(dojo.fromJson(ary[1])));
                break;
            case 'popupMove':
                map.infoWindow.hide();
                popup.setContent(ary[2]);
                popup.setTitle('Information' + ary[3]);
                popup.show(esri.geometry.fromJson(dojo.fromJson(ary[1])));
                break;
            case 'measure':
                map.getLayer('glmeasure').clear();
                geo = esri.geometry.fromJson(dojo.fromJson(ary[1]));
                if (geo.type === 'point' || geo.type === 'multipoint') {
                    symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 8, null, new dojo.Color([255, 0, 0, 0.75]));
                } else if (geo.type === 'line' || geo.type === 'polyline') {
                    symbol = new esri.symbol.CartographicLineSymbol(esri.symbol.CartographicLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2, esri.symbol.CartographicLineSymbol.CAP_ROUND, esri.symbol.CartographicLineSymbol.JOIN_ROUND);
                } else {
                    symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 0, 0, 0.5]));
                }
                map.getLayer('glmeasure').add(new esri.Graphic(geo, symbol));
                map.infoWindow.hide();
                popup.setContent(ary[2]);
                popup.setTitle('Measurement Result');
                popup.show(esri.geometry.fromJson(dojo.fromJson(ary[3])));
                break;
            case 'popupHide':
                map.infoWindow.hide();
                break;
            case 'closechart':
                closeChartPane();
                break;
            case 'createchart':
                map.infoWindow.hide();
                chartSummary(ary[1], ary[2], ary[3]);
                break;
            case 'hilite':
                map.getLayer('glhilite').clear();
                var layerDefinitions = [];
                if (ary[2] != 'ALL') {
                    layerDefinitions[quickZoomLayer[parseInt(ary[3])].layerIndex] = quickZoomLayer[parseInt(ary[3])].queryField + " = '" + ary[2] + "'";
                    map.getLayer('glhilite').add(new esri.Graphic(esri.geometry.fromJson(dojo.fromJson(ary[1])), new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0, 0.5]), 2), null)));
                    dojo.byId('childSector').innerHTML = quickZoomLayer[parseInt(ary[3])].displayName + ': ' + ary[2];
                } else {
                    layerDefinitions[quickZoomLayer[parseInt(ary[3])].layerIndex] = "1=1";
                    dojo.byId('childSector').innerHTML = 'ALL';
                }
                buildDateStringLabel();
                map.getLayer('overlayMapServiceLayer').setLayerDefinitions(layerDefinitions);
                break;
            case 'hilite_clear':
                dojo.byId('childSector').innerHTML = 'ALL';
                map.getLayer('glhilite').clear();
                break;
            case 'draw':
                //map.getLayer('gldraw').clear();
                geo = esri.geometry.fromJson(dojo.fromJson(ary[1]));
                symbol = null;
                if (geo.type === 'point' || geo.type === 'multipoint') {
                    shadow = "M 20.257396,4.6372091 18.673412,17.629397 5.6382559,18.748537 31.073802,37.152834 20.72224,43.379397 49.448802,49.514162 44.337474,20.586428 37.74763,30.709475 20.257396,4.6372091 Z";
                    ssymbol = new esri.symbol.SimpleMarkerSymbol();
                    ssymbol.setPath(shadow);
                    ssymbol.setColor(new dojo.Color([48, 48, 40, 0.3]));
                    ssymbol.setOutline(null);
                    ssymbol.setSize(50);
                    ssymbol.setOffset(-22, 30);
                    map.getLayer('gldraw').add(new esri.Graphic(geo, ssymbol));
                    path = "M 20.257396,4.6372091 18.673412,17.629397 5.6382559,18.748537 31.073802,37.152834 20.72224,43.379397 49.448802,49.514162 44.337474,20.586428 37.74763,30.709475 20.257396,4.6372091 Z";
                    symbol = new esri.symbol.SimpleMarkerSymbol();
                    symbol.setPath(path);
                    symbol.setColor(new dojo.Color([ary[2], ary[3], ary[4]]));
                    symbol.setOutline(null);
                    symbol.setSize(50);
                    symbol.setOffset(-25, 25);
                } else if (geo.type === 'line' || geo.type === 'polyline') {
                    symbol = new esri.symbol.CartographicLineSymbol(esri.symbol.CartographicLineSymbol.STYLE_SOLID, new dojo.Color([ary[2], ary[3], ary[4]]), 2, esri.symbol.CartographicLineSymbol.CAP_ROUND, esri.symbol.CartographicLineSymbol.JOIN_ROUND);
                } else {
                    symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([ary[2], ary[3], ary[4]]), 1), new dojo.Color([ary[2], ary[3], ary[4], 0.4]));
                }
                map.getLayer('gldraw').add(new esri.Graphic(geo, symbol));
                break;
            case 'draw_clear':
                map.infoWindow.hide();
                map.getLayer(ary[1]).clear();
                break;
            case 'map':
                switch (ary[1]) {
                    case 'clearGraphics':
                        glyr_HiLite.clear();
                        break;
                }
                break;
            case 'vislyr':
                map.infoWindow.hide();
                map.getLayer(ary[1]).setVisibleLayers(dojo.fromJson(ary[2]));
                break;
            case 'visibleLayers':
                map.getLayer('overlayMapServiceLayer').setVisibleLayers(dojo.fromJson(ary[1]), true);
                break;
            case 'visbase':
                map.infoWindow.hide();
                map.getLayer(ary[1]).setVisibility((ary[2] == 'true'));
                visibleCrimeGroupLayers();
                break;
            case 'allLayersOff':
                map.infoWindow.hide();
                aary = ary[1].split(',');
                dojo.forEach(aary, function (a) {
                    map.getLayer(a).setVisibility(false);
                    //dojo.byId('childVisibleLayers').innerHTML = '';
                });
                break;
            case 'datechange':
                startDate = new Date(dojo.fromJson(ary[1]));
                endDate = new Date(dojo.fromJson(ary[2]));
                dojo.forEach(eventsTypes, function (item) {
                    var weekDateQueryString = buildDateString(item.dateField, item.dbType);
                    buildDateStringLabel();
                    map.getLayer(item.id).setDefinitionExpression(weekDateQueryString);
                });
                break;
            case 'search':
                geo = esri.geometry.fromJson(dojo.fromJson(ary[3]));
                if (geo.type === 'point' || geo.type === 'multipoint') {
                    symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 8, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 255, 1.0]), 1), new dojo.Color([77, 77, 77, 1.0]));
                } else if (geo.type === 'line' || geo.type === 'polyline') {
                    symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0, 0.5]), 2);
                } else {
                    symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 255, 0, 0.5]), 2), null);
                }
                map.getLayer('glsearch').add(new esri.Graphic(geo, symbol));
                require(['esri/symbols/TextSymbol', 'esri/symbols/Font', 'esri/Color'], function (TextSymbol, Font, Color) {
                    textSymbol = new TextSymbol(ary[1], new Font(14, Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, 'Arial'), new Color([181, 56, 46, 0.9]));
                    textGraphic = new esri.Graphic(esri.geometry.fromJson(dojo.fromJson(ary[2])), textSymbol);
                    map.getLayer('glsearch').add(textGraphic);
                });
                break;
            case 'search_clear':
                map.getLayer('glsearch').clear();
                break;
            case 'online':
                addOnlineFeatures(ary[1]);
                break;
            case 'online_visibility':
                var layer = map.getLayer(ary[1]);
                if (layer) {
                    (ary[2] === 'true') ? layer.show() : layer.hide();
                }
                break;
            case 'online_remove':
                var layer = map.getLayer(ary[1]);
                if (layer) {
                    map.removeLayer(layer);
                }
                break;
        }
    });
    window.onbeforeunload = function () {
        dojo.cookie('holdChildLocation', dojo.toJson('holdChildLocation|' + window.screenTop + '|' + window.screenLeft + '|' + window.outerWidth + '|' + window.outerHeight), {
            expires: 365
        });
        window.opener.$(window.opener.document).trigger('divMainContainer', 'closeChild');
    };
}

function addOnlineFeatures(id) {
    require(["esri/arcgis/utils", "esri/map", "dojo/domReady!"], function (arcgisUtils, Map) {
        var deferred;
        deferred = arcgisUtils.createMap(id, "ui-map");
        deferred.then(function (response) {
            var uiMap = response.map;
            dojo.forEach(response.itemInfo.itemData.operationalLayers, function (item) {
                if (item.layerType === "ArcGISFeatureLayer") {
                    if (item.type !== "Feature Collection") {
                        var itemp = '';
                        var itemp_title = '';
                        if (item.popupInfo) {
                            itemp_title = item.popupInfo.title;
                            dojo.forEach(item.popupInfo.fieldInfos, function (itm) {
                                if (itm.visible) {
                                    itemp += itm.label + ": ${" + itm.fieldName + "} <br />";
                                }
                            });
                        }
                        lyr = new esri.layers.FeatureLayer(item.url, {
                            outFields: ["*"],
                            opacity: item.opacity,
                            visible: item.visibility,
                            infoTemplate: (itemp !== '') ? new esri.InfoTemplate(itemp_title, itemp) : null,
                            id: item.id
                        });
                        lyr.setRenderer(item.layerObject.renderer);
                        map.addLayer(lyr);
                    }
                }
            });
            uiMap.destroy();
            uiMap = null;
            dijit.byId('divOnLine').hide();
        }, function (error) {
            console.log("Error: ", error.code, " Message: ", error.message);
            deferred.cancel();
        });
    });
}

function visibleCrimeGroupLayers() {
    RemoveChildren(dojo.byId('legend_child_table'));
    var to = dojo.byId('legend_child_table');
    var tt = dojo.create('tbody', null, to);
    dojo.forEach(eventsTypes, function (evnt) {
        lyr = map.getLayer(evnt.id);
        if (lyr.visible) {
            dfsym = (lyr.renderer.defaultSymbol) ? lyr.renderer.defaultSymbol : lyr.renderer.symbol;
            m_row = dojo.create('tr', null, tt, 'last');
            m_td = dojo.create('td', null, m_row, 'last');
            m_to = dojo.create('table', {
                class: 'legend_child_intable'
            }, m_td);
            m_tt = dojo.create('tbody', null, m_to);
            row = dojo.create('tr', null, m_tt, 'last');
            tdi = dojo.create('td', {
                class: 'legend_child_icon_td',
                innerHTML: "<img src='" + dfsym.url + "' width=" + dfsym.width + " height=" + dfsym.height + ">"
            }, row, 'last');
            td = dojo.create('td', {
                class: 'legend_child_label_td',
                innerHTML: evnt.Label
            }, row, 'last');
        }
    });
}

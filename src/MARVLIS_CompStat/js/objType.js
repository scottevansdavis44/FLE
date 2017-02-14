var eventsTypes = [];

function clsType() {
    this.id = '';
    this.Label = '';
    this.InfoWinTemp = '';
    this.FeatureLayer = null;
    this.extraQuery = '';
    this.codes = '';
    this.dbType = '';
    this.dateField = '';
    this.codeField = '';
    this.summaries = null;
}

function saveClass(data) {
    var classVar = null;
    classVar = new clsType();
    classVar.id = data.id;
    classVar.Label = data.Label;
    classVar.InfoWinTemp = data.InfoWinTemp;
    classVar.FeatureLayer = data.FeatureLayer;
    classVar.extraQuery = data.extraQuery;
    classVar.codes = data.codes;
    classVar.dbType = data.dbType;
    classVar.dateField = data.dateField;
    classVar.codeField = data.codeField;
    classVar.summaries = null;
    return classVar;
}

function loadTypes() {
    updateWorking('loading event types');
    try {
        var d = new dojo.Deferred();
        if (isMain) {
            var new_acc = new dijit.layout.AccordionContainer({
                id: 'tocAccordion',
                style: 'height: 100%'
            });
        }
        dojo.forEach(dataConfig, function (item, i) {
            if (isMain) {
                var to = dojo.create('table', { style: "letter-spacing: normal" }, null, 'only');
                var tt = dojo.create('tbody', null, to);
            }
            dojo.forEach(item.eventServiceCrimeGroups, function (lyr, j) {
                var weekDateQueryString = buildDateString(lyr.dateFieldName, item.eventService_dbType);
                var defaultSymbol = new esri.symbol.PictureMarkerSymbol(lyr.renderer.imagePath + lyr.renderer.defaultSymbol, lyr.renderer.w, lyr.renderer.h);
                if (lyr.renderer.type == 'SIMPLE') {
                    var renderer = new esri.renderer.SimpleRenderer(defaultSymbol);
                } else {
                    if (item.eventServiceOpenCloseField.name != '') {
                        var renderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, lyr.codeFieldName, item.eventServiceOpenCloseField.name, null, '|');
                    } else {
                        var renderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, lyr.codeFieldName);
                    }
                    dojo.forEach(lyr.codeTable, function (code) {
                        if (lyr.codes.indexOf(code.code) > -1) {
                            if (item.eventServiceOpenCloseField.name != '') {
                                dojo.forEach(item.eventServiceOpenCloseField.open, function (o) {
                                    renderer.addValue(code.code + "|" + o, new esri.symbol.PictureMarkerSymbol(lyr.renderer.imagePath + lyr.label + '_Open.png', lyr.iconSize.w, lyr.iconSize.h));
                                });
                                dojo.forEach(item.eventServiceOpenCloseField.closed, function (c) {
                                    renderer.addValue(code.code + "|" + c, new esri.symbol.PictureMarkerSymbol(lyr.renderer.imagePath + lyr.label + '_Closed.png', lyr.iconSize.w, lyr.iconSize.h));
                                });
                                dojo.forEach(item.eventServiceOpenCloseField.unknown, function (u) {
                                    renderer.addValue(code.code + "|" + u, new esri.symbol.PictureMarkerSymbol(lyr.renderer.imagePath + lyr.label + '.png', lyr.renderer.w, lyr.renderer.h));
                                });
                            } else {
                                renderer.addValue(code.code, new esri.symbol.PictureMarkerSymbol(lyr.renderer.imagePath + lyr.label + '.png', lyr.iconSize.w, lyr.iconSize.h));
                            }
                        }
                    });
                }
                var dexp = weekDateQueryString;
                if (lyr.extraQuery != '') {
                    dexp += ' AND ' + lyr.extraQuery;
                }
                //                if (lyr.codes.length > 0) {
                //                    var codeQueryString = buildCodeString(lyr.codeFieldName, lyr.codes);
                //                    if (codeQueryString != '') { dexp += ' AND ' + codeQueryString; }
                //                }
                var fl = new esri.layers.FeatureLayer(item.eventService + lyr.index, {
                    id: 'eventLayer_' + i + '_' + j,
                    outFields: ['*'],
                    infoTemplate: new esri.InfoTemplate("Information", lyr.infotemp),
                    visible: false,
                    mode: esri.layers.FeatureLayer.MODE_ONDEMAND
                });

                var data = {
                    'id': 'eventLayer_' + i + '_' + j,
                    'Label': lyr.label,
                    'FeatureLayer': fl,
                    'InfoWinTemp': lyr.infotemp,
                    'extraQuery': lyr.extraQuery,
                    'codes': lyr.codes,
                    'dbType': item.eventService_dbType,
                    'dateField': lyr.dateFieldName,
                    'codeField': lyr.codeFieldName
                };
                var temp = saveClass(data);
                eventsTypes.push(temp);

                fl.setRenderer(renderer);
                fl.setDefinitionExpression(dexp);
                fl.on('update-start', function () {
                    log(lyr.label + ' update started');
                    showWorking2();
                });
                fl.on('update-end', function (evt) {
                    log(lyr.label + ' update ended');
                    hideWorking2();
                });
                layersToAdd.push(fl);
                if (isMain) {
                    r = dojo.create('tr', null, tt, 'last');
                    //                    if (lyr.summaries.length > 0) {
                    //                        td = dojo.create('td', {
                    //                            innerHTML: "<img id='" + fl.id + "_EXPAND' src='img/expand.png' onclick=\"toggleExpand('" + fl.id + "')\" >",
                    //                            style: 'cursor: pointer',
                    //                            class: 'expandCell'
                    //                        }, r, 'last');
                    //                    }
                    td = dojo.create('td', {
                        style: 'padding-bottom: 5px'
                    }, r, 'last');
                    var div = dojo.create('div', null, td);
                    var layerChk = new dijit.form.CheckBox({
                        id: fl.id + '_CHK',
                        checked: false,
                        style: 'margin: 2px 0px 0px 0px;',
                        class: 'ToggleControl',
                        onChange: function (evt) {
                            if (childWindow && childWindow.window) {
                                childWindow.$(childWindow.document).trigger('childWindow', 'visbase|' + fl.id + '|' + evt);
                            }
                            map.infoWindow.hide();
                            map.getLayer(fl.id).setVisibility(evt);
                            if (evt) {
                                checkAllEventLayers();
                            }
                            if (!evt) {
                                if (dojo.byId('lblChartPaneLabel').innerHTML == map.getLayer(fl.id).name) {
                                    closeChartPane();
                                    if (childWindow && childWindow.window) {
                                        childWindow.$(childWindow.document).trigger('childWindow', 'closechart|' + fl.id + '|' + evt);
                                    }
                                }
                            }
                        }
                    }, div);
                    if (lyr.summaries.length > 0) {
                        td = dojo.create('td', {
                            innerHTML: "<img src='img/columns.png' style='width: 16px; height: 16px' alt='chart' />",
                            title: fl.id,
                            style: 'cursor: pointer'
                        }, r, 'last');
                        td.onclick = function () {
                            if (dijit.byId(this.title + '_CHK').get('checked')) {
                                map.infoWindow.hide();
                                opts = dijit.byId('dttQuickZoom').get('value').split('_');
                                qk = quickZoomLayer[parseInt(opts[0])];
                                if (opts[1] != 'ALL') {
                                    chartSummary(map.getLayer(this.title).name, qk.geos[parseInt(opts[1]) + 1].name, qk.layerIndex);
                                    if (childWindow && childWindow.window) {
                                        childWindow.$(childWindow.document).trigger('childWindow', 'createchart|' + map.getLayer(this.title).name + '|' + qk.geos[parseInt(opts[1]) + 1].name + '|' + qk.layerIndex);
                                    }
                                } else {
                                    chartSummary(map.getLayer(this.title).name, qk.geos[0].name, qk.layerIndex);
                                    if (childWindow && childWindow.window) {
                                        childWindow.$(childWindow.document).trigger('childWindow', 'createchart|' + map.getLayer(this.title).name + '|' + qk.geos[0].name + '|' + qk.layerIndex);
                                    }
                                }
                            }
                        };
                        td = dojo.create('td', {
                            innerHTML: "<img src='img/table.png' style='width: 16px; height: 16px' alt='table' />",
                            title: fl.id,
                            style: 'cursor: pointer'
                        }, r, 'last');
                        td.onclick = function () {
                            if (dijit.byId(this.title + '_CHK').get('checked')) {
                                opts = dijit.byId('dttQuickZoom').get('value').split('_');
                                qk = quickZoomLayer[parseInt(opts[0])];
                                if (opts[1] != 'ALL') {
                                    lbls = dijit.byId('dttQuickZoom').get('displayedValue').split(':');
                                    // sector.label.split(':');
                                    createTable(map.getLayer(this.title), dojo.trim(lbls[1]), qk.eventFieldName, qk.layerIndex, qk.queryField);
                                } else {
                                    createTable(map.getLayer(this.title), 'ALL', qk.eventFieldName, qk.layerIndex, qk.queryField);
                                }
                                //if (childWindow && childWindow.window) {
                                //    childWindow.$(childWindow.document).trigger('childWindow', 'createchart|' + map.getLayer(this.title).name + '|' + sector);
                                //}
                            }
                        };
                    }
                    td = dojo.create('td', {
                        innerHTML: "<img src='" + lyr.renderer.imagePath + lyr.renderer.defaultSymbol + "' style='width: 18px; height: 18px' alt='table' />",
                        title: fl.id,
                        style: 'cursor: pointer'
                    }, r, 'last');
                    td.onclick = function () {
                        dijit.byId(this.title + '_CHK').set('checked', !dijit.byId(this.title + '_CHK').checked);
                    };
                    (lyr.summaries.length > 0 && lyr.currentCount == 0) ? clr = '#808080' : clr = '#000000';
                    td = dojo.create('td', {
                        innerHTML: "<label style='color: " + clr + "; cursor: pointer'>" + lyr.label + "</label>",
                        title: fl.id,
                        style: 'cursor: pointer'
                    }, r, 'last');
                    td.onclick = function () {
                        dijit.byId(this.title + '_CHK').set('checked', !dijit.byId(this.title + '_CHK').checked);
                    };
                    //                    if (lyr.summaries.length > 0) {
                    //                        r = dojo.create('tr', { id: fl.id + '_TREXPAND', style: 'display: none' }, tt, 'last');
                    //                        td = dojo.create('td', {
                    //                            colspan: 2
                    //                        }, r, 'last');
                    //                        td = dojo.create('td', {
                    //                            colspan: 4
                    //                        }, r, 'last');
                    //                    }
                }
            });
            if (isMain) {
                new_acc.addChild(new dijit.layout.AccordionPane({
                    title: item.eventTitle,
                    content: to,
                    onFocus: function () {
                        ufocus();
                    }
                }));
            }
        });
        if (isMain) {
            dijit.byId('divAccordion').addChild(new_acc);
            dijit.byId('divAccordion').resize();
        }
        d.resolve('loadTypes OK');
        return d;
    } catch (err) {
        eh(err, 'loadTypes');
        d.resolve('loadTypes NOT OK');
        return d;
    }
}

function toggleExpand(id) {
    try {
        var layerTR = dojo.byId(id + '_TREXPAND');
        var icon = dojo.byId(id + '_EXPAND');
        icon.src = (layerTR.style.display == 'table-row') ? 'img/expand.png' : 'img/close.png';
        layerTR.style.display = (layerTR.style.display == 'table-row') ? 'none' : 'table-row';
    } catch (e) {
        eh(e, 'toggleLayer');
    }
}

function checkAllEventLayers() {
    var oneChecked = false;
    dojo.forEach(dojo.query('.ToggleControl >'), function (chk) {
        if (chk.checked) {
            if (!oneChecked) {
                oneChecked = true;
            }
        }
    });
    dojo.byId('imgOnOff').src = (oneChecked) ? 'img/off.png' : 'img/on.png';
}

function toggleAllEventLayersOff() {
    ufocus();
    var lyrs = '';
    dojo.forEach(dojo.query('.ToggleControl >'), function (chk) {
        if (chk.checked) {
            ary = chk.id.split('_');
            map.getLayer(ary[0] + '_' + ary[1] + '_' + ary[2]).setVisibility(false);
            dijit.byId(chk.id).set('checked', false);
            (lyrs == '') ? lyrs = ary[0] + '_' + ary[1] + '_' + ary[2] : lyrs += ',' + ary[0] + '_' + ary[1] + '_' + ary[2];
        }
    });
    dojo.byId('imgOnOff').src = 'img/on.png';
    turnOffAllOnLine();
    if (childWindow && childWindow.window) {
        if (lyrs != '') {
            childWindow.$(childWindow.document).trigger('childWindow', 'allLayersOff|' + lyrs);
        }
    }
    closeChartPane();
    if (childWindow && childWindow.window) {
        childWindow.$(childWindow.document).trigger('childWindow', 'closechart|id|evt');
    }
}

function buildCodeString(eventServiceCodeFieldName, codes) {
    try {
        inlist = '';
        dojo.forEach(codes, function (c) {
            inlist += (inlist == '') ? "'" + c + "'" : ",'" + c + "'";
        });
        return eventServiceCodeFieldName + ' IN (' + inlist + ')';
    } catch (err) {
        eh(err, 'buildCodeString');
        return '';
    }
}

function buildDateString(eventServiceDateFieldName, eventService_dbType) {
    try {
        startMonth = (startDate.getMonth() + 1 < 10) ? '0' + (startDate.getMonth() + 1) : (startDate.getMonth() + 1);
        startDay = (startDate.getDate() < 10) ? '0' + startDate.getDate() : startDate.getDate();
        endMonth = (endDate.getMonth() + 1 < 10) ? '0' + (endDate.getMonth() + 1) : (endDate.getMonth() + 1);
        endDay = (endDate.getDate() < 10) ? '0' + endDate.getDate() : endDate.getDate();
        generalstring = '';
        switch (eventService_dbType) {
            case 'CAT_EXPORT':
                generalstring = 'BCS_YMD' + ' >= ' + startDate.getFullYear() + startMonth + startDay + ' AND ' + 'BCS_YMD' + ' <= ' + endDate.getFullYear() + endMonth + endDay;
                break;
            case 'MSSQL':
                generalstring = eventServiceDateFieldName + " >= date '" + startDate.getFullYear() + "-" + startMonth + "-" + startDay + "' AND " + eventServiceDateFieldName + " <= date '" + endDate.getFullYear() + "-" + endMonth + "-" + endDay + "'";
                break;
            case 'ORACLE':
                generalstring = eventServiceDateFieldName + " >= TO_DATE('" + startDate.getFullYear() + "-" + startMonth + "-" + startDay + "','YYYY-MM-DD') AND " + eventServiceDateFieldName + " <= TO_DATE('" + endDate.getFullYear() + "-" + endMonth + "-" + endDay + "','YYYY-MM-DD')";
                break;
            case 'FILE':
                generalstring = eventServiceDateFieldName + " >= DATE '" + startDate.getFullYear() + "-" + startMonth + "-" + startDay + "' AND " + eventServiceDateFieldName + " <= DATE '" + endDate.getFullYear() + "-" + endMonth + "-" + endDay + "'";
                break;
        }
        return '(' + generalstring + ')';
    } catch (err) {
        eh(err, 'buildDateString');
        return '';
    }
}

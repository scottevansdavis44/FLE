function createClassBreaks(evt) {
    try {
        if (evt == 'Class Breaks by day') {
            lyr = mapChart.getLayer(crime_part + ' ' + crime_days);
            dojo.byId('lblMapChart').innerHTML = crime_code_category_abbr + ' ' + crime_days + ' (' + crime_geolayer_filter_district + ')';
        } else {
            lyr = mapChart.getLayer(crime_part + ' ' + '52 weeks');
            dojo.byId('lblMapChart').innerHTML = crime_code_category_abbr + ' 52 wks (' + crime_geolayer_filter_district + ')';
        }
        lyr.hide();
        buildClassBreakRenderer(lyr);
    } catch (err) {
        eh(err, 'buildClassBreak');
    }
}

function buildClassBreakRenderer(flyr) {
    try {
        require(["esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/renderers/ClassBreaksRenderer",
        "esri/dijit/Legend", "esri/tasks/StatisticDefinition", "esri/plugins/FeatureLayerStatistics", "dojo/number", "dojo/domReady!"],
        function (SimpleFillSymbol, SimpleLineSymbol, ClassBreaksRenderer, Legend, StatisticDefinition, FeatureLayerStatistics, number) {
            showLW('divWorking_Map');
            try {
                dojo.forEach(geoLayers, function (lyr) {
                    mapChart.getLayer('cb_' + lyr.displayName).setRenderer(null);
                    mapChart.getLayer('cb_' + lyr.displayName).hide();
                });
                dojo.forEach(mapChart.graphicsLayerIds, function (id) {
                    mapChart.getLayer(id).hide();
                });
                lyrobj = getGeoLayerObject();

                statsField = getIRAEventField(crime_part, lyrobj);
                if (!statsField) {
                    myInfo('For this data, a ' + lyrobj.displayName + ' attribute does not exist. Cannot generate class break map.');
                    return;
                }

                lv_gl = getGeoLayer();
                lv_dstrct = lv_gl.value.split('|');
                lv_l = (lv_dstrct[1] == 'ALL') ? lyrobj.displayName : geoLayers[0].displayName;
                lv_categoryType = dijit.byId('selectCatagory').get('value');
                lv_category = lv_categoryType.split('_');
                f_category = (lv_category[1] == 'ALL') ? crime_part : lv_category[1];
                codeField = getCodeFieldByPart(crime_part, dataConfig[0]);
                byCode = '';
                if (lv_category[1] != 'ALL') {
                    codes = findCategoryCodes(crime_part, lv_category[1], dataConfig[0]);
                    byCode = " AND " + codeField + " IN (" + codes + ")";
                }
                if (lv_dstrct[1] == 'ALL') {
                    lv_district = 'ALL';
                } else {
                    lv_lbl = lv_gl.label.split(':');
                    lv_district = dojo.trim(lv_lbl[1]);
                }
                if (lv_dstrct[1] == 'ALL') {
                    mapChart.getLayer('cb_' + lv_l).setDefinitionExpression(null);
                } else {
                    mapChart.getLayer('cb_' + lv_l).setDefinitionExpression(geoLayers[lv_dstrct[0]].queryField + " = '" + lv_district + "'");
                }
                var featureLayerStats = new FeatureLayerStatistics({ layer: flyr });
                var featureLayerStatsParams = { field: statsField };
                featureLayerStats.getUniqueValues(featureLayerStatsParams).then(function (result) {
                    var max = Math.max.apply(Math, result.uniqueValueInfos.map(function (o) { return o.count; }));
                    var min = Math.min.apply(Math, result.uniqueValueInfos.map(function (o) { return o.count; }));
                    var numRanges = 5;
                    var inc = Math.round((max - min) / numRanges);
                    var q = new esri.tasks.Query();
                    q.returnGeometry = false;
                    q.outFields = [statsField];
                    q.where = '1=1';
                    flyr.queryFeatures(q, function (fs) {
                        cbCounterFeatures = fs.features;
                        mapChart.getLayer('cb_' + lv_l).show();
                        var bank = {
                            'zero': new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL, new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, null, 0), null),
                            'one': new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([53, 53, 53, 0.5]), 1), new dojo.Color([0, 97, 0, 0.7])),
                            'two': new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([53, 53, 53, 0.5]), 1), new dojo.Color([122, 171, 0, 0.7])),
                            'three': new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([53, 53, 53, 0.5]), 1), new dojo.Color([255, 255, 0, 0.7])),
                            'four': new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([53, 53, 53, 0.5]), 1), new dojo.Color([255, 153, 0, 0.7])),
                            'five': new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([53, 53, 53, 0.5]), 1), new dojo.Color([255, 34, 0, 0.7]))
                        };
                        var renderer = new ClassBreaksRenderer(bank.zero, calculate_cb_values);
                        renderer.setMaxInclusive(true);
                        if (max > 20) {
                            renderer.addBreak({ minValue: 0, maxValue: inc, label: "< " + inc, symbol: bank.one });
                            renderer.addBreak({ minValue: inc, maxValue: inc * 2, label: inc + "-" + inc * 2, symbol: bank.two });
                            renderer.addBreak({ minValue: inc * 2, maxValue: inc * 3, label: inc * 2 + "-" + inc * 3, symbol: bank.three });
                            renderer.addBreak({ minValue: inc * 3, maxValue: inc * 4, label: inc * 3 + "-" + inc * 4, symbol: bank.four });
                            renderer.addBreak({ minValue: inc * 4, maxValue: Infinity, label: "> " + inc * 4, symbol: bank.five });
                        } else if (max > 5 && max <= 20) {
                            renderer.addBreak({ minValue: 0, maxValue: 4, label: "< 4", symbol: bank.one });
                            renderer.addBreak({ minValue: 4, maxValue: 8, label: "4-8", symbol: bank.two });
                            renderer.addBreak({ minValue: 8, maxValue: 12, label: "8-12", symbol: bank.three });
                            renderer.addBreak({ minValue: 12, maxValue: 16, label: "12-16", symbol: bank.four });
                            renderer.addBreak({ minValue: 16, maxValue: Infinity, label: "> 16", symbol: bank.five });
                        } else {
                            renderer.addBreak({ minValue: 0, maxValue: 0, label: "0", symbol: bank.one });
                            renderer.addBreak({ minValue: 1, maxValue: 1, label: "1", symbol: bank.two });
                            renderer.addBreak({ minValue: 2, maxValue: 2, label: "2", symbol: bank.three });
                            renderer.addBreak({ minValue: 3, maxValue: 3, label: "3", symbol: bank.four });
                            renderer.addBreak({ minValue: 4, maxValue: Infinity, label: "> 3", symbol: bank.five });
                        }
                        mapChart.getLayer('cb_' + lv_l).setRenderer(renderer);
                        RemoveChildren(dojo.byId('mapClassBreakLegend'));
                        var to = dojo.create('table', { style: 'width: 100%; height: 100%; border-collapse: collapse' }, null, 'only');
                        var tt = dojo.create('tbody', null, to);
                        chgt = 100 / (renderer.infos.length);
                        dojo.forEach(renderer.infos, function (info) {
                            clr = info.symbol.color;
                            if (clr) {
                                _rgba = rgba(clr.r, clr.g, clr.b, clr.a);
                                row = dojo.create('tr', { style: 'height: ' + chgt + '%;' }, tt, 'last');
                                td = dojo.create('td', {
                                    class:'classBreakTD',
                                    style: 'height: ' + chgt + '%; background-color: ' + _rgba + ';'
                               }, row, 'last');
                               dojo.create('label', {
                                   innerHTML: info.label,
                                   class: 'classBreakLabels'
                               }, td, 'last')
                            }
                        });
                        dojo.byId('mapClassBreakLegend').appendChild(to);
                    });
                }).otherwise(function (error) {
                    hideLW('divWorking_Map');
                    console.log("An error occurred while calculating %s, Error: %o", "unique values", error);
                });
            } catch (err) {
                eh(err, 'buildClassBreakRenderer');
            } finally {
                hideLW('divWorking_Map');
            }
        });
    } catch (err) {
        eh(err, 'buildClassBreakRenderer');
    }
}

function calculate_cb_values(val) {
    try {
        lyrobj = getGeoLayerObject();
        var code = (val.hasOwnProperty("attributes")) ? val.attributes[lyrobj.queryField] : val;
        statsField = getIRAEventField(crime_part, lyrobj);
        filteredArr = dojo.filter(cbCounterFeatures, function (item) {
            return dojo.trim(String(item.attributes[statsField])) == dojo.trim(String(code));
        });
        return filteredArr.length;
    } catch (err) {
        eh(err, 'calculate_cb_values');
    }
}

function getClassBreakConfig(part, lyr) {
    try {
        filteredArr = dojo.filter(dataConfig[0].groups, function (item) {
            return item.title == part;
        });
        rtn = dojo.filter(filteredArr[0].events, function (evnt) {
            lv_type = dijit.byId('selectClassBreakType').get('value');
            lvtype = (lv_type != 'WEEK') ? 'chartPie' : 'chartLast52Weeks';
            etitle = (lv_type != 'WEEK') ? crime_days : '52 weeks';
            return (evnt.parent == lvtype && evnt.eventTitle == etitle);
        });
        rtn2 = dojo.filter(rtn[0].classBreaks, function (evnt) {
            return evnt.aliasname = lyr;
        });
        return rtn2[0];
    } catch (err) {
        eh(err, 'getClassBreakConfig');
    }
}

function getIRAEventField(part, obj) {
    filteredArr = dojo.filter(dataConfig[0].groups, function (item) {
        return item.title == part;
    });
    switch (obj.displayName) {
        case 'IRA':
            return filteredArr[0].table + '.' + filteredArr[0].iraField;
            break;
        case 'Patrol Zone':
            if (filteredArr[0].patrolField) {
                return filteredArr[0].table + '.' + filteredArr[0].patrolField;
            } else {
                return filteredArr[0].table + '.' + filteredArr[0].iraField;
            }
            break;
        case 'Sector':
            return filteredArr[0].table + '.' + filteredArr[0].sectorField;
            break;
        case 'District':
            return filteredArr[0].table + '.' + filteredArr[0].districtField;
            break;
    }
}

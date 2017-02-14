function getGeoLayerObject() {
    filteredArr = dojo.filter(dijit.byId('selectDistrict').getOptions(), function (opt) {
        return opt.selected;
    });
    //var frst = dijit.byId('selectDistrict').getOptions(0);
    val = filteredArr[0].value.split('|');
    if (val[1] == 'ALL') {
        //newval = frst.value.split('|');
        filteredArr2 = dojo.filter(geoLayers, function (item) {
            return item.displayHeader == val[2];
        });
        return filteredArr2[0];
    } else {
        return geoLayers[0];
    }
}

function getGeoEventField(part) {
    val = dijit.byId('selectDistrict').get('value');
    ary = val.split('|');
    filteredArr = dojo.filter(dataConfig[0].groups, function (item) {
        return item.title == part;
    });
    switch (ary[2]) {
        case 'IRAs':
            return filteredArr[0].table + '.' + filteredArr[0].iraField;
            break;
        case 'Patrol Zones':
            return filteredArr[0].table + '.' + filteredArr[0].patrolField;
            break;
        case 'Sectors':
            return filteredArr[0].table + '.' + filteredArr[0].sectorField;
            break;
        case 'Districts':
            return filteredArr[0].table + '.' + filteredArr[0].districtField;
            break;
    }
}

function getGeoVars() {
    return esri.request({
        url: 'json/fle_admin_zone.json',
        handleAs: 'json'
    });
}

function constructGeos() {
    try {
        var opts = [];
        dojo.forEach(geoLayers, function (lyr) {
            if (lyr.useInDropDown) {
                dojo.forEach(lyr.geos, function (g) {
                    opts.push({ value: g.value, label: g.label });
                });
            }
        });

        sel = new dijit.form.Select({
            id: "selectDistrict",
            name: "selectDistrict",
            style: "width: 100px",
            autoWidth: false,
            maxHeight: 200,
            options: opts,
            onChange: function (evt) {
                try {
                    log('selectDistrict_OnChange (' + evt + ')');
                    if (evt) {
                        getAnalysisVars();
                        ary_evt = evt.split('|');
                        qk = geoLayers[parseInt(ary_evt[0])];
                        var layerDefinitions = [];
                        vislayers = [];
                        dojo.forEach(geoLayers, function (zl) {
                            id = zl.layerIndex;
                            if (id == qk.layerIndex) {
                                vislayers.push(id);
                            }
                        });
                        mapChart.getLayer('olyr').setVisibleLayers(vislayers, false);
                        if (ary_evt[1] != 'ALL') {
                            var poly = qk.geos[parseInt(ary_evt[1]) + 1].poly;
                            var pjson = { xmin: poly[0].Value, ymin: poly[1].Value, xmax: poly[2].Value, ymax: poly[3].Value, spatialReference: { wkid: poly[4].Value[0].Value } };
                            var ext = new esri.geometry.Extent(pjson);
                            mapChart.setExtent(ext, true);
                            //require(["esri/geometry/jsonUtils"], function (geometryJsonUtils) {
                            //    var ext2 = geometryJsonUtils.fromJson(poly);
                            //    mapChart.setExtent(ext2, true);
                            //});
                            layerDefinitions[qk.layerIndex] = qk.queryField + " = '" + qk.geos[parseInt(ary_evt[1]) + 1].name + "'";
                        } else {
                            mapChart.setExtent(new esri.geometry.Extent(XMin, YMin, XMax, YMax, new esri.SpatialReference(SR)));
                            layerDefinitions[qk.layerIndex] = null;
                        }
                        mapChart.getLayer('olyr').setLayerDefinitions(layerDefinitions);
                        buildSummaryTable('ChartToDateSummary');
                        buildPie('ChartPie');
                        setLyrDefs();
                        buildHistogram('MainHistogram');
                        toggleLayerVisibility();
                    }
                } catch (err) {
                    eh(err, 'selectDistrict_OnChange');
                }
            }
        });
        dojo.byId('spatialSelector').appendChild(sel.domNode);
        sel.startup();
    } catch (err) {
        eh(err, 'constructGeos');
    }
}

function geoLayerQuery(zl) {
    try {
        var qt = new esri.tasks.QueryTask(adminMap + '/' + zl.layerIndex);
        var q = new esri.tasks.Query();
        q.returnGeometry = true;
        q.outSpatialReference = mapChart.spatialReference;
        q.outFields = ['*'];
        q.where = '1=1';
        q.orderByFields = [zl.queryField + ' ASC'];
        return qt.execute(q);
    } catch (err) {
        eh(err, 'geoLayerQuery');
        return null;
    }
}

function toggleLayerVisibility() {
    log('toggleLayerVisibility');
    try {
        if (clusterLayer) {
            mapChart.removeLayer(clusterLayer);
            clusterLayer = null;
        }
        mapChart.infoWindow.hide();
        dojo.forEach(mapChart.graphicsLayerIds, function (id) {
            mapChart.getLayer(id).hide();
        });
        lyr = mapChart.getLayer(crime_part + ' ' + crime_days);
        dojo.byId('lblMapChart').innerHTML = crime_code_category_abbr + ' ' + crime_days + ' (' + crime_geolayer_filter_district + ')';
        mapChartRenderType_onChange(dijit.byId('mapChartRenderType').get('value'));
        ((mapChart.getScale() <= 100000 && dijit.byId('mapChartRenderType').get('value') == 'Pin Map') || dijit.byId('mapChartRenderType').get('value') == 'Heat Map') ? lyr.show() : lyr.hide();
        lyr.refresh();
    } catch (err) {
        eh(err, 'toggleLayerVisibility');
    }
}

function mapChartRenderType_onChange(evt) {
    try {
        mapChart.infoWindow.hide();
        lv_grp = getGroupByPart(crime_part, dataConfig[0]);
        lyr = mapChart.getLayer(crime_part + ' ' + crime_days);
        dojo.forEach(geoLayers, function (l) {
            mapChart.getLayer('cb_' + l.displayName).setRenderer(null);
            mapChart.getLayer('cb_' + l.displayName).hide();
        });
        if (clusterLayer) {
            mapChart.removeLayer(clusterLayer);
            clusterLayer = null;
        }
        lyr.setRenderer(null);
        lyr.hide();
        switch (evt) {
            case 'Pin Map':
                dojo.byId('mapClassBreakLegend').style.display = 'none';
                showLW('divWorking_Map');
                var q = new esri.tasks.Query();
                q.returnGeometry = true;
                q.outFields = ["*"];
                q.where = '1=1';
                lyr.queryFeatures(q, function (result) {
                    var dataMap = dojo.map(result.features, function (p) {
                        return {
                            "x": p.geometry.x,
                            "y": p.geometry.y,
                            "attributes": p.attributes
                        };
                    });
                    var data = dojo.filter(dataMap, function (d) {
                        return d && IsNumeric(d.x) && IsNumeric(d.y);
                    });
                    require(['extras/ClusterLayer'], function (ClusterLayer) {
                        // cluster layer that uses OpenLayers style clustering
                        var singleSymbol = new esri.symbol.SimpleMarkerSymbol();
                        singleSymbol.setPath("m 10.5,6.5 a 4,4 0 0 1 -4,4 4,4 0 0 1 -4,-4 4,4 0 0 1 4,-4 4,4 0 0 1 4,4 z");
                        singleSymbol.setColor('#FF0000');
                        singleSymbol.setOutline(null);
                        singleSymbol.setSize(8);
                        clusterLayer = new ClusterLayer({
                            "data": data,
                            "distance": 100,
                            "id": "clusters",
                            "labelColor": "#fff",
                            "labelOffset": 10,
                            "resolution": mapChart.extent.getWidth() / mapChart.width,
                            "singleSymbol": singleSymbol,
                            "showSingles": true,
                            "singleTemplate": new esri.InfoTemplate('Info', lv_grp.infotemp.split('|').join('<br />'))
                        });
                        var defaultSym = new esri.symbol.SimpleMarkerSymbol().setSize(4);
                        var renderer = new esri.renderer.ClassBreaksRenderer(defaultSym, "clusterCount");
                        var picBaseUrl = "./extras/shapes/";
                        var blue = new esri.symbol.PictureMarkerSymbol(picBaseUrl + "BluePin1LargeB.png", 40, 40).setOffset(0, 15);
                        var green = new esri.symbol.PictureMarkerSymbol(picBaseUrl + "GreenPin1LargeB.png", 64, 64).setOffset(0, 15);
                        var red = new esri.symbol.PictureMarkerSymbol(picBaseUrl + "RedPin1LargeB.png", 90, 90).setOffset(0, 15);
                        var purple = new esri.symbol.PictureMarkerSymbol(picBaseUrl + "PurplePin1LargeB.png", 72, 72).setOffset(0, 15);
                        renderer.addBreak(0, 9, blue);
                        renderer.addBreak(9, 200, green);
                        renderer.addBreak(200, 1000, purple);
                        renderer.addBreak(1000, Infinity, red);
                        clusterLayer.setRenderer(renderer);
                        mapChart.addLayer(clusterLayer);
                    });
                }, function (err) {
                    log(err);
                    hideLW('divWorking_Map');
                });
                hideLW('divWorking_Map');
                break;
            case 'Heat Map':
                dojo.byId('mapClassBreakLegend').style.display = 'none';
                lyr.show();
                var scl = mapChart.getScale();
                require(["esri/renderers/smartMapping"], function (smartMapping) {
                    smartMapping.createHeatmapRenderer({
                        basemap: mapChart.getBasemap(),
                        maxRatio: 1.0,
                        blurRadius: 10,
                        layer: lyr,
                        fadeToTransparent: true,
                        scheme: { colors: ["rgba(0, 255, 0, 0)", "rgba(0, 255, 0, 0.7)", "rgba(255, 216, 0, 0.7)", "rgba(255, 106, 0, 0.7)", "rgba(255, 0, 0, 0.7)"] }
                    }).then(function (evt) {
                        lyr.setRenderer(evt.renderer);
                    });
                });
                break;
            default:
                dojo.byId('mapClassBreakLegend').style.display = 'block';
                createClassBreaks(evt);
                break;
        }
        lyr.refresh();
    } catch (err) {
        eh(err, 'mapChartRenderType_onChange');
    }
}

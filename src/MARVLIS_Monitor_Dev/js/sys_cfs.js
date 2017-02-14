var incidentRefreshCount = 1;
var cfsStatusFilter = null;
var gauge_P1 = null;
var gauge_P2 = null;
var gauge_P3 = null;
var gauge_P4 = null;
var stacked_District = null;

function createIncidentBars() {
    require(["dojox/charting/Chart", "dojox/charting/axis2d/Default", "dojox/charting/plot2d/StackedBars", "dojox/charting/themes/Chris"],
        function (Chart, Default, StackedBars, Chris) {
            try {
                ylabels = [];
                dojo.forEach(avlIncidents, function (name, i) {
                    ylabels.push({
                        value: i + 1,
                        text: name
                    });
                });

                //var table = dojo.create('table', { style: { 'width': '100%' } }, null, 'only');
                //tBody = dojo.create('tbody', null, table);

                //dojo.forEach(avlDistricts, function (name) {
                //    //ylabels = [{ value: 1, text: name }];
                //    tr = dojo.create('tr', null, tBody, 'last');
                //    dojo.create('td', { innerHTML: name, class: 'avlDistrict' }, tr, 'last');
                //    td = dojo.create('td', null, tr, 'last');
                //    div = dojo.create('div', { id: name + '_StackedBarsDiv', style: 'width:100%; height:65px !important;' }, td);
                fill_p1 = {
                    type: "linear", space: "shapeX", x1: 0, y1: 0, x2: 0, y2: 100,
                    colors: [{ offset: 0, color: [127, 201, 255] }, { offset: 1, color: [0, 148, 255] }]
                };
                fill_p2 = {
                    type: "linear", space: "shapeX", x1: 0, y1: 0, x2: 0, y2: 100,
                    colors: [{ offset: 0, color: [255, 178, 127] }, { offset: 1, color: [255, 106, 0] }]
                };
                fill_p3 = {
                    type: "linear", space: "shapeX", x1: 0, y1: 0, x2: 0, y2: 100,
                    colors: [{ offset: 0, color: [255, 233, 127] }, { offset: 1, color: [255, 216, 0] }]
                };
                fill_p4 = {
                    type: "linear", space: "shapeX", x1: 0, y1: 0, x2: 0, y2: 100,
                    colors: [{ offset: 0, color: [165, 255, 127] }, { offset: 1, color: [76, 255, 0] }]
                };

                stacked_District = new Chart("cfsPaneInner");
                stacked_District.setTheme(Chris);
                stacked_District.id = "StackedBars";

                stacked_District.addAxis("y", { fixLower: "major", fixUpper: "major", majorTickStep: 5, minorLabels: false, minorTicks: false, includeZero: false });
                stacked_District.addAxis("x", { labels: ylabels, vertical: true, fixLower: "minor", fixUpper: "minor", natural: true });
                stacked_District.addPlot("default", { type: StackedBars, gap: 1, minBarSize: 18, maxBarSize: 18, labels: true, precision: 0, labelStyle: "inside", font: "normal normal bold 8pt Arial", fontColor: "black" }); //, animate: { duration: 1000 }
                stacked_District.addSeries("P1", [{ y: 1 }, { y: 1 }, { y: 1 }, { y: 1 }, { y: 1 }, { y: 1 }], { fill: fill_p1, stroke: 'transparent' });
                stacked_District.addSeries("P2", [{ y: 2 }, { y: 2 }, { y: 2 }, { y: 2 }, { y: 2 }, { y: 2 }], { fill: fill_p2, stroke: 'transparent' });
                stacked_District.addSeries("P3", [{ y: 5 }, { y: 5 }, { y: 5 }, { y: 5 }, { y: 5 }, { y: 5 }], { fill: fill_p3, stroke: 'transparent' });
                stacked_District.addSeries("P4", [{ y: 4 }, { y: 4 }, { y: 4 }, { y: 4 }, { y: 4 }, { y: 4 }], { fill: fill_p4, stroke: 'transparent' });
                stacked_District.addPlot("Grid", { type: "Grid", hAxis: "x", vAxis: "y", hMajorLines: false, hMinorLines: false, vMajorLines: true, vMinorLines: true });
                stacked_District.theme.chart.fill = 'transparent';
                stacked_District.theme.chart.stroke = 'transparent';
                stacked_District.theme.plotarea.fill = 'transparent';
                stacked_District.theme.plotarea.stroke = 'transparent';
                stacked_District.theme.axis.stroke.color = 'transparent';
                stacked_District.theme.axis.tick.fontColor = 'white';
                stacked_District.theme.axis.tick.color = 'transparent';
                stacked_District.theme.axis.majorTick.color = [50, 50, 50];
                stacked_District.theme.axis.tick.font = "normal normal bold 12px Arial";
                stacked_District.render();
                //});
                //dijit.byId('cfsPane').set('content', table);
            } catch (err) {
                eh(err, 'createIncidentBars');
            }
        });
}

function generateIncidentRecords() {
    try {
        //dojo.byId('eventMonitor').innerHTML = 'Event Monitor (' + incidentRefreshCount + ')';
        incidentRefreshCount += 1;
        items = incidentLayer.getUniqueValues('bcs_incident');

        if (dojo.hasClass("CFSDetailPanePage", "myshowG")) {
            if (items.indexOf(dojo.byId('cfsDetailMonitor').innerHTML) > -1) {
                var filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_incident'] == dojo.byId('cfsDetailMonitor').innerHTML;
                });
                if (filteredArr.length > 0) {
                    focusOnCall(dojo.byId('cfsDetailMonitor').innerHTML, filteredArr[0].attributes['bcs_assigned']);
                }
            } else {
                toggleAVLCall('CFSPanePage');
                constructEventTable(incidentLayer.graphics, cfsStatusFilter);
            }
        } else {
            constructEventTable(incidentLayer.graphics, cfsStatusFilter);
        }

        if (stacked_District) {
            require(["dojo/_base/array"], function () {
                p1 = [{ y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }];
                p2 = [{ y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }];
                p3 = [{ y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }];
                p4 = [{ y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }];

                filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_priority'] == 'P1';
                });
                dojo.forEach(filteredArr, function (itm) {
                    var district = itm.attributes['bcs_division'];
                    dojo.forEach(avlIncidents, function (name, i) {
                        if ((itm.attributes['bcs_division'] == 'District ' + name) || (name == 'F' && itm.attributes['bcs_division'] == 'Floating')) {
                            p1[i]['y'] += 1;
                        }
                    });
                });
                filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_priority'] == 'P2';
                });
                dojo.forEach(filteredArr, function (itm) {
                    var district = itm.attributes['bcs_division'];
                    dojo.forEach(avlIncidents, function (name, i) {
                        if ((itm.attributes['bcs_division'] == 'District ' + name) || (name == 'F' && itm.attributes['bcs_division'] == 'Floating')) {
                            p2[i]['y'] += 1;
                        }
                    });
                });
                filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_priority'] == 'P3';
                });
                dojo.forEach(filteredArr, function (itm) {
                    var district = itm.attributes['bcs_division'];
                    dojo.forEach(avlIncidents, function (name, i) {
                        if ((itm.attributes['bcs_division'] == 'District ' + name) || (name == 'F' && !itm.attributes['bcs_division'] == 'Floating')) {
                            p3[i]['y'] += 1;
                        }
                    });
                });
                filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_priority'] != 'P1' && item.attributes['bcs_priority'] != 'P2' && item.attributes['bcs_priority'] != 'P3';
                });
                dojo.forEach(filteredArr, function (itm) {
                    var district = itm.attributes['bcs_division'];
                    dojo.forEach(avlIncidents, function (name, i) {
                        if (name == 'F' && itm.attributes['bcs_division'] == 'Floating') {
                            p4[i]['y'] += 1;
                        } else {
                            if (itm.attributes['bcs_division'] == 'District ' + name) {
                                p4[i]['y'] += 1;
                            }
                        }
                    });
                });
            });
            stacked_District.updateSeries('P1', p1);
            stacked_District.updateSeries('P2', p2);
            stacked_District.updateSeries('P3', p3);
            stacked_District.updateSeries('P4', p4);
            stacked_District.render();
        }


        if (dojo.byId('gauge_P1')) {
            require(["dojo/_base/array"], function () {
                filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_priority'] == 'P1';
                });
                var d = dijit.byId('gauge_P1');
                dijit.byId('gauge_P1').indicators[1].update(filteredArr.length, true);
                dijit.byId('gauge_P1').indicators[4].update(filteredArr.length, true);
                dojo.byId('lblMinAllCalls_P1').innerHTML = filteredArr.length;
                filteredArr2 = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_assigned'] && item.attributes['bcs_priority'] == 'P1';
                });
                dijit.byId('gauge_P1').indicators[2].update(filteredArr2.length, true);
                dijit.byId('gauge_P1').indicators[3].update(filteredArr2.length, true);
                dojo.byId('lblMinUnassignedCalls_P1').innerHTML = filteredArr.length - filteredArr2.length;
            });
        }
        if (dojo.byId('gauge_P2')) {
            require(["dojo/_base/array"], function () {
                filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_priority'] == 'P2';
                });
                dijit.byId('gauge_P2').indicators[1].update(filteredArr.length, true);
                dijit.byId('gauge_P2').indicators[4].update(filteredArr.length, true);
                dojo.byId('lblMinAllCalls_P2').innerHTML = filteredArr.length;
                filteredArr2 = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_assigned'] && item.attributes['bcs_priority'] == 'P2';
                });
                dijit.byId('gauge_P2').indicators[2].update(filteredArr2.length, true);
                dijit.byId('gauge_P2').indicators[3].update(filteredArr2.length, true);
                dojo.byId('lblMinUnassignedCalls_P2').innerHTML = filteredArr.length - filteredArr2.length;
            });
        }
        if (dojo.byId('gauge_P3')) {
            require(["dojo/_base/array"], function () {
                filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_priority'] == 'P3';
                });
                dijit.byId('gauge_P3').indicators[1].update(filteredArr.length, true);
                dijit.byId('gauge_P3').indicators[4].update(filteredArr.length, true);
                dojo.byId('lblMinAllCalls_P3').innerHTML = filteredArr.length;
                filteredArr2 = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_assigned'] && item.attributes['bcs_priority'] == 'P3';
                });
                dijit.byId('gauge_P3').indicators[2].update(filteredArr2.length, true);
                dijit.byId('gauge_P3').indicators[3].update(filteredArr2.length, true);
                dojo.byId('lblMinUnassignedCalls_P3').innerHTML = filteredArr.length - filteredArr2.length;
            });
        }
        if (dojo.byId('gauge_P4')) {
            require(["dojo/_base/array"], function () {
                filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_priority'] != 'P1' && item.attributes['bcs_priority'] != 'P2' && item.attributes['bcs_priority'] != 'P3';
                });
                dijit.byId('gauge_P4').indicators[1].update(filteredArr.length, true);
                dijit.byId('gauge_P4').indicators[4].update(filteredArr.length, true);
                dojo.byId('lblMinAllCalls_P4').innerHTML = filteredArr.length;
                filteredArr2 = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_assigned'] && (item.attributes['bcs_priority'] != 'P1' && item.attributes['bcs_priority'] != 'P2' && item.attributes['bcs_priority'] != 'P3');
                });
                dijit.byId('gauge_P4').indicators[2].update(filteredArr2.length, true);
                dijit.byId('gauge_P4').indicators[3].update(filteredArr2.length, true);
                dojo.byId('lblMinUnassignedCalls_P4').innerHTML = filteredArr.length - filteredArr2.length;
            });
        }
    } catch (err) {
        eh(err, 'generateIncidentRecords');
    }
}

function cfsP1() {
    cfsStatusFilter = 'P1';
}

function comparePriority(a, b) {
    if (new Date(a.attributes['bcs_timereceived']) < new Date(b.attributes['bcs_timereceived']))
        return 1;
    else if (new Date(a.attributes['bcs_timereceived']) > new Date(b.attributes['bcs_timereceived']))
        return -1;
    else
        return 0;
}

function constructEventTable(items, fltr) {
    try {
        RemoveChildren(dojo.byId('cfsPane'));
        var summary = {};
        var filteredArr = null;
        if (fltr) {
            require(["dojo/_base/array"], function () {
                filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['bcs_priority'] == fltr;
                });
            });
        } else {
            filteredArr = items;
        }

        attrs = [];
        dojo.forEach(filteredArr, function (itm) {
            stat = 'Call';
            if (itm.attributes['bcs_assigned']) {
                stat = 'Dispatched';
            }
            attrs.push({ inc: itm.attributes['bcs_incident'], assigned: itm.attributes['bcs_assigned'], grp: (!itm.attributes['bcs_division']) ? 'Floating' : itm.attributes['bcs_division'], priority: (!itm.attributes['bcs_priority']) ? 'P4' : itm.attributes['bcs_priority'], formatteddate: formatDate(itm.attributes['bcs_timereceived']), formattedtime: formatTime(itm.attributes['bcs_timereceived']), nature: itm.attributes['bcs_complaint'], address: itm.attributes['bcs_address'], status: stat, geo: itm.geometry });
        });

        key = 'formatteddate';
        sortVal = dijit.byId('selectCFSSort').get('value');
        sortValAry = sortVal.split(':')
        switch (sortValAry[0]) {
            case 'Priority':
                key = 'priority';
                key2 = 'formatteddate';
                sorteditems = sortByKeys(attrs, key, key2, sortValAry[1], 'D');
                break;
            case 'TimeReceived':
                key = 'formatteddate';
                sorteditems = sortByKey(attrs, key, sortValAry[1]);
                break;
            case 'District':
                key = 'grp';
                key2 = 'formatteddate';
                sorteditems = sortByKeys(attrs, key, key2, sortValAry[1], 'D');
                break;
        }

        var table = dojo.create('table', {
            style: {
                'width': '100%', 'border-collapse': 'collapse'
            }
        }, null, 'only');
        tBody = dojo.create('tbody', null, table);

        //filteredArr.sort(comparePriority);

        grpHeader = '';
        dojo.forEach(sorteditems, function (itm) {
            if (itm.grp == '') {
                grp = 'Floating';
                itm.grp = 'Floating';
            } else {
                grp = itm.grp;
            }
            summary[grp] = summary[grp] || [];
            summary[grp].push(itm);
            //dojo.forEach(filteredArr, function (itm) {
            title = itm.inc;
            prob = itm.nature;
            addr = '';
            (itm.address) ? addr = itm.address : addr = 'NO ADDRESS';
            priority = itm.priority;
            //veh = '';
            //(itm.attributes['bcs_dispatched']) ? veh = itm.attributes['bcs_dispatched'] : veh = 'NONE';

            clr = p4_color;
            switch (priority) {
                case 'P1':
                    clr = p1_color;
                    break;
                case 'P2':
                    clr = p2_color;
                    break;
                case 'P3':
                    clr = p3_color;
                    break;
                default:
                    clr = p4_color;
                    break;
            }

            if (grpHeader != grp && sortValAry[0] == 'District') {
                grpHeader = grp;
                trOuter = dojo.create('tr', null, tBody, 'last');
                td = dojo.create('td', {
                    innerHTML: grpHeader, colspan: 3,
                    class: 'cfsDistrictHeader',
                    style: { 'color': 'white' }
                }, trOuter, 'last');
            }
            if (grpHeader != itm.priority && sortValAry[0] == 'Priority') {
                grpHeader = itm.priority;
                trOuter = dojo.create('tr', null, tBody, 'last');
                td = dojo.create('td', {
                    innerHTML: grpHeader, colspan: 3,
                    class: 'cfsDistrictHeader',
                    style: { 'background-color': clr }
                }, trOuter, 'last');
            }

            trOuter = dojo.create('tr', {
                style: {
                    cursor: 'pointer'
                }
            }, tBody, 'last');
            td = dojo.create('td', null, trOuter, 'last');

            tableInner = dojo.create('table', {
                class: '',
                style: {
                    'width': '100%', 'height': '100%', 'border-collapse': 'collapse'
                }
            }, td, 'only');
            tBodyInner = dojo.create('tbody', null, tableInner);
            tBodyInner.setAttribute('geo', dojo.toJson(itm.geo.toJson()));
            tBodyInner.setAttribute('loc', addr);
            tBodyInner.setAttribute('id', title);
            tBodyInner.setAttribute('assigned', itm.assigned);
            tBodyInner.onclick = function () {
                var geo = esri.geometry.fromJson(dojo.fromJson(this.getAttribute('geo')));
                map.getLayer('glhilite').clear();
                map.centerAndZoom(geo, 16);
                map.getLayer('glhilite').add(new esri.Graphic(geo, new esri.symbol.PictureMarkerSymbol({ url: 'img/Incident_Selection.gif', height: 40, width: 40, xoffset: 0, yoffset: 0 }), { 'type': 'CFS', 'unit': '' }));
                toggleAVLCall('CFSDetailPanePage');
                focusOnCall(this.getAttribute('id'), this.getAttribute('assigned'));
            };

            trInner = dojo.create('tr', {
                style: {
                    cursor: 'pointer'
                }
            }, tBodyInner, 'last');
            td = dojo.create('td', {
                innerHTML: title.substring(12),
                class: 'cfsCellID'
            }, trInner, 'last');
            td = dojo.create('td', {
                innerHTML: priority,
                class: 'cfsCellPriority',
                style: {
                    'color': clr
                }
            }, trInner, 'last');
            td = dojo.create('td', {
                innerHTML: prob,
                class: 'cfsCellProblem'
            }, trInner, 'last');
            if (itm.status == 'Call') { td.style.background = '#720701'; }
            td = dojo.create('td', {
                innerHTML: itm.formattedtime,
                class: 'cfsCellTimeStamp'
            }, trInner, 'last');

            if (itm.status == 'Call') { td.style.background = '#720701'; }
            trInner = dojo.create('tr', {
                style: {
                    cursor: 'pointer'
                }
            }, tBodyInner, 'last');
            td = dojo.create('td', {
                innerHTML: (prob.indexOf('135') === 0 || prob.indexOf('27') === 0) ? 'W' : '',
                class: 'cfsCellBlank'
            }, trInner, 'last');

            td = dojo.create('td', {
                innerHTML: addr,
                class: 'cfsCellBlank'
            }, trInner, 'last');
            if (itm.status == 'Call') { td.style.background = '#720701'; }
            td = dojo.create('td', {
                innerHTML: itm.status,
                class: 'cfsCellStatus'
            }, trInner, 'last');
            if (itm.status == 'Call') { td.style.background = '#720701'; }

        });
        dijit.byId('cfsPane').set('content', table);
    } catch (err) {
        eh(err, 'constructEventTable');
    }
}

function buildGauges() {
    if (!dojo.byId('gauge_P1')) {
        buildIndicator("gaugeP1", "gauge_P1", p1_color);
        dojo.byId('lblMinAllCalls_P1').style.color = p1_color;
    }
    if (!dojo.byId('gauge_P2')) {
        buildIndicator("gaugeP2", "gauge_P2", p2_color);
        dojo.byId('lblMinAllCalls_P2').style.color = p2_color;
    }
    if (!dojo.byId('gauge_P3')) {
        buildIndicator("gaugeP3", "gauge_P3", p3_color);
        dojo.byId('lblMinAllCalls_P3').style.color = p3_color;
    }
    if (!dojo.byId('gauge_P4')) {
        buildIndicator("gaugeP4", "gauge_P4", p4_color);
        dojo.byId('lblMinAllCalls_P4').style.color = p4_color;
    }

}

function focusOnCall(id, assigned) {
    //toggleAVLCall('CFSDetailPanePage');
    dojo.byId('cfsDetailMonitor').innerHTML = id;
    require(["dojo/_base/array"], function () {
        filteredCFS = dojo.filter(incidentLayer.graphics, function (item) {
            return item.attributes['bcs_incident'] == id;
        });
        RemoveChildren(dojo.byId('cfsDetailPane'));
        var table = dojo.create('table', { style: { 'width': '100%', 'background-color': '#171717' } }, null, 'only');
        tBody = dojo.create('tbody', null, table);
        dojo.forEach(filteredCFS, function (itm) {
            title = itm.attributes['bcs_incident'];
            prob = itm.attributes['bcs_complaint'];
            addr = '';
            (itm.attributes['bcs_address']) ? addr = itm.attributes['bcs_address'] : addr = 'NO ADDRESS';
            priority = itm.attributes['bcs_priority'];
            //veh = '';
            ////(itm.attributes['bcs_dispatched']) ? veh = itm.attributes['bcs_dispatched'] : veh = 'NONE';
            //dojo.forEach(filteredAVL, function (unit) {
            //    veh += unit.attributes['bcs_name'] + ' ';
            //});
            //if (!veh) { veh = 'NONE'; }
            clr = p4_color;
            switch (priority) {
                case 'P1':
                    clr = p1_color;
                    break;
                case 'P2':
                    clr = p2_color;
                    break;
                case 'P3':
                    clr = p3_color;
                    break;
                default:
                    clr = p4_color;
                    break;
            }

            tr = dojo.create('tr', null, tBody, 'last');
            td = dojo.create('td', {
                innerHTML: title.substring(12),
                class: 'cfsCellIncident'
            }, tr, 'last');
            td = dojo.create('td', {
                innerHTML: priority,
                class: 'cfsCellPriority',
                style: {
                    'color': clr
                }
            }, tr, 'last');
            td = dojo.create('td', {
                innerHTML: prob,
                colspan: 2,
                class: 'cfsCellProblem'
            }, tr, 'last');
            tr = dojo.create('tr', null, tBody, 'last');
            td = dojo.create('td', {
                innerHTML: '',
                colspan: 2,
                class: 'cfsCellBlank'
            }, tr, 'last');
            td = dojo.create('td', {
                innerHTML: addr,
                colspan: 2,
                class: 'cfsCellBlank'
            }, tr, 'last');
            //tr = dojo.create('tr', null, tBody, 'last');
            //td = dojo.create('td', {
            //    innerHTML: '',
            //    colspan: 2,
            //    class: 'cfsCellBlank'
            //}, tr, 'last');
            //td = dojo.create('td', {
            //    innerHTML: 'Assigned Vehicle(s): ' + veh,
            //    colspan: 2,
            //    class: 'cfsCellBlank'
            //}, tr, 'last');
            tr = dojo.create('tr', null, tBody, 'last');
            td = dojo.create('td', {
                innerHTML: '',
                colspan: 2,
                class: 'cfsCellBlank'
            }, tr, 'last');
            td = dojo.create('td', {
                innerHTML: 'Received: ' + formatDate(itm.attributes['bcs_timereceived']),
                colspan: 2,
                class: 'cfsCellBlank'
            }, tr, 'last');

            //tr = dojo.create('tr', null, tBody, 'last');
            //td = dojo.create('td', {
            //    innerHTML: '',
            //    colspan: 2,
            //    class: 'cfsCellBlank'
            //}, tr, 'last');
            //td = dojo.create('td', {
            //    innerHTML: 'Dispatched: ' + formatDate(itm.attributes['bcs_timedispatched']),
            //    class: 'cfsCellBlank'
            //}, tr, 'last');
            //td = dojo.create('td', {
            //    innerHTML: daysBetween(itm.attributes['bcs_timereceived'], itm.attributes['bcs_timeenroute']),
            //    class: 'cfsCellElapse'
            //}, tr, 'last');

            //tr = dojo.create('tr', null, tBody, 'last');
            //td = dojo.create('td', {
            //    innerHTML: '',
            //    colspan: 2,
            //    class: 'cfsCellBlank'
            //}, tr, 'last');
            //td = dojo.create('td', {
            //    innerHTML: 'Enroute: ' + formatDate(itm.attributes['bcs_timeenroute']),
            //    class: 'cfsCellBlank'
            //}, tr, 'last');
            //td = dojo.create('td', {
            //    innerHTML: daysBetween(itm.attributes['bcs_timedispatched'], itm.attributes['bcs_timeenroute']),
            //    class: 'cfsCellElapse'
            //}, tr, 'last');

            //tr = dojo.create('tr', null, tBody, 'last');
            //td = dojo.create('td', {
            //    innerHTML: '',
            //    colspan: 2,
            //    class: 'cfsCellBlank'
            //}, tr, 'last');
            //td = dojo.create('td', {
            //    innerHTML: 'On Scene: ' + formatDate(itm.attributes['bcs_timeonscene']),
            //    class: 'cfsCellBlank'
            //}, tr, 'last');
            //td = dojo.create('td', {
            //    innerHTML: daysBetween(itm.attributes['bcs_timeenroute'], itm.attributes['bcs_timeonscene']),
            //    class: 'cfsCellElapse'
            //}, tr, 'last');

            //items = vehicleLayer.graphics;
            filteredAVL = dojo.filter(vehicleLayer.graphics, function (item) {
                return item.attributes['bcs_incidentid'] == id || item.attributes['bcs_name'] == assigned;
            });
            if (filteredAVL.length > 0) {
                var itemCounter = 0;
                tr = dojo.create('tr', null, tBody, 'last');
                td = dojo.create('td', {
                    colspan: 4,
                    class: 'cfsCellBlank',
                    style: {
                        'padding-top': '8px', 'background-color': 'transparent'
                    }
                }, tr, 'last');

                var avltable = dojo.create('table', {
                    class: '',
                    style: {
                        'border-spacing': '1px'
                    }
                }, td, 'only');
                avlBody = dojo.create('tbody', null, avltable);

                dojo.forEach(filteredAVL, function (item) {
                    id = item.attributes['bcs_id'];
                    unitName = item.attributes['bcs_name'];
                    avStatus = item.attributes['bcs_status'];
                    a = getColorLabel(item.attributes[vehicleStatusColorField]);

                    if (itemCounter === 0 || itemCounter === 3) {
                        trOuter = dojo.create('tr', null, avlBody, 'last');
                        itemCounter = 0;
                    }
                    td = dojo.create('td', {
                        innerHTML: id,
                        style: {
                            'background-color': a.color
                        }
                    }, trOuter, 'last');

                    tableInner = dojo.create('table', {
                        class: '',
                        style: {
                            'background-color': a.color,
                            'width': '170px', 'height': '100%',
                            'border': 'none'
                        }
                    }, td, 'only');
                    tBodyInner = dojo.create('tbody', null, tableInner);
                    tr = dojo.create('tr', { style: { 'height': '15px' } }, tBodyInner, 'last');
                    td = dojo.create('td', {
                        innerHTML: unitName,
                        class: 'avlCellVehicle',
                        style: {
                            'color': a.fontcolor
                        }
                    }, tr, 'last');
                    td = dojo.create('td', {
                        innerHTML: grp,
                        class: 'avlCellGroup',
                        style: {
                            'color': a.fontcolor
                        }
                    }, tr, 'last');
                    tr = dojo.create('tr', { style: { 'height': '15px' } }, tBodyInner, 'last');
                    td = dojo.create('td', {
                        innerHTML: a.text,
                        colspan: 2,
                        class: 'avlCellStatus',
                        style: {
                            'color': a.fontcolor
                        }
                    }, tr, 'last');
                    itemCounter += 1;
                });

            }

        });
        dijit.byId('cfsDetailPane').set('content', table);
        //fillNotes(filteredCFS);
    });
}

function fillNotes(items) {
    RemoveChildren(dojo.byId('cfsNotesPane'));

    var table = dojo.create('table', { style: { 'width': '100%' } }, null, 'only');
    tBody = dojo.create('tbody', null, table);

    dojo.forEach(items, function (itm) {
        var narr = itm.attributes['bcs_narrative'].replace(/(\r\n|\n|\r)/gm, "|");
        //narr = narr.replace(/(\r\n|\n|\r)/gm, "|");
        var narrAry = narr.split('|');
        dojo.forEach(narrAry, function (a, oe) {
            var matches = a.match(/\[(.*?)\]/);
            var time = '';
            if (matches) {
                var submatch = matches[1];
                ary = submatch.split(' ');
                if (ary.length > 2) {
                    time = ary[1];
                    a = a.replace(matches[0], '[' + ary[2] + ']');
                }
            }


            tr = dojo.create('tr', null, tBody, 'last');
            (oe % 2 == 0) ? roe = ' cellEven' : roe = ' cellOdd';
            dojo.create('td', {
                innerHTML: time,
                class: 'cfsCellNotes' + roe,
                style: { 'vertical-align': 'top' }
            }, tr, 'last');
            dojo.create('td', {
                innerHTML: a,
                class: 'cfsCellNotes' + roe
            }, tr, 'last');
        });
        //dojo.create('td', {
        //    innerHTML: narrAry[1].slice(0, -1),
        //    class: 'cfsCellNotes'
        //}, tr, 'last');

    });

    dijit.byId('cfsNotesPane').set('content', table);
}

function buildIndicator(div, id, clr) {
    require(['dojox/gauges/AnalogGauge', 'dojox/gauges/AnalogArcIndicator', 'dojox/gauges/AnalogNeedleIndicator',
    'dojox/gauges/AnalogCircleIndicator', 'dojox/gauges/AnalogLineIndicator', 'dojox/gauges/TextIndicator',
    'dojo/dom', 'dojo/_base/connect', 'dojo/_base/lang'], function (AnalogGauge, AnalogArcIndicator, AnalogNeedleIndicator, AnalogCircleIndicator, AnalogLineIndicator, TextIndicator, dom, connect, lang) {
        try {
            var gauge = null;
            //var fill = {
            //    'type': 'linear',
            //    'x1': 50,
            //    'y1': 50,
            //    'x2': 100,
            //    'y2': 100,
            //    'colors': [{ offset: 0, color: 'black' }, { offset: 0.5, color: 'yellow' }, { offset: 0.75, color: 'orange' }, { offset: 1, color: 'red' }]
            //};
            gauge = new AnalogGauge({
                id: id,
                startAngle: -90,
                endAngle: 90,
                background: 'transparent',
                width: 150,
                height: 150,
                cx: 70,
                cy: 105,
                useTooltip: false,
                radius: 75,
                ranges: [{
                    low: 0,
                    high: 20,
                    color: [0, 0, 0, 0]
                }],

                majorTicks: {
                    offset: 56,
                    interval: 4,
                    length: 3,
                    color: 'white',
                    labelPlacement: 'outside'
                },

                indicators: [new AnalogArcIndicator({
                    value: 20,
                    width: 20,
                    offset: 36,
                    color: [50, 50, 50],
                    strokeColor: 'transparent',
                    noChange: true,
                    title: 'value',
                    hideValue: true
                }), new AnalogArcIndicator({
                    value: 0,
                    width: 20,
                    offset: 36,
                    interactionMode: "indicator",
                    color: [255, 0, 0],
                    noChange: false,
                    title: 'value',
                    hideValue: true
                }), new AnalogArcIndicator({
                    front: true,
                    value: 0,
                    width: 20,
                    offset: 36,
                    interactionMode: "indicator",
                    color: clr,
                    noChange: false,
                    title: 'value',
                    hideValue: true
                }), new AnalogLineIndicator({
                    front: true,
                    value: 0,
                    width: 1,
                    offset: 36,
                    length: 20,
                    interactionMode: "indicator",
                    color: "white",
                    noChange: false,
                    title: 'value',
                    hideValue: true
                }), new TextIndicator({
                    value: 0,
                    align: 'middle',
                    x: 70,
                    y: 105,
                    font: {
                        family: "Arial",
                        style: "normal",
                        variant: 'small-caps',
                        weight: 'bold',
                        size: "36px"
                    },
                    hideValue: false,
                    color: clr
                })]
            }, dom.byId(div));

            //connect.connect(gauge, 'onClick', cfsP1);

            gauge.startup();

            connect.connect(gauge.indicators[1], "valueChanged", lang.hitch(gauge, function () {
                this.indicators[2].update(this.indicators[1].value);
            }));
            return gauge;
        } catch (err) {
            eh(err, 'buildIndicator');
        }
    });
}


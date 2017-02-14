var incidentRefreshCount = 1;
var cfsStatusFilter = null;
var gauge_P1 = null;
var gauge_P2 = null;
var gauge_P3 = null;
var gauge_P4 = null;
var stacked_District = null;
var focusedCall = null;

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
                stacked_District.addPlot("default", { type: StackedBars, gap: 4, minBarSize: 18, labels: true, precision: 0, labelStyle: "inside", font: "normal normal bold 10pt Arial", fontColor: "black" }); //, animate: { duration: 1000 }
                stacked_District.addSeries("P1", [{ y: 1 }, { y: 1 }, { y: 1 }, { y: 1 }, { y: 1 }], { fill: fill_p1, stroke: 'transparent' });
                stacked_District.addSeries("P2", [{ y: 2 }, { y: 2 }, { y: 2 }, { y: 2 }, { y: 2 }], { fill: fill_p2, stroke: 'transparent' });
                stacked_District.addSeries("P3", [{ y: 5 }, { y: 5 }, { y: 5 }, { y: 5 }, { y: 5 }], { fill: fill_p3, stroke: 'transparent' });
                stacked_District.addSeries("P4", [{ y: 4 }, { y: 4 }, { y: 4 }, { y: 4 }, { y: 4 }], { fill: fill_p4, stroke: 'transparent' });
                stacked_District.addPlot("Grid", { type: "Grid", hAxis: "x", vAxis: "y", hMajorLines: false, hMinorLines: false, vMajorLines: true, vMinorLines: true });
                stacked_District.theme.chart.fill = 'transparent';
                stacked_District.theme.chart.stroke = 'transparent';
                stacked_District.theme.plotarea.fill = 'transparent';
                stacked_District.theme.plotarea.stroke = 'transparent';
                stacked_District.theme.axis.stroke.color = 'transparent';
                stacked_District.theme.axis.tick.fontColor = 'white';
                stacked_District.theme.axis.tick.color = 'transparent';
                stacked_District.theme.axis.majorTick.color = [50, 50, 50];
                stacked_District.theme.axis.tick.font = "normal normal bold 14px Arial";
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
        //items = incidentLayer.getUniqueValues('incidentNumber');
        items = incidentLayer.graphics;
        if (dojo.hasClass("CFSDetailPanePage", "myshowG")) {
            if (items.indexOf(dojo.byId('cfsDetailMonitor').innerHTML) > -1) {
                var filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['incidentNumber'] == dojo.byId('cfsDetailMonitor').innerHTML;
                });
                if (filteredArr.length > 0) {
                    focusOnCall(dojo.byId('cfsDetailMonitor').innerHTML, filteredArr[0].attributes['assignedVehicles']);
                }
            } else {
                toggleAVLCall('CFSPanePage');
                constructEventTable(incidentLayer.graphics, cfsStatusFilter);
            }
        } else {
            constructEventTable(incidentLayer.graphics, cfsStatusFilter);
        }

        if (stacked_District) {
            //require(["dojo/_base/array"], function () {
            p1 = [{ y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }];
            p2 = [{ y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }];
            p3 = [{ y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }];
            p4 = [{ y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }, { y: 0 }];

            filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                return item.attributes['priorityDescription'] == 'P1';
            });
            dojo.forEach(filteredArr, function (itm) {
                var district = itm.attributes['jurisdiction'];
                dojo.forEach(avlIncidents, function (name, i) {
                    if (itm.attributes['jurisdiction'] == 'District ' + name) {
                        p1[i]['y'] += 1;
                    }
                });
            });
            filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                return item.attributes['priorityDescription'] == 'P2';
            });
            dojo.forEach(filteredArr, function (itm) {
                var district = itm.attributes['jurisdiction'];
                dojo.forEach(avlIncidents, function (name, i) {
                    if (itm.attributes['jurisdiction'] == 'District ' + name) {
                        p2[i]['y'] += 1;
                    }
                });
            });
            filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                return item.attributes['priorityDescription'] == 'P3';
            });
            dojo.forEach(filteredArr, function (itm) {
                var district = itm.attributes['jurisdiction'];
                dojo.forEach(avlIncidents, function (name, i) {
                    if (itm.attributes['jurisdiction'] == 'District ' + name) {
                        p3[i]['y'] += 1;
                    }
                });
            });
            filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                return item.attributes['priorityDescription'] !== 'P1' && item.attributes['priorityDescription'] !== 'P2' && item.attributes['priorityDescription'] !== 'P3';
            });
            dojo.forEach(filteredArr, function (itm) {
                var district = itm.attributes['jurisdiction'];
                dojo.forEach(avlIncidents, function (name, i) {
                    if (itm.attributes['jurisdiction'] == 'District ' + name) {
                        p4[i]['y'] += 1;
                    }
                });
            });
            //});
            stacked_District.updateSeries('P1', p1);
            stacked_District.updateSeries('P2', p2);
            stacked_District.updateSeries('P3', p3);
            stacked_District.updateSeries('P4', p4);
            stacked_District.render();
        }


        if (dojo.byId('gauge_P1')) {
            require(["dojo/_base/array"], function () {
                filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['priorityDescription'] == 'P1';
                });
                var d = dijit.byId('gauge_P1');
                dijit.byId('gauge_P1').indicators[1].update(filteredArr.length, true);
                dijit.byId('gauge_P1').indicators[4].update(filteredArr.length, true);
                dojo.byId('lblMinAllCalls_P1').innerHTML = filteredArr.length;
                filteredArr2 = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['assignedVehicles'] && item.attributes['priorityDescription'] == 'P1';
                });
                dijit.byId('gauge_P1').indicators[2].update(filteredArr2.length, true);
                dijit.byId('gauge_P1').indicators[3].update(filteredArr2.length, true);
                dojo.byId('lblMinUnassignedCalls_P1').innerHTML = filteredArr.length - filteredArr2.length;
            });
        }
        if (dojo.byId('gauge_P2')) {
            require(["dojo/_base/array"], function () {
                filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['priorityDescription'] == 'P2';
                });
                dijit.byId('gauge_P2').indicators[1].update(filteredArr.length, true);
                dijit.byId('gauge_P2').indicators[4].update(filteredArr.length, true);
                dojo.byId('lblMinAllCalls_P2').innerHTML = filteredArr.length;
                filteredArr2 = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['assignedVehicles'] && item.attributes['priorityDescription'] == 'P2';
                });
                dijit.byId('gauge_P2').indicators[2].update(filteredArr2.length, true);
                dijit.byId('gauge_P2').indicators[3].update(filteredArr2.length, true);
                dojo.byId('lblMinUnassignedCalls_P2').innerHTML = filteredArr.length - filteredArr2.length;
            });
        }
        if (dojo.byId('gauge_P3')) {
            require(["dojo/_base/array"], function () {
                filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['priorityDescription'] == 'P3';
                });
                dijit.byId('gauge_P3').indicators[1].update(filteredArr.length, true);
                dijit.byId('gauge_P3').indicators[4].update(filteredArr.length, true);
                dojo.byId('lblMinAllCalls_P3').innerHTML = filteredArr.length;
                filteredArr2 = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['assignedVehicles'] && item.attributes['priorityDescription'] == 'P3';
                });
                dijit.byId('gauge_P3').indicators[2].update(filteredArr2.length, true);
                dijit.byId('gauge_P3').indicators[3].update(filteredArr2.length, true);
                dojo.byId('lblMinUnassignedCalls_P3').innerHTML = filteredArr.length - filteredArr2.length;
            });
        }
        if (dojo.byId('gauge_P4')) {
            require(["dojo/_base/array"], function () {
                filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['priorityDescription'] !== 'P1' && item.attributes['priorityDescription'] !== 'P2' && item.attributes['priorityDescription'] !== 'P3';
                });
                dijit.byId('gauge_P4').indicators[1].update(filteredArr.length, true);
                dijit.byId('gauge_P4').indicators[4].update(filteredArr.length, true);
                dojo.byId('lblMinAllCalls_P4').innerHTML = filteredArr.length;
                filteredArr2 = dojo.filter(incidentLayer.graphics, function (item) {
                    return item.attributes['assignedVehicles'] && (item.attributes['priorityDescription'] !== 'P1' && item.attributes['priorityDescription'] !== 'P2' && item.attributes['priorityDescription'] !== 'P3');
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
    if (new Date(a.attributes['responseDate']) < new Date(b.attributes['responseDate']))
        return 1;
    else if (new Date(a.attributes['responseDate']) > new Date(b.attributes['responseDate']))
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
            // require(["dojo/_base/array"], function () {
            filteredArr = dojo.filter(incidentLayer.graphics, function (item) {
                return item.attributes['priorityDescription'] == fltr;
            });
            // });
        } else {
            filteredArr = items;
        }

        attrs = [];
        dojo.forEach(filteredArr, function (itm) {
            stat = 'Call';
            if (itm.attributes['assignedVehicles']) {
                stat = 'Dispatched';
            }
            attrs.push({ inc: itm.attributes['incidentNumber'], assigned: itm.attributes['assignedVehicles'], grp: (!itm.attributes['jurisdiction']) ? 'Floating' : itm.attributes['jurisdiction'], priority: (!itm.attributes['priorityDescription']) ? 'P4' : itm.attributes['priorityDescription'], formatteddate: formatDate(itm.attributes['responseDate']), formattedtime: formatTime(itm.attributes['responseDate']), nature: itm.attributes['problem'], address: itm.attributes['address'], status: stat, geo: itm.geometry });
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

        if (focusedCall) {
            var fil = dojo.filter(sorteditems, function (itm) {
                return itm.inc === focusedCall;
            });
            if (fil.length === 0) {
                focusedCall = null;
                dojo.byId('CFSDetailPanePage').className = 'myhidePane';
                dojo.byId('CFSPanePage').className = 'myshowPane';
                dijit.byId('btnCFSPanePage').set('checked', true, false);
                map.getLayer('glhilite').clear();
            } else {
                focusOnCall(focusedCall, fil[0].assigned);
            }
        }

        var table = dojo.create('table', { style: { 'width': '100%', 'border-collapse': 'collapse' } }, null, 'only');
        if (table) {
            var tBody = dojo.create('tbody', null, table);

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

                trOuter = dojo.create('tr', { style: { cursor: 'pointer' } }, tBody, 'last');
                td = dojo.create('td', null, trOuter, 'last');
                var tableInner = dojo.create('table', { style: { 'width': '100%', 'height': '100%', 'border-collapse': 'collapse' } }, td, 'only');
                if (tableInner) {
                    var tBodyInner = dojo.create('tbody', null, tableInner);
                    tBodyInner.setAttribute('geo', dojo.toJson(itm.geo.toJson()));
                    tBodyInner.setAttribute('loc', addr);
                    tBodyInner.setAttribute('id', title);
                    tBodyInner.setAttribute('assigned', itm.assigned);
                    tBodyInner.onclick = function () {
                        var geo = esri.geometry.fromJson(dojo.fromJson(this.getAttribute('geo')));
                        map.getLayer('glhilite').clear();
                        map.centerAndZoom(geo, 16);
                        var sym = new esri.symbol.SimpleMarkerSymbol();
                        sym.setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_PATH);
                        sym.setPath("M47.249,46.461l-3.108-3.19l-2.368-2.431c3.827-4.117,6.175-9.628,6.175-15.679 c0-6.154-2.429-11.748-6.372-15.886l2.565-2.633l3.108-3.19l1.555-1.595C49.201,1.208,49.627,0.586,50-0.087 c-0.663,0.39-1.273,0.832-1.912,1.246l-1.555,1.595l-3.108,3.19L40.87,8.566c-4.146-3.992-9.775-6.455-15.972-6.455 c-6.166,0-11.77,2.438-15.91,6.396L6.575,6.031l-3.108-3.19L1.913,1.246C1.273,0.832,0.663,0.39,0,0 c0.373,0.673,0.799,1.295,1.196,1.944L2.75,3.539l3.109,3.19L8.28,9.214C4.302,13.358,1.85,18.977,1.85,25.161 c0,6.104,2.389,11.656,6.275,15.784l-2.266,2.325l-3.109,3.19l-1.557,1.593C0.781,48.688,0.369,49.323,0,50 c0.667-0.387,1.292-0.814,1.915-1.243l1.552-1.598l3.108-3.19l2.25-2.31c4.156,4.049,9.826,6.551,16.073,6.551 c6.299,0,12.014-2.542,16.178-6.651l2.349,2.41l3.108,3.19l1.552,1.598C48.708,49.186,49.333,49.613,50,50 c-0.369-0.677-0.78-1.313-1.193-1.946L47.249,46.461z M10.922,39.508l0.316-0.324c0.178-0.291,0.362-0.577,0.545-0.864 c0.614,0.604,1.455,0.979,2.382,0.979h7.193v-2h-7.193c-0.774,0-1.404-0.63-1.404-1.404v-7.412h-2v7.412 c0,0.747,0.249,1.432,0.658,1.994c-0.298,0.199-0.595,0.401-0.897,0.598l-0.291,0.299C6.903,35.203,4.85,30.423,4.85,25.161 c0-5.342,2.113-10.19,5.531-13.788l0.139,0.144c0.352,0.242,0.706,0.481,1.065,0.715c-0.506,0.595-0.824,1.355-0.824,2.195v7.004h2 v-7.004c0-0.774,0.63-1.404,1.404-1.404h7.193v-2h-7.193c-0.862,0-1.642,0.333-2.243,0.864c-0.223-0.362-0.451-0.719-0.681-1.073 l-0.15-0.153c3.599-3.429,8.456-5.549,13.807-5.549c5.382,0,10.265,2.143,13.869,5.606l-0.009,0.009 c-0.267,0.409-0.527,0.824-0.781,1.245c-0.611-0.584-1.436-0.948-2.346-0.948h-7.225v2h7.225c0.774,0,1.404,0.63,1.404,1.404v7.004 h2v-7.004c0-0.828-0.31-1.578-0.803-2.169c0.42-0.268,0.832-0.542,1.239-0.823c3.384,3.591,5.475,8.414,5.475,13.726 c0,5.21-2.015,9.946-5.283,13.515l-0.187-0.19c-0.347-0.225-0.686-0.456-1.028-0.684c0.37-0.545,0.587-1.201,0.587-1.908v-7.412h-2 v7.412c0,0.774-0.63,1.404-1.404,1.404h-7.225v2h7.225c0.992,0,1.878-0.434,2.501-1.113c0.21,0.333,0.423,0.662,0.629,0.999 l0.221,0.226c-3.624,3.582-8.599,5.801-14.084,5.801C19.465,45.21,14.537,43.029,10.922,39.508z");
                        sym.setColor('#E55B00');
                        sym.setSize(70);
                        sym.setOutline(null);
                        map.getLayer('glhilite').add(new esri.Graphic(geo, sym, { 'type': 'CFS', 'unit': '' }));
                        toggleAVLCall('CFSDetailPanePage');
                        focusedCall = this.getAttribute('id');
                        focusOnCall(this.getAttribute('id'), this.getAttribute('assigned'));
                    };

                    trInner = dojo.create('tr', { style: { cursor: 'pointer' } }, tBodyInner, 'last');
                    td = dojo.create('td', { innerHTML: title.substring(12), class: 'cfsCellID' }, trInner, 'last');
                    td = dojo.create('td', { innerHTML: priority, class: 'cfsCellPriority', style: { 'color': clr } }, trInner, 'last');
                    td = dojo.create('td', { innerHTML: prob, class: 'cfsCellProblem' }, trInner, 'last');
                    if (itm.status == 'Call') { td.style.background = '#720701'; }
                    td = dojo.create('td', { innerHTML: itm.formattedtime, class: 'cfsCellTimeStamp' }, trInner, 'last');

                    if (itm.status == 'Call') { td.style.background = '#720701'; }
                    trInner = dojo.create('tr', { style: { cursor: 'pointer' } }, tBodyInner, 'last');
                    td = dojo.create('td', { innerHTML: (prob.indexOf('135') === 0 || prob.indexOf('27') === 0) ? 'W' : '', class: 'cfsCellBlank' }, trInner, 'last');

                    td = dojo.create('td', { innerHTML: addr, class: 'cfsCellBlank' }, trInner, 'last');
                    if (itm.status == 'Call') { td.style.background = '#720701'; }
                    td = dojo.create('td', { innerHTML: itm.status, class: 'cfsCellStatus' }, trInner, 'last');
                    if (itm.status == 'Call') { td.style.background = '#720701'; }
                }
            });
            dijit.byId('cfsPane').set('content', table);
        }
    } catch (err) {
        loge(err.stack);
        //eh(err, 'constructEventTable');
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
    // require(["dojo/_base/array"], function () {
    filteredCFS = dojo.filter(incidentLayer.graphics, function (item) {
        return item.attributes['incidentNumber'] == id;
    });
    RemoveChildren(dojo.byId('cfsDetailPane'));
    var table = dojo.create('table', { style: { 'width': '100%', 'background-color': '#171717' } }, null, 'only');
    tBody = dojo.create('tbody', null, table);
    dojo.forEach(filteredCFS, function (itm) {
        title = itm.attributes['incidentNumber'];
        prob = itm.attributes['problem'];
        addr = '';
        (itm.attributes['address']) ? addr = itm.attributes['address'] : addr = 'NO ADDRESS';
        priority = itm.attributes['priorityDescription'];
        veh = (itm.attributes['assignedVehicles']) ? itm.attributes['assignedVehicles'] : 'NONE';
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
        tr = dojo.create('tr', null, tBody, 'last');
        td = dojo.create('td', {
            innerHTML: '',
            colspan: 2,
            class: 'cfsCellBlank'
        }, tr, 'last');
        td = dojo.create('td', {
            innerHTML: 'Assigned Vehicle(s): ' + veh,
            colspan: 2,
            class: 'cfsCellBlank'
        }, tr, 'last');
        tr = dojo.create('tr', null, tBody, 'last');
        td = dojo.create('td', {
            innerHTML: '',
            colspan: 2,
            class: 'cfsCellBlank'
        }, tr, 'last');
        td = dojo.create('td', {
            innerHTML: 'Received: ' + formatDate(itm.attributes['responseDate']),
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
            return item.attributes['incidentNumberid'] == id || item.attributes['unitName'] == assigned;
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
                id = item.attributes['id'];
                unitName = item.attributes['unitName'];
                avStatus = item.attributes['status'];
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
                    innerHTML: item.attributes['division'],
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
    fillNotes(filteredCFS);
    // });
}

function fillNotes(items) {
    RemoveChildren(dojo.byId('cfsNotesPane'));
    var table = dojo.create('table', { style: { 'width': '100%' } }, null, 'only');
    tBody = dojo.create('tbody', null, table);
    tr = dojo.create('tr', null, tBody, 'last');
    roe = ' cellEven';
    dojo.create('td', {
        innerHTML: '',
        class: 'cfsCellNotes' + roe,
        style: { 'vertical-align': 'top' }
    }, tr, 'last');
    dojo.create('td', {
        innerHTML: 'CAD/Dispatcher notes go here',
        class: 'cfsCellNotes' + roe
    }, tr, 'last');
    dijit.byId('cfsNotesPane').set('content', table);
    return;

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
            //var fill = {
            //    'type': 'linear',
            //    'x1': 50,
            //    'y1': 50,
            //    'x2': 100,
            //    'y2': 100,
            //    'colors': [{ offset: 0, color: 'black' }, { offset: 0.5, color: 'yellow' }, { offset: 0.75, color: 'orange' }, { offset: 1, color: 'red' }]
            //};
            var gauge = new AnalogGauge({
                id: id,
                startAngle: -90,
                endAngle: 90,
                background: 'transparent',
                width: 164,
                height: 155,
                cx: 84,
                cy: 110,
                useTooltip: false,
                radius: 80,
                ranges: [{
                    low: 0,
                    high: 20,
                    color: [0, 0, 0, 0.3]
                }],

                majorTicks: {
                    offset: 54,
                    interval: 4,
                    length: 3,
                    color: 'white',  //#FF0000
                    labelPlacement: 'outside',
                    font: {
                        family: '"Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        style: "normal",
                        variant: 'normal',
                        weight: 'normal',
                        size: "11px"
                    }
                },

                indicators: [new AnalogArcIndicator({
                    value: 20,
                    width: 20,
                    offset: 36,
                    color: [100, 100, 100, 0.5],
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
                    x: 84,
                    y: 108,
                    font: {
                        family: '"Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        style: "normal",
                        variant: 'small-caps',
                        weight: 'bold',
                        size: "34px"
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


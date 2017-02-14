var runOnce = true;
var availableChart = null;

function creatAVL_Renderer() {
    try {
        runOnce = false;
        //createAvailbaleGauge();
        //var defaultSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([51, 51, 51, 0.9]), 2), vehicleStatusColorDefault.color);
        ////create renderer
        //var renderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, vehicleStatusColorField);
        //dojo.forEach(vehicleStatusColor, function (itm) {
        //    dojo.forEach(itm.value, function (val) {
        //        renderer.addValue(val, new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new esri.Color([51, 51, 51, 0.9]), 2), itm.color));
        //    });
        //});
        arrowNorth = "M30.967,29.874h0.029l-13.004-29.1l-13.004,29.1h0.045c-0.291,0.558-0.464,1.245-0.464,1.992c0,1.856,1.06,3.36,2.368,3.36c0.108,0,0.215-0.014,0.319-0.033l0.011,0.033l0.091-0.055c0.367-0.094,0.702-0.307,0.989-0.611l7.604-4.687h3.806l8.73,5.32l0.018-0.063c0.18,0.06,0.365,0.096,0.557,0.096c1.309,0,2.367-1.504,2.367-3.36C31.43,31.119,31.258,30.432,30.967,29.874z";
        creatAVL_RendererClass(arrowNorth, vehicleLayer);
        //vehicleLayer.setRenderer(renderer);
    } catch (err) {
        eh(err, 'creatAVL_Renderer');
    }
}

function creatAVL_RendererClass(path, layer) {
    try {
        require(['esri/renderers/UniqueValueRenderer', 'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol', 'esri/Color'], function (UniqueValueRenderer, SimpleMarkerSymbol, SimpleLineSymbol, Color) {
            var defaultSymbol = new SimpleMarkerSymbol();
            defaultSymbol.setStyle(SimpleMarkerSymbol.STYLE_PATH);
            defaultSymbol.setPath(path);
            defaultSymbol.setColor(vehicleStatusColorDefault.color);
            defaultSymbol.setOutline(null);
            var renderer = new UniqueValueRenderer(defaultSymbol, vehicleStatusColorField);
            dojo.forEach(vehicleStatusColor, function (itm) {
                dojo.forEach(itm.value, function (val) {
                    sym = new SimpleMarkerSymbol();
                    sym.setStyle(SimpleMarkerSymbol.STYLE_PATH);
                    sym.setPath(path);
                    sym.setColor(itm.color);
                    sym.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([50, 50, 50]), 3));
                    renderer.addValue(val, sym);
                });
            });
            renderer.setRotationInfo({
                field: "bcs_direction",
                type: "geographic"  // "arithmetic"
            });
            layer.setRenderer(renderer);
        });
    } catch (err) {
        eh(err, 'creatAVL_Renderer');
    }
}

function getColorLabel(val) {
    try {
        val += '';
        log(val);
        if (val === '' || val === null || val === 'undefined' || val === undefined) {
            return vehicleStatusColorDefault;
        }
        var filteredArr = dojo.filter(vehicleStatusColor, function (item) {
            return item.value.indexOf(val) > -1;
        });
        return (filteredArr.length === 1) ? filteredArr[0] : vehicleStatusColorDefault;
    } catch (err) {
        loge(val);
    }
}

function updateAvailableChart(summary) {
    seriesTotal = [];
    seriesInUse = [];
    xLabels = [];
    i = 1;
    for (var name in summary) {
        if (summary.hasOwnProperty(name)) {
            var item = summary[name];
            seriesTotal.push({ y: item.length });
            filteredArr = dojo.filter(item, function (itm) {
                return itm.attributes['incidentID'];
            });
            seriesInUse.push({ y: filteredArr.length });
            xLabels.push({ value: i, text: name });
            i += 1;
        }
    }
    availableChart.updateSeries("All", seriesTotal);
    availableChart.updateSeries("InUse", seriesInUse);
    availableChart.removeAxis('x');
    availableChart.addAxis("x", { labels: xLabels, includeZero: false, minorTicks: false });
    availableChart.render();
}

function updateAvailableGauges(summary) {
    summary2 = {};
    for (var name in summary) {
        if (summary.hasOwnProperty(name)) {
            var item = summary[name];
            total = item.length;
            filteredArr = dojo.filter(item, function (itm) {
                return itm.inc;   //itm.attributes['bcs_incidentid'];
            });
            inUse = filteredArr.length;
            pct = parseInt((inUse / total) * 100);
            if (dijit.byId(name + '_Indicator')) {
                dijit.byId(name + '_Indicator').update(pct);
                dojo.byId(name + '_AVLFree').innerHTML = (total - inUse) + ' of ' + total + ' free';
            }
        }
    }

}

function updateAvailableChart(summary) {
    var summaries = [];
    for (var name in summary) {
        if (summary.hasOwnProperty(name)) {
            var item = summary[name];
            total = item.length;
            filteredArr = dojo.filter(item, function (itm) {
                return itm.inc;
            });
            inUse = filteredArr.length;
            pct = parseInt((inUse / total) * 100);
            summaries.push({ y: pct, text: name, tooltip: (total - inUse) + ' of ' + total + ' free' });
        }
    }

    if (availableChart) {
        sorteditems = sortByKey(summaries, 'text', 'D');
        //var myAxis = availableChart.getAxis("y");
        //dojo.forEach(myAxis.opt.labels, function (l, i) {
        //    l.text = sorteditems[i].text + '(' + sorteditems[i].tooltip + ')';
        //});
        availableChart.updateSeries("InUse", sorteditems);
        availableChart.render();
    }
}

function createAvailbaleGauge() {
    require(["dojox/gauges/BarGauge", "dojox/gauges/BarIndicator", "dojox/gauges/BarLineIndicator", "dojo/fx/easing"], function (BarGauge, BarIndicator, BarLineIndicator, easing) {
        try {

            var fill = {
                type: "linear",
                x1: 0,
                x2: 375,
                y2: 0,
                y1: 20,
                colors: [{ offset: 0, color: "#007F0E" }, { offset: 0.5, color: "#FFD400" }, { offset: 1, color: "#E20000" }]
            };


            var table = dojo.create('table', { style: { 'width': '100%; border-collapse: collapse;' } }, null, 'only');
            tBody = dojo.create('tbody', null, table);
            dojo.forEach(avlDistricts, function (name) {
                var gauge = null;
                //    var ranges = [{ low: 0, high: 10, hover: '0 - 10', color: { type: 'linear', colors: [{ offset: 0, color: '#1EFF1E' }, { offset: 1, color: '#1EB41E' }] } },
                //{ low: 10, high: 20, hover: '10 - 20', color: { type: 'linear', colors: [{ offset: 0, color: '#1EB41E' }, { offset: 1, color: '#1E691E' }] } },
                //{ low: 20, high: 30, hover: '20 - 30', color: { type: 'linear', colors: [{ offset: 0, color: '#1E691E' }, { offset: 1, color: '#1E461E' }] } },
                //{ low: 30, high: 40, hover: '30 - 40', color: { type: 'linear', colors: [{ offset: 0, color: '#1E461E' }, { offset: 1, color: '#1E1E1E' }] } },
                //{ low: 40, high: 50, hover: '40 - 50', color: { type: 'linear', colors: [{ offset: 0, color: '#1E1E1E' }, { offset: 1, color: '#1E1E1E' }] } },
                //{ low: 50, high: 60, hover: '50 - 60', color: { type: 'linear', colors: [{ offset: 0, color: '#1E1E1E' }, { offset: 1, color: '#1E1E1E' }] } },
                //{ low: 60, high: 70, hover: '60 - 70', color: { type: 'linear', colors: [{ offset: 0, color: '#1E1E1E' }, { offset: 1, color: '#461E1E' }] } },
                //{ low: 70, high: 80, hover: '70 - 80', color: { type: 'linear', colors: [{ offset: 0, color: '#461E1E' }, { offset: 1, color: '#691E1E' }] } },
                //{ low: 80, high: 90, hover: '80 - 90', color: { type: 'linear', colors: [{ offset: 0, color: '#691E1E' }, { offset: 1, color: '#B41E1E' }] } },
                //{ low: 90, high: 100, hover: '90 - 100', color: { type: 'linear', colors: [{ offset: 0, color: '#B41E1E' }, { offset: 1, color: '#FF1E1E' }] } }];
                var ranges = [{ low: 0, high: 10, hover: '0 - 10', color: { type: 'linear', colors: [{ offset: 0, color: '#1E1E1E' }, { offset: 1, color: '#1E1E1E' }] } },
                            { low: 10, high: 20, hover: '10 - 20', color: { type: 'linear', colors: [{ offset: 0, color: '#1E1E1E' }, { offset: 1, color: '#1E1E1E' }] } },
                            { low: 20, high: 30, hover: '20 - 30', color: { type: 'linear', colors: [{ offset: 0, color: '#1E1E1E' }, { offset: 1, color: '#1E1E1E' }] } },
                            { low: 30, high: 40, hover: '30 - 40', color: { type: 'linear', colors: [{ offset: 0, color: '#1E1E1E' }, { offset: 1, color: '#1E1E1E' }] } },
                            { low: 40, high: 50, hover: '40 - 50', color: { type: 'linear', colors: [{ offset: 0, color: '#1E1E1E' }, { offset: 1, color: '#1E1E1E' }] } },
                            { low: 50, high: 60, hover: '50 - 60', color: { type: 'linear', colors: [{ offset: 0, color: '#1E1E1E' }, { offset: 1, color: '#1E1E1E' }] } },
                            { low: 60, high: 70, hover: '60 - 70', color: { type: 'linear', colors: [{ offset: 0, color: '#1E1E1E' }, { offset: 1, color: '#1E1E1E' }] } },
                            { low: 70, high: 80, hover: '70 - 80', color: { type: 'linear', colors: [{ offset: 0, color: '#1E1E1E' }, { offset: 1, color: '#1E1E1E' }] } },
                            { low: 80, high: 90, hover: '80 - 90', color: { type: 'linear', colors: [{ offset: 0, color: '#1E1E1E' }, { offset: 1, color: '#1E1E1E' }] } },
                            { low: 90, high: 100, hover: '90 - 100', color: { type: 'linear', colors: [{ offset: 0, color: '#1E1E1E' }, { offset: 1, color: '#1E1E1E' }] } }];
                tr = dojo.create('tr', null, tBody, 'last');
                dojo.create('td', { innerHTML: name, class: 'avlDistrict' }, tr, 'last');
                td = dojo.create('td', null, tr, 'last');
                div = dojo.create('div', { style: 'width:100&' }, td);
                gauge = new BarGauge({
                    id: name + "_Gauge",
                    width: 375,
                    height: 55,
                    dataHeight: 25,
                    dataWidth: 350,
                    dataX: 10,
                    dataY: 25,
                    useRangeStyles: 0,
                    background: 'transparent',
                    hideValues: true,
                    useTooltip: false
                }, div);
                gauge.startup();
                gauge.addRanges(ranges);
                gauge.setMajorTicks({
                    interval: 10,
                    length: 5,
                    offset: -5,
                    width: 1,
                    color: 'white',
                    font: { family: "Arial", style: "italic", variant: 'small-caps', weight: 'bold', size: "12px" }
                });
                valueIndicator = new BarIndicator({
                    id: name + '_Indicator',
                    value: 17,
                    width: 20,
                    length: 135,
                    hover: '',
                    title: 'Value',
                    hideValue: true,
                    easing: false,
                    duration: 0,
                    //strokeColor: '#1E1E1E',
                    stroke: { color: '#1E1E1E' },
                    color: fill    //color: [0, 19, 127]
                });
                gauge.addIndicator(valueIndicator);
                dojo.create('td', { id: name + '_AVLFree', innerHTML: '0', class: 'avlDistrictFree' }, tr, 'last');
            });
            dijit.byId('divVehicleAvail').set('content', table);
        } catch (err) {
            eh(err, 'createAvailbaleGauge');
        }
    });
}

function createAvailableChart() {
    require(["dojox/charting/Chart", "dojox/charting/axis2d/Default", "dojox/charting/plot2d/Bars", "dojox/charting/action2d/Highlight", "dojox/charting/action2d/Tooltip", "dojox/charting/themes/Chris", "dojo/fx/easing"],
	function (Chart, Default, Bars, Highlight, Tooltip, Chris, easing) {
	    try {
	        availableChart = new Chart("divVehicleAvail");
	        availableChart.setTheme(Chris);

	        fill = {
	            type: "linear", space: "plot", x1: 0, y1: 100, x2: 100, y2: 0,
	            colors: [{ offset: 0, color: "green" }, { offset: 0.5, color: "#FFD400" }, { offset: 1, color: "red" }]
	        };
	        availableChart.addPlot("default", { type: Bars, hAxis: "x", vAxis: "y", gap: 4, minBarSize: 18, labelOffset: 20, precision: 0, labels: false, labelStyle: "outside", font: "normal normal bold 8pt Arial", fontColor: "white" }); //, animate: { duration: 1000, easing: easing.linear }, labels: true, labelStyle: "inside", fontColor: "white", font: "normal normal bold 9pt Tahoma"
	        availableChart.addSeries("InUse", [{ y: 40, text: "6 of 10", tooltip: "40%" }, { y: 30, text: "6 of 10", tooltip: "40%" }, { y: 20, text: "6 of 10", tooltip: "40%" }, { y: 99, text: "6 of 10", tooltip: "40%" }, { y: 99, text: "6 of 10", tooltip: "40%" }], { stroke: { width: 0, color: 'transparent' }, plot: 'default', fill: fill });
	        availableChart.addPlot("Grid", { type: "Grid", hAxis: "x", vAxis: "y", hMajorLines: false, hMinorLines: false, vMajorLines: true, vMinorLines: true });
	        availableChart.addAxis("x", {
	            labels: [{ value: 0, text: '0' }, { value: 20, text: '20' }, { value: 40, text: '40' }, { value: 60, text: '60' }, { value: 80, text: '80' }, { value: 100, text: '100' }],
	            includeZero: true,
	            majorTickStep: 20,
	            minorTicks: false,
	            minorLabels: true,
	            min: 0,
	            max: 100
	        });
	        availableChart.addAxis("y", {
	            rotation: 0,
	            labels: [{ value: 1, text: '1' }, { value: 2, text: '2' }, { value: 3, text: '3' }, { value: 4, text: '4' }, { value: 5, text: '5' }],
	            vertical: true,
	            includeZero: false,
	            majorLabels: true,
	            minorLabels: true,
	            font: "normal normal bold 14px Arial",
	            fontColor: "white"
	        });
	        //availableChart.addAxis("y2", {
	        //    rotation: 0,
	        //    labels: [{ value: 1, text: 'T' }, { value: 2, text: 'C' }, { value: 3, text: 'C' }, { value: 4, text: 'C' }],
	        //    vertical: true,
	        //    leftBottom: false,
	        //    includeZero: false,
	        //    majorLabels: true,
	        //    minorLabels: true,
	        //    font: "normal normal normal 9pt Arial",
	        //    fontColor: "white"
	        //});
	        availableChart.theme.chart.fill = 'transparent';
	        availableChart.theme.chart.stroke = 'transparent';
	        availableChart.theme.plotarea.fill = 'transparent';
	        availableChart.theme.plotarea.stroke = 'transparent';
	        availableChart.theme.axis.stroke.color = 'transparent';
	        availableChart.theme.axis.tick.fontColor = '#FFFFFF';
	        availableChart.theme.axis.tick.color = 'transparent';
	        new Tooltip(availableChart, 'default', {
	            text: function (o) {
	                return o.run.data[o.index].tooltip;
	            }
	        });
	        //new Highlight(availableChart, 'All', {
	        //    duration: 1000,
	        //    easing: easing.sineOut,
	        //    highlight: 'black' // g({ type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 100 }, ColorLuminance('#FF9900', -0.5), '#FF9900')
	        //});
	        //new Highlight(availableChart, 'InUse', {
	        //    duration: 1000,
	        //    easing: easing.sineOut,
	        //    highlight: 'black' // g({ type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 100 }, ColorLuminance('#FF9900', -0.5), '#FF9900')
	        //});
	        availableChart.render();
	    } catch (err) {
	        eh(err, 'createAvailableChart');
	    }
	});
}

function generateFeedRecords() {
    try {
        require(["esri/geometry/geometryEngine", "esri/geometry/webMercatorUtils"], function (geometryEngine, webMercatorUtils) {
            // if (runOnce) { creatAVL_Renderer(); }
            if (!availableChart) { createAvailableChart(); }
            //if (!responseChart) { createResponseChart(); }
            if (map.getLayer('glhilite').graphics.length) {
                fa = dojo.filter(map.getLayer('glhilite').graphics, function (f) {
                    return f.attributes['type'] === 'AVL';
                });
                if (fa.length) {
                    unit = fa[0].attributes['unit'];
                    u = dojo.filter(vehicleLayer.graphics, function (f) {
                        return f.attributes['unitName'] === unit;
                    });
                    var geom = webMercatorUtils.geographicToWebMercator(u[0].geometry);
                    dojo.forEach(map.getLayer('glhilite').graphics, function (f) {
                        if (f.attributes['type'] === 'AVL') {
                            f.setGeometry(geom);
                        }
                    });
                    if (geometryEngine.intersects(geom, map.extent)) {
                        map.centerAt(geom);
                    }
                }
            }
        });
        require(['dojo/promise/all'], function (all, Json) {
            dary = [compare(vehicleLayer.graphics)];
            promises = all(dary);
            promises.then(function (returns) {
                constructUnitTable(returns[0]);
            });
        });
    } catch (err) {
        eh(err, 'generateFeedRecords');
    }
}

function compare(items) {
    return items.sort(function (a, b) {
        return parseFloat(a.attributes.id) - parseFloat(b.attributes.id);
    });
}

function decColor2hex(color) {
    // input:   (Number) decimal color (i.e. 16711680)
    // returns: (String) hex color (i.e. 0xFF0000)
    colArr = color.toString(16).toUpperCase().split('');
    numChars = colArr.length;
    for (a = 0; a < (6 - numChars) ; a++) { colArr.unshift("0"); }
    //return('0x' + colArr.join(''));
    return ('#' + colArr.join(''));
}

function constructUnitTable(items) {
    try {
        if (!items.length) { return; }
        var summary = {};
        var itemCounter = 0;
        attrs = [];
        dojo.forEach(items, function (itm) {
            attrs.push({ id: itm.attributes['id'], unitName: itm.attributes['unitName'], grp: itm.attributes['division'] + '', inc: itm.attributes['incidentID'] + '', avStatus: '', status: itm.attributes[vehicleStatusColorField] + '', geo: itm.geometry });
        });
        key = 'unitName';
        sortVal = dijit.byId('selectAVLSort').get('value');
        sortValAry = sortVal.split(':')
        switch (sortValAry[0]) {
            case 'Unit':
                key = 'unitName';
                sorteditems = sortByKey(attrs, key, sortValAry[1]);
                break;
            case 'Availability':
                key = 'status';
                key2 = 'unitName';
                sorteditems = sortByKeys(attrs, key, key2, sortValAry[1], 'A');
                break;
            case 'District':
                key = 'grp';
                key2 = 'unitName';
                sorteditems = sortByKeys(attrs, key, key2, sortValAry[1], 'A');
                break;
        }
        //sorteditems = sortByKey(attrs, key, sortValAry[1]);

        fa = dojo.filter(map.getLayer('glhilite').graphics, function (f) {
            return f.attributes['type'] === 'AVL';
        });
        unitSelected = (fa.length) ? fa[0].attributes['unit'] : 'unitNotSelected';

        RemoveChildren(dojo.byId('avlPane'));
        var table = dojo.create('table', { style: { 'width': '100%', 'border-spacing': '1px' } }, null, 'only');
        if (table) {
            var tBody = dojo.create('tbody', null, table);
            grpHeader = '';
            dojo.forEach(sorteditems, function (itm) {
                id = itm.id;
                grp = itm.grp;
                summary[grp] = summary[grp] || [];
                summary[grp].push(itm);
                unitName = itm.unitName;
                inc = itm.inc;
                if (inc == '0') {
                    inc = '';
                }
                avStatus = itm.avStatus;
                var a = getColorLabel(itm.status);
                if (grpHeader != grp && sortValAry[0] == 'District') {
                    grpHeader = grp;
                    trOuter = dojo.create('tr', null, tBody, 'last');
                    td = dojo.create('td', {
                        innerHTML: grpHeader, colspan: 5,
                        class: 'avlDistrictHeader'
                    }, trOuter, 'last');
                    itemCounter = 0;
                }
                if (grpHeader != a.text && sortValAry[0] == 'Availability') {
                    grpHeader = a.text;
                    trOuter = dojo.create('tr', null, tBody, 'last');
                    td = dojo.create('td', {
                        innerHTML: grpHeader, colspan: 5,
                        class: 'avlDistrictHeader'
                    }, trOuter, 'last');
                    itemCounter = 0;
                }
                if (itemCounter === 0 || itemCounter === 4) {
                    trOuter = dojo.create('tr', {
                        style: {
                            cursor: 'pointer'
                        }
                    }, tBody, 'last');
                    itemCounter = 0;
                }
                td = dojo.create('td', {
                    innerHTML: id,
                    class: '',
                    style: {
                        'background-color': a.color, 'width': '25%', 'height': '36px', 'border': '0.1em solid black'
                    }
                }, trOuter, 'last');

                tableInner = dojo.create('table', {
                    class: '',
                    style: {
                        'background-color': a.color,
                        'width': '100%', 'height': '100%',
                        'border': (unitSelected === unitName) ? '2px solid cyan' : 'none'
                    }
                }, td, 'only');
                tableInner.setAttribute('geo', dojo.toJson(itm.geo.toJson()));
                tableInner.setAttribute('status', itm.status);
                tableInner.setAttribute('incident', inc);
                tableInner.setAttribute('unit', unitName);
                tableInner.onclick = function () {
                    map.getLayer('glhilite').clear();
                    if (this.style.border === 'none') {
                        this.style.border = '2px solid cyan';
                        var geo = esri.geometry.fromJson(dojo.fromJson(this.getAttribute('geo')));
                        map.centerAndZoom(geo, 16);
                        var sym = new esri.symbol.SimpleMarkerSymbol();
                        sym.setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_PATH);
                        sym.setPath("M48.2,24.545h-1.8H42.8h-0.368V7.595H25.469V7.204v-3.6v-1.8c-0.152-0.6-0.299-1.2-0.5-1.8 c-0.201,0.6-0.348,1.2-0.5,1.8v1.8v3.6v0.391H7.489v16.95H7.191H3.591l-1.8-0.005c-0.6,0.149-1.2,0.296-1.8,0.505 c0.6,0.208,1.2,0.356,1.8,0.505l1.8-0.005h3.601h0.297v16.95h16.971v0.39v3.601l-0.005,1.801c0.149,0.6,0.296,1.2,0.505,1.8 c0.208-0.6,0.356-1.2,0.505-1.8l-0.005-1.801v-3.601v-0.39h16.972v-16.95H42.8H46.4h1.8c0.6-0.152,1.2-0.299,1.8-0.5 C49.4,24.844,48.8,24.697,48.2,24.545z M39.432,39.495H25.459v-0.21v-1.801c-0.075-0.297-0.149-0.594-0.229-0.891 c1.617-0.043,3.191-0.41,4.681-1.12l-0.861-1.805c-2.594,1.236-5.566,1.252-8.167,0.041l-0.843,1.814 c1.479,0.687,3.042,1.041,4.648,1.074c-0.08,0.295-0.153,0.591-0.228,0.886v1.801v0.21H10.489v-13.95h0.303h1.8 c0.249-0.063,0.498-0.127,0.747-0.192c0.048,1.606,0.414,3.168,1.119,4.643l1.805-0.861c-0.625-1.31-0.942-2.697-0.942-4.125 c0-1.428,0.317-2.816,0.942-4.126l-1.805-0.861c-0.715,1.498-1.084,3.083-1.123,4.715c-0.248-0.065-0.496-0.129-0.743-0.191h-1.8 h-0.303v-13.95h13.98v0.209l-0.005,1.8c0.068,0.273,0.137,0.547,0.209,0.82c-1.583,0.034-3.161,0.381-4.636,1.067l0.844,1.813 c2.599-1.21,5.575-1.195,8.168,0.041l0.861-1.805c-1.477-0.705-3.059-1.068-4.647-1.115c0.074-0.274,0.143-0.548,0.21-0.822 l-0.005-1.8v-0.209h13.962v13.95h-0.232l-1.8-0.005c-0.295,0.073-0.591,0.146-0.886,0.227c-0.034-1.603-0.388-3.165-1.074-4.642 l-1.814,0.843c0.599,1.287,0.901,2.646,0.901,4.041s-0.304,2.754-0.902,4.042l1.813,0.844c0.679-1.456,1.03-2.993,1.073-4.571 c0.296,0.081,0.593,0.154,0.89,0.228l1.8-0.005h0.232V39.495z");
                        sym.setColor('#00B5B5');
                        sym.setSize(80);
                        sym.setOutline(null);
                        map.getLayer('glhilite').add(new esri.Graphic(geo, sym, { 'type': 'AVL', 'unit': this.getAttribute('unit') }));
                    } else {
                        this.style.border = 'none';
                    }
                };
                tBodyInner = dojo.create('tbody', null, tableInner);
                tr = dojo.create('tr', { style: { 'cursor': 'pointer', 'line-height': '12px' } }, tBodyInner, 'last');
                td = dojo.create('td', {
                    innerHTML: id,
                    rowspan: 3,
                    class: 'avlCellID'
                }, tr, 'last');
                tr = dojo.create('tr', { style: { cursor: 'pointer', 'line-height': '12px' } }, tBodyInner, 'last');
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
                tr = dojo.create('tr', { style: { cursor: 'pointer', 'line-height': '12px' } }, tBodyInner, 'last');
                td = dojo.create('td', {
                    innerHTML: a.text,
                    colspan: 2,
                    class: 'avlCellStatus',
                    style: {
                        'color': a.fontcolor
                    }
                }, tr, 'last');
                tr = dojo.create('tr', { style: { cursor: 'pointer', 'line-height': '12px' } }, tBodyInner, 'last');
                td = dojo.create('td', {
                    innerHTML: inc,
                    colspan: 2,
                    class: 'avlCellIncident',
                    style: {
                        'color': a.fontcolor
                    }
                }, tr, 'last');
                //td = dojo.create('td', {
                //    innerHTML: avStatus,
                //    colspan: 2,
                //    class: 'avlCellAVStatus',
                //    style: {
                //        'color': a.fontcolor
                //    }
                //}, tr, 'last');
                itemCounter += 1;
            });
            dijit.byId('avlPane').set('content', table);
            updateAvailableGauges(summary);
            updateAvailableChart(summary);
        }
    } catch (err) {
        loge(err.stack);

        //eh(err, 'constructUnitTable');
    }
}


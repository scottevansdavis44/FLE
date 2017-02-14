var responseChart = null;

function response_update_end() {
    var priority = dijit.byId('selectPriority').get('value');
    var query = new esri.tasks.Query();
    query.returnGeometry = false;
    query.outFields = ['*'];
    query.orderByFields = ['AGENCY ASC'];
    query.where = "PRIORITY='" + priority + "'";
    tabResponse.queryFeatures(query, function (featureSet) {
        if (featureSet.features.length === 0) {
            return;
        } else {
            buildResponse(featureSet.features);
        }
    });
}

function buildResponse(features) {
    RemoveChildren(dojo.byId('divResponse'));
    var table = dojo.create('table', { style: { 'width': '100%', 'border-spacing': '2px' } }, null, 'only');
    if (table) {
        var tBody = dojo.create('tbody', null, table);
        tr = dojo.create('tr', { class: 'responseHeader' }, tBody, 'last');
        dojo.create('td', { innerHTML: 'Agency', class: 'responseHeaderTD0' }, tr, 'last');
        dojo.create('td', { innerHTML: 'Year Avg (min)', class: 'responseHeaderTD' }, tr, 'last');
        dojo.create('td', { innerHTML: 'Month Avg (min)', class: 'responseHeaderTD' }, tr, 'last');
        dojo.create('td', { innerHTML: 'Day Avg (min)', class: 'responseHeaderTD' }, tr, 'last');
        dojo.forEach(features, function (f) {
            tr = dojo.create('tr', { class: 'responseHeaderRow' }, tBody, 'last');
            dojo.create('td', { innerHTML: f.attributes['AGENCY'], class: 'responseHeaderRow0' }, tr, 'last');
            //YEAR
            bclr = (f.attributes['YEAR_TREND'] === 'DOWN') ? '#006309' : '#A50000';
            celltop = (f.attributes['YEAR_TREND'] === 'DOWN') ? 'responseCellTop_DOWN' : 'responseCellTop_UP';
            cellbottom = (f.attributes['YEAR_TREND'] === 'DOWN') ? 'responseCellBottom_DOWN' : 'responseCellBottom_UP';
            td = dojo.create('td', null, tr, 'last');
            tab = dojo.create('table', { style: { 'width': '100%', 'height': '100%', 'border-collapse': 'collapse' } }, td, 'only');
            bod = dojo.create('tbody', null, tab);
            r = dojo.create('tr', { style: { 'line-height': '10px' } }, bod, 'last');
            dojo.create('td', { class: celltop }, r, 'last');
            r = dojo.create('tr', null, bod, 'last');
            dojo.create('td', { innerHTML: f.attributes['YEAR_AVG'], class: 'responseCells', style: { 'background-color': bclr } }, r, 'last');
            r = dojo.create('tr', { style: { 'line-height': '10px' } }, bod, 'last');
            dojo.create('td', { class: cellbottom }, r, 'last');
            //MONTH
            bclr = (f.attributes['MONTH_TREND'] === 'DOWN') ? '#006309' : '#A50000';
            celltop = (f.attributes['MONTH_TREND'] === 'DOWN') ? 'responseCellTop_DOWN' : 'responseCellTop_UP';
            cellbottom = (f.attributes['MONTH_TREND'] === 'DOWN') ? 'responseCellBottom_DOWN' : 'responseCellBottom_UP';
            td = dojo.create('td', null, tr, 'last');
            tab = dojo.create('table', { style: { 'width': '100%', 'height': '100%', 'border-collapse': 'collapse' } }, td, 'only');
            bod = dojo.create('tbody', null, tab);
            r = dojo.create('tr', { style: { 'line-height': '10px' } }, bod, 'last');
            dojo.create('td', { class: celltop }, r, 'last');
            r = dojo.create('tr', null, bod, 'last');
            bclr = (f.attributes['MONTH_TREND'] == 'DOWN') ? '#006309' : '#A50000';
            dojo.create('td', { innerHTML: f.attributes['MONTH_AVG'], class: 'responseCells', style: { 'background-color': bclr } }, r, 'last');
            r = dojo.create('tr', { style: { 'line-height': '10px' } }, bod, 'last');
            dojo.create('td', { class: cellbottom }, r, 'last');
            //DAY
            bclr = (f.attributes['DAY_TREND'] === 'DOWN') ? '#006309' : '#A50000';
            celltop = (f.attributes['DAY_TREND'] === 'DOWN') ? 'responseCellTop_DOWN' : 'responseCellTop_UP';
            cellbottom = (f.attributes['DAY_TREND'] === 'DOWN') ? 'responseCellBottom_DOWN' : 'responseCellBottom_UP';
            td = dojo.create('td', null, tr, 'last');
            tab = dojo.create('table', { style: { 'width': '100%', 'height': '100%', 'border-collapse': 'collapse' } }, td, 'only');
            bod = dojo.create('tbody', null, tab);
            r = dojo.create('tr', { style: { 'line-height': '10px' } }, bod, 'last');
            dojo.create('td', { class: celltop }, r, 'last');
            r = dojo.create('tr', null, bod, 'last');
            bclr = (f.attributes['DAY_TREND'] == 'DOWN') ? '#006309' : '#A50000';
            dojo.create('td', { innerHTML: f.attributes['DAY_AVG'], class: 'responseCells', style: { 'background-color': bclr } }, r, 'last');
            r = dojo.create('tr', { style: { 'line-height': '10px' } }, bod, 'last');
            dojo.create('td', { class: cellbottom }, r, 'last');

            //td = dojo.create('td', { innerHTML: f.attributes['YEAR_AVG'], class: 'responseCells', style: { 'background-image': 'url(img/' + f.attributes['YEAR_TREND'] + '.png)' } }, tr, 'last');
            //td = dojo.create('td', { innerHTML: f.attributes['MONTH_AVG'], class: 'responseCells', style: { 'background-image': 'url(img/' + f.attributes['MONTH_TREND'] + '.png)' } }, tr, 'last');
            //td = dojo.create('td', { innerHTML: f.attributes['DAY_AVG'], class: 'responseCells', style: { 'background-image': 'url(img/' + f.attributes['DAY_TREND'] + '.png)' } }, tr, 'last');
        });
        dijit.byId('divResponse').set('content', table);
    }
}


//function response_update_end() {
//    var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
//    var yesterdayString = dojo.date.locale.format(yesterday, {
//        selector: 'date',
//        datePattern: 'yyyy-MM-dd HH:mm:ss'
//    });

//    var currentHour = yesterday.getHours();
//    var priority = dijit.byId('selectPriority').get('value');
//    var query = new esri.tasks.Query();
//    query.returnGeometry = false;
//    query.outFields = ['*'];
//    query.orderByFields = ['bcs_stamp ASC', 'bcs_hour ASC'];
//    query.where = "bcs_eo_min > 0 AND bcs_priority <> ''";
//    tabResponse.queryFeatures(query, function (featureSet) {
//        if (featureSet.features.length === 0) {
//            return;
//        } else {
//            buildResponse(featureSet.features, currentHour);
//        }
//    });
//}

//function buildResponse(features, currentHour) {
//    var priority = dijit.byId('selectPriority').get('value');
//    var p = new Array(4);
//    for (var i = 0; i < 4; i++) {
//        p[i] = new Array(24);
//        for (var j = 0; j < 24; j++) {
//            p[i][j] = { count: 0, sum: 0 };
//        }
//    }
//    dojo.forEach(features, function (feature) {
//        h = parseInt(feature.attributes['bcs_hour']);
//        pc = parseInt(feature.attributes['bcs_priority']) - 1;
//        if (pc > 2) { pc = 3; }
//        p[pc][h] = { count: p[pc][h].count + 1, sum: p[pc][h].sum + parseInt(feature.attributes['bcs_eo_min']) };
//    });
//    var post = [];
//    var calls = [];
//    var currentHour2 = currentHour;
//    for (var i = 0; i < 4; i++) {
//        for (var j = 0; j < 24; j++) {
//            if (currentHour2 + j == 24) { currentHour2 = -j; }
//            post.push({ y: (p[i][j].count > 0) ? p[i][j].sum / p[i][j].count : 0, x: currentHour2 + j });
//            calls.push({ y: p[i][j].count, x: currentHour2 + j });
//        }
//        //if (priority == "P" + (i + 1)) { responseChart.updateSeries("P" + (i + 1), post) };
//        if (priority == "P" + (i + 1)) {
//            labels = [];
//            for (var j = 0; j < 24; j++) {
//                if (currentHour + j == 24) { currentHour = -j; }
//                labels.push({ value: j, text: currentHour + j + '' });
//            }
//            var myAxis = responseChart.getAxis("x");
//            myAxis.opt.labels = labels;
//            var myAxis2 = responseChart.getAxis("x2");
//            myAxis2.opt.labels = labels;
//            //dojo.forEach(myAxis.opt.labels, function (l, i) {
//            //    l.text = sorteditems[i].text + '(' + sorteditems[i].tooltip + ')';
//            //});
//            responseChart.updateSeries("Calls", sortByKey(calls, 'x', 'A'));
//            responseChart.updateSeries("Priority", sortByKey(post, 'x', 'A'));
//        };
//        post = [];
//        calls = [];
//    }
//    responseChart.render();
//}

function createResponseChart() {
    require(["dojox/charting/Chart", "dojox/charting/axis2d/Default", "dojox/charting/plot2d/Columns", "dojox/charting/plot2d/Lines", "dojox/charting/action2d/Highlight", "dojox/charting/action2d/Tooltip", "dojox/charting/themes/Claro", "dojo/fx/easing"],
        function (Chart, Default, Columns, Lines, Highlight, Tooltip, Claro, easing) {
            try {
                var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
                var currentHour = yesterday.getHours();
                var labels = [];
                for (var j = 0; j < 24; j++) {
                    if (currentHour + j == 24) { currentHour = -j; }
                    labels.push({ value: j, text: currentHour + j });
                }


                responseChart = new Chart("divResponse");
                responseChart.setTheme(Claro);
                responseChart.addPlot("A", { type: "Lines", hAxis: "x", vAxis: "y", markers: false, tension: 'S' });
                responseChart.addSeries("Priority", [{ y: 9 }, { y: 9 }], { plot: 'A', stroke: { width: 1.5, color: 'red' }, fill: 'transparent' });
                responseChart.addPlot("C", { type: "Columns", hAxis: "x2", vAxis: "y2", gap: 0 });
                responseChart.addSeries("Calls", [{ y: 9 }, { y: 9 }], { plot: 'C', stroke: { width: 0, color: 'transparent' }, fill: '#0094FF' });


                //responseChart.addSeries("P2", [{ y: 9 }, { y: 8 }], { plot: 'A', stroke: { width: 1, color: p2_color }, fill: 'transparent' });
                //responseChart.addSeries("P3", [{ y: 5 }, { y: 2 }], { plot: 'A', stroke: { width: 1, color: p3_color }, fill: 'transparent' });
                //responseChart.addSeries("P4", [{ y: 1 }, { y: 5 }], { plot: 'A', stroke: { width: 1, color: p4_color }, fill: 'transparent' });
                //availableChart.addPlot("Grid", { type: "Grid", hAxis: "x", vAxis: "y", hMajorLines: false, hMinorLines: false, vMajorLines: true, vMinorLines: true });
                //availableChart.addPlot("default", { type: Bars, hAxis: "x", vAxis: "y", gap: 1, minBarSize: 18, maxBarSize: 18, labelOffset: 20, precision: 0, labels: false, labelStyle: "outside", font: "normal normal bold 8pt Arial", fontColor: "white" }); //, animate: { duration: 1000, easing: easing.linear }, labels: true, labelStyle: "inside", fontColor: "white", font: "normal normal bold 9pt Tahoma"
                //availableChart.addSeries("InUse", [{ y: 40, text: "6 of 10", tooltip: "40%" }, { y: 30, text: "6 of 10", tooltip: "40%" }, { y: 20, text: "6 of 10", tooltip: "40%" }, { y: 99, text: "6 of 10", tooltip: "40%" }], { stroke: { width: 0, color: 'transparent' }, plot: 'default', fill: fill });
                responseChart.addAxis("x", {
                    labels: labels,
                    includeZero: true,
                    majorTickStep: 1,
                    minorTicks: false,
                    minorLabels: true,
                    natural: true,
                    fixLower: "major",
                    fixUpper: "major",
                    min: 0,
                    max: 23
                });
                responseChart.addAxis("y", {
                    title: "Avg Time (min)",
                    titleGap: 10,
                    titleFontColor: "orange",
                    titleOrientation: 'axis',
                    rotation: 0,
                    min: 0,
                    vertical: true,
                    includeZero: true,
                    majorLabels: true,
                    minorLabels: false,
                    natural: true,
                    fixLower: "major",
                    fixUpper: "major",
                    majorTickStep: 2,
                    font: "normal normal normal 9pt Arial",
                    fontColor: "red"
                });
                responseChart.addAxis("x2", {
                    labels: labels,
                    includeZero: true,
                    majorTickStep: 1,
                    minorTicks: false,
                    minorLabels: false,
                    leftBottom: false,
                    natural: true,
                    fixLower: "major",
                    fixUpper: "major",
                    min: 0,
                    max: 23
                });
                responseChart.addAxis("y2", {
                    title: "Priority Call Count",
                    titleGap: 10,
                    titleFontColor: "orange",
                    titleOrientation: 'axis',
                    rotation: 0,
                    min: 0,
                    leftBottom: false,
                    vertical: true,
                    includeZero: true,
                    majorLabels: true,
                    minorLabels: false,
                    natural: true,
                    fixLower: "major",
                    fixUpper: "major",
                    majorTickStep: 2,
                    font: "normal normal normal 9pt Arial",
                    fontColor: "#0094FF"
                });
                responseChart.theme.chart.fill = 'transparent';
                responseChart.theme.chart.stroke = 'transparent';
                responseChart.theme.plotarea.fill = 'transparent';
                responseChart.theme.plotarea.stroke = 'transparent';
                responseChart.theme.axis.stroke.color = 'transparent';
                responseChart.theme.axis.tick.fontColor = '#FFFFFF';
                responseChart.theme.axis.tick.color = 'transparent';
                //new Tooltip(responseChart, 'default', {
                //    text: function (o) {
                //        return o.run.data[o.index].tooltip;
                //    }
                //});
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
                responseChart.render();
                response_update_end();
            } catch (err) {
                eh(err, 'createResponseChart');
            }
        });
}
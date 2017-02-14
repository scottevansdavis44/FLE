var linesColumns = null;
var regressionMenu = null;
var chartDayTime = null;
var daytime = null;
var trendType = { name: 'polynomial', order: 3 };

function buildHistogram(parent) {
    val = dijit.byId('chartHistogram_' + parent).get('value');
    if (val == 'BAR_DAY' || val == 'LINE_DAY') {
        buildLastDays(parent);
    } else {
        build52Weeks(parent);
    }
}

function get52WeekConfig(part) {
    filteredArr = dojo.filter(dataConfig[0].groups, function (item) {
        return item.title == part;
    });
    rtn = dojo.filter(filteredArr[0].events, function (evnt) {
        return evnt.parent == 'chartLast52Weeks';
    });
    return rtn[0];
}

function get52WeekDateField(part) {
    filteredArr = dojo.filter(dataConfig[0].groups, function (item) {
        return item.title == part;
    });
    return filteredArr[0].dateFieldName;
}

function get52WeekTrend(part) {
    filteredArr = dojo.filter(dataConfig[0].groups, function (item) {
        return item.title == part;
    });
    return filteredArr[0].trendUpSign;
}

function build52Weeks(parent) {
    showLW('divWorking_Week');
    try {
        //createTrendTypeMenu(parent);
        wk_evnt = get52WeekConfig(crime_part);
        wk_trend = get52WeekTrend(crime_part);
        RemoveChildren(dojo.byId(parent));
        if (linesColumns && linesColumns.node.id == parent) {
            linesColumns.destroy();
            linesColumns = null;
        }
        dojo.byId('lbl' + parent).innerHTML = crime_code_category_abbr + ' 52 wks  (' + crime_geolayer_filter_district + ')';


        var req = esri.request({
            url: adminSOE + 'getHistogram',
            handleAs: 'json',
            content: {
                title: '52 weeks',
                dayorweek: 'WEEK',
                code: (crime_code_category === crime_part) ? 'ALL' : crime_code_category,
                group: crime_part,
                zonefield: crime_geolayer_filter_field,
                zone: crime_geolayer_filter_district,
                shift: crime_shift,
                f: 'json'
            },
            callbackParamName: 'callback',
            load: function (msg, args) {
                daytime = new Array(24);
                for (var i = 0; i < 24; i++) {
                    daytime[i] = new Array(7);
                    for (var j = 0; j < 7; j++) {
                        daytime[i][j] = 0;
                    }
                }
                dojo.forEach(msg.hours, function (itm) {
                    daytime[itm.h][itm.d] = itm.count;
                });
                finish52Weeks2(wk_evnt, parent, msg.items, wk_trend);
                return;
            },
            error: function (e, args) {
                eh(e, 'getHistogram');
            }
        });

        //wk_dateField = get52WeekDateField(crime_part);
        //var q = new esri.tasks.Query();
        //q.returnGeometry = false;
        //q.outFields = [crime_group_by_part.table + '.BCS_WOY', crime_group_by_part.table + '.BCS_HOD', crime_group_by_part.table + '.' + wk_dateField];
        //q.where = '1=1';
        //var wk_evntLayer = mapChart.getLayer(crime_part + ' ' + '52 weeks');
        //wk_evntLayer.queryFeatures(q, function (result) {
        //    finish52Weeks(wk_evnt, result.features, crime_group_by_part.table + '.' + wk_dateField, crime_group_by_part.table + '.BCS_WOY', crime_group_by_part.table + '.BCS_HOD', parent, wk_trend);
        //}, function (err) {
        //    log(err);
        //});
    } catch (err) {
        eh(err, 'build52Weeks');
        hideLW('divWorking_Week');
    }
}

function finish52Weeks2(evnt, parent, wk_seriesA, wk_trend) {
    try {
        var sum = 0;
        dojo.forEach(wk_seriesA, function (itm) {
            sum += itm.y;
        });
        var avg = sum / 52;
        var labels = [];
        var labels2 = [];
        var data = [];
        var avg_series = [];
        var maxCount = 0;
        var g = dojox.charting.Theme.generateGradient;
        chartColor = (crime_code_category) ? findCategoryColor(crime_part, crime_code_category, dataConfig[0]) : '#0000FF';
        dojo.forEach(wk_seriesA, function (w) {
            w.fill = (w.y > avg) ? '#E10000' : '#007F0E';
            labels2.push({
                value: w.x,
                text: w.m
            });
            avg_series.push({ y: parseInt(avg), tooltip: "52 week event average: " + parseInt(avg) });
            if (w.y > maxCount) {
                maxCount = w.y;
            }
            data.push([w.x, w.y]);
        });
        var myRegression = regression(trendType.name, data, trendType.order);
        trnd = myRegression.series;
        var linear = regression('linear', data, 0);
        var trend_icon = 'UP_NEGATIVE';
        var above_color = '#E10000';
        var below_color = '#007F0E';
        switch (linear.trendDirection) {
            case 'UP':
                if (wk_trend === 'POSITIVE') {
                    trend_icon = 'UP_POSITIVE';
                    above_color = '#007F0E';
                    below_color = '#E10000';
                } else {
                    trend_icon = 'UP_NEGATIVE';
                    above_color = '#E10000';
                    below_color = '#007F0E';
                }
                break;
            default:
                if (wk_trend === 'POSITIVE') {
                    trend_icon = 'DOWN_NEGATIVE';
                    above_color = '#007F0E';
                    below_color = '#E10000';
                } else {
                    trend_icon = 'DOWN_POSITIVE';
                    above_color = '#E10000';
                    below_color = '#007F0E';
                }
                break;
        }
        dojo.byId('imgTrend').src = "img/" + trend_icon + ".png";
        maxYAxis = (maxCount < 100) ? maxCount + 5 : maxCount + 15;

        require(["dojo/fx/easing"], function (easing) {
            //if (smallWin) {
            avgLbl = (avg < 10) ? avg.toFixed(2) : parseInt(avg);
            linesColumns = new dojox.charting.Chart(parent, {
                title: 'Avg: ' + avgLbl + ' per week',
                titlePos: "bottom",
                titleGap: 8,
                titleFont: 'normal normal normal 10pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif',
                titleFontColor: "#FFE100"
            });
            //} else {
            //    linesColumns = new dojox.charting.Chart(parent);
            //}
            linesColumns.setTheme(dojox.charting.themes.Claro);
            linesColumns.addPlot("Grid", { type: "Grid", hAxis: "x", vAxis: "y", hMajorLines: true, hMinorLines: false, vMajorLines: true, vMinorLines: false });
            //chartDayTime.addPlot("default", { type: "Lines", markers: true, tension: 'S', shadows: { dx: 1, dy: 1, dw: 1 }, animate: { easing: easing.linear} });
            //chartDayTime.addSeries("TimeOfDay", chartData, { stroke: { width: 2, color: (crime_code_category) ? findCategoryColor(crime_code_category) : "gold"} });
            linesColumns.addPlot('default', { type: 'Lines', markers: false, hAxis: 'other x', vAxis: 'other y', shadow: { dx: 1, dy: 1, width: 2, color: [0, 0, 0, 0.3] }, animate: { duration: 1000, easing: easing.linear } });
            linesColumns.addSeries('trendline', trnd, { stroke: { width: 3, color: 'white' } });
            linesColumns.addSeries('averageline', avg_series, { stroke: { width: 3, color: '#FFE100', style: 'Dot' } });
            //atype = (parent != 'MaxContent') ? dijit.byId('chartTypeLast52Weeks').get('value') : dijit.byId('chartTypeLast52Weeks_'+parent).get('value');
            switch (dijit.byId('chartHistogram_' + parent).get('value')) {
                case 'BAR_WEEK':
                    linesColumns.addPlot("wk_seriesA", { type: "Columns", hAxis: "x", vAxis: "y", gap: 0, animate: { duration: 1000, easing: easing.linear } });
                    //defaultFill = { type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 100 };
                    //linesColumns.addSeries("A", wk_seriesA, { plot: 'wk_seriesA', fill: g(defaultFill, ColorLuminance(chartColor, -0.4), chartColor), stroke: { color: 'transparent'} });
                    linesColumns.addSeries("A", wk_seriesA, { plot: 'wk_seriesA', stroke: { width: 0, color: chartColor } });
                    break;
                case 'LINE_WEEK':
                    linesColumns.addPlot("wk_seriesA", { type: "Lines", hAxis: "x", vAxis: "y", markers: true, tension: 'S', animate: { duration: 1000, easing: easing.linear } });
                    linesColumns.addSeries("A", wk_seriesA, { plot: 'wk_seriesA', stroke: { width: 2, color: chartColor }, fill: 'transparent' });
                    new dojox.charting.action2d.Magnify(linesColumns, 'wk_seriesA');
                    break;
                case 'AREA_WEEK':
                    linesColumns.addPlot("wk_seriesA", { type: "Areas", hAxis: "x", vAxis: "y", tension: 'S', animate: { duration: 1000, easing: easing.linear } });
                    defaultFill = { type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 400 };
                    linesColumns.addSeries("A", wk_seriesA, { plot: 'wk_seriesA', fill: g(defaultFill, ColorLuminance(chartColor, -0.9), chartColor), stroke: { color: 'transparent' } });
                    break;
            }
            linesColumns.addAxis("y", {
                min: 0,
                max: maxYAxis,
                natural: true,
                vertical: true,
                includeZero: true,
                minorTicks: false,
                font: (parent == 'MainHistogram') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 14pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif'
            });
            linesColumns.addAxis("x", {
                labels: labels2,
                includeZero: false,
                minorTicks: false,
                font: (parent == 'MainHistogram') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 14pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif'
            });
            linesColumns.addAxis("other x", {
                labels: labels2,
                includeZero: false,
                minorTicks: false,
                leftBottom: false,
                font: (parent == 'MainHistogram') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 14pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif'
            });
            linesColumns.addAxis("other y", {
                min: 0,
                max: maxYAxis,
                natural: true,
                vertical: true,
                includeZero: true,
                minorTicks: false,
                leftBottom: false,
                font: (parent == 'MainHistogram') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 14pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif'
            });
            linesColumns.theme.chart.fill = '#1E1E1E';
            linesColumns.theme.chart.stroke = { color: 'transparent' };

            linesColumns.theme.marker.outline.color = 'transparent';
            linesColumns.theme.marker.stroke.color = 'transparent';
            linesColumns.theme.plotarea.fill = '#1E1E1E';
            linesColumns.theme.plotarea.stroke = '#1E1E1E';
            linesColumns.theme.axis.stroke.color = '#FFFFFF';
            linesColumns.theme.axis.tick.fontColor = '#FFFFFF';
            linesColumns.theme.axis.tick.color = '#FFFFFF';
            new dojox.charting.action2d.Highlight(linesColumns, 'wk_seriesA', {
                duration: 1000,
                easing: dojo.fx.easing.sineOut,
                highlight: 'black' // g({ type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 100 }, ColorLuminance('#FF9900', -0.5), '#FF9900')
            });
            new dojox.charting.action2d.Tooltip(linesColumns, 'wk_seriesA', {
                text: function (o) {
                    return numberWithCommas(o.run.data[o.index].y) + ' events in week of ' + o.run.data[o.index].hint;
                }
            });
            //            new dojox.charting.action2d.Tooltip(linesColumns, 'averageline', {
            //                text: function (o) {
            //                    return numberWithCommas(o.run.data[o.index].y) + ' events';
            //                }
            //            });
            linesColumns.render();
        });
        if (parent == 'MainHistogram') { selectHeatChart_onChange(dijit.byId('selectHeatChart_MainHeatTable').get('value')); }
    } catch (err) {
        eh(err, 'finish52Weeks');
    } finally {
        hideLW('divWorking_Week');
        p = dojo.byId(parent);
        linesColumns.resize(p.clientWidth, p.clientHeight);
    }
}

function finish52Weeks(evnt, features, dateField, bcs_woy, bcs_hod, parent, wk_trend) {
    try {
        var weekOfYear = new Array(53);
        for (var i = 0; i < 54; i++) {
            weekOfYear[i] = [];
        }
        // used for heat
        daytime = new Array(24);
        var hoursum = new Array(24);
        for (var i = 0; i < 24; i++) {
            daytime[i] = new Array(7);
            hoursum[i] = 0;
            for (var j = 0; j < 7; j++) {
                daytime[i][j] = 0;
            }
        }
        //
        currentWeek = (new Date()).getWeek();
        dojo.forEach(features, function (feature) {
            woy = parseInt(feature.attributes[bcs_woy]);
            (woy == 53) ? weekOfYear[1].push(feature) : weekOfYear[woy].push(feature);
            // used for heat
            day = new Date(feature.attributes[dateField]).getDay();
            hour = feature.attributes[bcs_hod];
            daytime[hour][day] += 1;
            hoursum[hour] += 1;
            //
        });
        avg = features.length / 52;
        var wk_seriesA = [];
        seriesChk = [];
        weekOfYear.splice(53, 1);
        weekOfYear.splice(0, 1);
        var currentYear = (new Date()).getFullYear();
        for (var week in weekOfYear) {
            if (weekOfYear.hasOwnProperty(week)) {
                var item = weekOfYear[week];
                if (parseInt(week) > currentWeek) {
                    myDate = getDateOfWeek(parseInt(week), currentYear - 1);
                    yr = currentYear - 1;
                    woy = parseInt(week) - 52;
                } else {
                    woy = parseInt(week);
                    myDate = getDateOfWeek(woy, currentYear);
                    yr = currentYear;
                }
                month = myDate.getMonth();
                seriesChk.push({
                    w: woy,
                    count: item.length,
                    m: mon(month),
                    yr: yr,
                    ow: (parseInt(week) == 0) ? 52 : parseInt(week)
                });
            }
        }
        seriesChk = sortByKey(seriesChk, 'w', 'A');
        var labels = [];
        var labels2 = [];
        var data = [];
        var avg_series = [];
        maxCount = 0;
        var g = dojox.charting.Theme.generateGradient;
        chartColor = (crime_code_category) ? findCategoryColor(crime_part, crime_code_category, dataConfig[0]) : '#0000FF';
        dojo.forEach(seriesChk, function (w) {
            data.push([w.w, w.count]);
        });
        var myRegression = regression(trendType.name, data, trendType.order);
        trnd = myRegression.series;
        var linear = regression('linear', data, 0);
        //linearTrend = linear.trendDirection;
        var trend_icon = 'UP_NEGATIVE';
        var above_color = '#E10000';
        var below_color = '#007F0E';
        switch (linear.trendDirection) {
            case 'UP':
                if (wk_trend === 'POSITIVE') {
                    trend_icon = 'UP_POSITIVE';
                    above_color = '#007F0E';
                    below_color = '#E10000';
                } else {
                    trend_icon = 'UP_NEGATIVE';
                    above_color = '#E10000';
                    below_color = '#007F0E';
                }
                break;
            default:
                if (wk_trend === 'POSITIVE') {
                    trend_icon = 'DOWN_NEGATIVE';
                    above_color = '#007F0E';
                    below_color = '#E10000';
                } else {
                    trend_icon = 'DOWN_POSITIVE';
                    above_color = '#E10000';
                    below_color = '#007F0E';
                }
                break;
        }
        dojo.byId('imgTrend').src = "img/" + trend_icon + ".png";
        dojo.forEach(seriesChk, function (w) {
            labels.push({
                value: w.w + (-seriesChk[0].w) + 1,
                text: w.w + ''
            });
            labels2.push({
                value: w.w + (-seriesChk[0].w) + 1,
                text: w.m
            });
            wk_seriesA.push({
                y: w.count,
                x: w.w + (-seriesChk[0].w) + 1,
                m: w.m,
                yr: w.yr,
                w: w.ow,
                fill: (w.count > avg) ? above_color : below_color
            });
            avg_series.push({ y: parseInt(avg), tooltip: "52 week event average: " + parseInt(avg) });
            if (w.count > maxCount) {
                maxCount = w.count;
            }
        });

        maxYAxis = (maxCount < 100) ? maxCount + 5 : maxCount + 15;
        require(["dojo/fx/easing"], function (easing) {
            //if (smallWin) {
            avgLbl = (avg < 10) ? avg.toFixed(2) : parseInt(avg);
            linesColumns = new dojox.charting.Chart(parent, {
                title: 'Avg: ' + avgLbl + ' per week',
                titlePos: "bottom",
                titleGap: 8,
                titleFont: 'normal normal normal 10pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif',
                titleFontColor: "#FFE100"
            });
            //} else {
            //    linesColumns = new dojox.charting.Chart(parent);
            //}
            linesColumns.setTheme(dojox.charting.themes.Claro);
            linesColumns.addPlot("Grid", { type: "Grid", hAxis: "x", vAxis: "y", hMajorLines: true, hMinorLines: false, vMajorLines: true, vMinorLines: false });
            //chartDayTime.addPlot("default", { type: "Lines", markers: true, tension: 'S', shadows: { dx: 1, dy: 1, dw: 1 }, animate: { easing: easing.linear} });
            //chartDayTime.addSeries("TimeOfDay", chartData, { stroke: { width: 2, color: (crime_code_category) ? findCategoryColor(crime_code_category) : "gold"} });
            linesColumns.addPlot('default', { type: 'Lines', markers: false, hAxis: 'other x', vAxis: 'other y', shadow: { dx: 1, dy: 1, width: 2, color: [0, 0, 0, 0.3] }, animate: { duration: 1000, easing: easing.linear } });
            linesColumns.addSeries('trendline', trnd, { stroke: { width: 3, color: 'white' } });
            linesColumns.addSeries('averageline', avg_series, { stroke: { width: 3, color: '#FFE100', style: 'Dot' } });
            //atype = (parent != 'MaxContent') ? dijit.byId('chartTypeLast52Weeks').get('value') : dijit.byId('chartTypeLast52Weeks_'+parent).get('value');
            switch (dijit.byId('chartHistogram_' + parent).get('value')) {
                case 'BAR_WEEK':
                    linesColumns.addPlot("wk_seriesA", { type: "Columns", hAxis: "x", vAxis: "y", gap: 0, animate: { duration: 1000, easing: easing.linear } });
                    //defaultFill = { type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 100 };
                    //linesColumns.addSeries("A", wk_seriesA, { plot: 'wk_seriesA', fill: g(defaultFill, ColorLuminance(chartColor, -0.4), chartColor), stroke: { color: 'transparent'} });
                    linesColumns.addSeries("A", wk_seriesA, { plot: 'wk_seriesA', stroke: { width: 0, color: chartColor } });
                    break;
                case 'LINE_WEEK':
                    linesColumns.addPlot("wk_seriesA", { type: "Lines", hAxis: "x", vAxis: "y", markers: true, tension: 'S', animate: { duration: 1000, easing: easing.linear } });
                    linesColumns.addSeries("A", wk_seriesA, { plot: 'wk_seriesA', stroke: { width: 2, color: chartColor }, fill: 'transparent' });
                    new dojox.charting.action2d.Magnify(linesColumns, 'wk_seriesA');
                    break;
                case 'AREA_WEEK':
                    linesColumns.addPlot("wk_seriesA", { type: "Areas", hAxis: "x", vAxis: "y", tension: 'S', animate: { duration: 1000, easing: easing.linear } });
                    defaultFill = { type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 400 };
                    linesColumns.addSeries("A", wk_seriesA, { plot: 'wk_seriesA', fill: g(defaultFill, ColorLuminance(chartColor, -0.9), chartColor), stroke: { color: 'transparent' } });
                    break;
            }
            linesColumns.addAxis("y", {
                min: 0,
                max: maxYAxis,
                natural: true,
                vertical: true,
                includeZero: true,
                minorTicks: false,
                font: (parent == 'MainHistogram') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 14pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif'
            });
            linesColumns.addAxis("x", {
                labels: labels2,
                includeZero: false,
                minorTicks: false,
                font: (parent == 'MainHistogram') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 14pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif'
            });
            linesColumns.addAxis("other x", {
                labels: labels2,
                includeZero: false,
                minorTicks: false,
                leftBottom: false,
                font: (parent == 'MainHistogram') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 14pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif'
            });
            linesColumns.addAxis("other y", {
                min: 0,
                max: maxYAxis,
                natural: true,
                vertical: true,
                includeZero: true,
                minorTicks: false,
                leftBottom: false,
                font: (parent == 'MainHistogram') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 14pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif'
            });
            linesColumns.theme.chart.fill = '#1E1E1E';
            linesColumns.theme.chart.stroke = { color: 'transparent' };
            linesColumns.theme.marker.outline.color = 'transparent';
            linesColumns.theme.marker.stroke.color = 'transparent';
            linesColumns.theme.plotarea.fill = '#1E1E1E';
            linesColumns.theme.plotarea.stroke = '#1E1E1E';
            linesColumns.theme.axis.stroke.color = '#FFFFFF';
            linesColumns.theme.axis.tick.fontColor = '#FFFFFF';
            linesColumns.theme.axis.tick.color = '#FFFFFF';
            new dojox.charting.action2d.Highlight(linesColumns, 'wk_seriesA', {
                duration: 1000,
                easing: dojo.fx.easing.sineOut,
                highlight: 'black' // g({ type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 100 }, ColorLuminance('#FF9900', -0.5), '#FF9900')
            });
            new dojox.charting.action2d.Tooltip(linesColumns, 'wk_seriesA', {
                text: function (o) {
                    return numberWithCommas(o.run.data[o.index].y) + ' events in week ' + o.run.data[o.index].w + ', ' + o.run.data[o.index].m + ' ' + o.run.data[o.index].yr;
                }
            });
            //            new dojox.charting.action2d.Tooltip(linesColumns, 'averageline', {
            //                text: function (o) {
            //                    return numberWithCommas(o.run.data[o.index].y) + ' events';
            //                }
            //            });
            linesColumns.render();
        });
        if (parent == 'MainHistogram') { selectHeatChart_onChange(dijit.byId('selectHeatChart_MainHeatTable').get('value')); }
    } catch (err) {
        eh(err, 'finish52Weeks');
    } finally {
        hideLW('divWorking_Week');
        p = dojo.byId(parent);
        linesColumns.resize(p.clientWidth, p.clientHeight);
    }
}

function createTrendTypeMenu(parent) {
    require(['dijit/Menu', 'dijit/MenuItem', 'dijit/CheckedMenuItem', "dojo/domReady!"],
        function (Menu, MenuItem, CheckedMenuItem) {
            try {
                //                if (regressionMenu && regressionMenu.params.targetNodeIds[0] == parent) {
                //                    regressionMenu.destroy();
                //                    regressionMenu = null;
                //                }
                regressionMenu = new Menu({
                    targetNodeIds: [parent]
                });
                regressionMenu.addChild(new CheckedMenuItem({
                    id: 'mnuLinear_' + parent,
                    label: 'Linear',
                    class: 'mnuTrend',
                    onClick: function (evt) {
                        trendType.name = 'linear';
                        trendType.order = 0;
                        dojo.query('.mnuTrend').forEach(function (node) {
                            if (node.attributes.id.value != 'mnuLinear_' + parent) {
                                dijit.byId(node.attributes.id.value).set('checked', false);
                            }
                        });
                        buildHistogram(parent);
                    }
                }));
                regressionMenu.addChild(new CheckedMenuItem({
                    id: 'mnuPolynomial2_' + parent,
                    label: 'Polynomial (order 2)',
                    class: 'mnuTrend',
                    onClick: function () {
                        trendType.name = 'polynomial';
                        trendType.order = 2;
                        dojo.query('.mnuTrend').forEach(function (node) {
                            if (node.attributes.id.value != 'mnuPolynomial2_' + parent) {
                                dijit.byId(node.attributes.id.value).set('checked', false);
                            }
                        });
                        buildHistogram(parent);
                    }
                }));
                regressionMenu.addChild(new CheckedMenuItem({
                    id: 'mnuPolynomial3_' + parent,
                    label: 'Polynomial (order 3)',
                    class: 'mnuTrend',
                    checked: true,
                    onClick: function () {
                        trendType.name = 'polynomial';
                        trendType.order = 3;
                        dojo.query('.mnuTrend').forEach(function (node) {
                            if (node.attributes.id.value != 'mnuPolynomial3_' + parent) {
                                dijit.byId(node.attributes.id.value).set('checked', false);
                            }
                        });
                        buildHistogram(parent);
                    }
                }));
            } catch (err) {
                eh(err, 'createTrendTypeMenu');
            }
        });
}

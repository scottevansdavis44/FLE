function buildLastDays(parent) {
    showLW('divWorking_Week');
    try {
        dayparts = crime_days.split(' ');
        filteredAry = dojo.filter(crime_group_by_part.events, function (evnt) {
            return evnt.eventTitle == crime_days;
        });
        wk_evnt = filteredAry[0];
        RemoveChildren(dojo.byId(parent));
        if (linesColumns && linesColumns.node.id == parent) {
            linesColumns.destroy();
            linesColumns = null;
        }
        dojo.byId('lbl' + parent).innerHTML = crime_code_category_abbr + ' ' + crime_days + ' (' + crime_geolayer_filter_district + ')';
        wk_dateField = get52WeekDateField(crime_part);
        wk_trend = get52WeekTrend(crime_part);
        var req = esri.request({
            url: adminSOE + 'getHistogram',
            handleAs: 'json',
            content: {
                title: crime_days,
                dayorweek: 'DAY' + dayparts[0],
                code: crime_code_category_SOE,
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
                finishLastDays(wk_evnt, parent, msg.items, parseInt(dayparts[0]), wk_trend);
                return;
            },
            error: function (e, args) {
                eh(e, 'getHistogram');
            }
        });
    } catch (err) {
        eh(err, 'buildLastDays');
        hideLW('divWorking_Week');
    }
}


function finishLastDays(evnt, parent, wk_seriesA, days, wk_trend) {
    try {
        sum = 0;
        dojo.forEach(wk_seriesA, function (itm) {
            sum += itm.y;
        });
        var avg = sum / days;
        var labels = [];
        var data = [];
        var avg_series = [];
        maxCount = 0;
        var g = dojox.charting.Theme.generateGradient;
        chartColor = (crime_code_category) ? findCategoryColor(crime_part, crime_code_category, dataConfig[0]) : '#0000FF';
        dojo.forEach(wk_seriesA, function (w) {
            w.fill = (w.y > avg) ? '#E10000' : '#007F0E';
            var md = w.m.split('.');
            labels.push({
                value: w.x,
                text: md[1] + '/' + md[0]
            });
            avg_series.push({ y: parseInt(avg), tooltip: "Event average: " + parseInt(avg) });
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
                title: 'Avg: ' + avgLbl + ' per day',
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
            linesColumns.addSeries('trendline', trnd, { stroke: { width: 3, color: 'white' }, animate: { duration: 1000, easing: easing.linear } });
            linesColumns.addSeries('averageline', avg_series, { stroke: { width: 3, color: '#FFE100', style: 'Dot' }, animate: { duration: 1000, easing: easing.linear } });
            //atype = (parent != 'MaxContent') ? dijit.byId('chartTypeLast52Weeks').get('value') : dijit.byId('chartTypeLast52Weeks_'+parent).get('value');
            switch (dijit.byId('chartHistogram_' + parent).get('value')) {
                case 'BAR_DAY':
                    linesColumns.addPlot("wk_seriesA", { type: "Columns", hAxis: "x", vAxis: "y", gap: 0, animate: { duration: 1000, easing: easing.linear } });
                    //defaultFill = { type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 100 };
                    //linesColumns.addSeries("A", wk_seriesA, { plot: 'wk_seriesA', fill: g(defaultFill, ColorLuminance(chartColor, -0.4), chartColor), stroke: { color: 'transparent'} });
                    linesColumns.addSeries("A", wk_seriesA, { plot: 'wk_seriesA', stroke: { width: 0, color: chartColor } });
                    break;
                case 'LINE_DAY':
                    linesColumns.addPlot("wk_seriesA", { type: "Lines", hAxis: "x", vAxis: "y", markers: true, tension: 'S', animate: { duration: 1000, easing: easing.linear } });
                    linesColumns.addSeries("A", wk_seriesA, { plot: 'wk_seriesA', stroke: { width: 2, color: chartColor }, fill: 'transparent' });
                    new dojox.charting.action2d.Magnify(linesColumns, 'wk_seriesA');
                    break;
                case 'AREA_DAY':
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
                labels: labels,
                includeZero: false,
                minorTicks: false,
                font: (parent == 'MainHistogram') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 14pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif',
                natural: true,
                majorTickStep: Math.round(wk_seriesA.length / 7)
            });
            linesColumns.addAxis("other x", {
                labels: labels,
                includeZero: false,
                minorTicks: false,
                leftBottom: false,
                font: (parent == 'MainHistogram') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 14pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif',
                natural: true,
                majorTickStep: Math.round(wk_seriesA.length / 7)
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
                    return numberWithCommas(o.run.data[o.index].y) + ' events on day of ' + o.run.data[o.index].hint;
                }
            });
            linesColumns.render();
        });
        if (parent == 'MainHistogram') { selectHeatChart_onChange(dijit.byId('selectHeatChart_MainHeatTable').get('value')); }
    } catch (err) {
        eh(err, 'finishLastDays');
    } finally {
        hideLW('divWorking_Week');
        p = dojo.byId(parent);
        linesColumns.resize(p.clientWidth, p.clientHeight);
    }
}

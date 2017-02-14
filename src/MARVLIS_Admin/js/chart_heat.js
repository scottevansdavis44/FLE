function buildHeatIndex(parent) {
    try {
        RemoveChildren(dojo.byId(parent));
        if (chartDayTime && chartDayTime.node.id == parent) {
            chartDayTime.destroy();
            chartDayTime = null;
        }
        val = dijit.byId('chartHistogram_MainHistogram').get('value');
        if (val == 'BAR_DAY' || val == 'LINE_DAY') {
            dojo.byId('lbl' + parent).innerHTML = crime_code_category_abbr + ' ' + crime_days + ' (' + crime_geolayer_filter_district + ')';
        } else {
            dojo.byId('lbl' + parent).innerHTML = crime_code_category_abbr + ' 52 wks (' + crime_geolayer_filter_district + ')';
        }
        //++++++++++++++++++++++++++++++++++++++++++++++++++
        // Standard Deviation grid across day and time
        //++++++++++++++++++++++++++++++++++++++++++++++++++
        var alldaytime = [];
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < 7; j++) {
                alldaytime.push(daytime[i][j]);
            }
        }
        sd = standardDeviation(alldaytime);
        av = average(alldaytime);
        mx = Math.max.apply(Math, alldaytime);
        mn = Math.min.apply(Math, alldaytime);
        var table = dojo.create('table', { class: 'gridTable' }, null);
        cellWidth = parseInt(table.clientWidth / 25) + 'px';
        var tBody = dojo.create('tbody', null, table);
        var tr = dojo.create('tr', null, tBody, 'last');
        for (var t = -1; t < 25; t++) {
            if (t > -1 && t < 24) {
                dojo.create('td', {
                    innerHTML: (t < 10) ? '0' + t : '' + t,
                    class: 'gridTableHC_' + parent,
                    style: 'width: ' + cellWidth + ' !important'
                }, tr, 'last');
            } else {
                if (t == -1) {
                    dojo.create('td', {
                        innerHTML: '',
                        class: 'gridTableHRClear_' + parent,
                        style: 'width: ' + cellWidth
                    }, tr, 'last');
                }
            }
        }
        for (var d = 0; d < 7; d++) {
            tr = dojo.create('tr', null, tBody, 'last');
            dojo.create('td', {
                innerHTML: dow(d),
                class: 'gridTableHR_' + parent,
                style: 'width: ' + cellWidth
            }, tr, 'last');
            daysum = 0;
            for (var h = 0; h < 25; h++) {
                if (h <= 23) {
                    clr = 'background-color: ' + sdColor(sd, av, daytime[h][d]) + ' !important; width: ' + cellWidth;
                    dojo.create('td', {
                        innerHTML: (parent == 'MainHeatTable') ? '' : daytime[h][d],
                        class: 'gridTableCell_' + parent,
                        style: clr
                    }, tr, 'last');
                }
            }
        }
        tr = dojo.create('tr', null, tBody, 'last');
        dojo.create('td', {
            innerHTML: '',
            colspan: 2,
            class: 'gridTableHRClear_' + parent,
            style: 'width: ' + cellWidth
        }, tr, 'last');
        clrs = ['#002783', '#1154C1', '#6C9FF8', '#9BBFF9', '#C7E1FC', '#FFFFFF', '#FFFA92', '#F6C05E', '#EF873E', '#EB5738', '#AF2C26'];
        dojo.forEach(clrs, function (c, i) {
            clr = 'background-color: ' + c + ' !important';
            if (i == 0) {
                dojo.create('td', {
                    innerHTML: (parent == 'MainHeatTable') ? 'L' : 'Low',
                    colspan: 2,
                    class: 'gridTableCellLegend_' + parent,
                    style: clr
                }, tr, 'last');
            } else {
                if (i == clrs.length - 1) {
                    dojo.create('td', {
                        innerHTML: (parent == 'MainHeatTable') ? 'H' : 'High',
                        colspan: 2,
                        class: 'gridTableCellLegend_' + parent,
                        style: clr
                    }, tr, 'last');
                } else {
                    dojo.create('td', {
                        innerHTML: '',
                        colspan: 2,
                        class: 'gridTableCellLegend_' + parent,
                        style: clr
                    }, tr, 'last');
                }
            }
        });
        tr = dojo.create('tr', null, tBody, 'last');
        td = dojo.create('td', { colspan: 25 }, tr, 'last');
        var table2 = dojo.create('table', { style: 'width:100%' }, td);
        var tBody2 = dojo.create('tbody', null, table2);
        tr = dojo.create('tr', null, tBody2, 'last');
        dojo.create('td', { innerHTML: 'Standard Deviations', colspan: 4, class: 'gridTableCellLegend_' + parent }, tr, 'last');
        tr = dojo.create('tr', null, tBody2, 'last');
        dojo.create('td', { innerHTML: 'Avg: ' + roundNumber(av, 2), class: 'gridTableCellStats_' + parent }, tr, 'last');
        dojo.create('td', { innerHTML: 'Std Dev: ' + roundNumber(sd, 2), class: 'gridTableCellStats_' + parent }, tr, 'last');
        //tr = dojo.create('tr', null, tBody2, 'last');
        dojo.create('td', { innerHTML: 'Min: ' + mn, class: 'gridTableCellStats_' + parent }, tr, 'last');
        dojo.create('td', { innerHTML: 'Max: ' + mx, class: 'gridTableCellStats_' + parent }, tr, 'last');
        tr = dojo.create('tr', null, tBody2, 'last');
        dojo.create('td', { innerHTML: 'Heat Index', colspan: 4, class: 'gridTableCellLegend2_' + parent }, tr, 'last');
        dijit.byId(parent).set('content', table);
    } catch (err) {
        eh(err, 'buildHeatIndex');
    }
}

function selectHeatChart_onChange(evt) {
    try {
        if (evt === 'HEATINDEXGRID') {
            dojo.byId('tdWeekDaySelector_MainHeatTable').style.display = 'none';
            buildHeatIndex('MainHeatTable');
        } else {
            dojo.byId('tdWeekDaySelector_MainHeatTable').style.display = 'block';
            if (!dojo.byId('weekDaySelector_MainHeatTable')) {
                sel = new dijit.form.Select({
                    id: "weekDaySelector_MainHeatTable",
                    name: "weekDaySelector_MainHeatTable",
                    style: "width: 80px",
                    autoWidth: false,
                    options: [{ value: 'All Days', label: 'All Days' }, { value: 'Monday', label: 'Monday' }, { value: 'Tuesday', label: 'Tuesday' }, { value: 'Wednesday', label: 'Wednesday' }, { value: 'Thursday', label: 'Thursday' }, { value: 'Friday', label: 'Friday' }, { value: 'Weekdays', label: 'Weekdays' }, { value: 'Weekend', label: 'Weekend'}],
                    value: 'All Days',
                    onChange: weekDaySelector_onChange
                });
                dojo.byId('tdWeekDaySelector_MainHeatTable').appendChild(sel.domNode);
                sel.startup();
                buildTimeLine('MainHeatTable');
            } else {
                buildTimeLine('MainHeatTable');
            }
        }
    } catch (err) {
        eh(err, 'selectHeatChart_onChange');
    }
}

function weekDaySelector_onChange(evt) {
    log('weekDaySelector_onChange');
    selectHeatChart_onChange('HEATINDEXLINE');
}

function buildTimeLine(parent) {
    try {
        RemoveChildren(dojo.byId(parent));
        if (chartDayTime && chartDayTime.node.id == parent) {
            chartDayTime.destroy();
            chartDayTime = null;
        }
        dojo.byId('lbl' + parent).innerHTML = crime_code_category_abbr + ' 52 wks (' + crime_geolayer_filter_district + ')';
        opt = dijit.byId('weekDaySelector_' + parent).get('value');
        var chartData = [];
        max = 0;
        day = 0;
        switch (opt) {
            case 'Monday':
                day = 1;
                break;
            case 'Tuesday':
                day = 2;
                break;
            case 'Wednesday':
                day = 3;
                break;
            case 'Thursday':
                day = 4;
                break;
            case 'Friday':
                day = 5;
                break;
        }
        switch (opt) {
            case 'All Days':
                for (var h = 0; h < 25; h++) {
                    if (h <= 23) {
                        sum = 0;
                        for (var d = 0; d < 7; d++) {
                            sum += daytime[h][d];
                        }
                        chartData.push({
                            x: h,
                            y: sum,
                            text: opt,
                            tooltip: numberWithCommas(sum) + ' events'
                        });
                    }
                }
                break;
            case 'Weekdays':
                for (var h = 0; h < 25; h++) {
                    if (h <= 23) {
                        sum = 0;
                        for (var d = 1; d < 6; d++) {
                            sum += daytime[h][d];
                        }
                        chartData.push({
                            x: h,
                            y: sum,
                            text: opt,
                            tooltip: numberWithCommas(sum) + ' events'
                        });
                    }
                }
                break;
            case 'Weekend':
                for (var h = 0; h < 25; h++) {
                    if (h <= 23) {
                        sum = 0;
                        for (var d = 0; d < 7; d++) {
                            if (d == 0 || d == 6) {
                                sum += daytime[h][d];
                            }
                        }
                        chartData.push({
                            x: h,
                            y: sum,
                            text: opt,
                            tooltip: numberWithCommas(sum) + ' events'
                        });
                    }
                }
                break;
            default:
                for (var h = 0; h < 25; h++) {
                    if (h <= 23) {
                        sum = 0;
                        for (var d = 0; d < 7; d++) {
                            if (d == day) {
                                sum += daytime[h][d];
                            }
                        }
                        chartData.push({
                            x: h,
                            y: sum,
                            text: opt,
                            tooltip: numberWithCommas(sum) + ' events'
                        });
                    }
                }
                break;
        }
        require(["dojo/fx/easing"], function (easing) {
            if (smallWin) {
                chartDayTime = new dojox.charting.Chart(parent, {
                    title: crime_code_category + ' Heat Index 52 wks by day',
                    titlePos: "bottom",
                    titleGap: 8,
                    titleFont: 'normal normal normal 10pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    titleFontColor: "orange"
                });
            } else {
                chartDayTime = new dojox.charting.Chart(parent);
            }
            chartDayTime.setTheme(dojox.charting.themes.Claro);
            if (smallWin) {
                chartDayTime.addPlot("default", { type: "Areas", hAxis: "x", vAxis: "y", tension: 'S', animate: { duration: 1000, easing: easing.linear} });
                chartDayTime.addSeries("TimeOfDay", chartData, { fill: (crime_code_category) ? findCategoryColor(crime_part, crime_code_category, dataConfig[0]) : "gold", stroke: { color: 'transparent'} });
            } else {
                chartDayTime.addPlot("default", { type: "Lines", markers: true, tension: 'S', shadow: { dx: 1, dy: 1, width: 4, color: [200, 200, 200, 0.4] }, animate: { easing: easing.linear} });
                chartDayTime.addSeries("TimeOfDay", chartData, { stroke: { width: 2, color: (crime_code_category) ? findCategoryColor(crime_part, crime_code_category, dataConfig[0]) : "gold"} });
            }
            chartDayTime.addAxis("x", {
                min: 0,
                max: 23,
                font: (parent == 'MainHeatTable') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 14pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif'
            });
            ymax = Math.max.apply(Math, chartData.map(function (o) { return o.y; }))
            chartDayTime.addAxis("y", {
                min: 0,
                max: Math.round(ymax * 1.1),
                vertical: true,
                fixLower: "major",
                fixUpper: "minor",
                font: (parent == 'MainHeatTable') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 14pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif'
            });

            chartDayTime.theme.chart.fill = '#1E1E1E';
            chartDayTime.theme.chart.stroke = 'transparent';
            chartDayTime.theme.plotarea.fill = '#1E1E1E';
            chartDayTime.theme.plotarea.stroke = '#1E1E1E';
            chartDayTime.theme.axis.stroke.color = '#FFFFFF';
            chartDayTime.theme.axis.tick.fontColor = '#FFFFFF';
            chartDayTime.theme.axis.tick.color = '#FFFFFF';
            chartDayTime.stretchToFit = true;
            new dojox.charting.action2d.Magnify(chartDayTime, 'default');
            new dojox.charting.action2d.Tooltip(chartDayTime, 'default');
            chartDayTime.render();
        });
    } catch (err) {
        eh(err, 'buildTimeLine');
    } finally {
        p = dojo.byId(parent);
        chartDayTime.resize(p.clientWidth, p.clientHeight);
    }
}

function mon(n) {
    switch (n) {
        case 0:
            return 'Jan';
            break;
        case 1:
            return 'Feb';
            break;
        case 2:
            return 'Mar';
            break;
        case 3:
            return 'Apr';
            break;
        case 4:
            return 'May';
            break;
        case 5:
            return 'Jun';
            break;
        case 6:
            return 'Jul';
            break;
        case 7:
            return 'Aug';
            break;
        case 8:
            return 'Sep';
            break;
        case 9:
            return 'Oct';
            break;
        case 10:
            return 'Nov';
            break;
        case 11:
            return 'Dec';
            break;
    }
}

function dow(n) {
    switch (n) {
        case 0:
            return 'S ';
            break;
        case 1:
            return 'M ';
            break;
        case 2:
            return 'T ';
            break;
        case 3:
            return 'W ';
            break;
        case 4:
            return 'T ';
            break;
        case 5:
            return 'F ';
            break;
        case 6:
            return 'S ';
            break;
    }
}

function standardDeviation(values) {
    var avg = average(values);
    var squareDiffs = values.map(function (value) {
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });
    var avgSquareDiff = average(squareDiffs);
    var stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
}

function average(data) {
    var sum = data.reduce(function (sum, value) {
        return sum + value;
    }, 0);
    var avg = sum / data.length;
    return avg;
}

function sdColor(sd, av, val) {
    sd = parseFloat(sd + '');
    av = parseFloat(av + '');
    val = parseFloat(val + '');
    if (val >= (3.0 * sd) + av) {
        return '#AF2C26';
    }
    if (val < (3.0 * sd) + av && val >= (2.0 * sd) + av) {
        return '#EB5738';
    }
    if (val < (2.0 * sd) + av && val >= (1.5 * sd) + av) {
        return '#EF873E';
    }
    if (val < (1.5 * sd) + av && val >= (1.0 * sd) + av) {
        return '#F6C05E';
    }
    if (val < (1.0 * sd) + av && val >= (0.5 * sd) + av) {
        return '#FFFA92';
    }
    if (val < (0.5 * sd) + av && val >= (-0.5 * sd) + av) {
        return '#FFFFFF';
    }
    if (val < (-0.5 * sd) + av && val >= (-1.0 * sd) + av) {
        return '#C7E1FC';
    }
    if (val < (-1.0 * sd) + av && val >= (-1.5 * sd) + av) {
        return '#9BBFF9';
    }
    if (val < (-1.5 * sd) + av && val >= (-2.0 * sd) + av) {
        return '#6C9FF8';
    }
    if (val < (-2.0 * sd) + av && val >= (-3.0 * sd) + av) {
        return '#1154C1';
    }
    if (val < (-3.0 * sd) + av) {
        return '#002783';
    }
}

function selectHeatChartMaxContent_onChange(evt) {
    if (evt === 'HEATINDEXGRID') {
        dojo.byId('tdWeekDaySelector_MaxContent').style.display = 'none';
        buildHeatIndex('MaxContent');
    } else {
        dojo.byId('tdWeekDaySelector_MaxContent').style.display = 'block';
        buildTimeLine('MaxContent');
    }
}

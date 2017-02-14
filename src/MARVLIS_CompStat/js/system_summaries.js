var chart = null;

function closeChartPane() {
    dojo.byId('chartPaneMain').style.visibility = 'hidden';
    if (isMain) {
        if (childWindow && childWindow.window) {
            childWindow.$(childWindow.document).trigger('childWindow', 'closechart|xxx');
        }
    }
}

function showChartPane() {
    dojo.byId('chartPaneMain').style.visibility = 'visible';
}

function findByName(config, id) {
    for (var j = 0; j < config.length; j++) {
        source = config[j].eventServiceCrimeGroups;
        for (var i = 0; i < source.length; i++) {
            if (source[i].label === id) {
                return source[i];
            }
        }
    }
    throw "Couldn't find object with label: " + id;
}

function findSummary(source, id, idx) {
    filteredArr = dojo.filter(source, function (item) {
        return (item.label == id && item.layerIndex == idx);
    });
    return filteredArr[0];
}

function destroyChart() {
    RemoveChildren(dojo.byId('chartPane'));
    if (chart) {
        chart.destroy();
        chart = null;
    }
}

function chartSummary(name, sector, layeridx) {
    destroyChart();
    var events = findByName(dataConfig, name);
    var evnt = findSummary(events.summaries, sector, layeridx);

    var trnd = trend([[1, evnt.wk3], [2, evnt.wk2], [3, evnt.wk1], [4, evnt.wk0]]);

    showChartPane();
    dojo.byId('chartPaneLabel').innerHTML = '<label>' + name + '</label><img src="img/' + trnd + '.png" alt="' + trnd + '">';
    require(['dojox/charting/Chart', 'dojox/charting/themes/Claro', 'dojo/fx/easing', 'dojox/charting/action2d/Tooltip', 'dojox/charting/plot2d/Columns', 'dojox/charting/plot2d/Lines', 'dojox/charting/Chart2D'], function (Chart, Claro, easing, Tooltip, Columns, Lines, Chart2D) {
        chart = new Chart("chartPane");
        chart.setTheme(Claro);
        chart.addAxis("x", {
            title: (evnt.avg < 1) ? sector + ' (' + evnt.avg + '/week)' : sector + ' (' + parseInt(evnt.avg) + '/week)',
            titleGap: 8,
            titleFont: (isMain) ? 'normal normal bold 10pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal bold 16pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif',
            titleFontColor: "orange",
            titleOrientation: "away",
            min: 0,
            max: 6,
            includeZero: true,
            majorLabels: true,
            minorTicks: false,
            minorLabels: false,
            microTicks: false,
            rotation: -30,
            font: (isMain) ? 'normal normal bold 9pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal bold 16pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontColor: "yellow",
            labels: [{
                value: 0,
                text: ""
            }, {
                value: 1,
                text: "WK"
            }, {
                value: 2,
                text: "WK1"
            }, {
                value: 3,
                text: "WK2"
            }, {
                value: 4,
                text: "WK3"
            }, {
                value: 5,
                text: "WKLY"
            }, {
                value: 6,
                text: ""
            }]
        });
        chart.addAxis("y", {
            natural: true,
            vertical: true,
            includeZero: true,
            minorTicks: false,
            font: (isMain) ? 'normal normal bold 9pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal bold 16pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif'
        });
        var items = [];
        items.push({
            x: 1,
            y: evnt.wk0,
            tooltip: evnt.wk0 + ' events current week ',
            stroke: {
                color: 'transparent'
            },
            fill: {
                type: "linear",
                space: "plot",
                x1: 0,
                y1: 0,
                x2: 75,
                y2: 75,
                colors: [{
                    offset: 0,
                    color: "white"
                }, {
                    offset: 1,
                    color: '#FFDF51'
                }]
            }
        });
        items.push({
            x: 2,
            y: evnt.wk1,
            tooltip: evnt.wk1 + ' events previous week ',
            stroke: {
                color: 'transparent'
            },
            fill: {
                type: "linear",
                space: "plot",
                x1: 0,
                y1: 0,
                x2: 75,
                y2: 75,
                colors: [{
                    offset: 0,
                    color: "white"
                }, {
                    offset: 1,
                    color: '#FF282F'
                }]
            }
        });
        items.push({
            x: 3,
            y: evnt.wk2,
            tooltip: evnt.wk2 + ' events 2 weeks ago ',
            stroke: {
                color: 'transparent'
            },
            fill: {
                type: "linear",
                space: "plot",
                x1: 0,
                y1: 0,
                x2: 75,
                y2: 75,
                colors: [{
                    offset: 0,
                    color: "white"
                }, {
                    offset: 1,
                    color: '#3AFF30'
                }]
            }
        });
        items.push({
            x: 4,
            y: evnt.wk3,
            tooltip: evnt.wk3 + ' events 3 weeks ago ',
            stroke: {
                color: 'transparent'
            },
            fill: {
                type: "linear",
                space: "plot",
                x1: 0,
                y1: 0,
                x2: 75,
                y2: 75,
                colors: [{
                    offset: 0,
                    color: "white"
                }, {
                    offset: 1,
                    color: '#3244FF'
                }]
            }
        });
        items.push({
            x: 5,
            y: evnt.wkly,
            tooltip: evnt.wkly + ' events this week last year ',
            stroke: {
                color: 'transparent'
            },
            fill: {
                type: "linear",
                space: "plot",
                x1: 0,
                y1: 0,
                x2: 75,
                y2: 75,
                colors: [{
                    offset: 0,
                    color: "white"
                }, {
                    offset: 1,
                    color: '#B200FF'
                }]
            }
        });
        var trnd = [{
            x: 0,
            y: evnt.avg
        }, {
            x: 1,
            y: evnt.avg
        }, {
            x: 2,
            y: evnt.avg
        }, {
            x: 3,
            y: evnt.avg
        }, {
            x: 4,
            y: evnt.avg
        }, {
            x: 4.5,
            y: evnt.avg
        }];
        chart.addPlot('default', {
            type: 'Lines',
            markers: false,
            hAxis: 'x',
            vAxis: 'y',
            animate: {
                duration: 1000,
                easing: easing.linear
            }
        });
        chart.addSeries('trendline', trnd, {
            stroke: {
                width: 6,
                color: 'red'
            },
            fill: 'red'
        });
        chart.addPlot("seriesa", {
            type: "Columns",
            gap: 1,
            labels: true,
            labelStyle: "inside",
            fontColor: "black",
            precision: 0,
            font: (isMain) ? 'normal normal bold 9pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal bold 16pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif',
            animate: {
                duration: 1000,
                easing: easing.linear
            }
        });
        chart.addSeries("A", items, {
            plot: 'seriesa'
        });
        chart.movePlotToFront('default');
        chart.theme.chart.fill = '#1E1E1E';
        chart.theme.chart.stroke = {
            color: 'transparent',
            width: 1
        };
        chart.theme.plotarea.fill = 'transparent';
        chart.theme.plotarea.stroke = 'transparent';
        chart.theme.axis.stroke.color = '#FFFFFF';
        chart.theme.axis.tick.fontColor = '#FFFFFF';
        chart.theme.axis.tick.color = '#FFFFFF';
        new Tooltip(chart, 'seriesa', {
            text: function (o) {
                return o.run.data[o.index].tooltip;
            }
        });
        //        new Tooltip(chart, 'default', {
        //            text: function (o) {
        //                return o.run.data[o.index].y + ' average ';
        //            }
        //        });
        chart.connectToPlot('seriesa', 'onclick', function (e) {
            if (e.type == 'onclick') {
                ee = e;
            }
        });
        chart.render();
        if (isMain) {
            chart.resize({
                h: 260,
                w: 298
            });
        } else {
            chart.resize({
                h: 420,
                w: 496
            });
        }
    });
}

function trend(data) {
    var sum = [0, 0, 0, 0, 0], n = 0;

    for (; n < data.length; n++) {
        if (data[n][1] != null) {
            sum[0] += data[n][0];
            sum[1] += data[n][1];
            sum[2] += data[n][0] * data[n][0];
            sum[3] += data[n][0] * data[n][1];
            sum[4] += data[n][1] * data[n][1];
        }
    }

    var gradient = (n * sum[3] - sum[0] * sum[1]) / (n * sum[2] - sum[0] * sum[0]);
    return (gradient > 0) ? 'UP' : (gradient < 0) ? 'DOWN' : 'FLAT';
}

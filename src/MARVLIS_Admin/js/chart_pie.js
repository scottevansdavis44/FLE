var chartPie = null;
var chartPieLegend = null;

function buildPie(parent) {
    showLW('divWorking_Pie');
    try {
        if (dijit.byId('selectPie_' + parent).get('value') == 'BAR') {
            dojo.byId('chartPie_legend').className = 'myhideG';
        } else {
            dojo.byId('chartPie_legend').className = 'myshowG';
        }
        dijit.byId('chartPie_main').resize();
        RemoveChildren(dojo.byId(parent));
        if (chartPie && chartPie.node.id == parent) {
            chartPie.destroy();
            chartPie = null;
        }
        if (chartPieLegend) {
            chartPieLegend.destroy();
            chartPieLegend = null;
        }

        var req = esri.request({
            url: adminSOE + 'getPieSummary',
            handleAs: 'json',
            content: {
                titles: crime_days,
                group: crime_part,
                zonefield: crime_geolayer_filter_field,
                zone: crime_geolayer_filter_district,
                shift: crime_shift,
                f: 'json'
            },
            callbackParamName: 'callback',
            load: function (msg, args) {
                finishPie(msg.items, parent);
            },
            error: function (e, args) {
                eh(e, 'getSummary_pie');
            }
        });
        dojo.byId('lbl' + parent).innerHTML = crime_part + ' ' + crime_days + '  (' + crime_geolayer_filter_district + ')';
    } catch (err) {
        eh(err, 'buildPie');
    }
}

function finishPie(pie_series, parent) {
    try {
        p = dojo.byId(parent);
        if (parent == 'ChartPie') {
            radius = (p.clientHeight < p.clientWidth) ? parseInt(p.clientHeight / 2 - 10) : radius = parseInt(p.clientWidth / 2 - 10);
        } else {
            radius = (p.clientHeight < p.clientWidth) ? parseInt(p.clientHeight / 2 - 60) : radius = parseInt(p.clientWidth / 2 - 60);
        }
        require(["dojo/fx/easing"], function (easing) {
            var dc = dojox.charting;
            chartPie = new dc.Chart(parent);
            chartPie.setTheme(dojox.charting.themes.Chris);
            switch (dijit.byId('selectPie_' + parent).get('value')) {
                case 'STACKED':
                    pie_series = sortByKey(pie_series, 'text', 'A');
                    chartPie.addPlot("default", { type: 'StackedColumns', gap: 0, minBarSize: radius * 2, maxBarSize: radius * 2, animate: { duration: 1000, easing: easing.linear} });
                    dojo.forEach(pie_series, function (a) {
                        chartPie.addSeries(a.category, [a]);
                    });
                    new dc.action2d.Highlight(chartPie, "default", {
                        duration: 450,
                        easing: dojo.fx.easing.bounceOut
                    });
                    chartPie.theme.series.stroke.color = '#353535';
                    break;
                case 'PIE':
                    pie_series = sortByKey(pie_series, 'text', 'A');
                    chartPie.addPlot('default', {
                        type: 'Pie',
                        font: 'bold normal 12pt sans-serif',
                        fontColor: '#ccc',
                        labelWiring: "#ccc",
                        htmlLabels: (parent == 'MaxContent') ? true : false,
                        omitLabels: (parent == 'MaxContent') ? false : true,
                        //ticks: (parent == 'MaxContent'),
                        fixed: true,
                        precision: 1,
                        labelOffset: 10,
                        labelStyle: (parent == 'MaxContent') ? 'columns' : 'auto',   // default/columns/rows/auto
                        //radGrad: "linear",
                        radGrad: "native",
                        radius: radius,
                        animate: {
                            duration: 2000,
                            easing: easing.quintIn
                        }
                    });
                    chartPie.addSeries('Series A', pie_series);
                    chartPie.theme.series.stroke.color = '#353535';
                    break;
                case 'BAR':
                    pie_series = sortByKey(pie_series, 'y', 'D');
                    if (parent == 'ChartPie' && pie_series.length > 11) {
                        pie_series.splice(10, pie_series.length - 10);
                    }
                    pie_series = sortByKey(pie_series, 'y', 'A');
                    ylabels = [];
                    dojo.forEach(pie_series, function (w, i) {
                        cat = w.text.split(' ');
                        ylabels.push({
                            value: i + 1,
                            text: dojo.trim(cat[0])
                        });
                        //                        w.fill = {
                        //                            type: "linear", space: "shape", x1: 0, y1: 0, x2: 0, y2: 100, colors: [{ offset: 0, color: "white" }, { offset: 1, color: w.fill}]
                        //                        }
                    });
                    chartPie.addPlot("default", { type: "Bars", gap: 1, labels: true,
                        labelStyle: "outside",
                        labelOffset: 20,
                        fontColor: "white",
                        precision: 0,
                        font: (parent == 'ChartPie') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 11pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        animate: {
                            duration: 2000,
                            easing: easing.linear
                        }
                    });
                    chartPie.addSeries('Series A', pie_series);
                    xmax = Math.max.apply(Math, pie_series.map(function (o) { return o.y; }))
                    chartPie.addAxis("x", {
                        min: 0,
                        max: Math.round(xmax * 1.1),
                        majorLabels: false,
                        minorTicks: false
                    });
                    chartPie.addAxis("y", {
                        rotation: 0,
                        labels: ylabels,
                        vertical: true,
                        includeZero: false,
                        majorLabels: true,
                        //minorTicks: false,
                        minorLabels: true,
                        //microTicks: false,
                        font: (parent == 'ChartPie') ? 'normal normal normal 8pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif' : 'normal normal normal 11pt "Myriad Pro", "Trebuchet MS", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif',
                        fontColor: "yellow"
                    });
                    chartPie.theme.series.stroke.color = 'transparent';
                    chartPie.theme.axis.stroke.color = 'transparent';
                    chartPie.theme.axis.tick.fontColor = 'transparent';
                    chartPie.theme.axis.tick.color = 'transparent';
                    break;
            }
            chartPie.theme.chart.fill = '#1E1E1E';
            chartPie.theme.chart.stroke = 'transparent';
            //chartPie.theme.series.stroke.color = '#353535';
            chartPie.theme.series.stroke.width = '1';
            chartPie.theme.plotarea.fill = '#1E1E1E';
            chartPie.theme.plotarea.stroke = '#1E1E1E';
            new dc.action2d.Highlight(chartPie, 'default');
            new dojox.charting.action2d.MoveSlice(chartPie);
            new dc.action2d.Tooltip(chartPie, 'default', {
                text: function (o) {
                    return numberWithCommas(o.run.data[o.index].tooltip);
                }
            });
            chartPie.render();
            if (parent == 'ChartPie') {
                chartPie.connectToPlot('default', function (evt) {
                    if (evt.type == 'onclick') {
                        switch (evt.element) {
                            case 'slice':
                                data = evt.run.data[evt.x];
                                ary = data.text.split(' ');
                                break;
                            default:
                                ary = evt.y.text.split(' ');
                        }
                        opts = dijit.byId('selectCatagory').getOptions();
                        filteredArr = dojo.filter(opts, function (opt) {
                            aary = opt.value.split('_');
                            return aary[2] == ary[0];
                        });
                        dijit.byId('selectCatagory').set('value', filteredArr[0].value);
                    }
                });
            }
        });
        if (parent == 'ChartPie') {
            if (dijit.byId('selectPie_' + parent).get('value') != 'BAR') {
                chartPieLegend = new dojox.charting.widget.Legend({
                    chartRef: chartPie,
                    horizontal: false
                });
                dijit.byId('chartPie_legend').set('content', chartPieLegend);
            }
        }
    } catch (err) {
        eh(err, 'finishPie');
    } finally {
        hideLW('divWorking_Pie');
        p = dojo.byId(parent);
        chartPie.resize(p.clientWidth, p.clientHeight);
    }
}

function reloadData(evt) {
    try {
        closeMax_onclick();
        getAnalysisVars();
        buildPie('ChartPie');
        buildSummaryTable('ChartToDateSummary');
        setLyrDefs();
        buildHistogram('MainHistogram');
        toggleLayerVisibility();
        mapChartRenderType_onChange(dijit.byId('mapChartRenderType').get('value'));
    } catch (err) {
        eh(err, "reloadData");
    }
}

function IsNumeric(val) {
    return Number(parseFloat(val)) === val;
}

function cleanUp() {
    mapChart.infoWindow.hide();
    clusterLayer.clearSingles();
}

function tick() {
    var mins = new Date().getMinutes();
    if (mins == "00" || mins == "30") {
        reloadData(null);
    }
}

function buildInititalCharts() {
    try {
        updateWorking('loading initial chart data ...');
        sel = new dijit.form.Select({
            id: "chartHistogram_MainHistogram",
            name: "chartHistogram_MainHistogram",
            style: "width: 55px",
            autoWidth: false,
            options: [{ value: 'BAR_DAY', label: "<img width='16px' height='16px' src='img/columns.png' style='vertical-align: middle;'/><label style='vertical-align: middle; padding-left: 4px;'>by day</label>", selected: true }, { value: 'LINE_DAY', label: "<img width='16px' height='16px' src='img/lines.png' style='vertical-align: middle;'/><label style='vertical-align: middle; padding-left: 4px;'>by day</label>" }, { value: 'BAR_WEEK', label: "<img width='16px' height='16px' src='img/columns.png' style='vertical-align: middle;'/><label style='vertical-align: middle; padding-left: 4px;'>by 52 wk</label>", selected: true }, { value: 'LINE_WEEK', label: "<img width='16px' height='16px' src='img/lines.png'  style='vertical-align: middle;'/><label style='vertical-align: middle; padding-left: 4px;'>by 52 wk</label>" }],
            onChange: function (evt) {
                if (evt === 'BAR_DAY' || evt === 'LINE_DAY') {
                    dojo.replaceClass('pane52Week', 'gcPaneBorderBackgound', 'gcPaneBorderBackgound_Hist');
                    dojo.replaceClass('pane52WeekTitle', 'gcTitlePaneBackground', 'gcTitlePaneBackground_Hist');
                    dojo.replaceClass('pane52WeekBottom', 'gcTitlePaneBackgroundBottom', 'gcTitlePaneBackgroundBottom_Hist');
                    dojo.replaceClass('paneHeatIndex', 'gcPaneBorderBackgound', 'gcPaneBorderBackgound_Hist');
                    dojo.replaceClass('paneHeatIndexTitle', 'gcTitlePaneBackground', 'gcTitlePaneBackground_Hist');
                    dojo.replaceClass('paneHeatIndexBottom', 'gcTitlePaneBackgroundBottom', 'gcTitlePaneBackgroundBottom_Hist');
                } else {
                    dojo.replaceClass('pane52Week', 'gcPaneBorderBackgound_Hist', 'gcPaneBorderBackgound');
                    dojo.replaceClass('pane52WeekTitle', 'gcTitlePaneBackground_Hist', 'gcTitlePaneBackground');
                    dojo.replaceClass('pane52WeekBottom', 'gcTitlePaneBackgroundBottom_Hist', 'gcTitlePaneBackgroundBottom');
                    dojo.replaceClass('paneHeatIndex', 'gcPaneBorderBackgound_Hist', 'gcPaneBorderBackgound');
                    dojo.replaceClass('paneHeatIndexTitle', 'gcTitlePaneBackground_Hist', 'gcTitlePaneBackground');
                    dojo.replaceClass('paneHeatIndexBottom', 'gcTitlePaneBackgroundBottom_Hist', 'gcTitlePaneBackgroundBottom');
                }
                buildHistogram('MainHistogram')
            }
        });
        dojo.byId('tdChartHistogram_Main').appendChild(sel.domNode);
        sel.startup();

        sel = new dijit.form.Select({
            id: "chartHistogram_MaxContent",
            name: "chartHistogram_MaxContent",
            options: [{ value: 'BAR_DAY', label: "<img width='16px' height='16px' src='img/columns.png' style='vertical-align: middle;'/><label style='vertical-align: middle; padding-left: 4px;'>by day</label>", selected: true }, { value: 'LINE_DAY', label: "<img width='16px' height='16px' src='img/lines.png' style='vertical-align: middle;'/><label style='vertical-align: middle; padding-left: 4px;'>by day</label>" }, { value: 'BAR_WEEK', label: "<img width='16px' height='16px' src='img/columns.png' style='vertical-align: middle;'/><label style='vertical-align: middle; padding-left: 4px;'>by 52 wk</label>", selected: true }, { value: 'LINE_WEEK', label: "<img width='16px' height='16px' src='img/lines.png'  style='vertical-align: middle;'/><label style='vertical-align: middle; padding-left: 4px;'>by 52 wk</label>" }],
            onChange: function (evt) {
                buildHistogram('MaxContent')
            }
        });
        dojo.byId('tdChartHistogram_MaxContent').appendChild(sel.domNode);
        sel.startup();

        sel = new dijit.form.Select({
            id: "selectPie_ChartPie",
            name: "selectPie_ChartPie",
            style: "width: 60px",
            autoWidth: false,
            options: [{ value: 'BAR', label: "<img width='16px' height='16px' src='img/bars.png' style='vertical-align: middle;'/>", selected: true }, { value: 'PIE', label: "<img width='16px' height='16px' src='img/pie.png'/>" }],
            onChange: function (evt) {
                buildPie('ChartPie');
            }
        });
        dojo.byId('tdSelectPie').appendChild(sel.domNode);
        sel.startup();

        sel = new dijit.form.Select({
            id: "selectPie_MaxContent",
            name: "selectPie_MaxContent",
            options: [{ value: 'BAR', label: "<img width='16px' height='16px' src='img/bars.png' style='vertical-align: middle;'/>", selected: true }, { value: 'PIE', label: "<img width='16px' height='16px' src='img/pie.png'/>" }],
            onChange: function (evt) {
                buildPie('MaxContent');
            }
        });
        dojo.byId('tdChartPie_MaxContent').appendChild(sel.domNode);
        sel.startup();

        dijit.byId('selectPie_MaxContent').set('options', [{ value: 'BAR', label: "<img width='16px' height='16px' src='img/bars.png' style='vertical-align: middle;'/>", selected: true }, { value: 'PIE', label: "<img width='16px' height='16px' src='img/pie.png'/>" }]);

        sel = new dijit.form.Select({
            id: "selectHeatChart_MainHeatTable",
            name: "selectHeatChart_MainHeatTable",
            style: "width: 55px",
            autoWidth: false,
            options: [{ value: 'HEATINDEXGRID', label: "<img width='16px' height='16px' src='img/grid.png' style='vertical-align: middle;'/>", selected: true }, { value: 'HEATINDEXLINE', label: "<img width='16px' height='16px' src='img/lines.png'/>" }],
            onChange: selectHeatChart_onChange
        });
        dojo.byId('tdSelectHeatChart_MainHeatTable').appendChild(sel.domNode);
        sel.startup();

        sel = new dijit.form.Select({
            id: "selectHeatChart_MaxContent",
            name: "selectHeatChart_MaxContent",
            options: [{ value: 'HEATINDEXGRID', label: "<img width='16px' height='16px' src='img/grid.png' style='vertical-align: middle;'/>", selected: true }, { value: 'HEATINDEXLINE', label: "<img width='16px' height='16px' src='img/lines.png'/>" }],
            onChange: selectHeatChartMaxContent_onChange
        });
        dojo.byId('tdSelectHeatChart_MaxContent').appendChild(sel.domNode);
        sel.startup();

        sel = new dijit.form.Select({
            id: "selectSummarySort_ChartToDateSummary",
            name: "selectSummarySort_ChartToDateSummary",
            style: "width: 55px",
            autoWidth: false,
            options: [{ value: 'Category:A', label: 'Category', selected: true }, { value: 'TDY:D', label: 'Today' }, { value: 'LYWK:D', label: 'Week Last Year' }, { value: 'WTD:D', label: 'Week To Date' }, { value: 'MTD:D', label: 'Month To Date' }, { value: 'YTD:D', label: 'Year To Date' }],
            onChange: function (evt) { buildSummaryTable('ChartToDateSummary'); }
        });
        dojo.byId('tdSummarySort').appendChild(sel.domNode);
        sel.startup();
        getAnalysisVars();
        setLyrDefs();
        buildPie('ChartPie');
        buildSummaryTable('ChartToDateSummary');
        buildHistogram('MainHistogram');
        toggleLayerVisibility();
    } catch (err) {
        eh(err, 'buildInititalCharts');
    }
}

function setLyrDefs() {
    log('setting layer definitions ...');
    try {
        lv_grp = getGroupByPart(crime_part, dataConfig[0]);
        weeklyr = mapChart.getLayer(crime_part + ' ' + '52 weeks');
        filteredAry = dojo.filter(lv_grp.events, function (evnt) {
            return evnt.eventTitle == crime_days;
        });
        lv_event = filteredAry[0];
        daylyr = mapChart.getLayer(crime_part + ' ' + crime_days);
        lv_categoryType = dijit.byId('selectCatagory').get('value');
        lv_category = lv_categoryType.split('_');
        f_category = (lv_category[1] == 'ALL') ? crime_part : lv_category[1];
        codeField = getCodeFieldByPart(crime_part, dataConfig[0]);
        byCode = '';
        if (lv_category[1] != 'ALL') {
            codes = findCategoryCodes(crime_part, lv_category[1], dataConfig[0]);
            byCode = codeField + " IN (" + codes + ")";
        } else {
            //            scode = '';
            //            allcodes = lv_grp.allCodes.split(',');
            //            dojo.forEach(allcodes, function (c) {
            //                (scode == '') ? scode += "'" + c + "'" : scode += ",'" + c + "'";
            //            });
            //            byCode = codeField + " IN (" + scode + ")";
        }
        lv_gl = getGeoLayer();
        lv_dstrct = lv_gl.value.split('|');
        shifts = '';
        if (crime_shift !== 'ALL' && lv_grp.shiftField !== '') {
            shifts = lv_grp.table + '.' + lv_grp.shiftField + " IN ('" + crime_shift.split(",").join("','") + "')";
        } else if (crime_shift !== 'ALL' && lv_grp.shiftField === '') {
            //var sft = dojo.filter(shiftObj, function (item) {
            //    return item.code === crime_shift;
            //});
            //var sand = '';
            //dojo.forEach(sft[0].times, function (t) {
            //    sand = (shifts !== '') ? " OR " : "";
            //    shifts += sand + "(" + lv_grp.table + ".BCS_DOW IN ('" + t.days.split(",").join("','") + "') AND (" + lv_grp.table + ".BCS_HMM >= " + t.starttime + " AND " + lv_grp.table + ".BCS_HMM < " + t.endtime + "))";
            //});
            //shifts = (shifts !== '') ? "(" + shifts + ")" : "";
        }
        dClause = '';
        if (lv_dstrct[1] != 'ALL') {
            lv_lbl = lv_gl.label.split(':');
            lv_district = dojo.trim(lv_lbl[1]);
            lv_field = getGeoEventField(crime_part);
            if (lv_field != '') {
                dClause = lv_field + " = '" + lv_district + "'";
            }
        }
        dayparts = crime_days.split(' ');
        startDate = getStartDate_BCS(parseInt(dayparts[0]));
        endDate = dojo.date.locale.format(new Date(), {
            selector: 'date',
            datePattern: 'yyyyMMdd'
        });
        var definitionClause = '(' + lv_grp.table + '.BCS_YMD >= ' + startDate + ' AND ' + lv_grp.table + '.BCS_YMD < ' + endDate + ')';
        definitionClause += (definitionClause == '') ? (dClause) ? dClause : "" : (dClause) ? " AND " + dClause : "";
        definitionClause += (definitionClause == '') ? (byCode) ? byCode : "" : (byCode) ? " AND " + byCode : "";
        definitionClause += (definitionClause == '') ? (shifts) ? shifts : "" : (shifts) ? " AND " + shifts : "";

        var week_definitionClause = '';
        week_definitionClause += (week_definitionClause == '') ? (dClause) ? dClause : "" : (dClause) ? " AND " + dClause : "";
        week_definitionClause += (week_definitionClause == '') ? (byCode) ? byCode : "" : (byCode) ? " AND " + byCode : "";
        week_definitionClause += (week_definitionClause == '') ? (shifts) ? shifts : "" : (shifts) ? " AND " + shifts : "";

        log(definitionClause);
        if (definitionClause) {
            if (definitionClause !== daylyr.getDefinitionExpression()) {
                daylyr.setDefinitionExpression(definitionClause);
            }
        } else {
            daylyr.setDefinitionExpression(null);
        }
        if (week_definitionClause) {
            if (week_definitionClause !== weeklyr.getDefinitionExpression()) {
                weeklyr.setDefinitionExpression(week_definitionClause);
            }
        } else {
            weeklyr.setDefinitionExpression(null);
        }
    } catch (err) {
        eh(err, 'setLyrDefs');
    }
}

Date.prototype.getDOY = function () {
    var onejan = new Date(this.getFullYear(), 0, 1);
    var yearFirstDay = Math.floor(onejan / 86400000);
    var thisDay = Math.ceil((this.getTime()) / 86400000);
    //return Math.ceil((this - onejan) / 86400000);
    return thisDay - yearFirstDay;
}

function getDOYfromAttribute(val) {
    var inputDate = new Date(val);
    var tzoffset = inputDate.getTimezoneOffset();
    inputDate.setTime(inputDate.getTime() + (tzoffset * 60 * 1000));
    var onejan = new Date(inputDate.getFullYear(), 0, 1);
    var yearFirstDay = Math.floor(onejan / 86400000);
    var thisDay = Math.ceil((inputDate.getTime()) / 86400000);
    return thisDay - yearFirstDay;
}

function databaseDate(val) {
    var inputDate = new Date(val);
    var tzoffset = inputDate.getTimezoneOffset();
    return dojo.date.add(inputDate, 'minute', tzoffset);
}

function calcOffset() {
    return (mapChart.extent.getWidth() / mapChart.width);
}

function getStartDate_BCS(days) {
    var ssDate = new Date();
    //ssDate.setHours(0, 0, 0);
    ssDate.setTime(ssDate.getTime() - (days * 24 * 60 * 60 * 1000));
    return dojo.date.locale.format(ssDate, {
        selector: 'date',
        datePattern: 'yyyyMMdd'
    });
}

//function paneOpen(elm) {
//    dojo.byId('AVLPanePage').className = 'myhideG';
//    dojo.byId('CallsPanePage').className = 'myhideG';
//    dojo.byId('TOCPanePage').className = 'myhideG';
//    dojo.byId('BasemapPanePage').className = 'myhideG';
//    dojo.byId(elm).className = 'myshowG';
//    toggleRightPaneOpen('OPEN');
//    dijit.byId('togglePanesMain').resize();
//    dijit.byId(elm).resize();
//}

function rgba(r, g, b, a) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

//function toggleRightPaneOpen(oc) {
//    if (oc == 'OPEN') {
//        dojo.replaceClass('togglePanes', 'rightShow', 'rightHide');
//    } else {
//        dojo.replaceClass('togglePanes', 'rightHide', 'rightShow');
//    }
//    dijit.byId('togglePanesMain').resize();
//    dijit.byId('mapPane').resize();
//    dijit.byId('togglePanes').resize();
//}

function ColorLuminance(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }
    return rgb;
}

function swapStyleSheet(elm, sheet) {
    document.getElementById(elm).setAttribute("href", sheet);
}

function RemoveChildren(parentNode) {
    require(["dojo/dom-construct"], function (domConstruct) {
        if (parentNode) {
            domConstruct.empty(parentNode.id);
        }
    });
}

function blur() {
    require(["dijit/focus"], function (focusUtil) {
        focusUtil.curNode && focusUtil.curNode.blur();
    });
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getDateOfWeek(weekNumber, year) {
    return new Date(year, 0, 1 + ((weekNumber - 1) * 7));
}

Date.prototype.getWeek = function () {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

function roundNumber(number, decimal_points) {
    try {
        if (!decimal_points)
            return Math.round(number);
        if (number == 0) {
            var decimals = "";
            for (var i = 0; i < decimal_points; i++)
                decimals += "0";
            return "0." + decimals;
        }

        var exponent = Math.pow(10, decimal_points);
        var num = Math.round((number * exponent)).toString();
        return num.slice(0, -1 * decimal_points) + "." + num.slice(-1 * decimal_points);
    } catch (err) {
        eh(err, "roundNumber");
    }
}

function sortByKey(array, key, order) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        if (typeof x == "string") {
            x = dojo.trim(x.toLowerCase());
            y = dojo.trim(y.toLowerCase());
        }
        if (order == 'A') {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        } else {
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        }
    });
}

var DataGrouper = (function () {
    var has = function (obj, target) {
        return _.any(obj, function (value) {
            return _.isEqual(value, target);
        });
    };

    var keys = function (data, names) {
        return _.reduce(data, function (memo, item) {
            var key = _.pick(item, names);
            if (!has(memo, key)) {
                memo.push(key);
            }
            return memo;
        }, []);
    };

    var group = function (data, names) {
        var stems = keys(data, names);
        return _.map(stems, function (stem) {
            return {
                key: stem,
                vals: _.map(_.where(data, stem), function (item) {
                    return _.omit(item, names);
                })
            };
        });
    };

    group.register = function (name, converter) {
        return group[name] = function (data, names) {
            return _.map(group(data, names), converter);
        };
    };

    return group;
}());

function returnDateWithOffset(val) {
    var inputDate = new Date(val);
    var tzoffset = inputDate.getTimezoneOffset();
    return dojo.date.add(inputDate, 'minute', tzoffset);
}

function formatDateIW(value, key, data) {
    var val;
    if (value instanceof Array) {
        val = value[0];
    } else {
        val = value;
    }
    if (val == null || val == 'null' || val == '') {
        return '<font color="#C0C0C0"><em>null</em></font>';
    } else {
        var inputDate = new Date(val);
        var tzoffset = inputDate.getTimezoneOffset();
        var utctime = dojo.date.add(inputDate, 'minute', tzoffset);
        return dojo.date.locale.format(utctime, {
            selector: 'date',
            datePattern: 'yyyy-MM-dd'
        });
    }
}

function openMax_onclick(elm) {
    RemoveChildren(dojo.byId('MaxContent'));
    aryOfTDs = ['tdChartHistogram_MaxContent', 'tdSummarySort_MaxContent', 'tdChartPie_MaxContent', 'tdSelectHeatChart_MaxContent', 'tdWeekDaySelector_MaxContent'];
    dojo.forEach(aryOfTDs, function (itm) {
        dojo.byId(itm).style.display = 'none';
    });
    dojo.byId('dialogMaximize').style.display = 'block';
    dojo.replaceClass('dialogMaximize', 'opacityShowAnimation', 'opacityHideAnimation');
    dojo.replaceClass('divMaximize', 'showContainer', 'hideContainer');
    switch (elm) {
        case 'Summary':
            dojo.byId('tdSummarySort_MaxContent').style.display = 'block';
            buildSummaryTable('MaxContent');
            dojo.byId('MaxContent').style.overflow = 'auto';
            break;
        case 'Pie':
            dojo.byId('tdChartPie_MaxContent').style.display = 'block';
            val = dijit.byId('selectPie_ChartPie').get('value');
            dijit.byId('selectPie_MaxContent').set('value', val);
            buildPie('MaxContent');
            dojo.byId('MaxContent').style.overflow = 'hidden';
            break;
        case 'HeatChartDays':
            dojo.byId('tdSelectHeatChartDays_MaxContent').style.display = 'block';
            if (dijit.byId('selectHeatChartDays_MainHeatTableDays').get('value') === 'HEATINDEXGRID') {
                dojo.byId('tdWeekDaySelectorDays_MaxContent').style.display = 'none';
                buildHeatIndexDays('MaxContent');
            } else {
                dojo.byId('tdWeekDaySelectorDays_MaxContent').style.display = 'block';
                buildTimeLineDays('MaxContent');
            }
            dojo.byId('MaxContent').style.overflow = 'hidden';
            break;
        case 'LastDays':
            dojo.byId('tdChartTypeLastDays_MaxContent').style.display = 'block';
            dijit.byId('chartTypeLastDays_MaxContent').set('value', dijit.byId('chartTypeLastDays_MainLastDays').get('value'));
            buildLastDays('MaxContent');
            dojo.byId('MaxContent').style.overflow = 'hidden';
            break;
        case '52Weeks':
            dojo.byId('tdChartHistogram_MaxContent').style.display = 'block';
            dijit.byId('chartHistogram_MaxContent').set('value', dijit.byId('chartHistogram_MainHistogram').get('value'));
            buildHistogram('MaxContent');
            dojo.byId('MaxContent').style.overflow = 'hidden';
            break;
        case 'HeatChart':
            dojo.byId('tdSelectHeatChart_MaxContent').style.display = 'block';
            if (dijit.byId('selectHeatChart_MainHeatTable').get('value') === 'HEATINDEXGRID') {
                dojo.byId('tdWeekDaySelector_MaxContent').style.display = 'none';
                buildHeatIndex('MaxContent');
            } else {
                dojo.byId('tdWeekDaySelector_MaxContent').style.display = 'block';
                buildTimeLine('MaxContent');
            }
            dojo.byId('MaxContent').style.overflow = 'hidden';
            break;

    }
    dijit.byId('divMaximize').resize();
}

function closeMax_onclick() {
    buildPie('ChartPie');
    RemoveChildren(dojo.byId('MaxContent'));
    dojo.replaceClass('divMaximize', 'hideContainer', 'showContainer');
    dojo.replaceClass('dialogMaximize', 'opacityHideAnimation', 'opacityShowAnimation');
    aryOfTDs = ['tdChartHistogram_MaxContent', 'tdSummarySort_MaxContent', 'tdChartPie_MaxContent', 'tdSelectHeatChart_MaxContent'];
    dojo.forEach(aryOfTDs, function (itm) {
        dojo.byId(itm).style.display = 'none';
    });
}

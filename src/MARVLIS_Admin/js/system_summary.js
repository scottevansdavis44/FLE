function getSummaryTableConfig(part, wk, msg) {
    filteredArr = dojo.filter(msg.items, function (item) {
        return item.part == part && item.eventTitle == wk;
    });
    return filteredArr;
}

function getCategoryCount(events, itm) {
    filteredArr = dojo.filter(events, function (item) {
        return item.category == itm;
    });
    return filteredArr[0].y;
}

function buildSummaryTable(parent) {
    showLW('divWorking_Summary');
    try {
        //categories = getCategoriesByPart(crime_part, dataConfig[0]);
        var req = esri.request({
            url: adminSOE + 'getSummary',
            handleAs: 'json',
            content: {
                titles: 'TDY LYWK WTD MTD YTD',
                group: crime_part,
                zonefield: crime_geolayer_filter_field,
                zone: crime_geolayer_filter_district,
                shift: crime_shift,
                f: 'json'
            },
            callbackParamName: 'callback',
            load: function (msg, args) {
                TDY_categories = getSummaryTableConfig(crime_part, 'TDY', msg);
                LYWK_categories = getSummaryTableConfig(crime_part, 'LYWK', msg);
                WTD_categories = getSummaryTableConfig(crime_part, 'WTD', msg);
                MTD_categories = getSummaryTableConfig(crime_part, 'MTD', msg);
                YTD_categories = getSummaryTableConfig(crime_part, 'YTD', msg);
                sortAry = [];
                dojo.forEach(LYWK_categories, function (cat, oe) {
                    sortAry.push({ 'Category': cat.category, 'abbr': cat.abbr, 'TDY': TDY_categories[oe].y, 'LYWK': LYWK_categories[oe].y, 'WTD': WTD_categories[oe].y, 'MTD': MTD_categories[oe].y, 'YTD': YTD_categories[oe].y });
                });
                evt = dijit.byId('selectSummarySort_' + parent).get('value');
                stval = evt.split(':');
                sortAry = sortByKey(sortAry, stval[0], stval[1]);
                buildFinalTable(parent, stval, sortAry);
                hideLW('divWorking_Summary');
            },
            error: function (e, args) {
                eh(e, 'getSummary_summary');
            }
        });
    } catch (err) {
        eh(err, 'buildSummaryTable');
    } finally {
        //hideLW('divWorking_Summary');
    }
}

function buildFinalTable(parent, stval, sortAry) {
    RemoveChildren(dojo.byId(parent));
    var to = dojo.create('table', {
        class: 'summaryTable_' + parent
    }, null, 'only');
    //to.border = 1;
    var tt = dojo.create('tbody', null, to);
    row = dojo.create('tr', null, tt, 'last');
    td = dojo.create('td', {
        innerHTML: 'Category',
        class: (stval[0] == 'Category') ? 'cellHeaderSorted_' + parent : 'cellHeader_' + parent
    }, row, 'last');
    td.onclick = function () { dijit.byId('selectSummarySort_' + parent).set('value', 'Category:A'); };
    td = dojo.create('td', {
        innerHTML: (parent == 'MaxContent') ? 'Today' : 'TDY',
        class: (stval[0] == 'TDY') ? 'cellHeaderSorted_' + parent : 'cellHeader_' + parent
    }, row, 'last');
    td.onclick = function () { dijit.byId('selectSummarySort_' + parent).set('value', 'TDY:D'); };
    td = dojo.create('td', {
        innerHTML: (parent == 'MaxContent') ? 'Last Year Week' : 'LYWK',
        class: (stval[0] == 'LYWK') ? 'cellHeaderSorted_' + parent : 'cellHeader_' + parent
    }, row, 'last');
    td.onclick = function () { dijit.byId('selectSummarySort_' + parent).set('value', 'LYWK:D'); };
    td = dojo.create('td', {
        innerHTML: (parent == 'MaxContent') ? 'Week To Date' : 'WTD',
        class: (stval[0] == 'WTD') ? 'cellHeaderSorted_' + parent : 'cellHeader_' + parent
    }, row, 'last');
    td.onclick = function () { dijit.byId('selectSummarySort_' + parent).set('value', 'WTD:D'); };
    td = dojo.create('td', {
        innerHTML: (parent == 'MaxContent') ? 'Month To Date' : 'MTD',
        class: (stval[0] == 'MTD') ? 'cellHeaderSorted_' + parent : 'cellHeader_' + parent
    }, row, 'last');
    td.onclick = function () { dijit.byId('selectSummarySort_' + parent).set('value', 'MTD:D'); };
    td = dojo.create('td', {
        innerHTML: (parent == 'MaxContent') ? 'Year To Date' : 'YTD',
        class: (stval[0] == 'YTD') ? 'cellHeaderSorted_' + parent : 'cellHeader_' + parent
    }, row, 'last');
    td.onclick = function () { dijit.byId('selectSummarySort_' + parent).set('value', 'YTD:D'); };

    dojo.forEach(sortAry, function (cat, oe) {
        row = dojo.create('tr', { class: (cat.Category == crime_summary_selected_category) ? 'cellSelected' : '' }, tt, 'last');
        (oe % 2 == 0) ? roe = ' cellEven' : roe = ' cellOdd';
        td = dojo.create('td', {
            innerHTML: (parent == 'MaxContent') ? cat.Category : cat.Category + ' (' + cat.abbr + ')',
            class: 'cellCategory_' + parent + roe
        }, row, 'last');
        td.setAttribute('abbr', cat.abbr);
        if (parent == 'ChartToDateSummary') {
            td.onclick = function () {
                var abbr = this.getAttribute('abbr');
                opts = dijit.byId('selectCatagory').getOptions();
                filteredArr = dojo.filter(opts, function (opt) {
                    ary = opt.value.split('_');
                    return ary[2] == abbr;
                });
                crime_summary_selected_category = filteredArr[0].label;
                dijit.byId('selectCatagory').set('value', filteredArr[0].value);
            };
        }
        dojo.create('td', {
            innerHTML: numberWithCommas(cat.TDY),
            class: 'cellNumbers' + roe
        }, row, 'last');
        dojo.create('td', {
            innerHTML: numberWithCommas(cat.LYWK),
            class: 'cellNumbers' + roe
        }, row, 'last');
        dojo.create('td', {
            innerHTML: numberWithCommas(cat.WTD),
            class: 'cellNumbers' + roe
        }, row, 'last');
        dojo.create('td', {
            innerHTML: numberWithCommas(cat.MTD),
            class: 'cellNumbers' + roe
        }, row, 'last');
        dojo.create('td', {
            innerHTML: numberWithCommas(cat.YTD),
            class: 'cellNumbers' + roe
        }, row, 'last');
    });
    dojo.byId('lbl' + parent).innerHTML = crime_part + ' To Date (' + crime_geolayer_filter_district + ')';
    dojo.byId(parent).appendChild(to);
}

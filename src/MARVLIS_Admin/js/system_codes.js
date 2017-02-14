function toggleCodeCategory(evt) {
    try {
        log('toggleCodeCategory');
        blur();
        var inputs = dojo.query('.btnMainStats');
        for (var i = 0, il = inputs.length; i < il; i++) {
            nm = inputs[i].attributes[2].value;
            dijit.byId(nm).set('checked', (nm == evt.id));
        }
        //categoryValue = evt.value;
        catitems = getCategoriesByPart(evt.value, dataConfig[0]);
        opts = [];
        dojo.forEach(catitems, function (itm) {
            opts.push({ value: evt.value + '_' + itm.category + '_' + itm.abbr, label: itm.category, selected: false });
        });
        opts.unshift({ value: evt.value + '_ALL_' + evt.value, label: "<div class='geoZoom'>" + evt.value + "</div>", selected: true });
        dijit.byId('selectCatagory').removeOption(dijit.byId('selectCatagory').getOptions());
        dijit.byId('selectCatagory').options = opts;
        dijit.byId('selectCatagory').set('value', evt.value + '_ALL_' + evt.value);

        grp = getGroupByPart(evt.value, dataConfig[0]);
        dojo.byId('shiftSelector').style.visibility = (grp.shiftField) ? 'visible' : 'hidden';
        //dojo.byId('shiftSelector').style.display = (grp.shiftField) ? 'block' : 'none';
        //dijit.byId('shiftSelector').set("disabled", (grp.shiftField) ? true : false);
    } catch (err) {
        eh(err, 'toggleCodeCategory');
    }
}

function getGroupByPart(part, config) {
    filteredAry = dojo.filter(config.groups, function (item) {
        return item.title == part;
    });
    return filteredAry[0];
}

function getCategoriesByPart(part, config) {
    ary = [];
    filteredAry = dojo.filter(config.groups, function (item) {
        return item.title == part;
    });
    dojo.forEach(filteredAry[0].codeTable, function (cat) {
        if (cat.part == part || part.toUpperCase() == 'ALL') {
            ary.push({ 'category': cat.category, 'abbr': cat.abbr });
        }
    });
    ary = sortByKey(ary, 'category', 'A');
    return ary;
}

function getCodeFieldByPart(part, config) {
    filteredAry = dojo.filter(config.groups, function (item) {
        return item.title == part;
    });
    return filteredAry[0].table + '.' + filteredAry[0].codeFieldName;
}

function findCategoryAbbr(part, category, config) {
    filteredAry = dojo.filter(config.groups, function (item) {
        return item.title == part;
    });
    group = dojo.filter(config.groups, function (item) {
        return item.title == part;
    });
    filteredAry = dojo.filter(group[0].codeTable, function (item) {
        return item.category == category;
    });
    return filteredAry[0].abbr;
}

function findCategoryCodes(part, category, config) {
    group = dojo.filter(config.groups, function (item) {
        return item.title == part;
    });
    filteredAry = dojo.filter(group[0].codeTable, function (item) {
        return item.category == category;
    });
    scode = '';
    dojo.forEach(filteredAry[0].codes, function (code) {
        (scode == '') ? scode += "'" + code + "'" : scode += ",'" + code + "'";
    });
    return scode;
}

function findCategoryColor(part, category, config) {
    group = dojo.filter(config.groups, function (item) {
        return item.title == part;
    });
    filteredAry = dojo.filter(group[0].codeTable, function (item) {
        return item.category == category;
    });
    if (filteredAry.length > 0) {
        return filteredAry[0].color;
    } else {
        return '#0026FF';
    }
}

function findCategoryByCode(code, config) {
    filteredAry = dojo.filter(config.codeTable, function (item) {
        return item.codes.indexOf(code) > -1;
    });
    if (filteredAry.length > 0) {
        return filteredAry[0].category;
    } else {
        return null;
    }
}

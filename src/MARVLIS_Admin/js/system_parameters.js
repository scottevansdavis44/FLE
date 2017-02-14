//crime type (based on the toggle)
var crime_part;
//shift values
var crime_shift;
//filter value based on poly based zones
var crime_geolayer_filter;
//crime_geolayer_filter district value
var crime_geolayer_filter_district;
//crime_geolayer_filter district field
var crime_geolayer_filter_field;
//crime event group settings
var crime_group_by_part;
//code category (full name)
var crime_code_category;
//code category (for SOE)
var crime_code_category_SOE;
//code category (abbr name)
var crime_code_category_abbr;
//days selected
var crime_days;
//selected summary table row category value
var crime_summary_selected_category = null;

var geometryService = null;

function getAnalysisVars() {
    crime_part = getMainStatsValue();
    crime_shift = dijit.byId("selectShift").get('value');
    crime_geolayer_filter = getGeoLayer();
    crime_group_by_part = getGroupByPart(crime_part, dataConfig[0]);
    crime_days = dijit.byId('selectDay').get('value');
    var vvv = dijit.byId('selectDistrict');
    filteredArr = dojo.filter(dataConfig[0].groups, function (item) {
        return item.title === crime_part;
    });
    dojo.forEach(dijit.byId('selectDistrict').getOptions(), function (opt) {
        ary = opt.value.split('|');
        switch (ary[2]) {
            case 'Patrol Zones':
                opt.disabled = (!filteredArr[0].patrolField);
                break;
            case 'Sectors':
                opt.disabled = (!filteredArr[0].sectorField);
                break;
            case 'Districts':
                opt.disabled = (!filteredArr[0].districtField);
                break;
        }
    });
    dijit.byId('selectDistrict').startup();
    filteredArr = dojo.filter(dijit.byId('selectDistrict').getOptions(), function (opt) {
        return opt.selected;
    });
    if (filteredArr[0].selected && filteredArr[0].disabled) {
        filteredA = dojo.filter(dijit.byId('selectDistrict').getOptions(), function (opt) {
            a = opt.value.split('|');
            return !opt.disabled && a[1] === 'ALL';
        });
        dijit.byId('selectDistrict').set('value', filteredA[0].value, false);
    } else {
        //frst = dijit.byId('selectDistrict').getOptions(0);
        //a = filteredArr[0].value.split('|');
        //if (!frst.disabled && a[1] === 'ALL') {
        //    dijit.byId('selectDistrict').set('value', dijit.byId('selectDistrict').getOptions(0).value, false);
        //}
    }
    dstrct = crime_geolayer_filter.value.split('|');
    qk = geoLayers[parseInt(dstrct[0])];
    if (dstrct[1] === 'ALL') {
        crime_geolayer_filter_district = 'ALL';
        crime_geolayer_filter_field = '';
    } else {
        lbl = crime_geolayer_filter.label.split(':');
        typ = dojo.trim(lbl[0]);
        crime_geolayer_filter_district = dojo.trim(lbl[1]);
        switch (typ) {
            case 'IRA':
                crime_geolayer_filter_field = crime_group_by_part.iraField;
                break;
            case 'Patrol Zone':
                crime_geolayer_filter_field = crime_group_by_part.patrolField;
                break;
            case 'Sector':
                crime_geolayer_filter_field = crime_group_by_part.sectorField;
                break;
            case 'District':
                crime_geolayer_filter_field = crime_group_by_part.districtField;
                break;
        }
    }

    categoryType = dijit.byId('selectCatagory').get('value');
    category = categoryType.split('_');
    crime_code_category = (category[1] === 'ALL') ? crime_part : category[1];
    crime_code_category_SOE = category[1];
    crime_code_category_abbr = category[2];

    log('crime_part: ' + crime_part);
    log('crime_shift: ' + crime_shift);
    log('crime_geolayer_filter: ' + crime_geolayer_filter.value);
    log('crime_geolayer_filter_district: ' + crime_geolayer_filter_district);
    log('crime_geolayer_filter_field: ' + crime_geolayer_filter_field);
    log('crime_code_category: ' + crime_code_category);
    log('crime_code_category_abbr: ' + crime_code_category_abbr);
}

function getMainStatsValue() {
    var inputs = dojo.query('.btnMainStats');
    for (var i = 0, il = inputs.length; i < il; i++) {
        nm = inputs[i].attributes[2].value;
        var dd = dijit.byId(nm);
        if (dijit.byId(nm).checked) {
            return dijit.byId(nm).value;
        }
    }
}

function getGeoLayer() {
    filteredArr = dojo.filter(dijit.byId('selectDistrict').getOptions(), function (opt) {
        return opt.selected;
    });
    return filteredArr[0];
}

function buildWeekWidget(rtn) {
    buildDateStringLabel();
    var opts = [];
    //current
    opts.push({
        value: [convertUTCToDate(startDate), convertUTCToDate(endDate)],
        label: 'Current Week',
        selected: true
    });
    //1 week before
    s = new Date(startDate);
    s.setDate(s.getDate() - rtn.reportDays);
    e = new Date(endDate);
    e.setDate(e.getDate() - rtn.reportDays);
    opts.push({
        value: [convertUTCToDate(s), convertUTCToDate(e)],
        label: 'Previous Week',
        selected: false
    });
    //2 weeks before
    s1 = new Date(s);
    s1.setDate(s1.getDate() - rtn.reportDays);
    e1 = new Date(e);
    e1.setDate(e1.getDate() - rtn.reportDays);
    opts.push({
        value: [convertUTCToDate(s1), convertUTCToDate(e1)],
        label: '2 Weeks Ago',
        selected: false
    });
    //3 weeks before
    s2 = new Date(s1);
    s2.setDate(s2.getDate() - rtn.reportDays);
    e2 = new Date(e1);
    e2.setDate(e2.getDate() - rtn.reportDays);
    opts.push({
        value: [convertUTCToDate(s2), convertUTCToDate(e2)],
        label: '3 Weeks Ago',
        selected: false
    });
    //all four weeks
    opts.push({
        value: [convertUTCToDate(s2), convertUTCToDate(endDate)],
        label: 'Cumulative (All 4 Weeks)',
        selected: false
    });

    if (dijit.byId('dttWeek')) {
        dijit.byId('dttWeek').destroy();
    }

    sel = new dijit.form.Select({
        id: "dttWeek",
        name: "dttWeek",
        maxHeight: 200,
        options: opts,
        value: opts[0].value,
        onChange: dttWeek_OnChange
    });
    dojo.byId('tdWeek').appendChild(sel.domNode);
    sel.startup();
    dojo.forEach(dataConfig, function (item) {
        item.eventServiceOpenCloseField.open = item.eventServiceOpenCloseField.open.split(',');
        item.eventServiceOpenCloseField.closed = item.eventServiceOpenCloseField.closed.split(',');
        item.eventServiceOpenCloseField.unknown = item.eventServiceOpenCloseField.unknown.split(',');
        dojo.forEach(item.eventServiceCrimeGroups, function (lyr) {
            lyr.codeTable = window[lyr.codeTable];
            lyr.codes = lyr.codes.split(',');
            lyr.infotemp = lyr.infotemp.replace(/\|/g, '<br />');
        });
    });
}

function dttWeek_OnChange(evt) {
    startDate = new Date(evt[0]);
    endDate = new Date(evt[1]);
    dojo.forEach(eventsTypes, function (item) {
        var weekDateQueryString = buildDateString(item.dateField, item.dbType);
        map.getLayer(item.id).setDefinitionExpression(weekDateQueryString);
    });
    startMonth = (startDate.getMonth() + 1 < 10) ? '0' + (startDate.getMonth() + 1) : (startDate.getMonth() + 1);
    startDay = (startDate.getDate() < 10) ? '0' + startDate.getDate() : startDate.getDate();
    endMonth = (endDate.getMonth() + 1 < 10) ? '0' + (endDate.getMonth() + 1) : (endDate.getMonth() + 1);
    endDay = (endDate.getDate() < 10) ? '0' + endDate.getDate() : endDate.getDate();
    buildDateStringLabel();
    if (isMain) {
        if (childWindow && childWindow.window) {
            childWindow.$(childWindow.document).trigger('childWindow', 'datechange|' + dojo.toJson(evt[0]) + '|' + dojo.toJson(evt[1]));
        }
    }
}

function buildDateStringLabel() {
  try {
    sformat = dojo.date.locale.format(startDate, {
      selector : 'date',
      datePattern : 'MM-dd'
    });
    eformat = dojo.date.locale.format(endDate, {
      selector : 'date',
      datePattern : 'MM-dd'
    });
    dojo.byId('lblDateRange').innerHTML = sformat + " to " + eformat;
  } catch (err) {
    eh(err, 'buildDateString');
    dojo.byId('lblDateRange').innerHTML = '';
  }
}

function ufocus() {
  require(["dijit/focus"], function(focusUtil) {
    focusUtil.curNode && focusUtil.curNode.blur();
  });
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function RemoveChildren(parentNode) {
  if (parentNode) {
    while (parentNode.hasChildNodes()) {
      parentNode.removeChild(parentNode.lastChild);
    }
  }
}

function convertUTCToDate(utc) {
  return (utc == '' || utc == null) ? null : dojo.date.locale.format(new Date(utc), {
    selector : 'date',
    datePattern : 'MM/dd/yyyy'
  });
}

function formatDateIW(value, key, data) {
  var val = ( value instanceof Array) ? value[0] : value;
  if (val == null || val == 'null' || val == '') {
    return '<font color="#C0C0C0"><em>null</em></font>';
  } else {
    var inputDate = new Date(val);
    return dojo.date.locale.format(dojo.date.add(inputDate, 'minute', inputDate.getTimezoneOffset()), {
      selector : 'date',
      datePattern : 'yyyy-MM-dd'
    });
  }
}

function hexToRgb(str) {
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/ig.test(str)) {
        var hex = str.substr(1);
        hex = hex.length == 3 ? hex.replace(/(.)/g, '$1$1') : hex;
        var rgb = parseInt(hex, 16);
        return [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255];
    }
}

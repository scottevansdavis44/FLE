require(['dojo/parser', 'dojo/_base/event', 'dojo/ready', 'esri/lang', 'esri/urlUtils', 'esri/tasks/locator', 'esri/map', 'esri/arcgis/Portal',
    'esri/dijit/HomeButton', 'esri/layers/FeatureLayer', 'esri/tasks/query', 'esri/layers/LabelLayer', 'esri/dijit/Popup', 'esri/layers/LabelClass',
    'esri/symbols/TextSymbol', 'esri/renderers/UniqueValueRenderer', 'esri/renderers/SimpleRenderer', 'esri/layers/StreamLayer', 'esri/layers/TimeInfo',
    'esri/layers/CSVLayer', 'esri/dijit/OverviewMap', 'esri/tasks/QueryTask', 'esri/layers/osm', 'esri/dijit/BasemapGallery', 'esri/tasks/geometry',
    'esri/toolbars/navigation', 'esri/tasks/AreasAndLengthsParameters', 'dojo/promise/all', 'dojo/DeferredList', 'dojo/Deferred', 'dojo/dom', 'dojo/date/locale',
    'dojo/_base/json', 'dijit/registry', 'dijit/popup', 'dijit/Dialog', 'dijit/Tooltip', 'dijit/TooltipDialog', 'dijit/form/FilteringSelect',
    'dijit/form/ToggleButton', 'dijit/form/Button', 'dijit/form/DropDownButton', 'dijit/layout/BorderContainer', 'dijit/layout/ContentPane',
    'dijit/layout/AccordionContainer', 'dijit/layout/AccordionPane', 'dojox/layout/FloatingPane', 'dijit/Toolbar', 'dijit/layout/TabContainer',
    'dijit/layout/LayoutContainer', 'dijit/form/TextBox', 'dijit/form/ComboBox', 'dijit/form/CheckBox', 'dijit/form/Select', 'dijit/form/MultiSelect',
    'dijit/form/Textarea', 'dijit/form/DateTextBox', 'dojo/cookie', 'dojo/data/ItemFileReadStore', 'dojox/layout/ScrollPane', 'dojox/lang/functional',
    'dojox/lang/functional/lambda', 'dojox/lang/functional/curry', 'dojox/lang/functional/fold', 'dojox/grid/DataGrid', 'dojo/data/ItemFileReadStore',
    'dojox/grid/EnhancedGrid', 'dojo/data/ItemFileWriteStore', 'dijit/form/HorizontalSlider', 'dojox/grid/enhanced/plugins/IndirectSelection',
    'dojox/grid/enhanced/plugins/NestedSorting', 'dojox/grid/enhanced/plugins/DnD', 'dijit/ProgressBar', 'dojox/layout/GridContainerLite', 'dijit/TitlePane'], function (parser, event, ready, elng) {
  ready(function() {
    parser.parse();
    if (dojo.isIE < 9) {
      window.location = 'ie8.htm';
      return;
    } else {
      isMain = true;
      // check for mobile device
      isMobile = {
        Android : function() {
          return navigator.userAgent.match(/Android/i);
        },
        BlackBerry : function() {
          return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS : function() {
          return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera : function() {
          return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows : function() {
          return navigator.userAgent.match(/IEMobile/i);
        },
        any : function() {
          return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
      };
      if (isMobile.any()) {
        log("This is a Mobile Device");
        dojo.byId('trShowChildWindow').style.display = 'none';
        dojo.byId('trCloseChildWindow').style.display = 'none';
      }
      showWorking('');
      dijit.byId('dialogTable').hide();
      closeChartPane();
      esriLang = elng;
      portalUrl = document.location.protocol + '//www.arcgis.com';
      portal = new esri.arcgis.Portal(portalUrl);
      portal.on('load', function (evt) {
          //                dom.byId('groupFinderSubmit').disabled = false;
          //                dom.byId('signIn').disabled = false;

          //                //hook up the sign-in click event
          //                on(dom.byId('signIn'), 'click', signIn);

          //                //search when enter key is pressed or button is clicked
          //                on(dom.byId('groupFinderSubmit'), 'click', findArcGISGroup);

          //                on(dom.byId('groupFinder'), 'keyup', function (e) {
          //                    if (e.keyCode === 13) {
          //                        findArcGISGroup();
          //                    }
          //                });
      });
      startApp();
     }
  });
});

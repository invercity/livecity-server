// city object
var city = null;

// text
TEXT = {
    zero: '0',
    empty: '',
    RU: {
        backToDefaultPlace: 'Вы вернулись в исходное положение',
        thisActionIsNotAllowed: 'Данное действие не доступно в режиме редактора',
        noDataToSave: 'Нет данных для сохранения',
        nothingSelected: 'Ничего не сохранено',
        selectFirstEndPointOnMap: 'Выберите начальную и конечную точку на карте',
        pointRemoved: 'Метка удалена',
        pointSaved: 'Метка сохранена',
        routeSaved: 'Маршрут сохранен',
        routeEndNotSelected: 'Конец маршрута не задан',
        routeStartNotSelected: 'Начало маршрута не задано',
        notSelected: 'Не выбрано',
        noData: 'Нет данных',
        noAvialableRoutes: 'Нет доступных маршрутов',
        nameNotChoosed: 'Имя не задано',
        notSet: 'Не задано',
        sessionEnd: 'Текущая сессия завершена',
        authSucc: 'Вы успешно авторизированы',
        login: 'Вход',
        exit: 'Выход'
    },
    ENG: {
        backToDefaultPlace: 'You have back to default place',
        noDataToSave: 'No data to save',
        nothingSelected: 'Nothing selected',
        selectFirstEndPointOnMap: 'Select first and end point on map',
        pointRemoved: 'Point removed successfully',
        pointSaved: 'Point saved successfully',
        routeSaved: 'Route saved successfully',
        routeEndNotSelected: 'Route end not selected',
        routeStartNotSelected: 'Route start not selected',
        noData: 'No data',
        noAvialableRoutes: 'No avialable routes',
        nameNotChoosed: 'Name not choosed',
        notSelected: 'Not selected',
        notSet: 'Not set',
        sessionEnd: 'Current session finished',
        authSucc: 'You have been authorized successfully',
        login: 'Login',
        exit: 'Exit'
    }
};

// $.ready handler
$(document).ready(function() {
    // links to page objects
    var objects = {
        body : $('body'),
        alertbox: $('#alertbox'),
        map: document.getElementById('map_canvas'),
        auth : $('#auth'),
        constrol: $('#control'),
        editPoints: $('#edit_points'),
        editRoutes: $('#edit_routes'),
        editGuide: $('#edit_guide'),
        pointEditor: {
            base: $('#edit_point'),
            close: $('#close_button_point'),
            save: $('#save_edit'),
            remove: $('#delete_edit'),
            valueLat: $('#label_posx'),
            valueLng: $('#label_posy'),
            valueTitle: $('#label_name')
        },
        routeEditor: {
            base: $('#edit_route'),
            close: $('#close_button_route'),
            save: $('#save_route'),
            start: $('#setRouteStart'),
            end: $('#setRouteEnd'),
            valueTitle: $('#label_route_name'),
            valueStart: $('#routeStartText'),
            valueEnd: $('#routeEndText')
        },
        guideEditor : {
            base: $('#guide'),
            close: $('#close_button_guide'),
            save: $('#guide_save'),
            create: $('#guide_new'),
            valueStart: $('#guide_start'),
            valueEnd: $('#guide_end'),
            valueLength: $('#guide_length'),
            valueUrl: $('#guide_url'),
            valueIfPlacesShowed: $('#guide_show_places')
        },
        searchBar: {
            base: $('#main-search'),
            chosen: $('.chosen'),
            option: function() {
                return $('option');
            },
            groups: $('optgroup')
        }
    };

    // livecity settings
    var settings = {
        zoom: 15,
        center: new google.maps.LatLng(51.4982000,31.2893500),
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle,
            position: google.maps.ControlPosition.BOTTOM_LEFT
        },
        navigationControl: true,
        navigationControlOptions: {
            style: google.maps.NavigationControlStyle.SMALL
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        lang: 'RU'
    };
    // create new city
    city = new Livecity(objects,settings);
    // init city
    city.init();
    // set update function with interval
    setInterval('city.update()',5000);
    // Edit stations click handler
    objects.editPoints.click(function() { city.onEditMarker(); });
    // edit route handler
    objects.editRoutes.click(function () { city.onEditRoute();});
    // guide handler
    objects.editGuide.click(function() {city.onGuide();});
    // Close edit panel handler
    objects.pointEditor.save.click(function () {city.onSavePoint();});
    // Cancel edit point click handler
    objects.pointEditor.close.click(function () {city.onCloseMarkerEditor();});
    // Cancel edit route click handler
    objects.routeEditor.close.click(function () {city.onCloseRouteEditor();});
    // Cancel guide
    objects.guideEditor.close.click(function() {city.onCloseGuide();});
    // remove button click
    objects.pointEditor.remove.click(function () {city.onDeletePoint();});
    // back to city center
    objects.constrol.click(function (){city.setCenter();});
    // save route handler
    objects.routeEditor.save.click(function() { city.routeBuilder.save();});
    // set route start handler
    objects.routeEditor.start.click(function() {city.routeBuilder.setStart();});
    // set route start handler
    objects.routeEditor.end.click(function() {city.routeBuilder.setEnd();});
    // auth button handler
    objects.auth.click(function() {city.auth();});
    // guide chkbox
    objects.guideEditor.valueIfPlacesShowed.change(function() {
        // check 'checked' property
        if (objects.guideEditor.valueIfPlacesShowed.prop('checked')) city.pointLayer.setVisible(true);
        else city.pointLayer.setVisible(false);
    });
    // new guide handler
    objects.guideEditor.create.click(function() {city.guide.popAll();});
    // demo handler (temporary)
    objects.guideEditor.demo.click(function(){city.guide.demo();});
    // search bar init
    objects.searchBar.chosen.chosen({
        no_results_text: TEXT[city.getLang()]
        // FEATURE
    }).change(function() {
          city.searchBar.init($(this).val());
    });
    // keydown handler
    objects.body.on('keydown',function(e) {
        if (e.keyCode === 27) city.onEscape();
    });
});

/*
 * City Class
 */
function Livecity(objects,settings) {

    /*
     * PUBLIC ATTRIBUTES
     */

    // static - static functions and values
    this.static = {
        ICON_BLUE: function() {
            return new google.maps.MarkerImage('img/stop2.png', new google.maps.Size(16, 16), new google.maps.Point(0, 0), new google.maps.Point(8, 10));
        },
        ICON_RED: function() {
            return new google.maps.MarkerImage('img/stop-m2.png', new google.maps.Size(16, 16), new google.maps.Point(0, 0), new google.maps.Point(8, 10));
        },
        ICON_TRANS: function() {
            return new google.maps.MarkerImage('img/bus.png', new google.maps.Size(32, 37), new google.maps.Point(0, 0), new google.maps.Point(16, 33));
        },
        ICON_A: function() {
            return new google.maps.MarkerImage('http://www.google.com/mapfiles/markerA.png', new google.maps.Size(36, 36), new google.maps.Point(0, 0), new google.maps.Point(9, 33));
        },
        ICON_B: function() {
            return new google.maps.MarkerImage('http://www.google.com/mapfiles/markerB.png', new google.maps.Size(36, 36), new google.maps.Point(0, 0), new google.maps.Point(9, 33));
        },
        TYPE_POST: 'POST',
        TYPE_JSON: 'JSON',
        TYPE_GET: 'GET',
        TYPE_DELETE: 'DELETE',
        TYPE_PUT: 'PUT'
    };

    /*
     *  PRIVATE ATTRIBUTES
     */

    // UID
    var __uid = null;
    // objects
    var __objects = objects;
    // set settings
    var __settings = settings;
    // server url
    var __url = 'http://localhost:3000';

    // map
    var __map = new google.maps.Map(__objects.map,__settings);

    /*
     * PUBLIC GETTERS & SETTERS
     */

    // GET uid
    this.getUID = function() {
        return __uid;
    };
    // SET uid
    this.setUID = function(uid) {
        __uid = uid;
    };
    // GET objects
    this.getObjects = function() {
        return __objects;
    };
    // SET objects
    this.setObjects = function(objs) {
        __objects = objs;
    };
    // GET selected object
    this.getObject = function(name) {
        return __objects[name];
    };
    // SET selected object
    this.setObject = function(name,value) {
        __objects[name] = value;
    };
    // GET property
    this.getProperty = function(name) {
        return __settings[name];
    };
    // SET property
    this.setProperty = function(name,value) {
        __settings[name] = value;
    };
    // GET settings
    this.getProperties = function() {
        return __settings;
    };
    // GET lang property
    this.getLang = function() {
        return __settings.lang;
    };
    // SET lang property
    this.setLang = function(lng) {
        __settings.lang = lng;
    };
    this.getMap = function() {
        return __map;
    };
    this.getStatic = function() {
        return __static;
    };
    this.getUrl = function() {
        return __url;
    };
    // notifier
    this.notifier = new Notifier(this);
    // point layer
    this.pointLayer = new PointLayer(this);
    // route layer
    this.routeLayer = new RouteLayer(this);
    // trans layer
    this.transLayer = new TransLayer(this);
    // search bar
    this.searchBar = new SearchBar(this);
    // route builder
    this.routeBuilder = null;
    // guide
    this.guide = null;
    // flag for point editor
    this.pointEditorOpened = false;
    //flag for route editor
    this.routeEditorOpened = false;
    // flag for guide
    this.guideOpened = false;
}

// [P] init - init map [DEPRECATED]
Livecity.prototype.init = function() {
    // link to main document
    var link = this;
    // load points on map
    this.pointLayer.load(function() {
        link.routeLayer.load(function(){
            link.searchBar.update();
        });
    });
    // map click handler
    google.maps.event.addListener(this.getMap(), 'click', function(event) {
        // point editor mode
        if (link.pointEditorOpened) {
            link.addPoint(event.latLng);
            link.pointLayer.getCurrent().save();
            link.outMsg(TEXT[link.getLang()].pointSaved,"green");
        }
        // guide editor mode
        if (link.guideOpened) {
            link.guide.push(event.latLng);
        }
    });
    this.update();
};

// [P] outMsg - show notification message
Livecity.prototype.outMsg = function(text,color) {
    this.notifier.msg(text,color);
};

// [P] onEscape - Escape button handler
Livecity.prototype.onEscape = function() {
    // if escape button pressed
    if (this.pointEditorOpened) {
        // if nothing selected
        if (!this.pointLayer.getCurrent()) this.onCloseMarkerEditor();
        else {
            this.pointLayer.setCurrent();
            this.clearEditor();
        }
    }
    if (this.routeEditorOpened) this.onCloseRouteEditor();
    if (this.guideOpened) this.onCloseGuide();
};

// [P] setEditPointData - set edits for editing marker
Livecity.prototype.setEditPointData = function(position, title, focus) {
    var lat = position.lat();
    var lng = position.lng();
    // FEATURE - add option Round?
    this.getObjects().pointEditor.valueLat.text(Number(lat).toFixed(4));
    this.getObjects().pointEditor.valueLng.text(Number(lng).toFixed(4));
    this.getObjects().pointEditor.valueTitle.val(title);
    // FEATURE
    if (focus) this.getObjects().pointEditor.valueTitle.focus();
};

// [P] addPoint - add new point on map
Livecity.prototype.addPoint = function(position) {
    var title = "id" + (this.pointLayer.points.length);
    var point = new MapPoint(this, position, this.static.ICON_RED(), title);
    point.getMarker().setDraggable(true);
    point.setVisible(true);
    this.pointLayer.add(point);
    this.pointLayer.setCurrent(point);
    this.setEditPointData(position, title, true);
    this.searchBar.update();
    return point;
};

// [P] clearEditor - clear editor inputs
Livecity.prototype.clearEditor = function() {
    this.getObjects().pointEditor.valueLat.text(TEXT.zero);
    this.getObjects().pointEditor.valueLng.text(TEXT.zero);
    this.getObjects().pointEditor.valueTitle.val(TEXT.empty);
    this.getObjects().routeEditor.valueTitle.val(TEXT.empty);
    this.getObjects().routeEditor.valueStart.text(TEXT[this.getLang()].notSelected);
    this.getObjects().routeEditor.valueEnd.text(TEXT[this.getLang()].notSelected);
    this.getObjects().guideEditor.valueStart.text(TEXT[this.getLang()].notSet);
    this.getObjects().guideEditor.valueEnd.text(TEXT[this.getLang()].notSet);
    this.getObjects().guideEditor.valueLength.text(TEXT.zero);
};

// [P] setCenter - set map to selected map position
Livecity.prototype.setCenter = function(center) {
    // if center is not selected, set map center default value
    if (!center) {
        this.getMap().setCenter(this.getProperty('center'));
        this.outMsg(TEXT[this.getLang()].backToDefaultPlace,"green");
    }
    // if selected - set value and save to settings
    else {
        this.getMap().setCenter(center);
        this.setProperty('center',center);
    }
};

// [P] auth - authorize user/end session
Livecity.prototype.auth = function() {
    if (this.getUID()) {
        // end session
        this.getObjects().auth.css("background", "url('img/key.png') right no-repeat");
        this.getObjects().auth.text(TEXT[this.getLang()].login);
        // FEATURE - replace with load()
        this.getObjects().editPoints.css("visibility", "hidden");
        this.getObjects().editRoutes.css("visibility", "hidden");
        this.getObjects().editGuide.css("visibility", "hidden");
        // F
        this.setUID(null);
        if (this.routeEditorOpened) this.onCloseRouteEditor();
        if (this.pointEditorOpened) this.onCloseMarkerEditor();
        if (this.guideOpened) this.onCloseGuide();
        this.outMsg(TEXT[this.getLang().sessionEnd],"green");
        // login
    } else {
        this.getObjects().auth.css("background", "url('img/lock.png') right no-repeat");
        this.getObjects().auth.text(TEXT[this.getLang()].exit);
        // FEATURE
        this.getObjects().editPoints.css("visibility", "visible");
        this.getObjects().editRoutes.css("visibility", "visible");
        this.getObjects().editGuide.css("visibility", "visible");
        // F
        this.setUID(1);
        this.outMsg(TEXT[this.getLang()].authSucc,"green");
    }
};

// [P] update - update trans layer on a map
Livecity.prototype.update = function() {
    this.transLayer.update();
};

// [P] onSavePoint - save point handler [DEPRECATED]
Livecity.prototype.onSavePoint = function() {
    var current = this.pointLayer.getCurrent();
    if (!current) this.outMsg(TEXT[this.getLang()].noDataToSave,"red");
    else {
        current.save();
        this.searchBar.update();
        this.outMsg(TEXT[this.getLang()].pointSaved,"green");
    }
};

// [P] onDeletePoint - delete point handler {DEPRECATED]
Livecity.prototype.onDeletePoint = function() {
    var current = this.pointLayer.getCurrent();
    if (!current) this.outMsg(TEXT[this.getLang()].nothingSelected,"red");
    else {
        this.pointLayer.remove(current);
        this.searchBar.update();
        this.outMsg(TEXT[this.getLang()].pointRemoved,"green");
    }
};

// [P] onEditMarker - edit marker button handler [DEPRECATED]
Livecity.prototype.onEditMarker = function() {
    if (this.pointEditorOpened) {
        this.onCloseMarkerEditor();
        return;
    }
    //close other editors
    if (this.routeEditorOpened) this.onCloseRouteEditor();
    if (this.guideOpened) this.onCloseGuide();
    // setting up cursor
    this.getMap().setOptions({
        draggableCursor: 'crosshair'
    });
    // show all points
    this.routeLayer.setVisible(false);
    this.pointLayer.setVisible(false);
    this.pointLayer.setVisible(true);
    // deselect search bar
    this.searchBar.deselect();
    // set current point as NULL
    this.pointLayer.setCurrent();
    // show editor
    this.getObjects().pointEditor.base.show('500');
    // set the document flag
    this.pointEditorOpened = true;
};

// [P] onEditRoute - edit route button handler [DEPRECATED]
Livecity.prototype.onEditRoute = function() {
    // if pointEditor opened already - close it
    if (this.routeEditorOpened) {
        this.onCloseRouteEditor();
        return;
    }
    // close other editors
    if (this.pointEditorOpened) this.onCloseMarkerEditor();
    if (this.guideOpened) this.onCloseGuide();
    // disable searchbar
    this.searchBar.deselect();
    // show all points
    this.routeLayer.setVisible(false);
    this.pointLayer.setVisible(false);
    this.pointLayer.setVisible(true);
    this.routeBuilder = new RouteBuilder(this);
    // show editor
    this.getObjects().routeEditor.base.show('500');
    // set editor flag
    this.routeEditorOpened = true;
};

// [P] onGuide - actions on open guide [DEPRECATED]
Livecity.prototype.onGuide = function() {
    // if guid opened already - close it
    if (this.guideOpened) {
        this.onCloseGuide();
        return;
    }
    // close other editors
    if (this.pointEditorOpened) this.onCloseMarkerEditor();
    if (this.routeEditorOpened) this.onCloseRouteEditor();
    // show guide
    this.getObjects().guideEditor.base.show('500');
    // set guide flag
    this.guideOpened = true;
    // set map handlers
    this.getMap().setOptions({
        draggableCursor: 'crosshair'
    });

    this.guide = new Guide(this);
    this.searchBar.deselect();
    this.outMsg(TEXT[this.getLang()].selectFirstEndPointOnMap,'green');
};

// [P] onCloseMarkerEditor - actions for closing editor [DEPRECATED]
Livecity.prototype.onCloseMarkerEditor = function() {
    this.getObjects().pointEditor.base.hide('500');
    // change cursor to default
    this.getMap().setOptions({
        draggableCursor: 'pointer'
    });
    // unset marker
    this.pointLayer.setCurrent();
    // set the main document flag
    this.pointEditorOpened = false;
    this.pointLayer.setVisible(false);
};

// [P] onCloseRouteEditor - actions for closing editor [DEPRECATED]
Livecity.prototype.onCloseRouteEditor = function() {
    this.getObjects().routeEditor.base.hide('500');
    this.routeEditorOpened = false;
    this.routeBuilder.end();
    this.routeBuilder = null;
    this.clearEditor();
};

// [P] onCloseGuide - actions for closing guide [DEPRECATED]
Livecity.prototype.onCloseGuide = function() {
    this.getObjects().guideEditor.base.hide('500');
    this.guideOpened = false;
    this.getMap().setOptions({
        draggableCursor: 'pointer'
    });
    this.guide.popAll();
    this.guide = null;
};

/*
 * Notifier Class
 */
function Notifier(parent) {
    // link to 'box' Element
    var __box = parent.getObjects().alertbox;
    // GET alertbox
    this.getBox = function() {
        return __box;
    }
}

// [P] msg - show message with selected text
Notifier.prototype.msg = function(text,color) {
    var link = this;
    this.getBox().css("display", "block");
    this.getBox().css("background-color", color);
    this.getBox().text(text);
    // show message for 3 seconds
    setTimeout(function() {
        link.getBox().css("display", "none");
    }, 3000);
};

/*
 * SearchBar Class
 */
function SearchBar(parent) {
    // link to parent object
    var __parent = parent;
    // points to select
    var __points = [];
    // routes to select
    var __routes = [];
    // chosed ID's
    var __chosed = [];
    // link to this
    var __link = this;

    // clear - clear all values for selecting
    this.clear = function() {
        var groups = __parent.getObjects().searchBar.groups;
        $(groups[0]).html('');
        $(groups[1]).html('');
    };

    // update values for select
    this.update = function() {
        this.clear();
        $.each(__parent.pointLayer.points,function(indx,item) {
            __link.add(0,item.getId(),item.getTitle());
        });
        $.each(__parent.routeLayer.routes,function(indx,item) {
            __link.add(1,item.id,item.name);
        })
    };

    // deselect selected items
    this.deselect = function() {
        __parent.getObjects().searchBar.option().prop('selected',false);
        __parent.getObjects().searchBar.chosen.trigger("liszt:updated");
    };

    // add value for selecting
    this.add = function(type, id, title) {
        if (type === 0) __points.push(id);
        else __routes.push(id);
        var groups = __parent.getObjects().searchBar.groups;
        $(groups[type]).append('<option value="' + id + '" >' + title + '</option>');
        __parent.getObjects().searchBar.chosen.trigger("liszt:updated");
    };

    this.init = function(sel) {
        // check if this is not base mode
        if ((__parent.pointEditorOpened) ||
            (__parent.routeEditorOpened) ||
            (__parent.guideOpened)) {
            link.deselect();
            __parent.outMsg(TEXT[__parent.getLang()].thisActionIsNotAllowed,"red");
        }
        // if null
        if (!sel) sel = [];
        // there was something new selected
        if (sel.length > __chosed.length) {
            // get new element
            var newElem = $(sel).not(__chosed).get(0);
            // push to choosed items
            __chosed.push(newElem);
            // get type
            // this is new route, which we need to show
            if (__points.indexOf(newElem) === -1) {
                var newRoute = __parent.routeLayer.getRouteById(newElem);
                newRoute.setVisible(true);
                __parent.transLayer.setVisibleByRoute(newElem,true);
            }
            else {
                var newPoint = __parent.pointLayer.getPointById(newElem);
                newPoint.update();
                newPoint.setVisible(true);
                newPoint.setInfoVisible(true);
            }
        }
        // there was something we need to hide
        else {
            //get old element we need to hide
            var oldElem = $(__chosed).not(sel).get(0);
            // pop it from choosed items
            __chosed.splice(__chosed.indexOf(oldElem),1);
            // get type
            // this is old route we need to hide
            if (__points.indexOf(oldElem) === -1) {
                var oldRoute = __parent.routeLayer.getRouteById(oldElem);
                oldRoute.setVisible(false);
                // add logic for displaying points
                __parent.transLayer.setVisibleByRoute(oldElem,false);
            }
            else {
                var oldPoint = __parent.pointLayer.getPointById(oldElem);
                oldPoint.setInfoVisible(false);
                oldPoint.setVisible(false);
            }
        }
    };
}

// marker layer
function PointLayer(main) {
    // link to main
    this.main = main;
    // points on layer
    this.points = [];
    // current point
    this.current = null;
    // visibility
    this.visible = false;

    // ----------- Methods -------------- //

    // visibility setter
    this.setVisible = function(is) {
        this.visible = is;
        $.each(this.points, function(index,item) {
            if (!is) item.setInfoVisible(false);
            item.setVisible(is);
        });
    };

    // get array of visible points (info's)
    this.getVisibleInfo = function() {
        var result = [];
        for (var i = 0; i < this.points.length; i++) {
            if (this.points[i]) {
                result.push(this.points[i].isInfoVisible());
            }
        }
        return result;
    };
    
    // get array of visible markers
    this.getVisible = function() {
        var result = [];
        for (var i = 0; i < this.points.length; i++) {
            if (this.points[i].isVisible()) {
                result.push(this.points[i]);
            }
        }
        return result;
    };

    // add point to layer
    this.add = function(point) {
        this.points.push(point);
    };

    // remove point from layer
    this.remove = function(point) {
        var index = this.points.indexOf(point);
        if (index === -1) return;
        this.points[index].remove();
        this.points.splice(index,1);
    };

    // load markers to map [ASYNC]
    this.load = function(callback) {
        var main = this.main;
        var layer = this;
        $.ajax({
            datatype: main.static.TYPE_JSON,
            type: main.static.TYPE_GET,
            url: main.getUrl() + '/data/points',
            success: function(result) {
                async.each(result,function(item,callback) {
                    var point = new MapPoint(main, new google.maps.LatLng(item.lat, item.lng),
                        main.static.ICON_BLUE(), item.title);
                    point.setId(item._id);
                    layer.add(point);
                    callback();
                },function(err) {
                    if (callback) callback(err);
                });
            }
        });
    };

    // set point as current
    this.setCurrent = function(point) {
        if (this.current) {
            this.current.getMarker().setIcon(main.static.ICON_BLUE());
            this.current.getMarker().setDraggable(false);
        }
        // unset point
        if (!point) {
            // FEATURE - ??????
            if (this.main.pointEditorOpened) this.main.clearEditor();
            this.current = null;
        } else {
            // set such point as current
            var pos = this.points.indexOf(point);
            if (pos !== -1) {
                this.current = point;
                point.getMarker().setIcon(main.static.ICON_RED());
            }
        }
    };

    // get current point from layer
    this.getCurrent = function() {
        return this.current;
    };

    // get point by point id [async]
    this.getPointById = function(id) {
        var points = this.points;
        for (var i = 0; i < points.length; i++) if (points[i].getId() === id) return points[i];
        return -1;
    };

    // get point by point id [async]
    this.getPointByName = function(name) {
        var points = this.points;
        for (var i = 0; i < points.length; i++) if (points[i].getTitle() === name) return points[i];
        return -1;
    };
}

// route layer class
function RouteLayer(main) {
    // parent layer
    this.main = main;
    // service for making route
    this.directionsService = new google.maps.DirectionsService();
    // route on layer
    this.routes = [];
    // nodes on layer
    this.nodes = [];
    // current route?
    this.current = null;
    // visibility
    this.visible = false;

    // ----------- Methods -------------- //

    // visibility [async]
    this.setVisible = function(is) {
        this.visible = is;
        $.each(this.routes, function(index,item) {
            item.setVisible(is);
        });
    };

    // get visible routes
    this.getVisible = function() {
        var result = [];
        for (var i = 0; i < this.routes.length; i++) if (this.routes[i].visible) result.push(this.routes[i]);
        return result;
    };

    // get id's of visible routes
    this.getVisibleId = function() {
        var result = [];
        for (var i = 0; i < this.routes.length; i++) if (this.routes[i].visible) result.push(this.routes[i].id);
    };

    // add point to layer
    this.add = function(route) {
        this.routes.push(route);
    };

    // remove route from layer
    this.remove = function(route) {
        var index = this.routes.indexOf(route);
        if (index === -1) return;
        this.routes[index].remove();
        this.routes.splice(index,1);
    };

    // current setter
    this.setCurrent = function(route) {
        // TBD
    };

    // get route by name
    this.getRouteByName = function(name) {
        var route = -1;
        for (var i = 0; i < this.routes.length; i++) if (this.routes[i].name == name) route = this.routes[i];
        return route;
    };

    //get route by id
    this.getRouteById = function(id) {
        var route = -1;
        for (var i = 0; i < this.routes.length; i++) if (this.routes[i].id === id) route = this.routes[i];
        return route;
    };

    // load layer from server [ASYNC]
    this.load = function(callback) {
        var main = this.main;
        var obj = this;
        // at first - getting nodes
        $.ajax({
            datatype: main.static.TYPE_JSON,
            type: main.static.TYPE_GET,
            url: main.getUrl() + '/data/nodes',
            async: false,
            success: function(result) {
                for (var i = 0; i < result.length; i++) {
                    var node = result[i];
                    var a = main.pointLayer.getPointById(node.a);
                    var b = main.pointLayer.getPointById(node.b);
                    var n = new MapNode(main, a, b, node.data, node.total);
                    n.setId(node._id);
                    main.routeLayer.nodes.push(n);
                }
                // next step - getting routes
                $.ajax({
                    datatype: main.static.TYPE_JSON,
                    type: main.static.TYPE_GET,
                    url: main.getUrl() + '/data/routes',
                    async: false,
                    success: function(result) {
                        async.each(result,function(item,callback) {
                            var start = main.pointLayer.getPointById(item.start);
                            var end = main.pointLayer.getPointById(item.end);
                            var route = new MapRoute(main);
                            route.setName(item.title);
                            route.init(item.nodes);
                            route.setStart(start);
                            route.setEnd(end);
                            route.setId(item._id);
                            obj.routes.push(route);
                            callback();
                        },function(err) {
                            if (callback) callback(err);
                        })
                    }
                });
            }
        });
    };

    // return true, if each point is part of visible route
    this.isPointOfVisibleRoute = function(id) {
        var is = false;
        // FEATURE - use async.js
        for (var i = 0; i < this.routes.length; i++) if ((this.routes[i].isPointOf(id)) && (this.routes[i].visible)) is = true;
        return is;
    };
}

function TransLayer(main) {
    this.main = main;
    // array for trans
    this.trans = [];
    // array for route ID's
    this.routes = [];
    // get visible trans
    this.getVisible = function() {
        var result = [];
        for (var i = 0; i < this.trans.length; i++) if (this.trans[i].visible) result.push(this.trans[i]);
        return result;
    };
    // clear all items
    this.clear = function() {
        for (var i = 0; i < this.trans.length; i++) this.trans[i].setVisible(false);
        this.trans = [];
    };
    // load cars from server
    this.load = function() {
        var main = this.main;
        var obj = this;
        $.ajax({
            datatype: main.static.TYPE_JSON,
            type: main.static.TYPE_GET,
            url: main.getUrl() + '/data/transport',
            async: false,
            success: function(result) {
                if ((!result) || (result.length === 0)) return;
                for (var i = 0; i < result.length; i++) {
                    var trans = result[i];
                    var t = new MapTrans(main, trans._id, trans.route, new google.maps.LatLng(trans.lat, trans.lng));
                    obj.add(t);
                    if (obj.routes.indexOf(trans.route) !== -1) t.setVisible(true);
                }
            }
        });
    };
    // add trans to layer
    this.add = function(item) {
        this.trans.push(item);
        // here we can provide any checks, etc
        // TBD
    };

    // set visibility by route id
    this.setVisibleByRoute = function(id, is) {
        var routes = this.routes;
        $.each(this.trans, function(index,item) {
            if (item.id_route === id) {
                item.setVisible(is);
                if (is) routes.push(id);
                else routes.splice(routes.indexOf(id), 1);
            }
        });
    };

    // update points, and set visible required
    this.update = function() {
        this.clear();
        this.load();
        // TBD
        // FEATURE
    };
}

// class for route
function MapRoute(main) {
    // set main
    this.main = main;
    // unique identifier
    this.id = -1;
    // start id
    this.start = -1;
    // end id
    this.end = -1;
    // start point info
    this.infoA = null;
    // end point info
    this.infoB = null;
    // visibility flag
    this.visible = false;
    // routeNodes
    this.nodes = [];
    // point ID's
    this.points = [];
    // total distance
    this.total = 0;
    // name
    this.name = "";
    // async set visible
    this.setVisible = function(is) {
        var nodes = this.nodes;
        // FEATURE - replace with async.js
        $.each(nodes, function(index,item) {
            item.setVisible(is);
        });
        // UPD
        if (is) {
            if (this.infoA) this.infoA.open(this.main.getMap());
            if (this.infoB) this.infoB.open(this.main.getMap());
        } else {
            if (this.infoA) this.infoA.open(null);
            if (this.infoB) this.infoB.open(null);
        }
        this.visible = is;
    };

    // set unique id
    this.setId = function(id) {
        this.id = id;
    };

    // set name
    this.setName = function(name) {
        this.name = name;
    };

    // add node to route
    this.add = function(node) {
        // if route is empty already, first we must add start point of first node
        if (this.nodes.length === 0) this.points.push(node.a.id);
        // add end of each node to array
        this.points.push(node.b.id);
        // check id,if id == -1 this node is builder node
        if (node.id !== -1) this.nodes.push(this.main.routeLayer.nodes[this.main.routeLayer.nodes.indexOf(node)]);
        else this.nodes.push(node);
    };

    // start setter
    this.setStart = function(point) {
        this.start = point.getId();
        if (this.infoA) this.infoA.hide();
        this.infoA = new InfoBox({
            content: '<div class="text"><center>' + point.getTitle() + '</center></div>',
            boxClass: "infoRoute",
            pixelOffset: new google.maps.Size(-50, -50),
            closeBoxURL: 'img/close_t.png'
        });
        this.infoA.setPosition(point.getMarker().position);
    };

    // end setter
    this.setEnd = function(point) {
        this.end = point.getId();
        if (this.infoB) this.infoB.hide();
        this.infoB = new InfoBox({
            content: '<div class="text"><center>' + point.getTitle() + '</center></div>',
            boxClass: "infoRoute",
            pixelOffset: new google.maps.Size(-50, -50),
            closeBoxURL: 'img/close_t.png'
        });
        this.infoB.setPosition(point.getMarker().position);
    };

    // init route
    this.init = function(ids) {
        var link = this;
        $.each(ids, function(lndex,item) {
            for (var j = 0; j < link.main.routeLayer.nodes.length; j++) {
                // TEST
                if (link.main.routeLayer.nodes[j].id == item) {
                    link.add(link.main.routeLayer.nodes[j]);
                }
            }
        });
    };

    // save route
    this.save = function() {
        var main = this.main;
        var obj = this;
        var nodes = this.nodes;
        // save new nodes at first
        var globalNodes = this.main.routeLayer.nodes;
        async.each(nodes,function(item,callback) {
            item.save();
            var index = globalNodes.indexOf(item);
            if (index === -1) globalNodes.push(item);
            nodes[nodes.indexOf(item)] = globalNodes[globalNodes.indexOf(item)];
            callback();
        },function(){
            // get node id's and total length
            var total = 0;
            var ids = [];
            for (var x = 0; x < obj.nodes.length; x++) {
                total += obj.nodes[x].total;
                ids.push(obj.nodes[x].id);
            }
            // fill properties
            var json = {
                start: obj.start,
                end: obj.end,
                nodes: ids,
                points: obj.points,
                total: total,
                title: obj.name
            };
            // send data
            $.ajax({
                datatype: main.static.TYPE_JSON,
                type: main.static.TYPE_POST,
                url: main.getUrl() + '/data/routes/',
                data: json,
                success: function(result) {
                    obj.setId(result.route._id);
                }
            });
        });
    };

    // return true if this point in this route
    this.isPointOf = function(id) {
        var index = this.points.indexOf(id);
        return index !== -1;
    };
}

//class for nodes
function MapNode(main, pointA, pointB, resNode, total) {
    this.main = main;
    // visible flag
    this.visible = false;
    // total distance
    this.total = total;
    // unique identifier for node
    this.id = -1;
    // point A
    this.a = pointA;
    // point b
    this.b = pointB;
    // node base class
    this.base = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport: true
    });
    // node result
    this.resNode = resNode;
    // setter unique id
    this.setId = function(id) {
        this.id = id;
    };

    // initialize node
    this.init = function() {
        var obj = this;
        var request = {
            origin: this.a.getMarker().position,
            destination: this.b.getMarker().position,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false
        };
        this.main.routeLayer.directionsService.route(request, function(result, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                obj.resNode = JSON.stringify(result, stringifyNode);
                obj.base.setDirections(result);
                var myroute = result.routes[0];
                var ttl = 0;
                for (var i = 0; i < myroute.legs.length; i++) ttl += myroute.legs[i].distance.value;
                obj.total = ttl;
            }
        });
    };

    // setter visibility
    this.setVisible = function(is) {
        this.visible = is;
        this.a.setVisible(is);
        this.b.setVisible(is);
        if (!is) {
            this.base.setMap(null);
            // if info was opened
            this.a.setInfoVisible(false);
            this.b.setInfoVisible(false);
        }
        else this.base.setMap(this.main.getMap());
    };

    // save this node
    this.save = function() {
        // check if this node is unsaved
        if (this.id !== -1) return;
        // link to this
        var obj = this;
        // object for sending
        var json = {};
        // fill properties
        json.a = this.a.getId();
        json.b = this.b.getId();
        json.total = this.total;
        json.data = this.resNode;
        $.ajax({
            datatype: main.static.TYPE_JSON,
            type: main.static.TYPE_POST,
            url: main.getUrl() + '/data/nodes/',
            data: json,
            async: false,
            success: function(result) {
                // REPLACE
                obj.setId(result.node._id);
            }
        });
    };

    if (!this.resNode) this.init();
    else this.base.setDirections(JSON.parse(this.resNode, parseNode));
}

/*
 * MapPoint Class
 */
function MapPoint(parent, position, icon, title) {
    // link to main
    var __parent = parent;
    // flag for info visibility
    var __infoVisible = false;
    // flag for marker visibility
    var __visible = false;
    // unique id
    var __id = -1;
    // google.maps.Marker base
    var __marker = new google.maps.Marker({
        position: new google.maps.LatLng(Number(position.lat()).toFixed(4), Number(position.lng()).toFixed(4)),
        icon: icon,
        map: __parent.getMap(),
        title: title,
        draggable: false,
        visible: false
    });

    var __baseContent = '<div class="text" id="info' + __id + '"><center><b>' + __marker.title + '</b></center></div>';
    // infoBox base
    var __info = new InfoBox({
        content: __baseContent,
        boxClass: "infoBox",
        pixelOffset: new google.maps.Size(-150, -120)
    });

    // SET title
    this.setTitle = function(title) {
        __marker.setTitle(title);
        // FEATURE add some code for updating content
    };

    // GET title
    this.getTitle = function() {
        return __marker.title;
    };

    // GET marker
    this.getMarker = function() {
        return __marker;
    };

    // GET baseContent
    this.getBaseContent = function() {
        return __baseContent;
    };

    // SET infoVisible
    this.setInfoVisible = function(is) {
        __infoVisible = is;
        if (!is) __info.hide();
        else {
            __info.open(__parent.getMap(), __marker);
            __info.show();
        }
    };

    // GET infoVisible
    this.isInfoVisible = function() {
        return __infoVisible;
    };

    // GET visible
    this.setVisible = function(is) {
        __visible = is;
        __marker.setVisible(is);
        if (!is) this.setInfoVisible(false);
    };

    // GET visible
    this.isVisible = function() {
        return __visible;
    };

    // SET id
    this.setId = function(id) {
        __id = id;
    };

    // GET id
    this.getId = function() {
        return __id;
    };

    // GET parent
    this.getParent = function() {
        return __parent;
    };

    // GET info
    this.getInfo = function() {
        return __info;
    };

    var link = this;
    // setting listeners
    google.maps.event.addListener(__marker, 'click', function(event) {
        // if we work in PointEditor
        if (__parent.pointEditorOpened) {
            __parent.setEditPointData(event.latLng, __marker.title, true);
            __parent.pointLayer.setCurrent(link);
            this.setDraggable(true);
        // if we work in RouteEditor
        } else if (__parent.routeEditorOpened) {
            for (var i = 0; i < __parent.pointLayer.points.length; i++) {
                if (__parent.pointLayer.points[i].getMarker() === this)
                    __parent.routeBuilder.add(__parent.pointLayer.points[i]);
            }
        }
        // if we work in base mode
        else {
            if (link.isInfoVisible()) link.setInfoVisible(false);
            else {
                link.update();
                link.setInfoVisible(true);
            }
        }
    });
    google.maps.event.addListener(__marker, 'drag', function(event) {
        if (main.pointEditorOpened) {
            //FEATURE
            var title = __parent.getObjects().pointEditor.valueTitle.val();
            __parent.setEditPointData(event.latLng, title, false);
        }
    });
    google.maps.event.addListener(__marker, 'dragend', function() {
        if (__parent.pointEditorOpened) {
            __parent.pointLayer.current.save();
            __parent.outMsg(TEXT[__parent.getLang()].pointSaved,"green");
        }
    });
}

// [P] update - update point data
MapPoint.prototype.update = function() {
    var link = this;
    if (this.getId() !== -1) {
        $.ajax({
            datatype: this.getParent().static.TYPE_JSON,
            type: this.getParent().static.TYPE_GET,
            url: this.getParent().getUrl() + '/arrival/' + this.getId(),
            success: function(result) {
                var content = "";
                var routeResult = null;
                for (var i = 0; i < result.length; i++) {
                    if (result[i].status === "OK") {
                        // natural value (min)
                        var ctime = Number(result[i].time).toFixed(0);
                        // real time (sec)
                        var rtime = Number((result[i].time - ctime) * 60).toFixed(0);
                        // absolute values
                        if (rtime < 0) rtime *= -1;
                        // if value in seconds < 10
                        var p = "";
                        if (rtime < 10) p = "0";
                        routeResult = ctime + ":" + p + rtime + " мин. <br/>";
                    }
                    // TBD
                    // need to add some other checks
                    else routeResult = TEXT[link.getParent().getLang()].noData + "<br/>";
                    content += ("№" + result[i].name + " - " + routeResult);
                }
                if (result.length === 0) content += TEXT[link.getParent().getLang()].noAvialableRoutes + "<br/>";
                link.getInfo().setContent(link.getBaseContent() + content);
            }
        });
    }
};

// [P] save  - save point
MapPoint.prototype.save = function() {
    // object for sending
    var json = {};
    // fill properties
    json.lat = this.getParent().getObjects().pointEditor.valueLat.text();
    json.lng = this.getParent().getObjects().pointEditor.valueLng.text();
    json._id = this.getId();
    json.title = this.getParent().getObjects().pointEditor.valueTitle.val();
    // create new one
    if (this.getId() === -1) {
        $.ajax({
            datatype: this.getParent().static.TYPE_JSON,
            type: this.getParent().static.TYPE_POST,
            url: this.getParent().getUrl() + '/data/points',
            data: json,
            async: false,
            success: function(result) {
            }
        });
    }
    // update existing
    else {
        $.ajax({
            datatype: this.getParent().static.TYPE_JSON,
            type: this.getParent().static.TYPE_PUT,
            url: this.getParent().getUrl() + '/data/points/' + this.getId(),
            data: json
        });
    }
    /// TEST
    this.getParent().pointLayer.current.setTitle(json.title);
};

// delete point
MapPoint.prototype.remove = function() {
    // async delete on server
    $.ajax({
        datatype: this.getParent().static.TYPE_JSON,
        type: this.getParent().static.TYPE_DELETE,
        url: this.getParent().getUrl() + '/data/points/' + this.getId(),
        cache: false
    });
    this.getMarker().setMap(null);
    // some code for info....
    this.getParent().pointLayer.points.splice(this.getParent().pointLayer.points.indexOf(this), 1);
    this.getParent().pointLayer.setCurrent();
};

// class for cars
function MapTrans(main, id, id_route, position) {
    this.main = main;
    // unique id
    this.id = id;
    // unique route id
    this.id_route = id_route;
    // latLng()
    this.position = position;
    // icon
    this.marker = new google.maps.Marker({
        position: position,
        icon: main.static.ICON_TRANS(),
        map: main.getMap(),
        title: "",
        draggable: false,
        visible: false,
        zIndex: 5000
    });
    // flag visibility
    this.visible = false;

    // visible setter
    this.setVisible = function(is) {
        this.marker.setVisible(is);
        this.visible = is;
    };
}

// route builder
function RouteBuilder(main) {
    this.main = main;
    // array for points
    this.points = [];
    // buffer route
    this.route = new MapRoute(this.main);
    // add point to buffer
    this.add = function(point) {
        this.points.push(point);
        point.getMarker().setIcon(this.main.static.ICON_RED());
        var size = this.points.length;
        if (this.points.length > 1) {
            var node = new MapNode(this.main, this.points[size - 2], this.points[size - 1], null, 0);
            this.route.add(node);
            node.setVisible(true);
        }
    };

    // set endpoint of route
    this.setEnd = function() {
        if (this.points.length === 0) main.outMsg(TEXT[main.getLang()].nothingSelected,"red");
        else {
            // FEATURE
            var infoB = this.route.infoB;
            // close previous endpoint info
            if (infoB) infoB.open(null);
            var lastPoint = this.points[this.points.length - 1];
            // set new endpoint
            this.route.setEnd(lastPoint);
            // show new endpoint info
            this.route.infoB.open(this.main.getMap(), lastPoint.getMarker());
            // set info in box
            main.getObjects().routeEditor.valueEnd.text(lastPoint.getTitle());
        }
    };

    // set start point of route
    this.setStart = function() {
        if (this.points.length === 0) main.outMsg(TEXT[main.getLang()].nothingSelected,"red");
        else {
            var infoA = this.route.infoA;
            // close prevoius endpoint info
            if (infoA) infoA.open(null);
            var lastPoint = this.points[this.points.length - 1];
            // set new endpoint
            this.route.setStart(lastPoint);
            // show new endpoint info
            this.route.infoA.open(this.main.getMap(), lastPoint.getMarker());// set info in box
            main.getObjects().routeEditor.valueStart.text(lastPoint.getTitle());
        }
    };

    // init routeBuilder by existing route
    this.initExist = function(route) {
        // TBD
    };

    // set points to defaults
    this.leavePoints = function() {
        var main = this.main;
        var obj = this;
        async.each(this.points,function(item,callback) {
            item.getMarker().setIcon(main.static.ICON_BLUE());
            callback();
        },function() {
            obj.points.length = 0;
        })
    };

    // save new route
    this.save = function() {
        // check name
        var title = this.main.getObjects().routeEditor.valueTitle.val();
        if (title === "") this.main.outMsg(TEXT[this.main.getLang()].nameNotChoosed, "red");
        else if (this.route.idS === -1) this.main.outMsg(TEXT[this.main.getLang()].routeStartNotSelected, "red");
        else if (this.route.idE === -1) this.main.outMsg(TEXT[this.main.getLang()].routeEndNotSelected, "red");
        else {
            this.route.setName(title);
            // save each route
            this.route.save();
            // check if this is a new route, if not add it to route layer
            var indx = this.main.routeLayer.routes.indexOf(this.route);
            if (indx === -1) {
                this.main.routeLayer.routes.push(this.route);
            }
            else this.main.routeLayer.routes[indx] = this.route;
            // add this route to search box
            this.main.searchBar.add(1,this.route.id,this.route.name);
            this.main.outMsg(TEXT[this.main.getLang()].routeSaved,"green");
        }
    };

    // action on builder closing
    this.end = function() {
        this.main.pointLayer.setVisible(false);
        if (this.points.length === 0) return;
        this.route.setVisible(false);
        this.leavePoints();
        this.main.pointLayer.setVisible(false);
    };
}

function Guide(main,start,end,result,total) {
    this.main = main;
    this.base = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport: true
    });
    this.geocoder = new google.maps.Geocoder();
    this.start = null;
    this.end = null;
    this.result = null;

    if (start) this.start = start;
    if (end) this.end = end;
    if (result) this.result = result;
    if (total) this.total = total;

    /*
     * Methods
     */

    this.push = function(position){
        var obj = this;
        if ((this.start) && (this.end)) return;
        // if position is the pos of A
        if (!this.start) {
            this.start = new google.maps.Marker({
                position: position,
                map: this.main.getMap(),
                icon: this.main.static.ICON_A()
            });
            this.geocoder.geocode({'latLng': position}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        // FEATURE - fetch address from result
                        obj.main.getObjects().guideEditor.valueStart.text(results[1].formatted_address.substr(0,30) + '...');
                    }
                }
            });
        }
        else {
            this.end = new google.maps.Marker({
                position: position,
                map: this.main.getMap(),
                icon: this.main.static.ICON_B()
            });
            this.geocoder.geocode({'latLng': position}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                       obj.main.getObjects().guideEditor.valueEnd.text(results[1].formatted_address.substr(0,30) + '...');
                    }
                }
            });
            var request = {
                origin: this.start.position,
                destination: this.end.position,
                travelMode: google.maps.TravelMode.DRIVING,
                optimizeWaypoints: false
            };
            this.main.routeLayer.directionsService.route(request, function(result, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    obj.result = JSON.stringify(result, stringifyNode);
                    obj.base.setDirections(result);
                    var myroute = result.routes[0];
                    var ttl = 0;
                    for (var i = 0; i < myroute.legs.length; i++) ttl += myroute.legs[i].distance.value;
                    obj.total = ttl;
                    obj.main.getObjects().guideEditor.valueLength.text(ttl);
                    obj.base.setMap(obj.main.getMap());
                }
            });
        }
    };

    this.popAll = function() {
        if (this.start) {
            this.start.setMap(null);
            this.start = null;
        }
        if (this.end) {
            this.end.setMap(null);
            this.end = null;
            this.base.setMap(null);
        }
        this.main.clearEditor();
    };
}

function stringifyNode(name, value) {
    if (value instanceof google.maps.LatLng) return 'LatLng(' + value.lat() + ',' + value.lng() + ')';
    else return value;
}

function parseNode(name, value) {
    if (/^LatLng\(/.test(value)) {
        var match = /LatLng\(([^,]+),([^,]+)\)/.exec(value);
        return new google.maps.LatLng(match[1], match[2]);
    } else return value;
}
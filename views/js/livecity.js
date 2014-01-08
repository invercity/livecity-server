// city object
var city = null;

// $.ready handler
$(document).ready(function() {
    // links to page objects
    var objects = {
        alertbox: $('#alertbox'),
        map: document.getElementById('map_canvas')
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
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    // create new city
    city = new Livecity(objects,settings);
    // init city
    city.init();
    // set update function with interval
    setInterval('city.update()',5000);
    // Edit stations click handler
    $("#edit").click(function() { city.onEditMarker(); });
    // edit route handler
    $("#edit2").click(function () { city.onEditRoute();});
    // guide handler
    $('#opt').click(function() {city.onGuide();});
    // Close edit panel handler
    $("#save_edit").click(function () {city.onSavePoint();});
    // Cancel edit point click handler
    $("#close_button_point").click(function () {city.onCloseMarkerEditor();});
    // Cancel edit route click handler
    $("#close_button_route").click(function () {city.onCloseRouteEditor();});
    // Cancel guide
    $('#close_button_guide').click(function() {city.onCloseGuide();});
    // remove button click
    $("#delete_edit").click(function () {city.onDeletePoint();});
    // back to city center
    $("#main").click(function (){city.setCenter(); city.outMsg("Вы вернулись в исходное положение","green")});
    // save route handler
    $("#save_route").click(function() { city.routeBuilder.save();});
    // auth button handler
    $("#auth").click(function() {city.auth();});
    // guide chkbox
    $('#guide_show_places').change(function() {
        // check 'checked' property
        if ($('#guide_show_places').prop('checked') === true) city.pointLayer.setVisible(true);
        else city.pointLayer.setVisible(false);
    })
    // new guide handler
    $('#guide_new').click(function() {city.guide.popAll();});
    // demo handler (temporary)
    $('#guide_demo').click(function(){city.guide.demo();});
});

/*
 * City Class
 */
function Livecity(objects,settings) {
    // UID [unused]
    var __uid = null;
    // objects
    var __objects = objects;
    // set settings
    var __settings = settings;
    // server url
    this.url = 'http://localhost:3000';
    // static objects
    this.objects = new Objects();
    // static values
    this.values = new Values();
    // visible items
    this.view = [];
    // map
    this.map = new google.maps.Map(__objects.map,__settings);

    /*
     * GETTTERS & SETTERS
     */

    // GET uid
    this.getUID = function() {
        return __uid;
    }
    // SET uid
    this.setUID = function(uid) {
        __uid = uid;
    }
    // GET objects
    this.getObjects = function() {
        return __objects;
    }
    // SET objects
    this.setObjects = function(objs) {
        __objects = objs;
    }
    // GET selected object
    this.getObject = function(name) {
        return __objects[name];
    }
    // SET selected object
    this.setObject = function(name,value) {
        __objects[name] = value;
    }
    // GET property
    this.getProperty = function(name) {
        return __settings[name];
    }
    // SET property
    this.setProperty = function(name,value) {
        __settings[name] = value;
    }
    // GET settings
    this.getProperties = function() {
        return __settings;
    }
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
    this.routeBuilder = -1;
    // guide
    this.guide = null;
    // flag for point editor
    this.pointEditorOpened = false;
    //flag for route editor
    this.routeEditorOpened = false;
    // flag for guide
    this.guideOpened = false;
}

// [P] init - init map
Livecity.prototype.init = function() {
    // load points on map
    this.pointLayer.load();
    // load nodes/routes on map
    this.routeLayer.load();
    // link to main document
    var obj = this;
    // map click handler
    google.maps.event.addListener(this.map, 'click', function(event) {
        // editor mode
        if (obj.pointEditorOpened) {
            obj.addPoint(event.latLng);
            obj.pointLayer.current.save();
            obj.outMsg("Метка сохранена","green");
            // user mode
            // NEED TEST
        } //else if (obj.pointLayer.current !== -1) obj.pointLayer.current.info.hide();
        if (obj.guideOpened) {
            obj.guide.push(event.latLng);
        }
    });
    // button click handler
    document.documentElement.onkeydown = function(e) {
        // if escape
        if (e.keyCode === 27) {
            if (obj.pointEditorOpened) {
                if (obj.pointLayer.current === -1) obj.onCloseMarkerEditor();
                else {
                    obj.pointLayer.setCurrent(-1);
                    obj.clearEditor();
                }
            }
            if (obj.routeEditorOpened) obj.onCloseRouteEditor();
            if (obj.guideOpened) obj.onCloseGuide();
        }
    };
    this.update();
};

// [P] outMsg - show notification message
Livecity.prototype.outMsg = function(text,color) {
    this.notifier.msg(text,color);
}

// [P] setEditPointData - set edits for editing marker
Livecity.prototype.setEditPointData = function(position, title, focus) {
    var lat = position.lat();
    var lng = position.lng();
    $("#label_posx").text(Number(lat).toFixed(4));
    $("#label_posy").text(Number(lng).toFixed(4));
    $("#label_name").val(title);
    if (focus) $('#label_name').focus();
};

// [P] addPoint - add new point on map
Livecity.prototype.addPoint = function(position) {
    var title = "id" + (this.pointLayer.points.length);
    var point = new MapPoint(this, position, this.objects.ICON_RED(), title);
    point.marker.setDraggable(true);
    point.marker.setVisible(true);
    //point.setId(this.pointLayer.points.length);
    this.pointLayer.add(point);
    this.pointLayer.setCurrent(point);
    this.setEditPointData(position, title, true);
    return point;
};

// [P] clearEditor - clear editor inputs
Livecity.prototype.clearEditor = function() {
    $("#label_posx").text("0");
    $("#label_posy").text("0");
    $("#label_name").val("");
    $("#label_route_name").val("");
    $("#routeStartText").text("Не выбрано");
    $("#routeEndText").text("Не выбрано");
    $('#guide_start').text('Не задано');
    $('#guide_end').text('Не задано');
    $('#guide_length').text('0');
};

// [P] setCenter - set map to selected map position
Livecity.prototype.setCenter = function(center) {
    // if center is not selected, set map center default value
    if (!center) this.map.setCenter(this.settings.center);
    // if selected - set value and save to settings
    else {
        this.map.setCenter(center);
        this.settings.center = center;
    }
};

// [P] auth - authorize user/end session
Livecity.prototype.auth = function() {
    if (this.getUID()) {
        // end session
        $("#auth").css("background", "url('img/key.png') right no-repeat");
        $("#auth").text("Вход");
        $("#edit").css("visibility", "hidden");
        $("#edit2").css("visibility", "hidden");
        $("#opt").css("visibility", "hidden");
        this.setUID(null);
        if (this.routeBuilder !== -1) this.routeBuilder.end();
        if (this.routeEditorOpened) this.onCloseRouteEditor();
        if (this.pointEditorOpened) this.onCloseMarkerEditor();
        if (this.guideOpened) this.onCloseGuide();
        this.outMsg("Сессия завершена","green");
        // login
    } else {
        $("#auth").css("background", "url('img/lock.png') right no-repeat");
        $("#auth").text("Выйти");
        $("#edit").css("visibility", "visible");
        $("#edit2").css("visibility", "visible");
        $("#opt").css("visibility", "visible");
        this.setUID(1);
        this.outMsg("Вы успешно авторизированы","green");
    }
};

// [P] update - update trans layer on a map
Livecity.prototype.update = function() {
    this.transLayer.update();
};

// [P] onSavePoint - save point handler [DEPRECATED]
Livecity.prototype.onSavePoint = function() {
    if (this.pointLayer.current === -1) this.outMsg("Нет данных для сохранения","red");
    else {
        this.pointLayer.current.save();
        this.outMsg("Метка сохранена","green");
    }
    //else this.outMsg("Произошла ошибка", "red");
};

// [P] onDeletePoint - delete point handler {DEPRECATED]
Livecity.prototype.onDeletePoint = function() {
    if (this.pointLayer.current === -1) this.outMsg("Ничего не выбрано","red");
    else {
        this.pointLayer.current.delete();
        this.outMsg("Метка удалена","green");
    }
};

// [P] onEditMarker - edit marker button handler [DEPRECATED]
Livecity.prototype.onEditMarker = function() {
    //close other editors
    if (this.routeEditorOpened) this.onCloseRouteEditor();
    if (this.guideOpened) this.onCloseGuide();
    // setting up cursor
    this.map.setOptions({
        draggableCursor: 'crosshair'
    });
    // show all points
    this.routeLayer.setVisible(false);
    this.pointLayer.setVisible(false);
    this.pointLayer.setVisible(true);
    // deselect search bar
    this.searchBar.deselect();
    // set current point
    this.pointLayer.setCurrent(-1);
    // show editor
    $('#edit_marker').show('500');
    // set the document flag
    this.pointEditorOpened = true;
};

// [P] onEditRoute - edit route button handler [DEPRECATED]
Livecity.prototype.onEditRoute = function() {
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
    var rb = this.routeBuilder;
    // setting onSetRouteEnd handler
    $('#setRouteEnd').click(function() {
        rb.setEnd();
    });
    $('#setRouteStart').click(function() {
        rb.setStart();
    });
    // show editor
    $('#edit_route').show('500');
    // set editor flag
    this.routeEditorOpened = true;
};

// [P] onGuide - actions on open guide [DEPRECATED]
Livecity.prototype.onGuide = function() {
    if (this.guideOpened) return;
    // close other editors
    if (this.pointEditorOpened) this.onCloseMarkerEditor();
    if (this.routeEditorOpened) this.onCloseRouteEditor();
    // show guide
    $('#guide').show('500');
    // set guide flag
    this.guideOpened = true;
    // set map handlers
    this.map.setOptions({
        draggableCursor: 'crosshair'
    });

    this.guide = new Guide(this);
    this.searchBar.deselect();
    this.outMsg('Виберите начальную и конечную точку на карте','green');
};

// [P] onCloseMarkerEditor - actions for closing editor [DEPRECATED]
Livecity.prototype.onCloseMarkerEditor = function() {
    $('#edit_marker').hide('500');
    // change cursor to default
    this.map.setOptions({
        draggableCursor: 'pointer'
    });
    // unset marker
    this.pointLayer.setCurrent(-1);
    // set the main document flag
    this.pointEditorOpened = false;
    this.pointLayer.setVisible(false);
};

// [P] onCloseRouteEditor - actions for closing editor [DEPRECATED]
Livecity.prototype.onCloseRouteEditor = function() {
    $('#edit_route').hide('500');
    this.routeEditorOpened = false;
    this.routeBuilder.end();
    this.clearEditor();
};

// [P] onCloseGuide - actions for closing guide [DEPRECATED]
Livecity.prototype.onCloseGuide = function() {
    $('#guide').hide('500');
    this.guideOpened = false;
    this.map.setOptions({
        draggableCursor: 'pointer'
    });
    this.guide.popAll();
    this.guide = null;
};

/*
 * Notifier Class
 */
function Notifier(parent) {
    // link to parent object
    var __parent = parent;
    // alertbox
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
    setTimeout(function() {
        link.getBox().css("display", "none");
    }, 3000);
}

/*
 * SearchBar Class
 */
function SearchBar(main) {
    this.main = main;
    // array for points, opened before
    this.oldP = [];
    // array for routes, opened before
    this.oldR = [];
    // init function
    this.init = function() {
        var obj = this;
        jQuery(".chosen").chosen({
            no_results_text: "Ничего не найдено для"
        }).change(function(e) {
            // check if this is not base mode
            if ((main.pointEditorOpened) || (main.routeEditorOpened) || (main.guideOpened)) {
                obj.deselect();
                main.outMsg("Данное действие не доступно в режиме редактирования","red");
            }
            // get copy of prevous selected points/routes
            var oldP = obj.oldP.slice();
            var oldR = obj.oldR.slice();
            obj.selected = $(this).val();
            // buffers for selected values
            var n = [];
            var r = [];
            // if something selected
            if (obj.selected !== null) {
                // fill buffers with points/routes
                for (var i = 0; i < obj.selected.length; i++) {
                    var point = obj.main.pointLayer.getPointById(obj.selected[i]);
                    if (point === -1) {
                        var route = obj.main.routeLayer.getRouteById(obj.selected[i]);
                        r.push(route);
                    } else {
                        n.push(point);
                    }
                }
            }
            // if there is any points selected
            if (n.length > -1) {
                // if we need to hide something
                if ($(oldP).not(n).get().length === 1) {
                    var point = $(oldP).not(n).get()[0];
                    // check, if this point is not part of visible route
                    if (!obj.main.routeLayer.isPointOfVisibleRoute(point.id)) point.setBaseVisible(false);
                    point.setVisible(false);
                }
                // if we need to show something new
                else if ((n.length > 0) && (n.length !== oldP.length)) {
                    var point = $(n).not(oldP).get()[0];
                    if (point) {
                        point.updateInfo();
                        point.setVisible(true);
                        point.setBaseVisible(true);
                    }
                }
            }
            // if there is any rotes selected
            if (r.length > -1) {
                // if we need to hide route
                if ($(oldR).not(r).get().length === 1) {
                    $(oldR).not(r).get()[0].setVisible(false);
                    obj.main.transLayer.setVisibleByRoute($(oldR).not(r).get()[0].id, false);
                    // set visible selected points
                    for (var x = 0; x < n.length; x++) if (!n[x].marker.visible) n[x].marker.setVisible(true);
                }
                // if we need to show new route
                else if ((r.length > 0) && (oldR.length !== r.length)) {
                    $(r).not(oldR).get()[0].setVisible(true);
                    obj.main.transLayer.setVisibleByRoute($(r).not(oldR).get()[0].id, true);
                }
            }
            // set currently selected points/routes as previous
            obj.oldP = n.slice();
            obj.oldR = r.slice();
        });
        
    };
    
    // add item to search pane
    this.add = function (group,id,name) {
        var groups = $("optgroup");
        $(groups[group]).append('<option value="' + id + '" >' + name + '</option>');
        this.update();
    };

    // buffer for selected items
    var selected = [];

    // update items
    this.update = function() {
        $('.chosen').trigger("liszt:updated");
    };

    // deselect all items
    this.deselect = function() {
        $('option').prop('selected', false);
        this.update();
    };

    this.test = function() {
        $("#main-search").val(2).trigger("liszt:updated");
    };

    this.select = function(id) {
        $('.chosen').select()
        $('.chosen').trigger("liszt:updated");
    };

    // operations on creating
    this.init();
}

// marker layer
function PointLayer(main) {
    // link to main
    this.main = main;
    // points on layer
    this.points = [];
    // current point
    this.current = -1;
    // visibility
    this.visible = false;

    // ----------- Methods -------------- //

    // visibility setter
    this.setVisible = function(is) {
        this.visible = is;
        var points = this.points;
        asyncLoop(this.points.length, function(loop) {
            var iter = loop.iteration();
            if (!is) points[iter].setVisible(false);
            points[iter].setBaseVisible(is);
            loop.next();
        });
    };

    // get array of visible points (infos)
    this.getVisible = function() {
        var result = [];
        for (var i = 0; i < this.points.length; i++) {
            if (this.points[i].visible) {
                result.push(this.points[i]);
            }
        }
        return result;
    };
    
    // get array of visible markers
    this.getVisibleMarkers = function() {
        var result = [];
        for (var i = 0; i < this.points.length; i++) {
            if (this.points[i].marker.visible) {
                result.push(this.points[i]);
            }
        }
        return result;
    }

    // add point to layer
    this.add = function(point) {
        this.points.push(point);
    };

    // load markers to map
    this.load = function() {
        var main = this.main;
        var layer = this;
        $.ajax({
            datatype: main.values.TYPE_JSON,
            type: main.values.TYPE_GET,
            url: main.url + '/data/points',
            async: false,
            success: function(result) {
                for (var i = 0; i < result.length; i++) {
                    var station = result[i];
                    var point = new MapPoint(main, new google.maps.LatLng(station.lat, station.lng), main.objects.ICON_BLUE(), station.title);
                    point.setId(station._id);
                    layer.add(point);
                    main.searchBar.add(0,point.id,point.marker.title);
                }
            }
        });
    };

    // set point as current
    this.setCurrent = function(point) {
        if (this.current !== -1) {
            this.current.marker.setIcon(main.objects.ICON_BLUE());
            this.current.marker.setDraggable(false);
        }
        // unset point
        if (point === -1) {
            if (this.main.pointEditorOpened) this.main.clearEditor();
            this.current = point;
        } else {
            // set such point as current
            var pos = this.points.indexOf(point);
            if (pos !== -1) {
                this.current = point;
                point.marker.setIcon(main.objects.ICON_RED());
            }
        }
    };

    // get point by point id [async]
    this.getPointById = function(id) {
        var points = this.points;
        for (var i = 0; i < points.length; i++) if (points[i].id === id) return points[i];
        return -1;
    };

    // get point by point id [async]
    this.getPointByName = function(name) {
        var points = this.points;
        for (var i = 0; i < points.length; i++) if (points[i].marker.title === name) return points[i];
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
    this.current = -1;
    // visibility
    this.visible = false;

    // ----------- Methods -------------- //

    // visibility [async]
    this.setVisible = function(is) {
        this.visible = is;
        routes = this.routes;
        asyncLoop(this.routes.length, function(loop) {
            routes[loop.iteration()].setVisible(is);
            loop.next();
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

    // load layer from server
    this.load = function() {
        var main = this.main;
        var obj = this;
        // at first - getting nodes
        $.ajax({
            datatype: main.values.TYPE_JSON,
            type: main.values.TYPE_GET,
            url: main.url + '/data/nodes',
            async: false,
            success: function(result) {
                for (var i = 0; i < result.length; i++) {
                    var node = result[i];
                    var idA = -1;
                    var idB = -1;
                    for (var j = 0; j < main.pointLayer.points.length; j++) {
                        if (main.pointLayer.points[j].id === node.a) idA = main.pointLayer.points[j];
                        if (main.pointLayer.points[j].id === node.b) idB = main.pointLayer.points[j];
                    }
                    var n = new MapNode(main, idA, idB, node.data, node.total);
                    n.setId(node._id);
                    main.routeLayer.nodes.push(n);
                }
                // next step - getting routes
                $.ajax({
                    datatype: main.values.TYPE_JSON,
                    type: main.values.TYPE_GET,
                    url: main.url + '/data/routes',
                    async: false,
                    success: function(result) {
                        var groups = $("optgroup");
                        for (var i = 0; i < result.length; i++) {
                            var route = result[i];
                            var end = {};
                            var start = {};
                            var nodes = route.nodes;
                            for (var j = 0; j < main.pointLayer.points.length; j++) {
                                if (main.pointLayer.points[j].id === route.end) end = main.pointLayer.points[j];
                                if (main.pointLayer.points[j].id === route.start) start = main.pointLayer.points[j];
                            }
                            var r = new MapRoute(main);
                            r.setName(route.title);
                            r.init(nodes);
                            // set route end
                            r.setEnd(end.marker.position, end.marker.title);
                            r.idE = route.end;
                            // set route start
                            r.setStart(start.marker.position,start.marker.title);
                            r.idS = route.start;
                            r.setId(route._id);
                            obj.routes.push(r);
                            $(groups[1]).append('<option value="' + route._id + '" >' + route.title + '</option>');
                            main.searchBar.update();
                        }
                    }
                });
            }
        });
    };

    // return true, if each point is part of visible route
    this.isPointOfVisibleRoute = function(id) {
        var is = false;
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
            datatype: main.values.TYPE_JSON,
            type: main.values.TYPE_GET,
            url: main.url + '/data/transport',
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
        var t = this.trans;
        var r = this.routes;
        asyncLoop(t.length, function(loop) {
            var iter = loop.iteration();
            if (t[iter].id_route === id) {
                t[iter].setVisible(is);
                if (is) r.push(id);
                else r.splice(r.indexOf(id), 1);
            }
            loop.next();
        });
    };

    // update points, and set visible required
    this.update = function() {
        this.clear();
        this.load();
        // TBD
    };
}

// class for route
function MapRoute(main) {
    // set main
    this.main = main;
    // unique identifier
    this.id = -1;
    // start point
    this.a;
    // end point
    this.b;
    // start id
    this.idS = -1;
    // end id
    this.idE = -1;
    // start point info
    this.infoA = -1;
    // end point info
    this.infoB = -1;
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
        var main = this.main;
        asyncLoop(nodes.length, function(loop) {
            nodes[loop.iteration()].setVisible(is);
            loop.next();
        });
        // UPD
        if (is) {
            if (this.infoA !== -1) this.infoA.open(this.main.map);
            if (this.infoB !== -1) this.infoB.open(this.main.map);
        } else {
            if (this.infoA !== -1) this.infoA.open(null);
            if (this.infoB !== -1) this.infoB.open(null);
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
    this.setStart = function(position, title) {
        this.a = position;
        if (this.infoA !== -1) this.infoA.hide();
        this.infoA = new InfoBox({
            content: '<div class="text"><center>' + title + '</center></div>',
            boxClass: "infoRoute",
            pixelOffset: new google.maps.Size(-50, -50),
            closeBoxURL: 'img/close_t.png'
        });
        this.infoA.setPosition(position);
    };

    // end setter
    this.setEnd = function(position, title) {
        this.b = position;
        if (this.infoB !== -1) this.infoB.hide();
        this.infoB = new InfoBox({
            content: '<div class="text"><center>' + title + '</center></div>',
            boxClass: "infoRoute",
            pixelOffset: new google.maps.Size(-50, -50),
            closeBoxURL: 'img/close_t.png'
        });
        this.infoB.setPosition(position);
    };

    // init route
    this.init = function(ids) {
        var main = this.main;
        var obj = this;
        asyncLoop(ids.length, function(loop) {
            var iter = loop.iteration();
            for (var j = 0; j < main.routeLayer.nodes.length; j++) {
                // TEST
                if (main.routeLayer.nodes[j].id == ids[iter]) {
                    obj.add(main.routeLayer.nodes[j]);
                }
            }
            loop.next();
        });
    };

    // save route
    this.save = function() {
        var main = this.main;
        var obj = this;
        var nodes = this.nodes;
        // save new nodes at first
        var globalNodes = this.main.routeLayer.nodes;
        asyncLoop(nodes.length, function(loop) {
            var iter = loop.iteration();
            nodes[iter].save();
            var indx = globalNodes.indexOf(nodes[iter]);
            if (indx === -1) globalNodes.push(nodes[iter]);
            nodes[iter] = globalNodes[globalNodes.indexOf(nodes[iter])];
            loop.next();
            // callback
        }, function() {
            var json = {};
            // calculate total distance
            var total = 0;
            for (var x = 0; x < obj.nodes.length; x++) total += obj.nodes[x].total;
            // fill properties
            var ids = [];
            for (var i = 0; i < obj.nodes.length; i++) ids.push(obj.nodes[i].id);
            json.start = obj.idS;
            json.end = obj.idE;
            json.nodes = ids;
            json.points = obj.points;
            json.total = total;
            json.title = obj.name;
            // send data
            $.ajax({
                datatype: main.values.TYPE_JSON,
                type: main.values.TYPE_POST,
                url: main.url + '/data/routes/',
                data: json,
                success: function(result) {
                    obj.setId(result.route._id);
                }
            });
            main.outMsg("Маршрут сохранен","green");
        });
    };

    // return true if this point in this route
    this.isPointOf = function(id) {
        var index = this.points.indexOf(id);
        if (index !== -1) return true;
        return false;
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
            origin: this.a.marker.position,
            destination: this.b.marker.position,
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

    this.calc = function() {
        if (this.resNode !== -1) {
            var myroute = this.resNode.routes[0];
            this.total = 0;
            for (var i = 0; i < myroute.legs.length; i++) this.total += myroute.legs[i].distance.value;
            return total;
        }
        return 0;
    };

    this.setResult = function(res) {
        this.resNode = res;
        this.base.setDirection(this.resNode);
    };

    // setter visibility
    this.setVisible = function(is) {
        this.visible = is;
        this.a.marker.setVisible(is);
        this.b.marker.setVisible(is);
        if (!is) {
            this.base.setMap(null);
            // if info was opened
            this.a.setVisible(false);
            this.b.setVisible(false);
        }
        else this.base.setMap(this.main.map);
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
        json.a = this.a.id;
        json.b = this.b.id;
        json.total = this.total;
        json.data = this.resNode;
        $.ajax({
            datatype: main.values.TYPE_JSON,
            type: main.values.TYPE_POST,
            url: main.url + '/data/nodes/',
            data: json,
            async: false,
            success: function(result) {
                // REPLACE
                obj.setId(result.node._id);
            }
        });
    };

    if (this.resNode === -1) this.init();
    else this.base.setDirections(JSON.parse(this.resNode, parseNode));
}
// class for points
function MapPoint(main, position, icon, title) {
    // link to main
    this.main = main;
    // flag for enabling info on click
    this.enabled = true;
    // flag for arker visibility
    this.visible = false;
    // unique id
    this.id = -1;
    // google.maps.Marker base
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(Number(position.lat()).toFixed(4), Number(position.lng()).toFixed(4)),
        icon: icon,
        map: main.map,
        title: title,
        draggable: false,
        visible: false
    });

    this.basecontent = '<div class="text" id="info' + this.id + '"><center><b>' + this.marker.title + '</b></center></div>';
    // infoBox base
    this.info = new InfoBox({
        content: this.basecontent,
        boxClass: "infoBox",
        pixelOffset: new google.maps.Size(-150, -120),
    });

    // enable setter
    this.setEnabled = function(is) {
        this.enabled = is;
    };

    // title setter
    this.setTitle = function(title) {
        this.marker.setTitle(title);
        // add some code for updating content
    };

    // visible setter
    this.setVisible = function(is) {
        if (!is) this.info.hide();
        else {
            this.info.open(this.main.map, this.marker);
            this.info.show();
        }
        this.visible = is;
    };

    // visibility of marker
    this.setBaseVisible = function(is) {
        this.marker.setVisible(is);
        if (!is) {
            //this.setVisible(false);
        }
        //this.visible = is;
    };

    // set unique id
    this.setId = function(id) {
        this.id = id;
    };

    // update constent of .info
    this.updateInfo = function() {
        var main = this.main;
        var obj = this;
        if (this.id !== -1) {
            $.ajax({
                datatype: main.values.TYPE_JSON,
                type: main.values.TYPE_GET,
                url: main.url + '/arrival/' + this.id,
                success: function(result) {
                    var content = "";
                    var routeresult;
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
                            routeresult = ctime + ":" + p + rtime + " мин. <br/>";
                        }
                        // TBD
                        // need to add some other checks
                        else routeresult = " Нет данных<br/>";
                        content += ("№" + result[i].name + " - " + routeresult);
                    }
                    if (result.length === 0) content += "Нет доступных маршрутов<br/>";
                    obj.info.setContent(obj.basecontent + content);
                }
            });
        }
    };

    // click listener setter
    this.setClickListener = function() {
        var obj = this;
        var main = this.main;
        // adding default handlers
        google.maps.event.addListener(this.marker, 'click', function(event) {
            if (main.pointEditorOpened) {
                main.setEditPointData(this.position, this.title, true);
                main.pointLayer.setCurrent(obj);
                this.setDraggable(true);
            } else if (main.routeEditorOpened) {
                for (var i = 0; i < main.pointLayer.points.length; i++) {
                    if (main.pointLayer.points[i].marker === this) main.routeBuilder.add(main.pointLayer.points[i]);
                }
            }
            // base mode
            else {
                // hide info, which was opened before
                //if (main.pointLayer.current !== -1) main.pointLayer.current.info.hide();
                //main.pointLayer.current = obj;
                if (obj.visible) obj.setVisible(false);
                else {
                    obj.updateInfo();
                    obj.setVisible(true);
                }
                
            }
        });
        google.maps.event.addListener(this.marker, 'drag', function(event) {
            if (main.pointEditorOpened) {
                var name = $('#label_name').val();
                main.setEditPointData(this.position, name, false);
            }
        });
        google.maps.event.addListener(this.marker, 'dragend', function(event) {
            if (main.pointEditorOpened) {
                main.pointLayer.current.save();
                main.outMsg("Метка сохранена","green");
            }
        });
        // TBD
        // it will be good feture to deselect item from searchbox when i click "close" button on its info
    };

    // delete point
    this.delete = function() {
        // async delete on server
        $.ajax({
            datatype: main.values.TYPE_JSON,
            type: main.values.TYPE_DELETE,
            url: main.url + '/data/points/' + this.id,
            cache: false
        });
        this.marker.setMap(null);
        // some code for info....
        // TBD
        this.main.pointLayer.points.splice(main.pointLayer.points.indexOf(this), 1);
        this.main.pointLayer.setCurrent(-1);
    };

    // save point
    this.save = function() {
        // link to base class
        var main = this.main;
        // object for sending
        var json = {};
        // fill properties
        json.lat = $('#label_posx').text();
        json.lng = $('#label_posy').text();
        /*if (this.id !== -1)*/
        json._id = this.id;
        json.title = $('#label_name').val();
        // create new one
        if (this.id === -1) {
            $.ajax({
                datatype: main.values.TYPE_JSON,
                type: main.values.TYPE_POST,
                url: main.url + '/data/points',
                data: json,
                async: false,
                success: function(result) {
                    main.pointLayer.current.setId(result.point._id);
                    main.searchBar.add(0,result.point._id,json.title);
                }
            });
        }
        // update existing
        else {
            $.ajax({
                datatype: main.values.TYPE_JSON,
                type: main.values.TYPE_PUT,
                url: main.url + '/data/points/' + this.id,
                data: json,
                async:false,
                success: function(result) {
                    // NEED DEBUG
                }
            });
        }

        /// TEST
        main.pointLayer.current.setTitle(json.title);
    };

    // set default click listener
    this.setClickListener();
}

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
        icon: main.objects.ICON_TRANS(),
        map: main.map,
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
        point.marker.setIcon(this.main.objects.ICON_RED());
        var size = this.points.length;
        if (this.points.length > 1) {
            var node = new MapNode(this.main, this.points[size - 2], this.points[size - 1], -1, 0);
            this.route.add(node);
            node.setVisible(true);
        }
    };

    // set endpoint of route
    this.setEnd = function() {
        if (this.points.length === 0) main.outMsg("Ничего не выбрано","red");
        else {
            var infoB = this.route.infoB;
            // close prevoius endpoint info
            if (infoB !== -1) infoB.open(null);
            var lastPoint = this.points[this.points.length - 1];
            // set new endpoint
            this.route.setEnd(lastPoint.marker.position, lastPoint.marker.title);
            // set new endpoint id
            this.route.idE = lastPoint.id;
            // show new endpoint info
            this.route.infoB.open(this.main.map, lastPoint.marker);
            // set info in box
            $('#routeEndText').text(lastPoint.marker.title);
        }
    };

    // set start point of route
    this.setStart = function() {
        if (this.points.length === 0) main.outMsg("Ничего не выбрано","red");
        else {
            var infoA = this.route.infoA;
            // close prevoius endpoint info
            if (infoA !== -1) infoA.open(null);
            var lastPoint = this.points[this.points.length - 1];
            // set new endpoint
            this.route.setStart(lastPoint.marker.position, lastPoint.marker.title);
            // set new endpoint id
            this.route.idS = lastPoint.id;
            // show new endpoint info
            this.route.infoA.open(this.main.map, lastPoint.marker);// set info in box
            $('#routeStartText').text(lastPoint.marker.title);
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
        asyncLoop(this.points.length, function(loop) {
            obj.points[loop.iteration()].marker.setIcon(main.objects.ICON_BLUE());
            loop.next();
        }, function() {
            obj.points.length = 0;
        });
    };

    // save new route
    this.save = function() {
        // check name
        var name = $('#label_route_name').val();
        if (name === "") this.main.outMsg("Имя не задано", "red");
        else if (this.route.idS === -1) this.main.outMsg("Начало маршрута не задано", "red");
        else if (this.route.idE === -1) this.main.outMsg("Конец маршрута не задан", "red");
        else {
            this.route.setName(name);
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
    this.end = null;
    this.infoBoxes = [];
    if (start) this.start = start;
    if (end) this.end = end;
    if (result) this.result = result;
    if (total) this.total = total;
    // TMP
    this.demoOpened = false;
    this.markers = [];
    /*
     * Methods
     */

    this.push = function(position){
        if ((this.start) && (this.end)) return;
        // if position is the pos of A
        if (!this.start) {
            this.start = new google.maps.Marker({
                position: position,
                map: this.main.map,
                icon: this.main.objects.ICON_A()
            });
            this.geocoder.geocode({'latLng': position}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        $("#guide_start").text(results[1].formatted_address.substr(0,30) + '...');
                    }
                }
            });
            //$("#guide_start").text(Number().toFixed(4));
        }
        else {
            this.end = new google.maps.Marker({
                position: position,
                map: this.main.map,
                icon: this.main.objects.ICON_B()
            });
            this.geocoder.geocode({'latLng': position}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        $("#guide_end").text(results[1].formatted_address.substr(0,30) + '...');
                    }
                }
            });
            var obj = this;
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
                    $('#guide_length').text(ttl);
                    obj.base.setMap(obj.main.map);
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

        // TMP
        if (this.demoOpened) {
            for (var a=0;a<this.infoBoxes.length;a++) this.infoBoxes[a].open(null);
            for (var a=0;a<this.markers.length;a++) this.markers[a].setMap(null);
            this.markers = [];
            this.infoBoxes = [];
            this.demoOpened = false;
        }
        this.main.clearEditor();
    };

    this.addExch = function(position,title) {
        var a = new InfoBox({
            content: '<div class="text"><center><b>' + title + '</b></center></div>',
            boxClass: "infoRoute",
            pixelOffset: new google.maps.Size(-50, -50),
            closeBoxURL: 'img/close_t.png'
        });
        a.setPosition(position);
        this.infoBoxes.push(a);
        return a;
    }

    this.demo = function() {
        this.popAll();
        this.demoOpened = true;
        var posA = new google.maps.LatLng(51.4986,31.3029);
        var posB = new google.maps.LatLng(51.4945,31.2958);
        var posC = new google.maps.LatLng(51.4949,31.2946);
        var posD = new google.maps.LatLng(51.5008,31.2856);

        var start = new google.maps.LatLng(51.5020,31.3087);
        var end = new google.maps.LatLng(51.5015,31.2848);
        this.push(start);
        this.push(end);

        var MA = new google.maps.Marker({
            position: posA,
            map: this.main.map,
            icon: this.main.objects.ICON_BLUE()
        });
        var MB = new google.maps.Marker({
            position: posB,
            map: this.main.map,
            icon: this.main.objects.ICON_BLUE()
        });
        var MC = new google.maps.Marker({
            position: posC,
            map: this.main.map,
            icon: this.main.objects.ICON_BLUE()
        });
        var MD = new google.maps.Marker({
            position: posD,
            map: this.main.map,
            icon: this.main.objects.ICON_BLUE()
        });
        this.markers.push(MA);
        this.markers.push(MB);
        this.markers.push(MC);
        this.markers.push(MD);

        this.addExch(posA,'>> 12').open(this.main.map);
        this.addExch(posB,'12 >>').open(this.main.map);
        this.addExch(posC,'>> 37').open(this.main.map);
        this.addExch(posD,'37 >>').open(this.main.map);
    }
}

// static objects class
function Objects() {
    this.ICON_BLUE = function() {
        return new google.maps.MarkerImage('img/stop2.png', new google.maps.Size(16, 16), new google.maps.Point(0, 0), new google.maps.Point(8, 10));
    };
    this.ICON_RED = function() {
        return new google.maps.MarkerImage('img/stop-m2.png', new google.maps.Size(16, 16), new google.maps.Point(0, 0), new google.maps.Point(8, 10));
    };
    this.ICON_TRANS = function() {
        return new google.maps.MarkerImage('img/bus.png', new google.maps.Size(32, 37), new google.maps.Point(0, 0), new google.maps.Point(16, 33));
    };
    this.ICON_A = function() {
        return new google.maps.MarkerImage('http://www.google.com/mapfiles/markerA.png', new google.maps.Size(36, 36), new google.maps.Point(0, 0), new google.maps.Point(9, 33));
    }
    this.ICON_B = function() {
        return new google.maps.MarkerImage('http://www.google.com/mapfiles/markerB.png', new google.maps.Size(36, 36), new google.maps.Point(0, 0), new google.maps.Point(9, 33));
    }
}

// const strings
function Values() {
    this.TYPE_POST = 'POST';
    this.TYPE_JSON = 'JSON';
    this.TYPE_GET = 'GET';
    this.TYPE_DELETE = 'DELETE';
    this.TYPE_PUT = 'PUT';
}

// asynchronus loop
function asyncLoop(iterations, func, callback) {
    var index = 0;
    var done = false;
    var loop = {
        next: function() {
            if (done) {
                return;
            }

            if (index < iterations) {
                index++;
                func(loop);

            } else {
                done = true;
                if (callback) callback();
            }
        },

        iteration: function() {
            return index - 1;
        },

        break: function() {
            done = true;
            callback();
        }
    };
    loop.next();
    return loop;
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
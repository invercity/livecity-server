// city object
var city = null;

// text
TEXT = {
    zero: '0',
    empty: '',
    RU: {
        backToDefaultPlace: 'Вы вернулись в исходное положение',
        editingFinished: 'Редактирования завершено',
        modePointEditor: 'Режим редактирования остановок',
        modeRouteEditor: 'Режим редактирования маршрутов',
        thisActionIsNotAllowed: 'Данное действие не доступно в режиме редактора',
        noDataToSave: 'Нет данных для сохранения',
        nothingSelected: 'Ничего не выбрано',
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
        exit: 'Выход',
        minute: 'мин.',
        transArrived: 'прибыл'
    },
    ENG: {
        backToDefaultPlace: 'You have back to default place',
        editingFinished: 'Editing finished',
        modePointEditor: 'Point editor mode',
        modeRouteEditor: 'Route editor mode',
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
        exit: 'Exit',
        minute: 'min.',
        transArrived: 'arrived'
    }
};

// $.ready handler
$(document).ready(function() {
    // links to page objects
    var objects = {
        body : $('body'),
        alertbox: $('#alertbox'),
        map: document.getElementById('map_canvas'),
        onAuth : $('#auth'),
        control: $('#control'),
        editPoints: $('#edit_points'),
        editRoutes: $('#edit_routes'),
        editGuide: $('#edit_guide'),
        pointEditor: {
            open: $('#open-point-editor'),
            close: $('#point-editor-close'),
            save: $('#point-save'),
            remove: $('#point-delete'),
            valueLat: $('#label_posx'),
            valueLng: $('#label_posy'),
            valueTitle: $('#label_name')
        },
        routeEditor: {
            open: $('#open-route-editor'),
            close: $('#route-editor-close'),
            save: $('#route-save'),
            remove: $('#route-route-remove'),
            start: $('#button-route-start'),
            end: $('#button-route-end'),
            valueTitle: $('#route-name'),
            valueStart: $('#route-start'),
            valueEnd: $('#route-end')
        },
        guideEditor : {
            open: $('#open-guide'),
            close: $('#guide-close'),
            save: $('#guide-save'),
            create: $('#guide-new'),
            valueStart: $('#guide_start'),
            valueEnd: $('#guide_end'),
            valueLength: $('#guide_length'),
            valueUrl: $('#guide_url'),
            valueIfPlacesShowed: $('#guide-show-places')
        },
        toolBox: {
            base: $('#toolbox'),
            data: $('#toolbox-data'),
            activeGuide: $('#tab-guide-active'),
            activePoint: $('#tab-point-active'),
            activeRoute: $('#tab-route-active')
        },
        loginBox: {
            base: $('#authform'),
            login: $('#auth-login'),
            pass: $('#auth-pass'),
            act: $('#auth-submit')
        },
        searchBar: {
            base: $('#main-search'),
            chosen: $('.chosen'),
            option: function() {
                return $('option');
            },
            groups: $('optgroup'),
            main: function() {
                return $('#main_search_chzn');
            },
            drop: function() {
                return $('.chzn-drop');
            }
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
    // TBD
    setInterval('city.update()',2000);
    // Edit stations click handler
    objects.pointEditor.open.click(function() { city.onEditPoint(); });
    // edit route handler
    objects.routeEditor.open.click(function () { city.onEditRoute();});
    // guide handler
    objects.guideEditor.open.click(function() {city.onEditGuide();});
    // Close edit panel handler
    objects.pointEditor.save.click(function () {city.onSavePoint();});
    // Cancel edit point click handler
    objects.pointEditor.close.click(function () {city.onClosePointEditor();});
    // Cancel edit route click handler
    objects.routeEditor.close.click(function () {city.onCloseRouteEditor();});
    // Cancel guide
    objects.guideEditor.close.click(function() {city.onCloseGuideEditor();});
    // remove button click
    objects.pointEditor.remove.click(function () {city.onDeletePoint();});
    // back to city center
    objects.control.click(function (){city.setCenter();});
    // save route handler
    objects.routeEditor.save.click(function() { city.routeBuilder.save();});
    // set route start handler
    objects.routeEditor.start.click(function() {city.routeBuilder.setStart();});
    // set route start handler
    objects.routeEditor.end.click(function() {city.routeBuilder.setEnd();});
    // onAuth button handler
    objects.onAuth.click(function() {city.onAuth();});
    // login button handler
    objects.loginBox.base.on('submit', function(e) {city.onLogin(e)});
    // guide checkbox
    objects.guideEditor.valueIfPlacesShowed.change(function() {
        // check 'checked' property
        if (objects.guideEditor.valueIfPlacesShowed.prop('checked')) city.pointLayer.setVisible(true);
        else city.pointLayer.setVisible(false);
    });
    // new guide handler
    objects.guideEditor.create.click(function() {city.toolBox.__guideEditor.popAll();});
    // search bar init
    objects.searchBar.chosen.chosen({
            no_results_text: TEXT[city.getLang()],
            width: '100%'
    }).change(function() {
            city.searchBar.init($(this).val());
    });
    // fixing searchBar width... [TEMPORARY]
    objects.searchBar.main().css('width', '100%');
    objects.searchBar.drop().css('width', '100%');
    // key down handler
    objects.body.on('keydown',function(e) {
        // escape handler
        if (e.keyCode === 27) city.onEscape();
    });

    /*
     * TEXT SET
     */

    $.get('/app/version', function(version) {
        objects.control.html('livecity<div class="small"><sup> ' + version + '</sup></div> ');
    });
});

/*
 * City Class
 * @objects - link to HTML objects
 * @settings - settings for livecity
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
    // GET map
    this.getMap = function() {
        return __map;
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
    // tool box
    this.toolBox = new ToolBox(this);
    // auth box
    this.loginBox = new LoginBox(this);
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
        if (link.toolBox.isPointEditorOpened()) {
            var point = link.addPoint(event.latLng);
            point.save(function() {
                link.pointLayer.add(point);
                link.pointLayer.setCurrent(point);
                link.searchBar.update();
                link.outMsg(TEXT[link.getLang()].pointSaved,"green");
            });
        }
        // guide editor mode
        if (link.toolBox.isGuideEditorOpened()) {
            // temporary
            link.toolBox.__guideEditor.push(event.latLng);
        }
    });
    this.toolBox.maximize(false);
    this.loginBox.checkAuthorization(function(res) {
        link.login(res);
    });
    this.update();
};

// [P] outMsg - show notification message
Livecity.prototype.outMsg = function(text,color) {
    this.notifier.msg(text,color);
};

// [P] onEscape - Escape button handler
Livecity.prototype.onEscape = function() {
    // point editor mode
    if (this.toolBox.isPointEditorOpened()) {
        if (this.pointLayer.getCurrent()) {
            this.pointLayer.setCurrent();
            this.toolBox.clear();
        }
        else this.onClosePointEditor();
    }
    if (this.toolBox.isRouteEditorOpened()) {
        this.onCloseRouteEditor();
    }
    if (this.toolBox.isGuideEditorOpened()) {
        if (!this.toolBox.__guideEditor.empty()) {
            this.toolBox.__guideEditor.popAll();
            this.toolBox.clear();
        }
        else this.onCloseGuideEditor();
    }
};

// [P] setEditPointData - set edits for editing marker
Livecity.prototype.setEditPointData = function(position, title, focus) {
    var lat = position.lat();
    var lng = position.lng();
    // UPD - add option Round?
    this.getObjects().pointEditor.valueLat.text(Number(lat).toFixed(4));
    this.getObjects().pointEditor.valueLng.text(Number(lng).toFixed(4));
    this.getObjects().pointEditor.valueTitle.val(title);
    // UPD
    if (focus) this.getObjects().pointEditor.valueTitle.focus();
};

// [P] addPoint - add new point on map
Livecity.prototype.addPoint = function(position) {
    var title = "id" + (this.pointLayer.points.length);
    var point = new MapPoint(this, null, position, this.static.ICON_RED(), title);
    point.getMarker().setDraggable(true);
    point.setVisible(true);
    this.setEditPointData(position, title, true);
    return point;
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

Livecity.prototype.login = function(is) {
    if (true === is) {
        this.toolBox.show(true);
        this.getObjects().onAuth.css("background", "url('img/lock.png') right no-repeat");
        this.getObjects().onAuth.text(TEXT[this.getLang()].exit);
        this.loginBox.setVisible(false);

    }
    else {
        this.toolBox.show(false);
        if (this.toolBox.isRouteEditorOpened()) this.onCloseRouteEditor();
        if (this.toolBox.isPointEditorOpened()) this.onClosePointEditor();
        if (this.toolBox.isGuideEditorOpened()) this.onCloseGuideEditor();
        this.getObjects().onAuth.css("background", "url('img/key.png') right no-repeat");
        this.getObjects().onAuth.text(TEXT[this.getLang()].login);
    }
};

// [P] onAuth - authorize user/end session
Livecity.prototype.onAuth = function(change) {
    var _this = this;
    this.loginBox.checkAuthorization(function(res) {
        if (true === res) {
            _this.loginBox.logout(function(res){
                if (true === res) {
                    _this.login(false);
                    _this.outMsg(TEXT[_this.getLang()].sessionEnd,"green");
                }
                else {
                    // TBD
                    // logout err
                }
            })
        }
        else {
            _this.loginBox.setVisible(true);
        }
    });
};

Livecity.prototype.onLogin = function(e) {
    var _this = this;
    this.loginBox.login(this.getObjects().loginBox.base, function(result){
        if (true === result) {
            _this.login(true);
            _this.outMsg(TEXT[_this.getLang()].authSucc,"green");
        };
    });
    e.preventDefault();
};

// [P] update - update trans layer on a map
Livecity.prototype.update = function() {
    this.transLayer.update();
};

// [P] onSavePoint - save point handler [DEPRECATED]
Livecity.prototype.onSavePoint = function() {
    var link = this;
    var current = this.pointLayer.getCurrent();
    if (!current) this.outMsg(TEXT[this.getLang()].noDataToSave,"red");
    else {
        current.save(function () {
            link.searchBar.update();
            link.outMsg(TEXT[link.getLang()].pointSaved,"green");
        });
    }
};

// [P] onDeletePoint - delete point handler {DEPRECATED]
Livecity.prototype.onDeletePoint = function() {
    var link = this;
    var current = this.pointLayer.getCurrent();
    if (!current) this.outMsg(TEXT[this.getLang()].nothingSelected,"red");
    else {
        this.pointLayer.remove(current, function () {
            link.searchBar.update();
            link.toolBox.clear();
            link.outMsg(TEXT[link.getLang()].pointRemoved,"green");
        });
    }
};

// [P] onEditPoint - edit marker button handler [DEPRECATED]
Livecity.prototype.onEditPoint = function() {
    this.toolBox.openPointEditor(true);
    this.outMsg(TEXT[this.getLang()].modePointEditor,"green");
};

// [P] onEditRoute - edit route button handler [DEPRECATED]
Livecity.prototype.onEditRoute = function() {
    this.toolBox.openRouteEditor(true);
    this.outMsg(TEXT[this.getLang()].modeRouteEditor,"green");
};
// [P] onGuide - actions on open guide [DEPRECATED]
Livecity.prototype.onEditGuide = function() {
    this.toolBox.openGuideEditor(true);
    this.outMsg(TEXT[this.getLang()].selectFirstEndPointOnMap,'green');
};

// [P] onClosePointEditor - actions for closing editor
Livecity.prototype.onClosePointEditor = function() {
    this.toolBox.openPointEditor(false);
    this.toolBox.deselect();
    this.toolBox.maximize(false);
    this.outMsg(TEXT[this.getLang()].editingFinished,"green");
};

// [P] onCloseRouteEditor - actions for closing editor
Livecity.prototype.onCloseRouteEditor = function() {
    this.toolBox.openRouteEditor(false);
    this.toolBox.deselect();
    this.toolBox.maximize(false);
    this.outMsg(TEXT[this.getLang()].editingFinished,"green");
};

// [P] onCloseGuide - actions for closing guide
Livecity.prototype.onCloseGuideEditor = function() {
    this.toolBox.openGuideEditor(false);
    this.toolBox.deselect();
    this.toolBox.maximize(false);
    this.outMsg(TEXT[this.getLang()].editingFinished,"green");
};

Livecity.prototype.optimizeView = function(point, callback) {
    var __this = this;
    var bounds = new google.maps.LatLngBounds();
    var vPoints = this.pointLayer.getVisible();
    var vRoutes = this.routeLayer.getVisible();
    async.each(vPoints, function(item ,callback) {
        bounds.extend(item.getPosition());
        callback();
    }, function() {
        async.each(vRoutes, function(item, callback) {
            bounds.extend(item.getInfoStart().getPosition());
            bounds.extend(item.getInfoEnd().getPosition());
            callback();
        }, function(){
            if ((vPoints.length === 0) && (vRoutes.length === 0)) {
                var b1 = new google.maps.LatLngBounds();
                b1.extend(__this.getProperties().center);
                __this.getMap().fitBounds(b1);
                __this.getMap().setZoom(__this.getProperties().zoom);
            }
            else __this.getMap().fitBounds(bounds);
            if (point) {
                var b = new google.maps.LatLngBounds();
                b.extend(bounds.getCenter());
                b.extend(point.getPosition());
                __this.getMap().setCenter(b.getCenter());
            }
            if (vPoints.length === 1) __this.getMap().setZoom(__this.getProperties().zoom);
            else if (callback) callback();
        });
    });
};

/*
 * LoginBox Class
 */
function LoginBox(parent) {
    // link to parent
    this.__parent = parent;
    // visible flag
    this.__visible = false;
};

// [P]
LoginBox.prototype.setVisible = function(is) {
    if (true === is) {
        this.__visible = true;
        this.__parent.getObjects().loginBox.base.show();
    }
    else {
        this.__visible = false;
        this.__parent.getObjects().loginBox.base.hide();
    }
};

LoginBox.prototype.login = function(box, callback) {
    $.ajax({
        url: '/login',
        type: 'POST',
        data: box.serialize(),
        success: function(result) {
            if (result.authorized) {
                callback(true);
            }
            else callback(false);
    }});
};

LoginBox.prototype.logout = function(callback) {
    var _this = this;
    $.ajax({
        url: '/logout',
        type: 'POST',
        success: function(res) {
            if (res.logout) {
                callback(true);
            }
            else callback(false);
        }
    });
};

LoginBox.prototype.checkAuthorization = function(callback) {
    $.get('/session', function(res) {
        callback(true === res.authorized);
    });
};

/*
 * ToolBox Class
 */
function ToolBox(parent) {
    // link to parent
    this.__parent = parent;
    // point editor flag
    this.__pointEditorOpened = false;
    // route editor link
    this.__routeEditor = null;
    // guide editor link
    this.__guideEditor = null;
    // visibility flag
    this.__visible = false;
    // maximize flag
    this.__maximized = false;
}

// [P]
ToolBox.prototype.isPointEditorOpened = function() {
    return this.__pointEditorOpened;
};

// [P]
ToolBox.prototype.isRouteEditorOpened = function() {
    return (this.__routeEditor !== null);
};

// [P]
ToolBox.prototype.isGuideEditorOpened = function() {
    return (this.__guideEditor !== null);
};

// [P]
ToolBox.prototype.openPointEditor = function(is) {
    if (true === is) {
        if ((!this.__maximized)) {
            this.maximize(true);
        }
        else if ((this.__maximized) && (this.isPointEditorOpened())) {
            this.maximize(false);
            return;
        }
        if (!this.isPointEditorOpened()) {
            //close other editors
            if (this.isRouteEditorOpened()) this.openRouteEditor(false);
            if (this.isGuideEditorOpened()) this.openGuideEditor(false);
            // setting up cursor
            this.__parent.getMap().setOptions({
                draggableCursor: 'crosshair'
            });
            // show all points
            this.__parent.routeLayer.setVisible(false);
            this.__parent.pointLayer.setVisible(false);
            this.__parent.pointLayer.setVisible(true);
            // deselect search bar
            this.__parent.searchBar.deselect();
            // set current point as NULL
            this.__parent.pointLayer.setCurrent();
            // set the document flag
            this.__pointEditorOpened = true;
        }
    }
    else {
        this.__parent.getMap().setOptions({
            draggableCursor: 'pointer'
        });
        // unset marker
        this.__parent.pointLayer.setCurrent();
        // hide points
        this.__parent.pointLayer.setVisible(false);
        // set the main document flag
        this.__pointEditorOpened = false;
        // clear input data
        this.clear();
    }
};

ToolBox.prototype.deselect = function() {
    this.__parent.getObjects().toolBox.activeGuide.removeClass('active');
    this.__parent.getObjects().toolBox.activePoint.removeClass('active');
    this.__parent.getObjects().toolBox.activeRoute.removeClass('active');
};

// [P]
ToolBox.prototype.openRouteEditor = function(is) {
    if (true === is) {
        // if minimized - maximize it
        if ((!this.__maximized)) {
            this.maximize(true);
        }
        else if ((this.__maximized) && (this.isRouteEditorOpened())) {
            this.maximize(false);
            return;
        }
        if (!this.isRouteEditorOpened()) {
            // close other editors
            if (this.isPointEditorOpened()) this.openPointEditor(false);
            if (this.isGuideEditorOpened()) this.openGuideEditor(false);
            // disable searchbar
            this.__parent.searchBar.deselect();
            // show all points
            this.__parent.routeLayer.setVisible(false);
            this.__parent.pointLayer.setVisible(false);
            this.__parent.pointLayer.setVisible(true);
            this.__routeEditor = new RouteBuilder(this.__parent);
        }
    }
    else {
        this.__routeEditor.end();
        this.__routeEditor = null;
        this.clear();
    }
};

ToolBox.prototype.openGuideEditor = function(is) {
    if (true === is) {
        // if toolbar minimized - maximize it
        if ((!this.__maximized)) {
            this.maximize(true);
        }
        else if ((this.__maximized) && (this.isGuideEditorOpened())) {
            this.maximize(false);
            return;
        }
        if (!this.isGuideEditorOpened()) {
            // close other editors
            if (this.isPointEditorOpened()) this.openPointEditor(false);
            if (this.isRouteEditorOpened()) this.openRouteEditor(false);
            // temp
            this.__parent.searchBar.deselect();
            this.__parent.pointLayer.setVisible(false);
            this.__parent.routeLayer.setVisible(false);
            // set map handlers
            this.__parent.getMap().setOptions({
                draggableCursor: 'crosshair'
            });

            this.__guideEditor = new Guide(this.__parent);
        }
    }
    else {
        this.__parent.getMap().setOptions({
            draggableCursor: 'pointer'
        });
        this.__guideEditor.popAll();
        this.__guideEditor = null;
        // unset 'checked
        this.__parent.getObjects().guideEditor.valueIfPlacesShowed.removeAttr('checked');
        // hide point layer
        this.__parent.pointLayer.setVisible(false);
        // clear input data
        this.clear();
    }
};

ToolBox.prototype.maximize = function(is) {
    if (true === is) {
        this.__maximized = true;
        this.__parent.getObjects().toolBox.base.css('height', '90%');
        this.__parent.getObjects().toolBox.data.show();
    }
    else {
        this.__maximized = false;
        this.__parent.getObjects().toolBox.base.css('height', '50px');
        this.__parent.getObjects().toolBox.data.hide();
    }
};

ToolBox.prototype.show = function(is) {
    if (true === is) {
        this.__visible = true;
        this.__parent.getObjects().toolBox.base.show();
    }
    else {
        this.__visible = false;
        this.__parent.getObjects().toolBox.base.hide();
    }
}

ToolBox.prototype.clear = function() {
    this.__parent.getObjects().pointEditor.valueLat.text(TEXT.zero);
    this.__parent.getObjects().pointEditor.valueLng.text(TEXT.zero);
    this.__parent.getObjects().pointEditor.valueTitle.val(TEXT.empty);
    this.__parent.getObjects().routeEditor.valueTitle.val(TEXT.empty);
    this.__parent.getObjects().routeEditor.valueStart.text(TEXT[this.__parent.getLang()].notSelected);
    this.__parent.getObjects().routeEditor.valueEnd.text(TEXT[this.__parent.getLang()].notSelected);
    this.__parent.getObjects().guideEditor.valueStart.text(TEXT[this.__parent.getLang()].notSet);
    this.__parent.getObjects().guideEditor.valueEnd.text(TEXT[this.__parent.getLang()].notSet);
    this.__parent.getObjects().guideEditor.valueLength.text(TEXT.zero);
};

// [P]
ToolBox.prototype.isEditorOpened = function() {
    return ((this.isGuideEditorOpened()) || (this.isPointEditorOpened()) || (this.isRouteEditorOpened()));
};

/*
 * Notifier Class
 */
function Notifier(parent) {
    // link to 'box' Element
    var __box = parent.getObjects().alertbox;
    // message stack
    var __stack = [];

    // GET alert box
    this.getBox = function() {
        return __box;
    };

    // push message to stack
    this.push = function() {
        __stack.push({});
    };

    // pop item from stack
    this.pop = function() {
        __stack.pop();
    };

    // is empty stack
    this.empty = function() {
        return __stack.length === 0;
    };
}

// [P] msg - show message with selected text
Notifier.prototype.msg = function(text, color, sec) {
    var link = this;
    var duration = (sec) ? sec*1000 : 3000;
    this.push();
    this.getBox().css("display", "block");
    this.getBox().css("background-color", color);
    this.getBox().text(text);
    // show message for 3 seconds
    setTimeout(function() {
        link.pop();
        if (link.empty()) link.getBox().css("display", "none");
    }, duration);
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

    // update values for select [ASYNC]
    this.update = function() {
        // clear items from box
        this.clear();
        // add all points
        async.each(__parent.pointLayer.points,function(point, callback) {
            __link.add(0,point.getId(),point.getTitle());
            callback();
        }, function() {
            // add all routes
            async.each(__parent.routeLayer.routes,function(route, callback) {
                __link.add(1,route.getId(),route.getTitle());
                callback();
            }, function(callback) {
                if (callback) callback();
            });
        });
    };

    // deselect selected items
    this.deselect = function() {
        __parent.getObjects().searchBar.option().prop('selected',false);
        __parent.getObjects().searchBar.chosen.trigger("liszt:updated");
        __chosed = [];
    };

    // add value for selecting
    this.add = function(type, id, title) {
        if (type === 0) __points.push(id);
        else __routes.push(id);
        var groups = __parent.getObjects().searchBar.groups;
        $(groups[type]).append('<option value="' + id + '" >' + title + '</option>');
        __parent.getObjects().searchBar.chosen.trigger("liszt:updated");
    };
    // init SearchBar handler
    this.init = function(sel) {
        var newPoint = null;
        // check if this is not base mode
        if (__parent.toolBox.isEditorOpened()) {
            this.deselect();
            __parent.outMsg(TEXT[__parent.getLang()].thisActionIsNotAllowed,"red");
        }
        else {
            // if null
            var selected = (sel) ? sel : [];
            // there was something new selected
            if (selected.length > __chosed.length) {
                // get new element
                var newElem = $(selected).not(__chosed).get(0);
                // push to choosed items
                __chosed.push(newElem);
                // get type
                // this is new route, which we need to show
                if (__points.indexOf(newElem) === -1) {
                    var newRoute = __parent.routeLayer.getRouteById(newElem);
                    newRoute.setVisible(true);
                    __parent.transLayer.setVisibleByRoute(newElem,true);
                }
                // this is new point we need to show
                else {
                    newPoint = __parent.pointLayer.getPointById(newElem);
                    newPoint.update();
                    newPoint.setVisible(true);
                    newPoint.setInfoVisible(true);
                }
            }
            // there was something we need to hide
            else {
                //get old element we need to hide
                var oldElem = $(__chosed).not(selected).get(0);
                // pop it from choosed items
                __chosed.splice(__chosed.indexOf(oldElem),1);
                // get type
                // this is old route we need to hide
                if (__points.indexOf(oldElem) === -1) {
                    var oldRoute = __parent.routeLayer.getRouteById(oldElem);
                    oldRoute.setVisible(false);
                    // TEMPORARY
                    // check if we hide one of chosed points
                    async.each(oldRoute.getPoints(), function(point, callback) {
                        if (__chosed.indexOf(point) !== -1) {
                            var p = parent.pointLayer.getPointById(point);
                            p.setVisible(true);
                            p.setInfoVisible(true);
                        }
                        callback();
                    },function() {});
                    // add logic for displaying points
                    __parent.transLayer.setVisibleByRoute(oldElem,false);
                }
                // this is old point we need to hide
                else {
                    var oldPoint = __parent.pointLayer.getPointById(oldElem);
                    oldPoint.setInfoVisible(false);
                    if (!__parent.routeLayer.isPointOfVisibleRoute(oldPoint.getId())) oldPoint.setVisible(false);
                }
            }
        }
        // add zoom update
        __parent.optimizeView(newPoint, function() {
            // TBD
        });
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

    // visibility setter [ASYNC]
    this.setVisible = function(is, callback) {
        this.visible = is;
        async.each(this.points, function(item, callback) {
            if (!is) item.setInfoVisible(false);
            item.setVisible(is);
            callback();
        },function(err) {
            if (callback) callback(err);
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

    // get southwest point [ASYNC]
    this.getSouthWestPoint = function(callback) {
        var sw = null;
        var points = this.getVisible();
        async.eachSeries(points, function(point, callback) {
            if (!sw) sw = point;
            else if ((point.getPosition().lat() < sw.getPosition().lat()) ||
                    (point.getPosition().lng() < sw.getPosition().lng())) sw = point;
            callback();
        }, function() {
            callback(sw);
        });
    };

    this.getNorthPoint = function(callback) {
        var sw = null;
        var points = this.getVisible();
        async.eachSeries(points, function(point, callback) {
            if (!sw) sw = point;
            else if (point.getPosition().lat() > sw.getPosition().lat()) sw = point;
            callback();
        }, function() {
            callback(sw);
        });
    };

    // get northeast point [ASYNC]
    this.getNorthEastPoint = function(callback) {
        var ne = null;
        var points = this.getVisible();
        async.eachSeries(points, function(point, callback) {
            if (!ne) ne = point;
            else if ((point.getPosition().lat() >= ne.getPosition().lat()) ||
                (point.getPosition().lng() >= ne.getPosition().lng())) ne = point;
            callback();
        }, function() {
            callback(ne);
        });
    };

    // add point to layer
    this.add = function(point) {
        this.points.push(point);
    };

    // remove point from layer
    this.remove = function(point, callback) {
        var link = this;
        var index = this.points.indexOf(point);
        if (index === -1) return;
        if (point === this.getCurrent()) this.setCurrent();
        point.remove(function () {
            link.points.splice(index,1);
            if (callback) callback();
        });
    };

    // load markers to map [ASYNC]
    this.load = function(callback) {
        var main = this.main;
        var layer = this;
        $.get('/data/points', function(result) {
            async.each(result,function(item,callback) {
                var point = new MapPoint(main, item._id, new google.maps.LatLng(item.lat, item.lng),
                    main.static.ICON_BLUE(), item.title);
                layer.add(point);
                callback();
            },function(err) {
                if (callback) callback(err);
            });
        });
    };

    // set point as current
    this.setCurrent = function(point) {
        if (this.current) {
            this.current.getMarker().setIcon(main.static.ICON_BLUE());
            this.current.getMarker().setDraggable(false);
        }
        // unset point
        if (!point) this.current = null;
        else {
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

    // get point by point id
    this.getPointById = function(id) {
        var points = this.points;
        for (var i = 0; i < points.length; i++) if (points[i].getId() === id) return points[i];
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
    // current route
    this.current = null;
    // visibility
    this.visible = false;

    // SET visible [ASYNC]
    this.setVisible = function(is, callback) {
        this.visible = is;
        async.each(this.routes, function(item, callback) {
            item.setVisible(is);
            callback();
        },function(err){
            if (callback) callback(err);
        });
    };

    // get visible routes
    this.getVisible = function() {
        var result = [];
        for (var i = 0; i < this.routes.length; i++) if (this.routes[i].isVisible()) result.push(this.routes[i]);
        return result;
    };

    // get id's of visible routes
    this.getVisibleId = function() {
        var result = [];
        for (var i = 0; i < this.routes.length; i++) if (this.routes[i].visible) result.push(this.routes[i].id);
        return result;
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

    // get route by title
    this.getRouteByTitle = function(title) {
        var route = -1;
        for (var i = 0; i < this.routes.length; i++) if (this.routes[i].getTitle() == title) route = this.routes[i];
        return route;
    };

    // get route by id
    this.getRouteById = function(id) {
        var route = -1;
        for (var i = 0; i < this.routes.length; i++) if (this.routes[i].getId() === id) route = this.routes[i];
        return route;
    };

    // load layer from server [ASYNC]
    this.load = function(callback) {
        var main = this.main;
        var obj = this;
        // at first - getting nodes
        $.get('/data/nodes', function(result) {
            async.each(result, function(node, callback) {
                // get start point of node by its id
                var nodeStart = main.pointLayer.getPointById(node.start);
                // get end point of node by its id
                var nodeEnd = main.pointLayer.getPointById(node.end);
                var n = new MapNode(main, node._id, nodeStart, nodeEnd, node.data, node.total);
                // add node to layer
                main.routeLayer.nodes.push(n);
                callback();
            }, function() {
                $.get('/data/routes', function(result) {
                    async.each(result,function(item,callback) {
                        // get start point of route by id
                        var start = main.pointLayer.getPointById(item.start);
                        // get end point of route by id
                        var end = main.pointLayer.getPointById(item.end);
                        var route = new MapRoute(main, item._id, start, end, item.title, item.total);
                        // init nodes and points by its node id
                        route.init(item.nodes, function () {
                            // add route to layer
                            obj.routes.push(route);
                            callback();
                        });

                    },function(err) {
                        if (callback) callback(err);
                    })
                });
            });
        });
    };

    // return true, if each point is part of visible route
    this.isPointOfVisibleRoute = function(id) {
        var is = false;
        // FEATURE - use async.js
        for (var i = 0; i < this.routes.length; i++) if ((this.routes[i].isPointOf(id)) && (this.routes[i].isVisible())) is = true;
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

    // clear all items [ASYNC]
    this.clear = function(callback) {
        var _this = this;
        async.each(this.trans, function(item ,callback) {
            item.setVisible(false);
            callback();
        }, function() {
            _this.trans = [];
            if (callback) callback();
        });
    };

    // load cars from server
    this.load = function(callback) {
        var _this = this;
        $.get('/data/transport', function(result) {
            async.each(result, function(trans, callback) {
                var t = new MapTrans(main, trans._id, trans.route, new google.maps.LatLng(trans.lat, trans.lng));
                _this.add(t);
                if (_this.routes.indexOf(trans.route) !== -1) t.setVisible(true);
                callback();
            }, function() {
                if (callback) callback();
            });
        });
    };

    // add trans to layer
    this.add = function(item) {
        this.trans.push(item);
        // here we can provide any checks, etc
        // TBD
    };

    // set visibility by route id
    this.setVisibleByRoute = function(id, is, callback) {
        if (is) this.routes.push(id);
        else this.routes.splice(this.routes.indexOf(id), 1);
        async.each(this.trans, function(item, callback) {
            if (item.id_route === id) item.setVisible(is);
            callback();
        }, function() {
            if (callback) callback();
        });
    };

    // update points, and set visible required [ASYNC]
    this.update = function(callback) {
        var _this = this;
        this.clear(function() {
            _this.load(function() {
                if (callback) callback();
            });
        });
    };
}

// class for route
function MapRoute(parent, id, start, end, title, total) {
    // set parent
    var __parent = parent;
    // unique identifier
    var __id = (id) ? id : null;
    // start point id
    var __start = (start) ? start.getId() : null;
    // end point id
    var __end = (end) ? end.getId() : null;
    // start point info
    var __infoStart = (start) ? new InfoBox({
        content: '<div class="text"><center>' + start.getTitle() + '</center></div>',
        boxClass: "infoRoute",
        pixelOffset: new google.maps.Size(-50, -50),
        closeBoxURL: 'img/close_t.png',
        position: start.getPosition()
    }) : null;
    // end point info
    var __infoEnd = (end) ? new InfoBox({
        content: '<div class="text"><center>' + end.getTitle() + '</center></div>',
        boxClass: "infoRoute",
        pixelOffset: new google.maps.Size(-50, -50),
        closeBoxURL: 'img/close_t.png',
        position: end.getPosition()
    }) : null;
    // visibility flag
    var __visible = false;
    // routeNodes
    var __nodes = [];
    // point ID's
    var __points = [];
    // total distance
    var __total = (total) ? total : 0;
    // name
    var __title = (title) ? title : null;

    // SET visible [ASYNC]
    this.setVisible = function(is,callback) {
        async.each(__nodes,function(item,callback) {
            item.setVisible(is);
            callback();
        },function(err) {
            if (is) {
                if (__infoStart) __infoStart.open(__parent.getMap());
                if (__infoEnd) __infoEnd.open(__parent.getMap());
            } else {
                if (__infoStart) __infoStart.open(null);
                if (__infoEnd) __infoEnd.open(null);
            }
            __visible = is;
            if (callback) callback(err);
        });
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

    // SET title
    this.setTitle = function(title) {
        __title = title;
    };

    // GET title
    this.getTitle = function() {
        return __title;
    };

    // GET parent
    this.getParent = function() {
        return __parent;
    };

    // GET nodes
    this.getNodes = function() {
        return __nodes;
    };

    // GET points
    this.getPoints = function() {
        return __points;
    };

    // GET total
    this.getTotal = function() {
        return __total;
    };

    // SET start
    this.setStart = function(point) {
        __start = point.getId();
        // if infoStart opened already - close it
        if (__infoStart) __infoStart.hide();
        __infoStart = new InfoBox({
            content: '<div class="text"><center>' + point.getTitle() + '</center></div>',
            boxClass: "infoRoute",
            pixelOffset: new google.maps.Size(-50, -50),
            closeBoxURL: 'img/close_t.png',
            position: point.getMarker().position
        });
    };

    // GET start
    this.getStart = function() {
        return __start;
    };

    // SET end
    this.setEnd = function(point) {
        __end = point.getId();
        if (__infoEnd) __infoEnd.hide();
        __infoEnd = new InfoBox({
            content: '<div class="text"><center>' + point.getTitle() + '</center></div>',
            boxClass: "infoRoute",
            pixelOffset: new google.maps.Size(-50, -50),
            closeBoxURL: 'img/close_t.png',
            position: point.getMarker().position
        });
    };

    // GET end
    this.getEnd = function() {
        return __end;
    };

    // GET infoEnd
    this.getInfoEnd = function() {
        return __infoEnd;
    };

    this.getInfoStart = function() {
        return __infoStart;
    };

    // return true if this point in this route
    this.isPointOf = function(id) {
        return __points.indexOf(id) !== -1;
    };
}

// add node to route
MapRoute.prototype.add = function(node) {
    // if route is empty already, first we must add start point of first node
    if (this.getNodes().length === 0) this.getPoints().push(node.getStart().getId());
    // add end of each node to array
    this.getPoints().push(node.getEnd().getId());
    // check id,if id == -1 this node is builder node
    // UPDATE
    if (node.getId()) this.getNodes().push(this.getParent().routeLayer.nodes[this.getParent().routeLayer.nodes.indexOf(node)]);
    else this.getNodes().push(node);
};

// [P] init route [ASYNC]
MapRoute.prototype.init = function(ids, callback) {
    // link to this
    var link = this;
    async.each(ids, function(item,callback) {
        async.each(link.getParent().routeLayer.nodes, function(node,call) {
            if (node.getId() === item.node) link.add(node);
            call();
        },function(err) {
            callback(err);
        });
    },function(err) {
        if (callback) callback(err);
    });
};

// [P] save route [ASYNC]
MapRoute.prototype.save = function(callback) {
    // link to this
    var link = this;
    // UPD
    if (!this.getId()) {
        var globalNodes = this.getParent().routeLayer.nodes;
        // save new nodes at first
        async.each(link.getNodes(),function(item,callback) {
            item.save(function() {
                var index = globalNodes.indexOf(item);
                if (index === -1) globalNodes.push(item);
                // refresh link [UPD]
                link.getNodes()[link.getNodes().indexOf(item)] = globalNodes[globalNodes.indexOf(item)];
                callback();
            });
        },function(){
            // get node id's and total length
            var total = 0;
            var ids = [];
            // get total distance, and array of node ID's
            async.eachSeries(link.getNodes(),function(item,callback){
                total += item.getTotal();
                ids.push({node: item.getId(), total: item.getTotal()});
                callback();
            },function(err) {
                // save route
                $.ajax({
                    datatype: link.getParent().static.TYPE_JSON,
                    type: link.getParent().static.TYPE_POST,
                    url: '/data/routes/',
                    data: {
                        start: link.getStart(),
                        end: link.getEnd(),
                        nodes: ids,
                        points: link.getPoints(),
                        total: total,
                        title: link.getTitle()
                    },
                    success: function(result) {
                        link.setId(result.route._id);
                        if (callback) callback(err);
                    }
                });
            });
        });
    }
};

// [P] remove - remove route [ASYNC]
MapRoute.prototype.remove = function(callback) {
    // TBD
};

/*
 * MapNode Class
 */
function MapNode(parent, id, start, end, data, total) {
    // link to parent
    var __parent = parent;
    // visible flag
    var __visible = false;
    // total distance
    var __total = (total) ? total : 0;
    // unique identifier for node
    var __id = (id) ? id : null;
    // point A
    var __start = (start) ? start : null;
    // point b
    var __end = (end) ? end : null;
    // node base class
    var __base = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport: true
    });
    // node result
    var __data = (data) ? data : null;

    // SET id
    this.setId = function(id) {
        __id = id;
    };

    // GET id
    this.getId = function() {
        return __id;
    };

    // setter visibility
    this.setVisible = function(is) {
        __visible = is;
        __start.setVisible(is);
        __end.setVisible(is);
        if (!is) {
            __base.setMap(null);
            // if info was opened
            __start.setInfoVisible(false);
            __end.setInfoVisible(false);
        }
        else __base.setMap(__parent.getMap());
    };

    // GET visible
    this.isVisible = function() {
        return __visible;
    };

    // GET total
    this.getTotal = function() {
        return __total;
    };

    this.getStart = function() {
        return __start;
    };

    this.getEnd = function() {
        return __end;
    };

    // SET total
    this.setTotal = function(ttl) {
        __total = ttl;
    };

    // GET parent
    this.getParent = function() {
        return __parent;
    };

    // SET data
    this.setData = function(data) {
        __data = data;
    };

    // GET data
    this.getData = function() {
        return __data;
    };

    // GET base
    this.getBase = function() {
        return __base;
    };

    // TBD
    if (!__data) this.init();
    else __base.setDirections(JSON.parse(__data, parseNode));
}

// [P] init - init node using GService [ASYNC]
MapNode.prototype.init = function(callback) {
    var link = this;
    var request = {
        origin: this.getStart().getPosition(),
        destination: this.getEnd().getPosition(),
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false
    };
    this.getParent().routeLayer.directionsService.route(request, function(result, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            link.setData(JSON.stringify(result, stringifyNode));
            link.getBase().setDirections(result);
            var myroute = result.routes[0];
            var ttl = 0;
            for (var i = 0; i < myroute.legs.length; i++) ttl += myroute.legs[i].distance.value;
            link.setTotal(ttl);
        }
        if (callback) callback(result);
    });
};

// [P] save - save this node [ASYNC]
MapNode.prototype.save = function(callback) {
    // check if this node is unsaved
    // TBD - add update logic
    if (this.getId()) return;
    // link to this
    var link = this;
    $.ajax({
        datatype: this.getParent().static.TYPE_JSON,
        type: this.getParent().static.TYPE_POST,
        url: '/data/nodes/',
        data: {
            start: this.getStart().getId(),
            end: this.getEnd().getId(),
            total: this.getTotal(),
            data: this.getData()
        },
        success: function(result) {
            link.setId(result.node._id);
            if (callback) callback(result);
        }
    });
};

MapNode.prototype.remove = function(callback) {
    // TBA
};

/*
 * MapPoint Class
 */
function MapPoint(parent, id, position, icon, title) {
    // link to main
    var __parent = parent;
    // flag for info visibility
    var __infoVisible = false;
    // flag for marker visibility
    var __visible = false;
    // unique id
    var __id = (id) ? id : null;
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
        __baseContent = '<div class="text" id="info' + __id + '"><center><b>' + title + '</b></center></div>';
    };

    // GET title
    this.getTitle = function() {
        return __marker.title;
    };

    // GET marker
    this.getMarker = function() {
        return __marker;
    };

    // GET marker.position
    this.getPosition = function() {
        return __marker.position;
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

    // SET visible
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
            // UPD - async.js
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
        if (__parent.pointEditorOpened) {
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

// [P] update - update point data [ASYNC]
MapPoint.prototype.update = function(callback) {
    var link = this;
    // get traffic info for this point
    $.get('/arrival/' + this.getId(), function(result) {
        var content = '';
        // check each route
        async.each(result.routes, function(item,callback){
            // template for route
            var head = '№' + item.title + ' - ';
            // check route status
            // if OK - there are trans on route
            if (item.status === 'OK') {
                // check time
                // if time === 0 - trans has been arived
                if (item.time === 0) content +=(head +  TEST[link.getParent().getLang()].transArrived + '<br/>');
                // else - some minutes left
                else {
                    var timeValue = (item.time < 1) ? '< 1' : item.time;
                    timeValue += ' ';
                    content += (head + timeValue + TEXT[link.getParent().getLang()].minute + '<br/>');
                }
            }
            // if NOTRANS - there are no trans for this route
            if (item.status === 'NOTRANS') content += (head + TEXT[link.getParent().getLang()].noData + "<br/>");
            // another checks....

            //
            callback();
        },function(err) {
            if (result.routes.length === 0) content += TEXT[link.getParent().getLang()].noAvialableRoutes + "<br/>";
            link.getInfo().setContent(link.getBaseContent() + content);
            if (callback) callback(err);
        });
    });
};

// [P] save  - save point [ASYNC]
MapPoint.prototype.save = function(callback) {
    var link = this;
    // create new one
    if (!this.getId()) {
        $.ajax({
            datatype: this.getParent().static.TYPE_JSON,
            type: this.getParent().static.TYPE_POST,
            url: '/data/points',
            data: {
                lat : this.getParent().getObjects().pointEditor.valueLat.text(),
                lng : this.getParent().getObjects().pointEditor.valueLng.text(),
                _id : this.getId(),
                title : this.getParent().getObjects().pointEditor.valueTitle.val()
            },
            success: function(result) {
                link.setId(result.point._id);
                link.setTitle(result.point.title);
                if (callback) callback(result);
            }
        });
    }
    // update existing
    else {
        $.ajax({
            datatype: this.getParent().static.TYPE_JSON,
            type: this.getParent().static.TYPE_PUT,
            url: '/data/points/' + this.getId(),
            data: {
                lat : this.getParent().getObjects().pointEditor.valueLat.text(),
                lng : this.getParent().getObjects().pointEditor.valueLng.text(),
                _id : this.getId(),
                title : this.getParent().getObjects().pointEditor.valueTitle.val()
            },
            success: function(result) {
                link.setTitle(result.point.title);
                if (callback) callback(result);
            }
        });
    }
};

// [P] delete - delete point [ASYNC]
MapPoint.prototype.remove = function(callback) {
    var link = this;
    // async delete on server
    $.ajax({
        datatype: this.getParent().static.TYPE_JSON,
        type: this.getParent().static.TYPE_DELETE,
        url: '/data/points/' + this.getId(),
        cache: false,
        success: function(result) {
            link.getMarker().setMap(null);
            if (callback) callback(result);
        }
    });

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

/*
 * RouteBuilder Class
 * @main - link to parent layer
 */
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
            var node = new MapNode(this.main, null, this.points[size - 2], this.points[size - 1], null, 0);
            this.route.add(node);
            node.setVisible(true);
        }
    };

    // set endpoint of route
    this.setEnd = function() {
        if (this.points.length === 0) main.outMsg(TEXT[main.getLang()].nothingSelected,"red");
        else {
            // FEATURE
            var end = this.route.getInfoEnd();
            // close previous endpoint info
            if (end) end.open(null);
            var lastPoint = this.points[this.points.length - 1];
            // set new endpoint
            this.route.setEnd(lastPoint);
            // show new endpoint info
            this.route.getInfoEnd().open(this.main.getMap(), lastPoint.getMarker());
            // set info in box
            this.main.getObjects().routeEditor.valueEnd.text(lastPoint.getTitle());
        }
    };

    // set start point of route
    this.setStart = function() {
        if (this.points.length === 0) main.outMsg(TEXT[main.getLang()].nothingSelected,"red");
        else {
            var start = this.route.getInfoStart();
            // close prevoius endpoint info
            if (start) start.open(null);
            var lastPoint = this.points[this.points.length - 1];
            // set new endpoint
            this.route.setStart(lastPoint);
            // show new endpoint info
            this.route.getInfoStart().open(this.main.getMap(), lastPoint.getMarker());
            // set info in box
            this.main.getObjects().routeEditor.valueStart.text(lastPoint.getTitle());
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

    // save new route [ASYNC]
    this.save = function(callback) {
        // link to this
        var link = this;
        // check name
        var title = this.main.getObjects().routeEditor.valueTitle.val();
        if (title === '') this.main.outMsg(TEXT[this.main.getLang()].nameNotChoosed, "red");
        else if (!this.route.getStart()) this.main.outMsg(TEXT[this.main.getLang()].routeStartNotSelected, "red");
        else if (!this.route.getEnd()) this.main.outMsg(TEXT[this.main.getLang()].routeEndNotSelected, "red");
        else {
            this.route.setTitle(title);
            // save each route
            this.route.save(function(err) {
                // check if this is a new route, if not add it to route layer
                var indx = link.main.routeLayer.routes.indexOf(link.route);
                if (indx === -1) {
                    link.main.routeLayer.add(link.route);
                }
                // UPD
                else link.main.routeLayer.routes[indx] = link.route;
                // update searchBar
                link.main.searchBar.update();
                link.main.outMsg(TEXT[link.main.getLang()].routeSaved,"green");
                if (callback) callback(err);
            });
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

/*
 * Guide Class
 */
function Guide(main, start, end, result, total) {
    this.main = main;
    this.base = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport: true
    });
    this.geocoder = new google.maps.Geocoder();
    this.start = (start) ? start : null;
    this.end = (end) ? end : null;
    this.result = (result) ? result : null;
    this.total = (total) ? total : 0;

    // push - add new point to stack
    this.push = function(position){
        var obj = this;
        if ((this.start) && (this.end)) return;
        // if position is the pos of A
        if (!this.start) {
            this.start = new google.maps.Marker({
                position: position,
                draggable: true,
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
                draggable: true,
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

    // popAll - pop all points from stack
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
        // TBD
        this.main.toolBox.clear();
    };

    // empty - check if editing process finished
    this.empty = function() {
        return this.start === null;
    }
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
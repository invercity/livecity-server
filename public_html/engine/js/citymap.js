function CityMap(mapCenter) {
    // map settings
    this.settings = {
        zoom: 15,
        center: mapCenter,
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
    };
    // server url
    this.url = 'http//178.54.56.121:8080/';
    // static objects
    this.objects = new Objects();
    // static values
    this.values = new Values();
    // map
    this.map = new google.maps.Map(document.getElementById("map_canvas"), this.settings);
    // point layer
    this.pointLayer = new PointLayer(this);
    // route layer
    this.routeLayer = new RouteLayer(this);
    // route builder
    this.routeBuilder;
    // flag for point editor
    this.pointEditorOpened = false;
    //flag for route editor
    this.routeEdotorOpened = false;

    // ---------- Methods -------- //

    // init map
    this.init = function() {
        this.pointLayer.load();
        this.routeLayer.load();
        //this.pointLayer.setVisible(true);
        // link to main document
        var obj = this;
        //map click handler
        google.maps.event.addListener(this.map, 'click', function(event) {
            if (obj.pointEditorOpened) {
                obj.addPoint(event.latLng);
                obj.pointLayer.current.save();
                obj.outMsg("Метка сохранена");
            } else if (obj.pointLayer.current !== -1) obj.pointLayer.current.info.hide();
        });
        // button click handler
        document.documentElement.onkeydown = function(e) {
            // if escape
            if (e.keyCode === 27) {
                if (obj.pointEditorOpened) {
                    if (obj.pointLayer.current === -1) obj.onCloseMarkerEditor();
                    else obj.pointLayer.setCurrent(-1);
                }
                if (obj.routeEditorOpened) obj.onCloseRouteEditor();
            }
        };
    };

    // set edits during editing marker
    this.setEditPointData = function(position, title, focus) {
        var lat = position.lat();
        var lng = position.lng();
        $("#label_posx").text(Number(lat).toFixed(4));
        $("#label_posy").text(Number(lng).toFixed(4));
        $("#label_name").val(title);
        if (focus) $('#label_name').focus();
    };

    // out message on page with choosed color
    this.outMsg = function(txt, color) {
        $('#tootltip').css("display", "block");
        $('#tootltip').css("background-color", color);
        $('#tootltip').text(txt);
        setTimeout(function() {
            $('#tootltip').css("display", "none");
        }, 2000);
    };

    // add new point on map 
    this.addPoint = function(position) {
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

    // clear editor inputs
    this.clearEditor = function() {
        $("#label_posx").text("");
        $("#label_posy").text("");
        $("#label_name").val("");
    };

    // ------------ Handlers ----------- //

    // edit marker button handler
    this.onEditMarker = function() {
        // ajax animation
        $('#edit_route').hide('500');
        $('#edit_marker').show('500');
        // setting up cursor
        this.map.setOptions({
            draggableCursor: 'crosshair'
        });
        // show all points
        this.pointLayer.setVisible(true);
        // set current point
        this.pointLayer.setCurrent(-1);
        // set the document flag
        this.pointEditorOpened = true;
    };
    
    // edit route button handler
    this.onEditRoute = function() {
        $('#edit_marker').hide('500');
        $('#edit_route').show('500');
        if (!this.pointLayer.visible) this.pointLayer.setVisible(true);
        this.routeBuilder = new RouteBuilder(this);
        this.routeEditorOpened = true;
    };
    
    // save point handler
    this.onSavePoint = function() {
        if (this.pointLayer.current === -1) this.outMsg("Нет данных для сохранения");
        else {
            this.pointLayer.current.save();
            this.outMsg("Метка сохранена");
        }
        //else this.outMsg("Произошла ошибка", "red");
    };
    
    // delete point handler
    this.onDeletePoint = function() {
        if (this.pointLayer.current === -1) this.outMsg("Ничего не выбрано");
        else {
            this.pointLayer.current.delete();
            this.outMsg("Метка удалена");
        }
    };
    
    // close point editor handler
    this.onCloseMarkerEditor = function() {
        $('#edit_marker').hide('500');
        // change cursor to default
        this.map.setOptions({
            draggableCursor: 'pointer'
        });
        // unset marker
        this.pointLayer.setCurrent(-1);
        // set the main document flag
        this.pointEditorOpened = false;
    };

    // close route editor
    this.onCloseRouteEditor = function() {
        $('#edit_route').hide('500');
        this.routeEditorOpened = false;
        this.routeBuilder.end();
    };

    // show route [testing]
    this.onShowRoute = function() {
        if (!this.routeLayer.visible) this.routeLayer.setVisible(true);
    };
}

// marker layer
function PointLayer(main) {
    // link to main
    this.main = main;
    // points on layer
    this.points = [];
    // current pint
    this.current = -1;
    // visibility
    this.visible = false;

    // ----------- Methods -------------- //

    // visibility setter
    this.setVisible = function(is) {
        this.visible = is;
        var points = this.points;
        asyncLoop(this.points.length, function(loop) {
            points[loop.iteration()].marker.setVisible(is);
            loop.next();
        });
    };

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
            type: main.values.TYPE_POST,
            url: main.url,
            data: main.values.GET_STATION,
            success: function(result) {
                for (var i = 0; i < result.length; i++) {
                    var station = result[i];
                    var point = new MapPoint(main, new google.maps.LatLng(station.a, 
                    station.b), main.objects.ICON_BLUE(), station.name);
                    point.setId(station._id);
                    layer.add(point);
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
    // current layer
    this.current;
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

    // add point to layer
    this.add = function(route) {
        this.routes.push(route);
    };
    
    // current setter
    this.setCurrent = function(route) {
        // TBD
    };
    
    // load layer from server
    this.load = function() {
        var main = this.main;
        var obj = this;
        var json = {};
        var data = {};
        data.type = "GET_NODE";
        data.data = json;
        $.ajax({
            datatype: main.values.TYPE_JSON,
            type: main.values.TYPE_POST,
            url: main.url,
            data: JSON.stringify(data),
            success: function(result) {
                for (var i = 0; i < result.length; i++) {
                    var node = result[i];
                    var idA = -1;
                    var idB = -1;
                    for (var j=0;j<main.pointLayer.points.length;j++) {
                        if (main.pointLayer.points[j].id === node.a) idA = main.pointLayer.points[j];
                        if (main.pointLayer.points[j].id === node.b) idB = main.pointLayer.points[j];
                    }
                    var n = new MapNode(main,idA,idB,node.result);
                    n.setId(node._id);
                    main.routeLayer.nodes.push(n);
                }
                var data2 = {};
                data2.type = "GET_ROUTE";
                data2.data = json;
                $.ajax({
                    datatype: main.values.TYPE_JSON,
                    type: main.values.TYPE_POST,
                    url: main.url,
                    data: JSON.stringify(data2),
                    success: function(result) {
                        for (var i = 0; i < result.length; i++) {
                            var route = result[i];
                            var start = {};
                            var end = {};
                            var nodes = route.nodes;
                            for (var j=0;j<main.pointLayer.points.length;j++) {
                                if (main.pointLayer.points[j].id === route.start) start = main.pointLayer.points[j];
                                if (main.pointLayer.points[j].id === route.end) end = main.pointLayer.points[j];
                            }
                            var r = new MapRoute(main);
                            r.init(nodes);
                            obj.routes.push(r);
                        }
                   }
               });
            }
        });
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
    this.visible = true;
    // routeNodes
    this.nodes = [];
    // total distance
    this.total = 0;
    
    // async set visible
    this.setVisible = function(is) {
        var nodes = this.nodes;
        asyncLoop(nodes.length, function(loop) {
            nodes[loop.iteration()].setVisible(is);
            loop.next();
        });
        // UPD
        if (is) {
            if (this.infoA !== -1) this.infoA.open(this.main.map);
            if (this.infoB !== -1) this.infoB.open(this.main.map);
        }
        else {
            if (this.infoA !== -1) this.infoA.hide();
            if (this.infoB !== -1) this.infoB.hide();
        }
    };
    
    // set unique id
    this.setId = function(id) {
        this.id = id;
    };

    // add node to route
    this.add = function(node) {
        // -------- there must be some code to define start or end
        // check for size
        if (this.nodes.length === 0) {
            this.setStart(node.a.marker.position, node.a.marker.title);
            // set id of start point
            this.idS = node.a.id;
        }
        // set new point as end point
        this.setEnd(node.b.marker.position, node.b.marker.title);
        // set id of end point
        this.idE = node.b.id;
        // check id,if id == -1 this node is builder node
        if (node.id !== -1) 
            this.nodes.push(this.main.routeLayer.nodes[this.main.routeLayer.nodes.indexOf(node)]);
        else this.nodes.push(node);
        // inc this total
        this.total += node.total;
    };

    // start setter
    this.setStart = function(position, title) {
        this.a = position;
        if (this.infoA !== -1) this.infoA.hide();
        this.infoA = new InfoBox({
            content: '<div class="text"><center>' + title + '</center></div>',
            boxClass: "infoRoute",
            pixelOffset: new google.maps.Size(-50, -50),
            closeBoxURL: 'engine/img/close_t.png'
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
            closeBoxURL: 'engine/img/close_t.png'
        });
        this.infoB.setPosition(position);
    };
    
    // init route
    this.init = function(ids) {
        var main = this.main;
        var obj = this;
        asyncLoop(ids.length, function(loop) {
            var iter = loop.iteration();
            for (var j=0;j<main.routeLayer.nodes.length;j++) {
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
        // save new nodes at first
        var main = this.main;
        var obj = this;
        var nodes = this.nodes;
        var globalNodes = this.main.routeLayer.nodes;
        asyncLoop(nodes.length, function(loop) {
            var iter = loop.iteration();
            nodes[iter].save();
            var indx = globalNodes.indexOf(nodes[iter]);
            if (indx === -1) globalNodes.push(nodes[iter]);
            nodes[iter] = globalNodes[globalNodes.indexOf(nodes[iter])];
            loop.next();
        // callback
        },function() {
            var json = {};
            var data = {};
            // fill properties
            var ids = [];
            for (var i=0;i<obj.nodes.length;i++) ids.push(obj.nodes[i].id);
            json._id = obj.id;
            json.a = obj.idS;
            json.b = obj.idE;
            json.nodes = ids;
            json.total = obj.total;
            data.type = "SEND_ROUTE";
            data.data = json;
            // send data
            $.ajax({
                datatype: main.values.TYPE_JSON,
                type: main.values.TYPE_POST,
                url: main.url,
                data: JSON.stringify(data),
                success: function(result) {
                    obj.setId(result._id);
                }
            });
            main.outMsg("Маршрут сохранен");
        }); 
    };
}

//class for nodes
function MapNode(main, pointA, pointB,resNode) {
    this.main = main;
    // visible flag
    this.visible = false;
    // total distance
    this.total = 0;
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
        this.id  = id;
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
                obj.resNode = JSON.stringify(result,stringifyNode);
                obj.base.setDirections(result);
                var myroute = result.routes[0];
                var ttl = 0;
                for (var i = 0; i < myroute.legs.length; i++) ttl += myroute.legs[i].distance.value;
                obj.total += ttl;
            }
        });
    };
    
    this.setResult = function(res) {
        this.resNode = res;
        this.base.setDirection(this.resNode);
    };
    
    // setter visibility
    this.setVisible = function(is) {
        this.visible = is;
        if (!is) this.base.setMap(null);
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
        var data = {};
        // fill properties
        data.type = "SEND_NODE";
        json.a = this.a.id;
        json.b = this.b.id;
        json.result = this.resNode;
        data.data = json;
        console.log(this.resNode);
        $.ajax({
            datatype: main.values.TYPE_JSON,
            type: main.values.TYPE_POST,
            url: main.url,
            data: JSON.stringify(data),
            async: false,
            success: function(result) {
                obj.setId(result._id);
            }
        });
    };
    
    if (this.resNode === -1) this.init();
    else this.base.setDirections(JSON.parse(this.resNode,parseNode));
}
// class for points
function MapPoint(main, position, icon, title) {
    // link to main
    this.main = main;
    // flag for enabling info on click
    this.enabled = true;
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

    // infoBox base
    this.info = new InfoBox({
        content: '<div class="text"><center>' + this.marker.title + '</center></div>',
        boxClass: "infoBox",
        pixelOffset: new google.maps.Size(-150, -120)
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
        if (is) this.info.hide();
        else this.info.show();
    };

    // visibility of marker
    this.setBaseVisible = function(is) {
        this.marker.setVisible(is);
    };
    
    // set unique id
    this.setId = function(id) {
        this.id = id;
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
                for (var i=0;i<main.pointLayer.points.length;i++) {
                    if (main.pointLayer.points[i].marker === this) main.routeBuilder.add(main.pointLayer.points[i]);
                }
            }
            // base mode
            else {
                if (main.pointLayer.current !== -1) main.pointLayer.current.info.hide();
                obj.info.open(obj.main.map, this);
                obj.info.show();
                main.pointLayer.current = obj;
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
                main.outMsg("Метка сохранена");
            }
        });
    };

    // delete point
    this.delete = function() {
        // object for sending
        var json = {};
        var data = {};
        // fill properties
        json._id = this.main.pointLayer.current.id;
        data.type = "DELETE_STATION";
        data.data = json;
        // async delete on server
        $.ajax({
            datatype: main.values.TYPE_JSON,
            type: main.values.TYPE_POST,
            url: main.url,
            data: JSON.stringify(data),
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
        var data = {};
        // fill properties
        json.a = $('#label_posx').text();
        json.b = $('#label_posy').text();
        /*if (this.id !== -1)*/ json._id = this.id;
        json.name = $('#label_name').val();
        data.type = "SEND_STATION";
        data.data = json;
        $.ajax({
            datatype: main.values.TYPE_JSON,
            type: main.values.TYPE_POST,
            url: main.url,
            data: JSON.stringify(data),
            success: function(result) {
                main.pointLayer.current.setId(result._id);
            }
        });
        /// TEST
        main.pointLayer.current.setTitle(json.name);
    };

    // set default click listener
    this.setClickListener();
}

// route builder
function RouteBuilder(main) {
    this.main = main;
    // array for points
    this.points = [];
    // array for infos
    this.info = [];
    // buffer route
    this.route = new MapRoute(this.main);
    
    // add point to buffer
    this.add = function(point) {
        this.points.push(point);
        var size = this.points.length;
        this.info.push(new InfoBox({
            content: '<div class="builder"><center>' + point.marker.title + '</center></div>',
            boxClass: "infoRoute",
            pixelOffset: new google.maps.Size(-50, -50),
            closeBoxURL: 'engine/img/close_t.png'
        }));
        if (this.points.length === 1) this.info[0].open(this.main.map, this.points[0].marker);
        if (this.points.length > 1) {
            if (this.points.length === 2) {
                this.info[0].hide();
                this.info[0] = -1;
            }
            var node = new MapNode(this.main,this.points[size-2],this.points[size-1],-1);
            //node.setVisible(true);
            this.route.add(node);
            this.route.setVisible(true);
            if (size > 2) this.info[size - 2].open(this.main.map, this.points[size - 2].marker);
        }
    };
    
    // init routeBuilder by existing route
    this.initExist = function(route) {
        // TBD
    };
    
    // save new route
    this.save = function() {
        this.route.save();
        var indx = this.main.routeLayer.routes.indexOf(this.route);
        if (indx === -1) this.main.routeLayer.routes.push(this.route);
        else this.main.routeLayer.routes[indx] = this.route;
    };

    // action on builder closing
    this.end = function() {
        this.route.setVisible(false);
        var info = this.info;
        asyncLoop(info.length, function(loop) {
            var iter = loop.iteration();
            if (info[iter] !== -1) info[iter].hide();
            loop.next();
        });
    };
}

// static objects class
function Objects() {
    this.ICON_BLUE = function() {
        return new google.maps.MarkerImage('./engine/img/stop.png', new google.maps.Size(30, 30), new google.maps.Point(0, 0), new google.maps.Point(15, 20));
    };

    this.ICON_RED = function() {
        return new google.maps.MarkerImage('./engine/img/stop-m.png', new google.maps.Size(30, 30), new google.maps.Point(0, 0), new google.maps.Point(15, 20));
    };
}

function Values() {
    this.TYPE_POST = 'POST';
    this.TYPE_JSON = 'json';
    this.GET_STATION = '{"type" : "GET_STATION"}';
    this.GET_NODE = '{"type" : "GET_NODE"}';
    this.GET_ROUTE = '{"type" : "GET_ROUTE"}';
    this.DELETE_STATION = function(id) {return '{"type" : "DELETE_STATION","id" : "' + id + '"}';};
    this.SEND_STATION = function(id) {
        return '{"type" : "SEND_STATION",\n\
                "pos_a" : "' + $('#label_posx').text() + '","pos_b" : "' + 
                $('#label_posy').text() + '","id" : "' + id + '","name" : "' + $('#label_name').val() + '"}';
    };
    this.SEND_NODE = function(a,b) {
        var res = '{"type" : "SEND_NODE","a":"' + a + '","b":"' + b + '"}';
        return res;
    };
    this.SEND_ROUTE = function(id,a,b,nodes) {
        var res = '{"type" : "SEND_ROUTE","a":"' + a + '","b":"' + b + '","id":' + id + ',"nodes":"' + nodes +'"}';
        console.log(res);
        return res;
    };
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
  }
  else return value;
}
 
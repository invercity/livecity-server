function CityMap(mapCenter) {
    // map settings
    this.settings = {
	zoom: 15,
	center: mapCenter,
	mapTypeControl: true,
	mapTypeControlOptions: {style: google.maps.MapTypeControlStyle,
        position: google.maps.ControlPosition.BOTTOM_LEFT},
	navigationControl: true,
	navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
	mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    // server url
    this.url = 'http://178.54.56.121:8080/';
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
    // 
    this.editorOpened = false;
    
    // ---------- Methods -------- //

    // init map
    this.init = function() {
        this.pointLayer.load();
        // link to main document
        var obj = this;
        //map click handler
        google.maps.event.addListener(this.map, 'click', function(event){
            if (obj.editorOpened) {
                var point = obj.addPoint(event.latLng);
                obj.pointLayer.setPrevious(event.latLng);
                obj.pointLayer.setCurrent(point);
                obj.pointLayer.current.save() 
                obj.outMsg("Метка сохранена");
            }
        });
        // button click handler
        document.documentElement.onkeydown = function(e) {
            // if escape
            if (e.keyCode==27) {
                if (obj.editorOpened) obj.onCloseMarkerEditor();
            } 
        };
    }
    
    // set edits during editing marker
    this.setEditPointData = function(position,title,focus) {
        var lat = position.lat();
        var lng = position.lng();
        $("#label_posx").text(Number(lat).toFixed(4)); 
        $("#label_posy").text(Number(lng).toFixed(4));
        $("#label_name").val(title);
        if (focus) $('#label_name').focus();
    }
    
    // out message on page with choosed color
    this.outMsg = function(txt,color) {
        $('#tootltip').css("display","block");
        $('#tootltip').css("background-color",color);
        $('#tootltip').text(txt);
        setTimeout(function(){$('#tootltip').css("display","none");},2000);
    }
    
    // add new point on map 
    this.addPoint = function(position) {
        var title = "id" + (this.pointLayer.points  .length);
        var point = new MapPoint(this,position,this.objects.ICON_RED(),title);
        point.marker.setDraggable(true);
        this.pointLayer.add(point);
        this.setEditPointData(position,title,true);
        return point;
    }
    
    this.clearEditor = function() {
        $("#label_posx").text("");
        $("#label_posy").text("");
        $("#label_name").val("");
    }
    
    // ------------ Handlers ----------- //
    
    // edit marker button handler
    this.onEditMarker = function() {
        // ajax animation
        $('#edit_route').hide('500');
        $('#edit_marker').show('500');
        // setting up cursor
        this.map.setOptions({ draggableCursor: 'crosshair'});
        // set current point
        this.pointLayer.setCurrent(-1);
        // set the document flag
        this.editorOpened = true;
    }
    // save point handler
    this.onSavePoint = function() {
        if (this.pointLayer.current == -1) this.outMsg("Нет данных для сохранения");
        else {
            this.pointLayer.current.save();
            this.outMsg("Метка сохранена");
        }
        //else this.outMsg("Произошла ошибка", "red");
    }
    // delete point handler
    this.onDeletePoint = function() {
        if (this.pointLayer.current == -1) this.outMsg("Ничего не выбрано");
        else {
            this.pointLayer.current.delete();
            this.outMsg("Метка удалена");
        }
    }
    // close point editor handler
    this.onCloseMarkerEditor = function() {
        $('#edit_marker').hide('500');
        // change cursor to default
        this.map.setOptions({ draggableCursor: 'pointer'});
        // unset marker
        this.pointLayer.setCurrent(-1);
        // set the main document flag
        this.editorOpened = false;
    }
    
    this.onShowRoute = function() {
        if (!this.routeLayer.visible) {
            this.routeLayer.setVisible(true);
            var route = new MapRoute(this);
            route.add(
                    this.pointLayer.points[4].marker.getPosition(),
                    this.pointLayer.points[4].marker.getTitle(),
                    this.pointLayer.points[10].marker.getPosition(),
                    this.pointLayer.points[10].marker.getTitle()
            );
            this.routeLayer.add(route);
            this.map.setCenter(this.pointLayer.points[0].marker.getPosition());
            
        }
        //else this.outMsg(this.routeLayer.routes[0].total);
    }
    
    // edit route handler
    this.onEditRoute = function() {
        $('#edit_marker').hide('500');
        $('#edit_route').show('500');
    }
}

// marker layer
function PointLayer(main) {
    // link to main
    this.main = main;
    // points on layer
    this.points = [];
    // current pint
    this.current = -1;
    // prev position
    this.previous = -1;
    // visibility
    this.visible = false;
    
    // ----------- Methods -------------- //
    
    // visibility
    this.setVisible = function(is) {
        this.visible = is;
        // set visible all markers
    }
    // set previous
    this.setPrevious = function(prev) {
        this.previous = prev;
    }
    // add point to layer
    this.add = function(point) {
        this.points.push(point);
    }
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
                for (var i=0;i<result.length;i++) {
                    var station = result[i];
                    var point = new MapPoint(main,new google.maps.LatLng(station['pos_a'],station['pos_b']),
                            main.objects.ICON_BLUE(),station['name']);
                    layer.add(point); 
                }
            }
        });
    }
    // set marker as current
    this.setCurrent = function(point) {
        if (this.current != -1) {
            this.current.marker.setIcon(main.objects.ICON_BLUE());
            this.current.marker.setDraggable(false);
        }
        if (point == -1) {
            if (this.main.editorOpened) this.main.clearEditor();
            this.current = point;
        }
        else {
            pos = this.points.indexOf(point);
            if (pos != -1) {
                this.current = point;
                point.marker.setIcon(main.objects.ICON_RED());
            }
        }
    }
    
    this.setPrevious = function (point) {
        this.previous = point;
    }
}

// route layer
function RouteLayer(parent) {
    // parent layer
    this.parent = parent;
    // service for making route
    this.directionsService = new google.maps.DirectionsService();
    // route on layer
    this.routes = [];
    // current layer
    this.current;
    // visibility
    this.visible = false;
    
    // ----------- Methods -------------- //
    
    // visibility
    this.setVisible = function(is) {
        this.visible = is;
        for (var i=0;i<routes.length;i++)
            routes[i].setVisible(is);
    }
    // add point to layer
    this.add = function(route) {
        this.routes.push(route);
    }
}

// class for route
function MapRoute(main) {
    // set main
    this.main = main;
    // start point
    this.a;
    // end point
    this.b;
    // start point info
    this.infoA;
    // end point info
    this.infoB;
    // visibility flag
    this.visible = true;
    // count
    this.count = 0;
    // RouteNodes
    this.nodes = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            preserveViewport: true
    });
    this.nodes.setMap(this.main.map); 
    // total distance
    this.total = 0;
    // visibility flag
    this.setVisible = function(is) {
        // hide all nodes
    }
    // add node to route
    this.add = function(a,titleA,b,titleB) {
        var ttl = 0;
        var obj = this;
        var request = {
            origin:a,
            destination:b,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
        };
        this.main.routeLayer.directionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                obj.nodes.setDirections(result);
                var myroute = result.routes[0]; 
                for (i = 0; i < myroute.legs.length; i++) ttl += myroute.legs[i].distance.value;
                obj.total = obj.total + ttl;
                obj.count++;
                var leg = myroute.legs[0];
                if (obj.count == 1) obj.setStart(leg.start_location,titleA);
                obj.setEnd(leg.end_location,titleB);
            }
        }); 
    }
    // start setter
    this.setStart = function(position,title) {
        this.a = position;
        this.infoA = new InfoBox({
            content: '<div class="text"><center>' + title + '</center></div>',
            boxClass: "infoRoute",
            pixelOffset: new google.maps.Size(-50,-50),
            closeBoxURL : 'engine/img/close_t.png'
        });
        this.infoA.open(this.main.map);
        this.infoA.setPosition(position);
    }
    // end setter
    this.setEnd = function(position,title) {
        this.b = position;
        this.infoB = new InfoBox({
            content: '<div class="text"><center>' + title + '</center></div>',
            boxClass: "infoRoute",
            pixelOffset: new google.maps.Size(-50,-50),
            closeBoxURL : 'engine/img/close_t.png'
        });
        this.infoB.open(this.main.map);
        this.infoB.setPosition(position);       
    }
}
// class for points
function MapPoint(main,position,icon,title) {
    // link to main
    this.main = main;
    // flag for enabling info on click
    this.enabled = true;
    // visibilty flag
    this.visible = true;
    // google.maps.Marker base
    this.marker =  new google.maps.Marker({
            position: new google.maps.LatLng(Number(position.lat()).toFixed(4),Number(position.lng()).toFixed(4)),
            icon: icon,
            map: main.map,
            title : title,
            draggable: false
        });
    // infoBox base
    this.info = new InfoBox({
            content: '<div class="text">' + this.marker.title + '</div>',
            boxClass: "infoBox",
            pixelOffset: new google.maps.Size(-150,-120)
    });
    // enable setter
    this.setEnabled = function(is) {
        this.enabled = is;
    }
    // title setter
    this.setTitle = function(title) {
        this.marker.setTitle(title);
        // add some code for updating content
    }
    // visible setter
    this.setVisible = function(is) {
        this.visible = is;
        if (is) {
            //this.marker.
            this.info.hide();
        }
        else {
            //
            this.info.show();
        }
    }
    // click listener setter
    this.setClickListener = function() {
        var obj = this;
        var main = this.main;
        google.maps.event.addListener(this.marker, 'click', function(event) {
            if (main.editorOpened) {
                main.setEditPointData(this.position,this.title,true);
                main.pointLayer.setPrevious(this.position);
                main.pointLayer.setCurrent(obj);
                this.setDraggable(true);
            }
            else {
                if (main.pointLayer.current != -1) main.pointLayer.current.info.hide();
                obj.info.open(obj.main.map,this);
                obj.info.show();
                main.pointLayer.current = obj;
            }
            
        });
        // drag event handler
        google.maps.event.addListener(this.marker, 'drag', function(event) {
            if (main.editorOpened) {
                var name = $('#label_name').val();
                main.setEditMarkerData(this.position,name,false);
            }
        });
        google.maps.event.addListener(this.marker, 'dragstart', function(event) {
            if (main.editorOpened) {
                main.pointLayer.setPrevious(this.position);
            }
        });
        google.maps.event.addListener(this.marker, 'dragend', function(event) {
            if (main.editorOpened) {
                main.pointLayer.current.save();
            }
        });
    }
    // delete point
    this.delete = function() {
        var obj = this;
        var main = this.main;
        $.ajax({
            datatype: main.values.TYPE_JSON,
            type: main.values.TYPE_POST,
            url: main.url,
            data: main.values.DELETE_STATION(),
            cache: false,
            success: function(result) {
                obj.marker.setMap(null);
                // some code for info....
                main.pointLayer.points.splice(main.pointLayer.points.indexOf(obj),1);
                main.pointLayer.setCurrent(-1);
            }
        });
    }

    // save point
    this.save = function() {
        var main = this.main;
        $.ajax({
            datatype: main.values.TYPE_JSON,
            type: main.values.TYPE_POST,
            url: main.url,
            data: main.values.SEND_STATION(this.marker.position),
            success: function(result) {
                var name = $('#label_name').val();
                main.pointLayer.current.setTitle(name);
                return true;
            }
        });
        //return false;
    }
    // set default click listener
    this.setClickListener();
}

// static objects class
function Objects() {
    this.ICON_BLUE = function() {
        return new google.maps.MarkerImage(
            './engine/img/stop.png',
            new google.maps.Size(30,30),
            new google.maps.Point(0,0),
            new google.maps.Point(15,20)
        );
    }

    this.ICON_RED = function() {
        return new google.maps.MarkerImage(
            './engine/img/stop-m.png',
            new google.maps.Size(30,30),
            new google.maps.Point(0,0),
            new google.maps.Point(15,20)
        );
    }
}

function Values() {
    this.TYPE_POST = 'POST';
    this.TYPE_JSON = 'json';
    this.GET_STATION = '{"type" : "GET_STATION"}';
    this.DELETE_STATION = function () {
        return '{"type" : "DELETE_STATION",\n\
           "pos_a" : "' + $('#label_posx').text() + 
        '","pos_b" : "' + $('#label_posy').text() + '"}'
    }
    this.SEND_STATION = function(position) {
        return '{"type" : "SEND_STATION",\n\
                        "pos_a" : "' + $('#label_posx').text() + 
                     '","old_a" : "' + Number(position.lat()).toFixed(4) + 
                     '","old_b" : "' + Number(position.lng()).toFixed(4) + 
                     '","pos_b" : "' + $('#label_posy').text() + 
                     '","name" : "' + $('#label_name').val() + '"}'
    }
}

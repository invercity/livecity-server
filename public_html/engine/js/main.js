function initialize() {
		var latlng = new google.maps.LatLng(51.4982000,31.2893500);
		var settings = {
			zoom: 15,
			center: latlng,
			mapTypeControl: true,
			mapTypeControlOptions: {style: google.maps.MapTypeControlStyle,
                            position: google.maps.ControlPosition.BOTTOM_LEFT},
			navigationControl: true,
			navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
			mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                // creating map with specific settings
                var map = new google.maps.Map(document.getElementById("map_canvas"), settings);
                $.ajax({
                datatype: 'jsonp',
                type: 'POST',
                url: 'http://localhost:8888',
                data: '{"type" : "GET_STATION"}',
                jsonp: 'callback',
                cache: true,
                success: function(result) {
                    //data1 = JSON.parse(result);
                    
                    for (var i=0;i<result.length;i++) {
                        var station = result[i];
                        stations.push(placeStation(map,station['id'],station['pos_a'],station['pos_b'],
                        station['name']));
                    }
                }
                });
                return map;
}

// get latLng from marker and set edits
function markerClick(latLng,name,focus) {
    var lat = latLng.lat();
    var lng = latLng.lng();
    $("#label_posx").text(Number(lat).toFixed(4)); 
    $("#label_posy").text(Number(lng).toFixed(4));
    $("#label_name").val(name);
    if (focus == 1) $('#label_name').focus();
}

function addMarkerMap(map,stations,latLng) {
    var title = "id" + (stations.length);
    stations.push(putMarker(map,latLng,title));
    markerClick(latLng,title,1);
    // add handler for new marker
    google.maps.event.addListener(stations[stations.length-1], 'click', function(event) {
          markerClick(this.position,this.title,1);
          setOld(this.position.lat(),this.position.lng());
          setCurrent(this);
    });
    google.maps.event.addListener(stations[stations.length-1], 'drag', function(event) {
        var name = $('#label_name').val();
          markerClick(this.position,name,0);
    });
    google.maps.event.addListener(stations[stations.length-1], 'dragstart', function(event) {
                        setOld(event.latLng.lat(),event.latLng.lng());
                        setCurrent(this);
    });
    google.maps.event.addListener(stations[stations.length-1], 'dragend', function(event) {
                        saveStation(stations);
    });
}

function addToList(value){
    var list = document.getElementById("ul_list"); 
    var li = document.createElement('LI'); 
    li.innerHTML = value;
    list.appendChild(li);
}

// save previos values
function setOld(a,b) {
    $('#old_a').text(Number(a).toFixed(4));
    $('#old_b').text(Number(b).toFixed(4));
}



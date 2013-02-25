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
                return map;
}

function onEdit() {
    document.getElementById('edit_marker').style.display = "";
}

function onEscape(e) {
    if (e.keyCode==27) $('#close_edit').click(); 
}

// get latLng from marker and set edits
function markerClick(latLng,name) {
    var lat = latLng.lat();
    var lng = latLng.lng();
    $("#label_posx").text(Number(lat).toFixed(6)); 
    $("#label_posy").text(Number(lng).toFixed(6));
    $("#label_name").val(name);
    $('#label_name').focus();
}

function addMarkerMap(map,stations,latLng) {
    stations.push(putMarker(map,latLng));
    markerClick(latLng,"");
    // add handler for new marker
    google.maps.event.addListener(stations[stations.length-1], 'click', function(event) {
          markerClick(this.position);
    });
    google.maps.event.addListener(stations[stations.length-1], 'drag', function(event) {
          markerClick(this.position);
    });
}

function addToList(value){
    var list = document.getElementById("ul_list"); 
    var li = document.createElement('LI'); 
    li.innerHTML = value;
    list.appendChild(li);
}



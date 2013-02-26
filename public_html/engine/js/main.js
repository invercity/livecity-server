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
                //document.getElementById('label_posx').
}

function onEdit() {
    document.getElementById('edit_marker').style.display = "";
}

function onEscape(e) {
    if (e.keyCode==27) $('#close_edit').click(); 
}

// get latLng from marker and set edits
function markerClick(id,latLng,name,focus) {
    var lat = latLng.lat();
    var lng = latLng.lng();
    $("#label_posx").text(Number(lat).toFixed(6)); 
    $("#label_posy").text(Number(lng).toFixed(6));
    $("#label_name").val(name);
    $('#label_name').focusout();
    if (focus==1) $('#label_name').focus();
    $('#label_id').text(id);
    
}

function addMarkerMap(map,stations,latLng) {
    stations.push(putMarker(map,latLng));
    var title = "id";
    title+=stations.length-1;
    markerClick(title,latLng,title,1);
    // add handler for new marker
    google.maps.event.addListener(stations[stations.length-1], 'click', function(event) {
          markerClick(this.id,this.position,this.title,1);
    });
    google.maps.event.addListener(stations[stations.length-1], 'drag', function(event) {
          markerClick(this.id,this.position,this.title,0);
    });
}

function addToList(value){
    var list = document.getElementById("ul_list"); 
    var li = document.createElement('LI'); 
    li.innerHTML = value;
    list.appendChild(li);
}



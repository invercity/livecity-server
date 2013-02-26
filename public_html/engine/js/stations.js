// place station in selected place
function placeStation(map,a,b,name) {
    var pos = new google.maps.LatLng(a,b);
    var img = new google.maps.MarkerImage('./engine/img/stop.png',
	new google.maps.Size(30,30),
	new google.maps.Point(0,0),
	new google.maps.Point(15,20)
    );
    
    marker = new google.maps.Marker({
        position: pos,
        map: map,
        icon: img,
        title: name,
        zindex: 15,
        draggable: false
    });
    return marker;
}


function putMarker(map,location) {
  //var clickedLocation = new google.maps.LatLng(location);
  var img = new google.maps.MarkerImage('./engine/img/stop.png',
	new google.maps.Size(30,30),
	new google.maps.Point(0,0),
	new google.maps.Point(15,20));
  marker = new google.maps.Marker({
      position: location, 
      map: map,
      icon: img,
      draggable: true
  });
  return marker; 
}

function setDraggable(arr) {
    for (var i=0;i<arr.length;i++)
        arr[i].set("draggable","true");
}

function unsetDraggable(arr) {
    for (var i=0;i<arr.length;i++)
        arr[i].set("draggable","");
}



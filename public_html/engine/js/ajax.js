// edit click handler
function editClick(map,stations) {
    // ajax animation
    $('#edit_marker').show('500');
    // setting up cursor
    map.setOptions({ draggableCursor: 'crosshair'});
    // check if escape button was pushed
    document.documentElement.onkeydown = function(e) {
        if (e.keyCode==27) $('#close_button').click(); 
    };
    //map click handler
    google.maps.event.addListener(map, 'click', function(event){
        // add marker to visible layout
        addMarkerMap(map,stations,event.latLng);
        setOld(event.latLng.lat(),event.latLng.lng());
        setCurrent(stations[stations.length-1]);
        saveStation(stations);
    });
                // enable drag markers
                setDraggable(stations);
                //add marker handler
                for (var i=0;i<stations.length;i++) {
                    // adding to list of stations on edit pad
                    // addToList(stations[i].position);
                    // station marker click handler
                    google.maps.event.addListener(stations[i], 'click', function(event) {
                        markerClick(this.position,this.title,1);
                        setCurrent(this);
                    });
                    // station marker drag handler
                    google.maps.event.addListener(stations[i], 'drag', function(event) {
                        var name = $('#label_name').val();
                        markerClick(this.position,name,0);
                    });
                    google.maps.event.addListener(stations[i], 'dragstart', function(event) {
                        setOld(event.latLng.lat(),event.latLng.lng());
                        markerClick(this.position,this.title,0);
                        setCurrent(this);
                    });
                    google.maps.event.addListener(stations[i], 'dragend', function(event) {
                        saveStation(stations);
                    });
                }                
}

function saveStation(stations) {
// filling request with data
                var senddata = '{"type" : "SEND_STATION",\n\
                        "pos_a" : "' + $('#label_posx').text() + 
                     '","old_a" : "' + $('#old_a').text() + 
                     '","old_b" : "' + $('#old_b').text() + 
                     '","pos_b" : "' + $('#label_posy').text() + 
                     '","name" : "' + $('#label_name').val() + '"}';
                $.ajax({
                    datatype: 'jsonp',
                    type: 'POST',
                    url: 'http://localhost:9090/',
                    data: senddata,
                    jsonp: 'callback',
                    //contentType: "charset=utf-8",
                    cache: false,
                    // result will be the id of updated station
                    success: function(result) {
                        var old_a = $('#label_posx').text();
                        var name = $('#label_name').val();
                        var pos = 0;
                        while ((pos<stations.length) && 
                                (Number(stations[pos].getPosition().lat()).toFixed(4) != old_a))
                            pos++;
                        if (pos!=stations.length)
                            stations[pos].setTitle(name);  
                        outMsg("Метка сохранена");
                    }
                });
}

function deleteStation(stations) {
    var senddata = '{"type" : "DELETE_STATION",\n\
           "pos_a" : "' + $('#label_posx').text() + 
        '","pos_b" : "' + $('#label_posy').text() + '"}';
    $.ajax({
          datatype: 'jsonp',
          type: 'POST',
          url: 'http://localhost:9090/',
          data: senddata,
          jsonp: 'callback',
          //contentType: "charset=utf-8",
          cache: false,
          // result will be the id of updated station
          success: function(result) {
                var old_a = $('#label_posx').text();
                var pos = 0;
                while ((pos<stations.length) && 
                     (Number(stations[pos].getPosition().lat()).toFixed(4) != old_a))
                  pos++;
              // remove from local station list
                if (pos!=stations.length) {
                    stations[pos].setMap(null);
                    stations.splice(pos,1);
                    $("#label_posx").text("");
                    $("#label_posy").text("");
                    $("#label_name").val("");
                    $("#label_id").text("");
                    // unset marker
                    setCurrent(-1);
                    outMsg("Метка удалена");
                }
                else outMsg("Unknown Error","red");
                
          }
    });
}

function closeEditor(map,stations) {
    $('#edit_marker').hide('500');
    map.setOptions({ draggableCursor: 'pointer'});
    //unset click handler
    google.maps.event.clearListeners(map, 'click');
    //unset marler click and drag handler
    for (var i=0;i<stations.length;i++) {
        google.maps.event.clearListeners(stations[i], 'click');
        google.maps.event.clearListeners(stations[i], 'drag');
        google.maps.event.clearListeners(stations[i], 'dragstart');
        google.maps.event.clearListeners(stations[i], 'dragend');
    }
    // unset escape handler 
    document.documentElement.onkeydown = function(e) {};
    // disable drag markers
    unsetDraggable(stations);
    //clear fields
    $("#label_posx").text("");
    $("#label_posy").text("");
    $("#label_name").val("");
    $("#label_id").text("");
    // unset marker
    setCurrent(-1);
}

function outMsg(text,color) {
    $('#tootltip').css("display","block");
    $('#tootltip').css("background-color",color);
    $('#tootltip').text(text);
    setTimeout(function(){$('#tootltip').css("display","none");},2000);
}



/**
 * Created by invercity on 17.04.14.
 */
var pos = new google.maps.LatLng(51.4982000,31.2893500);
// endAction flag, if flag === 0, endAction = 'exit', if flag === 1, endAction = 'enter'
var action = 0;
// route id
var route = null;
// transport id
var _id = null;

// create map, and marker [CAR]
function initializeMap() {
    // set map settings
    var settings = {
        zoom: 15,
        center: pos,
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
    // create map
    var m = new google.maps.Map(document.getElementById("map_canvas"), settings);
    // create bus marker
    var marker = new google.maps.Marker({
        position: pos,
        map: m,
        draggable: true
    });
    // add marker dragend handler
    google.maps.event.addListener(marker, 'dragend', function(event) {
        updateMarkerData(event.latLng);
    });
    // run next handler
    initAction();
};
// update marker [CAR] data on drag
function updateMarkerData (pos) {
    $.ajax({
        datatype: 'JSON',
        type: 'POST',
        url: '/service/transport?act=report',
        data: {
            _id:_id,
            route: route,
            lat: pos.lat(),
            lng: pos.lng()
        },
        success: function(result) {
            // actions?
        }
    });
}
// initAction app
function initAction() {
    $.ajax({
        datatype: 'json',
        type: 'POST',
        url: '/service/transport?act=init',
        data: {
            lat: pos.lat(),
            lng: pos.lng()
        },
        success: function(result) {
            route = result.routes[0]._id;
            _id = result.trans._id;
            action = 0;
            console.log(route);
            // set text for 'ACT' button
            $('#act').text('Exit');
        }
    });
}
// initAction or end endAction
function endAction() {
    // end action
    if (action === 0) {
        $.ajax({
            datatype: 'JSON',
            type: 'POST',
            url: '/service/transport?act=end',
            data: {
                _id: _id
            },
            success: function(result) {
                _id = null;
                route = null;
                action = 1;
                // set text for 'ACT' button
                $('#act').text('Init');
            }
        })
    }
    // init action
    else if (action === 1) initAction();
}
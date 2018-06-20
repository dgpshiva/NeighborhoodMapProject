/* For initial render of view based on viewport dimensions */

// To toglgle sideNav
// true = Open
// false = Closed
var navStatus = true;

// true if viewport has mobile dimensions
var mobile = false;

// true if viewport has ipad dimensions
var ipad = false;

// If mobile device, keep the sideNav closed
if (window.innerWidth < 400) {
    navStatus = false;
    mobile = true;
}

// If iPad keep the sideNav open
else if (window.innerWidth > 400 && window.innerWidth < 800) {
    navStatus = false;
    ipad = true;
}
else {
    navStatus = true;
}

renderNavBar();



// Locations data to be used by the app
// This can eventually come from a server
var initialLocations = [
    {title: "Thai Cottage II", location: {lat: 29.584786, lng: -95.631824}},
    {title: "Fadi’s Mediterranean Grill", location: {lat: 29.606914, lng: -95.642116}},
    {title: "Torchy's Tacos", location: {lat: 29.600708, lng: -95.621441}},
    {title: "Aga's Restaurant & Catering", location: {lat: 29.649128, lng: -95.567608}},
    {title: "Aling's Chinese", location: {lat: 29.603257, lng: -95.613732}}
];

// Global variables
var map;

// Global dict to map each Location to it's corresponding Marker
// so that retrival of Marker for a Location can be done in O(1)
var titleMarkerDict = {};


/* Model */
var Location = function(data) {
    this.title =  data.title;
    this.position = { lat: data.location.lat, lng: data.location.lng};
    this.isSelected = ko.observable(false);
}


/* View Model */
var ViewModel = function() {

    var self = this;

    self.filterText = ko.observable("");

    // Function to toggle sideNav open and close
    // on click of hamburger
    self.toggleNav = function() {
        navStatus = !navStatus;
        renderNavBar();
    };


    // Create Location object using each location in json input
    // and add it to the locationsList observable array
    self.locationsList = ko.observableArray([]);

    // Adding the Location objects to this array also
    // This will be used for the search and reseting the filter
    self.masterLocationsList = [];

    initialLocations.forEach( function(location) {
        self.locationsList.push(new Location(location));
        self.masterLocationsList.push(new Location(location));
    });

    // Iterate through locationsList observable array
    // and create actual map markers.
    // Add them to global titleMarker dict
    self.createMarkers = function() {
        for (var i=0; i<self.locationsList().length; i++) {
            var marker = new google.maps.Marker({
                position: self.locationsList()[i].position,
                title: self.locationsList()[i].title,
                animation: google.maps.Animation.DROP,
                id: i
            });

            // Add event listener to toggle marker bounce animation
            // and infoWindow when clicked.
            var infoWindow = new google.maps.InfoWindow();
            infoWindow.addListener('closeclick', function(markerCopy, locationCopy) {
                return function() {
                    markerCopy.setAnimation(null);
                    this.close();
                    locationCopy.isSelected(false);
                }
            }(marker, self.locationsList()[i]));

            marker.infowindow = infoWindow;

            marker.addListener('click', function(markerCopy, locationCopy) {
                return function() {
                    markerClicked(markerCopy, locationCopy);
                }
            }(marker, self.locationsList()[i]));

            // Add the marker created to the global titleMarkerDict
            titleMarkerDict[self.locationsList()[i].title] = marker;
        }
    };

    // Function to toggle marker bounce and inforWindow when its corresponding
    // list element is clicked
    self.toggleSelected = function(data) {

        // Toggling selected location marker's animation, infoWindow
        // and list element css class
        markerClicked(titleMarkerDict[data.title], data);
    }

    // Function to filter location titles list and
    // markers based on user input filter text
    self.filterLocations = function() {

        // Array to store the Location objects matching the filter applied by user
        var filteredLocationsList = [];

        // Alert user if Filter button clicked without any input
        if (self.filterText() === "") {
            window.alert("Please enter some text to filter.");
            return;
        }

        // Iterating the masterLocationsList array to find Location objects
        // matching the filter applied by user.
        // And loading them into the filteredLocationsList array
        self.masterLocationsList.forEach( function(location) {
            if (location.title.toUpperCase().indexOf(self.filterText().toUpperCase()) > -1) {
                filteredLocationsList.push(location);
            }
        });

        // Clearing the locationsList observable array
        self.locationsList.removeAll();

        // Clearing all the exisitng markers from the map
        for (var key in titleMarkerDict) {
            titleMarkerDict[key].setMap(null);
        }

        // Loading the locationsList observable array with Location objects filtered.
        // And placing their markers on the map
        filteredLocationsList.forEach( function(location) {
            self.locationsList.push(location);
            titleMarkerDict[location.title].setMap(map);
        });
    };

    // Function to reset filter
    self.resetFilter = function() {

        // Clearing filter text
        self.filterText("");

        // Clearing the locationsList observable array
        self.locationsList.removeAll();

        // Clearing all the exisitng markers from the map
        for (var key in titleMarkerDict) {
            titleMarkerDict[key].setMap(null);
        }

        // Using the masterLocationsList array to populate the
        // locationsList observable array and placing all the markers on the map
        self.masterLocationsList.forEach( function(location) {
            self.locationsList.push(location);
            titleMarkerDict[location.title].setMap(map);
        });
    }
}



// Maps success callback function
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 29.616067, lng: -95.557722},
        zoom: 13
    });

    // Calling the ViewModel function to create the markers
    // and populate the global titleMarkerDict dict with them
    vm.createMarkers();

    // Putting all the location markers on the map
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the markers
    for (var key in titleMarkerDict) {
        titleMarkerDict[key].setMap(map);
        bounds.extend(titleMarkerDict[key].position);
    }
    map.fitBounds(bounds);
}



// Helper functions
function renderNavBar() {
    if (!navStatus) {
        document.getElementById("mySidenav").style.width = "0px";
        document.getElementById("main").style.marginLeft = "0px";
    }
    else if (mobile) {
        document.getElementById("title-text").style.fontSize = "20px";
        document.getElementById("title-text").style.marginBottom = "25px";

        document.getElementById("filter-locations-text").style.width = "100%";

        document.getElementById("filter-controls").style.border = "none";

        document.getElementById("filter-locations").style.width = "100%";
        document.getElementById("filter-locations").style.justifyContent = "center";
        document.getElementById("filter-locations").style.margin = "5px 3px";
        document.getElementById("filter-locations").style.borderRadius = "3px";

        document.getElementById("reset-controls").style.margin = "0";

        document.getElementById("reset-button").style.width = "100%";
        document.getElementById("reset-button").style.justifyContent = "center";
        document.getElementById("reset-button").style.margin = "0 3px";
        document.getElementById("reset-button").style.borderRadius = "3px";

        document.getElementById("mySidenav").style.width = "200px";
        document.getElementById("main").style.marginLeft = "200px";
    }
    else if (ipad) {
        document.getElementById("filter-locations").style.padding = "7px 14px";
        document.getElementById("mySidenav").style.width = "400px";
        document.getElementById("main").style.marginLeft = "400px";
    }
    else {
        document.getElementById("mySidenav").style.width = "400px";
        document.getElementById("main").style.marginLeft = "400px";
    }
}

function markerClicked(clickedMarker, location) {

    var markerInfoWindow = clickedMarker.infowindow;

    // Toggle bounce animation and infowindow
    if (clickedMarker.getAnimation() !== null) {
        clickedMarker.setAnimation(null);
        markerInfoWindow.close();

        // isSelected property is bound to the css class
        // to be applied on list element on selection
        location.isSelected(false);
    }
    else {
        // toggle clickedMarker bounce animation
        clickedMarker.setAnimation(google.maps.Animation.BOUNCE);

        // Set the infoWindow on the current clicked marker
        markerInfoWindow.marker = clickedMarker;

        // Open the infoWindow on the correct marker.
        markerInfoWindow.open(map, clickedMarker);

        // isSelected property is bound to the css class
        // to be applied on list element on selection
        location.isSelected(true);
    }
}

var vm = new ViewModel();
ko.applyBindings(vm);

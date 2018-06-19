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
    {title: "Glenshire Park", location: {lat: 29.647542, lng: -95.536096}},
    {title: "Gammil Park", location: {lat: 29.634687, lng: -95.518776}},
    {title: "Fondren Park", location: {lat: 29.632763, lng: -95.514022}},
    {title: "Buffalo Run Park", location: {lat: 29.614102, lng: -95.511442}},
    {title: "Bicentennial Park", location: {lat: 29.611448, lng: -95.540761}}
];

// Global variables
var map;

// Glocal dict to map each Location to it's corresponding Marker
// so that retrival of Marker for a Location can be done in O(1)
var locationTitleMarkerDict = {}


/* Model */
var Location = function(data) {
    this.title =  data.title;
    this.position = { lat: data.location.lat, lng: data.location.lng};
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
    // Add them to global locationTitleMarker dict
    self.createMarkers = function() {
        for (var i=0; i<self.locationsList().length; i++) {
            var marker = new google.maps.Marker({
                position: self.locationsList()[i].position,
                title: self.locationsList()[i].title,
                animation: google.maps.Animation.DROP,
                id: i
            });

            // Add event listener to make marker bounce when clicked
            marker.addListener('click', function() {
                toggleBounce(this);
            });

            // Add the marker created to the global locationTitleMarkerDict
            locationTitleMarkerDict[self.locationsList()[i].title] = marker;
        }
    };

    // Function to toggle marker bounce when its corresponding
    // list element is clicked
    self.toggleMarkerBounce = function(data) {
        toggleBounce(locationTitleMarkerDict[data.title]);
    }


    self.filterLocations = function(data) {
        // Array to store the Location objects matching the filter applied by user
        var filteredLocationsList = [];

        // Alert user if Filter button clicked without any input
        if (self.filterText() === "") {
            window.alert("Please enter some text to filter.");
            return;
        }

        // Iterating the self.masterLocationsList array to find Location objects
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
        for (var key in locationTitleMarkerDict) {
            locationTitleMarkerDict[key].setMap(null);
        }

        // Loading the locationsList observable array with Location objects filtered.
        // And placing their markers on the map
        filteredLocationsList.forEach( function(location) {
            self.locationsList.push(location);
            locationTitleMarkerDict[location.title].setMap(map);
        });
    };
}



// Maps success callback function
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 29.616067, lng: -95.557722},
        zoom: 13
    });

    // Calling the ViewModel funtion to create the markers
    // and populate the global markers[] array with them
    var vm = new ViewModel();
    vm.createMarkers();

    // Putting all the location markers on the map
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the markers
    for (var key in locationTitleMarkerDict)
    {
        locationTitleMarkerDict[key].setMap(map);
        bounds.extend(locationTitleMarkerDict[key].position);
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
        document.getElementById("filter-locations-text").style.height = "20px";
        document.getElementById("filter-locations").style.width = "100%";
        document.getElementById("filter-locations").style.justifyContent = "center";
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

function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    }
    else {
       marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}


ko.applyBindings(new ViewModel());

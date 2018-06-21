var map;

/* Model */
var Location = function(data) {
    this.title =  data.title;
    this.position = { lat: data.location.lat, lng: data.location.lng};
    this.isSelected = ko.observable(false);
}

/* View Model */
var ViewModel = function() {

    var self = this;

    /* For initial render of view based on viewport dimensions */

    // To toglgle sideNav
    // true = Open
    // false = Closed
    self.navStatus = true;

    // true if viewport has mobile dimensions
    self.mobile = false;

    // true if viewport has ipad dimensions
    self.ipad = false;

    // If mobile device, keep the sideNav closed
    if (window.innerWidth < 400) {
        self.navStatus = false;
        self.mobile = true;
    }

    // If iPad keep the sideNav open
    else if (window.innerWidth > 400 && window.innerWidth < 800) {
        self.navStatus = false;
        self.ipad = true;
    }
    else {
        self.navStatus = true;
    }

    renderNavBar(self.navStatus, self.mobile, self.ipad);


    // Locations data to be used by the app.
    // This can eventually come from a server.
    self.initialLocations = [
        {title: "Thai Cottage II", location: {lat: 29.584786, lng: -95.631824}},
        {title: "Fadis Mediterranean Grill", location: {lat: 29.606914, lng: -95.642116}},
        {title: "Torchy's Tacos", location: {lat: 29.600708, lng: -95.621441}},
        {title: "Aga's Restaurant & Catering", location: {lat: 29.649128, lng: -95.567608}},
        {title: "Aling's Hakka Chinese Cuisine", location: {lat: 29.603257, lng: -95.613732}}
    ];

    self.titleMarkerDict = {};

    self.filterText = ko.observable("");

    // Create Location object using each location in json input
    // and add it to the locationsList observable array
    self.locationsList = ko.observableArray([]);

    // Adding the Location objects to this array also
    // This will be used for the search and reseting the filter
    self.masterLocationsList = [];

    self.initialLocations.forEach( function(location) {
        self.locationsList.push(new Location(location));
        self.masterLocationsList.push(new Location(location));
    });


    // Function to toggle sideNav open and close
    // on click of hamburger
    self.toggleNav = function() {
        self.navStatus = !self.navStatus;
        renderNavBar(self.navStatus, self.mobile, self.ipad);
    };

    // Iterate through locationsList observable array
    // and create actual map markers.
    // Add them to global titleMarker dict
    self.createMarkers = function() {
        self.titleMarkerDict = {};
        for (var i=0; i<self.locationsList().length; i++) {
            var marker = new google.maps.Marker({
                // position: locationsList[i].position,
                position: self.locationsList()[i].position,
                //title: locationsList[i].title,
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
            //}(marker, locationsList[i]));


            marker.infowindow = infoWindow;

            marker.addListener('click', function(markerCopy, locationCopy) {
                return function() {
                    self.markerClicked(markerCopy, locationCopy);
                }
            }(marker, self.locationsList()[i]));
            //}(marker, locationsList[i]));

            // Add the marker created to the global titleMarkerDict
            //self.titleMarkerDict[locationsList[i].title] = marker;
            self.titleMarkerDict[self.locationsList()[i].title] = marker;
        }
    };

    self.markerClicked = function(clickedMarker, location) {
        var markerInfoWindow = clickedMarker.infowindow;

        var fourSquareApiSearchUrl = "https://api.foursquare.com/v2/venues/search?client_id=TL1CUWH2JXZLJ4HV4B5PM0W0NJXO40EZRF2152HQ1P21IGQE&client_secret=XELO1HXFNWCNVVI0GAHR3U0WZBKCUQFJIPYRHAI00DFQ0P1Y&v=20180323"
                                + "&ll=" + location.position.lat + "," + location.position.lng;
        var fsRequestTimeOut = setTimeout(function(){
            markerInfoWindow.setContent("Failed to get a response from FourSquare!");
        }, 8000);

        // Toggle bounce animation and infowindow
        if (clickedMarker.getAnimation() !== null) {
            clickedMarker.setAnimation(null);
            markerInfoWindow.close();

            // isSelected property is bound to the css class
            // to be applied on list element on selection
            location.isSelected(false);
        }
        else {
            // Making AJAX request to FourSquare search api endpoint
            $.ajax({
                url: fourSquareApiSearchUrl,
                success: function(response) {
                    var searchReponseObj = response;
                    if (searchReponseObj.meta.code == 200) {
                        self.populateInfoWindow(searchReponseObj, markerInfoWindow, clickedMarker);
                        clearTimeout(fsRequestTimeOut);
                    }
                },
                error: function(errResponse) {
                    if (errResponse.responseJSON.meta.errorType == "rate_limit_exceeded") {
                        markerInfoWindow.setContent("Rate limit to FourSquare exceeded.\nPlease try again tomorrow.");
                    }
                    else if (errResponse.responseJSON.meta.errorType == "quota_exceeded") {
                        infoWindow.setContent("Daily call quota to FourSquare exceeded.\nPlease try again tomorrow.");
                    }
                    else {
                        markerInfoWindow.setContent("Failed to get response from FourSquare!");
                    }
                    clearTimeout(fsRequestTimeOut);
                }
            });

            // toggle clickedMarker bounce animation
            clickedMarker.setAnimation(google.maps.Animation.BOUNCE);

            // isSelected property is bound to the css class
            // to be applied on list element on selection
            location.isSelected(true);
        }
    };

    self.populateInfoWindow = function(responseObj, infoWindow, marker) {
        var venues = responseObj.response.venues;
        var venueId;
        var i;
        var venue;

        // Since FourSquare returns number of locations for a given lat lng,
        // iterating through them to find out location of interest
        for (i=0; i<venues.length; i++) {
            venue = venues[i];
            if (venue.name.includes(marker.title)) {
                venueId = venue.id;
                break;
            }
        }

        var fourSquareApiVenueUrl = "https://api.foursquare.com/v2/venues/" +
                                        venueId + "?client_id=TL1CUWH2JXZLJ4HV4B5PM0W0NJXO40EZRF2152HQ1P21IGQE&client_secret=XELO1HXFNWCNVVI0GAHR3U0WZBKCUQFJIPYRHAI00DFQ0P1Y&v=20180323";

        var fsRequestTimeOut = setTimeout(function(){
            infoWindow.setContent("Failed to get a response from FourSquare!");
        }, 8000);

        // Making AJAX request to FourSquare venue details api endpoint
        $.ajax({
            url: fourSquareApiVenueUrl,
            success: function(response) {
                var venueReponseObj = response;
                if (venueReponseObj.meta.code == 200) {

                    var venueObj = venueReponseObj.response.venue;
                    var address = venueObj.location.address;
                    var city = venueObj.location.city;
                    var state = venueObj.location.state;
                    var postalCode = venueObj.location.postalCode;
                    var countryCode = venueObj.location.cc;
                    var phoneNumber = venueObj.contact.formattedPhone;
                    var pricing = venueObj.price.message;
                    var rating = venueObj.rating;
                    var ratingColor = venueObj.ratingColor;
                    var status = venueObj.hours.status;

                    var pTagStartMargin = '<p style="margin-top: 5px">';
                    var pTagStart = '<p style="margin: 0">';
                    var pTagEnd = '</p>';
                    var displayString =
                        '<div>' +
                        pTagStart + address + pTagEnd +
                        pTagStart + city + ", " + state + " " + postalCode + pTagEnd +
                        pTagStart + countryCode + pTagEnd +
                        pTagStartMargin + phoneNumber + pTagEnd +
                        pTagStartMargin + "Pricing: " + pricing + pTagEnd +

                        pTagStartMargin + "Rating: " + rating + "\n" +
                        '<i class="fas fa-star" style="color: #' + ratingColor + '"></i>' +
                        pTagEnd +


                        pTagStartMargin + status + pTagEnd +
                        '</div>';

                    infoWindow.setContent(displayString);

                    clearTimeout(fsRequestTimeOut);
                }
            },
            error: function(errResponse) {
                if (errResponse.responseJSON.meta.errorType == "rate_limit_exceeded") {
                    infoWindow.setContent("Rate limit to FourSquare exceeded.\nPlease try again tomorrow.");
                }
                else if (errResponse.responseJSON.meta.errorType == "quota_exceeded") {
                    infoWindow.setContent("Daily call quota to FourSquare exceeded.\nPlease try again tomorrow.");
                }
                else {
                    infoWindow.setContent("Failed to get response from FourSquare!");
                }
                clearTimeout(fsRequestTimeOut);
            }
        });

        // Set the infoWindow on the current clicked marker
        infoWindow.marker = marker;

        // Open the infoWindow on the correct marker.
        infoWindow.open(map, marker);

    };

    // Function to toggle marker bounce and inforWindow when its corresponding
    // list element is clicked
    self.toggleSelected = function(data) {

        // Toggling selected location marker's animation, infoWindow
        // and list element css class
        self.markerClicked(self.titleMarkerDict[data.title], data);
    }

    // Function to filter location titles list and
    // markers based on user input filter text
    self.filterLocations = function() {
        // Alert user if Filter button clicked without any input
        if (self.filterText() === "") {
            window.alert("Please enter some text to filter.");
            return;
        }

        // Clearing the locationsList observable array
        self.locationsList.removeAll();

        self.masterLocationsList.forEach( function(location) {
            if (location.title.toUpperCase().indexOf(self.filterText().toUpperCase()) > -1) {
                // filteredLocationsList.push(location);
                self.locationsList.push(location);
            }
        });

        // Clearing all the exisitng markers from the map
        for (var key in self.titleMarkerDict) {
            self.titleMarkerDict[key].setMap(null);
        }

        //self.createMarkers(self.locationsList());
        self.createMarkers();

        // Putting all the location markers on the map
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the markers
        for (var key in self.titleMarkerDict) {
            self.titleMarkerDict[key].setMap(map);
            bounds.extend(self.titleMarkerDict[key].position);
        }
        map.fitBounds(bounds);
    };

    // Function to reset filter
    self.resetFilter = function() {

        // Clearing filter text
        self.filterText("");

        // Clearing the locationsList observable array
        self.locationsList.removeAll();

        self.masterLocationsList.forEach( function(location) {
            self.locationsList.push(location);
        });

        // Clearing all the exisitng markers from the map
        for (var key in self.titleMarkerDict) {
            self.titleMarkerDict[key].setMap(null);
        }

        //self.createMarkers(self.locationsList());
        self.createMarkers();

        // Putting all the location markers on the map
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the markers
        for (var key in self.titleMarkerDict) {
            self.titleMarkerDict[key].setMap(map);
            bounds.extend(self.titleMarkerDict[key].position);
        }
        map.fitBounds(bounds);

        // // Putting all the location markers on the map
        // var bounds = new google.maps.LatLngBounds();
        // // Extend the boundaries of the map for each marker and display the markers
        // for (var key in self.titleMarkerDict) {
        //     self.titleMarkerDict[key].setMap(map);
        //     bounds.extend(self.titleMarkerDict[key].position);
        // }
        // map.fitBounds(bounds);

        // Using the masterLocationsList array to populate the
        // locationsList observable array and placing all the markers on the map.
        // Also redefining bounds of map to all markers
        // var bounds = new google.maps.LatLngBounds();
        // self.masterLocationsList.forEach( function(location) {
        //     self.locationsList.push(location);
        //     titleMarkerDict[location.title].setMap(map);
        //     bounds.extend(titleMarkerDict[location.title].position);
        // });
        // map.fitBounds(bounds);
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
    //vm.createMarkers(vm.locationsList());
    vm.createMarkers();

    // Putting all the location markers on the map
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the markers
    for (var key in vm.titleMarkerDict) {
        vm.titleMarkerDict[key].setMap(map);
        bounds.extend(vm.titleMarkerDict[key].position);
    }
    map.fitBounds(bounds);
}


function googleError() {
    window.alert("Unable to load Google Maps!");
}


// Helper functions
function renderNavBar(navStatus, mobile, ipad) {
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


var vm = new ViewModel();
ko.applyBindings(vm);



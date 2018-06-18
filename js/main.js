// Global variables

var map;

// To toglgle sideNav
// true = Open
// false = Closed
var navStatus = true;

// true if viewport has mobile dimensions
var mobile = false;

// true if viewport has ipad dimensions
var ipad = false;


var ViewModel = function() {

    var self = this;

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

    self.toggleNav = function () {
        navStatus = !navStatus;
        renderNavBar();
    }
}

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

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 29.616067, lng: -95.557722},
        zoom: 13
    });
}

ko.applyBindings(new ViewModel());

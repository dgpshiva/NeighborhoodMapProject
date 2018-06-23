# NeighborhoodMapProject

This repository contains code for a SPA (Single Page Applicaton). It is a Neighborhood Map of all favourite restaurants. Currently, static data is added to the app. The app requires a restaurant's title and position in latitude and longitude. The app can be used to get details about selected restaurants.

## Table of content
- [Requirements to run the code](#requirements-to-run-the-code)
- [Updating data used by the app](#updating-data-used-by-the-app)
- [Requirements on data](#requirements-on-data)
- [Running the code](#running-the-code)
- [Navigating the application](#navigating-the-application)
- [Stopping the code](#stopping-the-code)
- [Known issues](#known-issues)
- [References](#references)


## Requirements to run the code
- Any web browser. Although Google Chrome is the officially supported browser for this app. Some features might not work as expected on other browsers.
- The device on which the app is being opened must have internet connection

## Updating data used by the app
- Pull the code from Github repo [master](https://github.com/dgpshiva/NeighborhoodMapProject/tree/master)
- Navigate to the folder /NeighborhoodMapProject/js
- Open the file `main.js`
- Update the `self.initialLocations` dictionary to update data used by the app
* For every restaurant the following information needs to be provided
    * `title` - name of the restaurant
    * `position` - position of the restaurant in latitude (`lat`) and longitude (`lng`)

## Requirements on data
- The restaurant title names need to be unique, else some features may not work as expected
- The restaurant name needs to be a sub set of of the name for it in FourSquare, for the app to be able to pull it's details from the FourSquare API

## Running the code
- Make sure you have pulled the code from Github repo [master](https://github.com/dgpshiva/NeighborhoodMapProject/tree/master)
- Navigate to the folder /NeighborhoodMapProject
- Open the `index.html` file in web browser. The app should display on the web browser

## Navigating the application:
- If the app is opened on a mobile device or iPad, the left hand pane is hidden. Clicking the hamburger menu on top left will open the pane
- If the app is opened on a dektop or laptop, the left hand pane will be open by default
- The hamburger menu can be used to toggle open/close of the pane
- The list of restaurant titles are displayed on the left hand pane, for wich data has been entered in the app ([Updating data used by the app](#updating-data-used-by-the-app))
- And the markers for those restaurants are placed on the map
- Clicking on a restaurant title will make the title styling to change and its corresponding marker will start bouncing
- And also an info window will be opened on the marker showing details about the restaurant
- Restaurant details has been powered by FourSquare API
- Clicking on the marker again or closing the info window will make the marker to stop bouncing and also revert back the styling for the list element
- Any number of restaurant titles and markers can be clicked to toggle between the above functionalities for restaurants
- There is a filter input text and button on the left hand pane
- This can be used to filter restaurant(s)
- The markers on the map are automatically updated when a filter is applied
- Also the map is bounded to the filtered markers
- There is a reset button below the filter button
- This can be used to reset any filters applied

## Stopping the code
- Simply close the web browser window to shut down the app

## Known issues
- The free version of FourSquare API has been used to develop this app
- The free version has a rate limit of 50 calls per day
- If the app reaches this limit it will not be able to get details for the restaurant from FourSquare
- And will diplay the error message _Daily call quota to FourSquare exceeded. Please try again tomorrow._ in the info window


## References
- The restaurant details have been powered by [FourSquare](https://developer.foursquare.com/)
-  This [blog post](https://leewc.com/articles/google-maps-infowindow/) by Wen Chuan Lee was really helpful in understanding how to create multiple info windows on Google Maps
- This [blog post](https://scotch.io/tutorials/how-to-use-the-javascript-fetch-api-to-get-data) helped understand using the `fetch` API

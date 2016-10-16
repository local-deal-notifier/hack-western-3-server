var firebase = require("firebase");

// Initialize the app with no authentication
firebase.initializeApp({
  databaseURL: "https://hackwestern3backendtest.firebaseio.com/"
});

// The app only has access to public data as defined in the Security Rules
var db = firebase.database();
var userDataRef = db.ref("/UserData");
var filteredPromotionsRef = db.ref("/FilteredPromotions")
var allPromotionsRef = db.ref("/AllPromotions");
var userData;

function isNearUser(filteredPromotions) {
    // radius of where promotion is active (within 100m)
    return (filteredPromotions.distance < 0.1);
}
userDataRef.on("value", function(snapshot) {
    userData = snapshot.val();
    allPromotionsRef.once("value", function(snapshot) {
        allPromotions = snapshot.val()
        allPromotions.forEach(function(promotion) {
            promotion.distance = getDistanceFromLatLonInKm(userData.latitude, userData.longitude, promotion.latitude, promotion.longitude);
        });
        filteredPromotions = allPromotions.filter(isNearUser);
        filteredPromotions.sort(function(a, b) {
            return parseFloat(a.distance) - parseFloat(b.distance);
        });
        console.log(filteredPromotions);
        filteredPromotionsRef.set(filteredPromotions); 
    });   
});

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

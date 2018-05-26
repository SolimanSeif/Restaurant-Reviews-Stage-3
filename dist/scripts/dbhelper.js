'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Common database helper functions.
 */

var DBHelper = function () {
  function DBHelper() {
    _classCallCheck(this, DBHelper);
  }

  _createClass(DBHelper, null, [{
    key: 'fetchRestaurants',


    /**
     * Fetch all restaurants.
     */
    value: function fetchRestaurants(callback) {
      fetch(DBHelper.DATABASE_URL).then(function (response) {
        if (response) {
          return response.json();
        } else {
          return undefined;
        }
      }).then(function (resJson) {
        if (resJson) {
          callback(null, resJson);
          addAllResturants(resJson);
        }
      }).catch(function (error) {
        allResturnats(callback);
      });
    }

    /**
     * Fetch a restaurant by its ID.
     */

  }, {
    key: 'fetchRestaurantById',
    value: function fetchRestaurantById(id, callback) {
      // fetch all restaurants with proper error handling.

      fetch('http://localhost:1337/restaurants/' + id).then(function (obj) {
        if (obj) {
          return obj.json();
        } else {
          return undefined;
        }
      }).then(function (restaurant) {
        if (restaurant) {
          callback(null, restaurant);
          addResturant(id, restaurant);
        } else {
          callback(error, null);
        }
      }).catch(function (error) {
        resturantByID(id, callback);
      });
    }
  }, {
    key: 'fetchRestaurantReviews',
    value: function fetchRestaurantReviews(id, callback, callbackFailedReviews) {
      // fetch all restaurants with proper error handling.

      fetch('http://localhost:1337/reviews/?restaurant_id=' + id).then(function (obj) {
        return obj.json();
      }).then(function (restaurant) {
        if (restaurant) {
          callback(null, restaurant);
          addResturantReviews(id, restaurant);
        }
      }).catch(function (e) {
        console.log('Error during fetching resturant reviews.. ' + e);
        resturantReviews(id, callback);
        getAllPendingReviews(id, callbackFailedReviews);
      });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */

  }, {
    key: 'fetchRestaurantByCuisine',
    value: function fetchRestaurantByCuisine(cuisine, callback) {
      // Fetch all restaurants  with proper error handling
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given cuisine type
          var results = restaurants.filter(function (r) {
            return r.cuisine_type == cuisine;
          });
          callback(null, results);
        }
      });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */

  }, {
    key: 'fetchRestaurantByNeighborhood',
    value: function fetchRestaurantByNeighborhood(neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given neighborhood
          var results = restaurants.filter(function (r) {
            return r.neighborhood == neighborhood;
          });
          callback(null, results);
        }
      });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */

  }, {
    key: 'fetchRestaurantByCuisineAndNeighborhood',
    value: function fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          var results = restaurants;
          if (cuisine != 'all') {
            // filter by cuisine
            results = results.filter(function (r) {
              return r.cuisine_type == cuisine;
            });
          }
          if (neighborhood != 'all') {
            // filter by neighborhood
            results = results.filter(function (r) {
              return r.neighborhood == neighborhood;
            });
          }
          callback(null, results);
        }
      });
    }
  }, {
    key: 'fetchSearchValues',
    value: function fetchSearchValues(callback) {
      DBHelper.fetchRestaurants(function (error, restaurants) {
        if (error) {
          callback(error, null);
        } else {
          // Get all neighborhoods from all restaurants
          var neighborhoods = restaurants.map(function (v, i) {
            return restaurants[i].neighborhood;
          });
          // Remove duplicates from neighborhoods
          var uniqueNeighborhoods = neighborhoods.filter(function (v, i) {
            return neighborhoods.indexOf(v) == i;
          });

          var cuisines = restaurants.map(function (v, i) {
            return restaurants[i].cuisine_type;
          });
          // Remove duplicates from cuisines
          var uniqueCuisines = cuisines.filter(function (v, i) {
            return cuisines.indexOf(v) == i;
          });

          callback(null, uniqueNeighborhoods, uniqueCuisines);
        }
      });
    }

  }, {
    key: 'urlForRestaurant',
    value: function urlForRestaurant(restaurant) {
      return './restaurant.html?id=' + restaurant.id;
    }
  }, {
    key: 'getImageName',
    value: function getImageName(restaurant) {
      var name = restaurant.photograph;
      if (name && !(name.endsWith('.jpg') || name.endsWith('JPG'))) {
        name = name + '.jpg';
      }

      return name;
    }
    /**
     * Restaurant image URL.
     */

  }, {
    key: 'imageUrlForRestaurant',
    value: function imageUrlForRestaurant(restaurant) {
      var name = DBHelper.getImageName(restaurant);
      return '/images/' + name;
    }
  }, {
    key: 'imagesUrlForRestaurant',
    value: function imagesUrlForRestaurant(restaurant) {
      var name = DBHelper.getImageName(restaurant);
      var imgsList = [];
      if (name) {
        imgsList.push('/images/1600/' + name);
        imgsList.push('/images/800x600/' + name);
        imgsList.push('/images/' + name);
        imgsList.push('/images/270x203/' + name);
      } else {
        imgsList.push('/images/SplashScreen/splashScreen-256x256.png');
        imgsList.push('/images/SplashScreen/splashScreen-256x256.png');
        imgsList.push('/images/SplashScreen/splashScreen-256x256.png');
        imgsList.push('/images/SplashScreen/splashScreen-256x256.png');
      }

      return imgsList;
    }
    /**
     * Map marker for a restaurant.
     */

  }, {
    key: 'mapMarkerForRestaurant',
    value: function mapMarkerForRestaurant(restaurant, map) {
      var marker = new google.maps.Marker({
        position: restaurant.latlng,
        title: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),
        map: map,
        animation: google.maps.Animation.DROP });
      return marker;
    }
  }, {
    key: 'idb_object',


    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */

    get: function get() {
      return new idb('mws-restaurant-stage-1', 'Restaurants', 1);
    }
  }, {
    key: 'DATABASE_URL',
    get: function get() {
      var port = 8000; // Change this to your server port
      // return `http://localhost:${port}/data/restaurants.json`;
      return 'http://localhost:1337/restaurants';
    }
  }]);

  return DBHelper;
}();
//# sourceMappingURL=dbhelper.js.map

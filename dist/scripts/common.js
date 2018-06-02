'use strict';

var CONST_FAVORITIFY_ACTION_SPAN_ID_PREFIX = 'FavoritMark_';
var CATEGORY_MARK_AS_FAVORIT = 'Favorite';
var CATEGORY_MARK_AS_UN_FAVORIT = 'unFavorite';

var syncInfo = function syncInfo() {

  iterateSyncIDB(function (cursKey, info, category) {
    var syncWorker = new Worker('scripts/workers/syncWorker.js');
    syncWorker.postMessage({ 'cursKey': cursKey, 'info': info, 'category': category });

    syncWorker.onmessage = function (message) {
      var data = message.data;
      if (data.isCompleted) {
        removeFromSyncIDB(data.cursKey);
        if (data.postSyncAction) {
          postSyncActionComplete(data.postSyncAction, info);
        }
      }
    };
  });
};

var postSyncActionComplete = function postSyncActionComplete(actionName, info) {
  if (actionName === 'recachingRestaurantReviews') {
    var jsonInfo = JSON.parse(info);
    //restaurant_id
    DBHelper.fetchRestaurantReviews(jsonInfo.restaurant_id, undefined, undefined);
  }
};

if (window.navigator.onLine) {
  // customNotification('I will start synchronization');
  syncInfo();
}

window.addEventListener('online', function () {
  customNotification('You back to Online mode');
  syncInfo();
});

window.addEventListener('offline', function () {
  customNotification('You are running in offline mode');
});

function customNotification(message) {
  // Let's check if the browser supports notifications
  if (!('Notification' in window)) {
    alert(message);
  }
  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === 'granted') {
      // If it's okay let's create a notification
      var notification = new Notification(message);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === 'granted') {
          var notification = new Notification(message);
        }
      });
    }
}

var markRestaurantAsFavorit = function markRestaurantAsFavorit(restaurantID, is_favorite, index) {
  console.log('restaurant id: ' + restaurantID + ' , is_favorite : ' + is_favorite + ' , index: ' + index);

  var switchSpanIcon = function switchSpanIcon() {
    var span = document.getElementById('' + CONST_FAVORITIFY_ACTION_SPAN_ID_PREFIX + restaurantID);
    if (span.className === 'fontawesome-heart-empty') {
      span.className = 'fontawesome-heart';
    } else {
      span.className = 'fontawesome-heart-empty';
    }
    span.setAttribute('onclick', 'markRestaurantAsFavorit(' + restaurantID + ', ' + !is_favorite + ', ' + index + ')');
  };

  var successCallback = function successCallback(response) {
    switchSpanIcon();

    if (index >= 0) {
      // working from home page
      DBHelper.fetchRestaurants(undefined);
    } else {
      DBHelper.fetchRestaurantById(restaurantID, undefined);
    }
  };

  var failCallback = function failCallback() {
    switchSpanIcon();
    if (is_favorite === true || is_favorite === 'true') {
      addToSyncListReviews(restaurantID, CATEGORY_MARK_AS_UN_FAVORIT);
    } else {
      addToSyncListReviews(restaurantID, CATEGORY_MARK_AS_FAVORIT);
    }
  };

  favoriteRestaurant(restaurantID, !is_favorite, successCallback, failCallback);
};
//# sourceMappingURL=common.js.map

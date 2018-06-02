'use strict';

var idb_name = 'mws-restaurant-stage-1';
var objectStoreName = 'Restaurants';
var version = 1;

var allRestKey = 'allResturnats';
var resturantReviewsPrefix = 'ReviewsRestuarant_';
var restaurantSingReviewPrefix = 'Review_';

var syncObjectStoreName = 'syncRequests';
var syncCreateNewRestaurantReviewCount = 0;
var syncFavoriteRestaurantCount = 10000;
var syncUnfavoriteRestaurantCount = 20000;
var syncUpdateRestaurantReviewCount = 30000;
var syncDeleteRestaurantReviewCount = 40000;
var syncOperationIndex = 0;

var getIDBObject = function getIDBObject() {
	var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
	var open = indexedDB.open(idb_name, version);
	open.onupgradeneeded = function () {
		var db = open.result;
		var store = db.createObjectStore(objectStoreName);
		var store = db.createObjectStore(syncObjectStoreName);
	};
	return open;
};

var allResturnats = function allResturnats(callback) {

	var open = getIDBObject();

	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(objectStoreName);
		var store = tx.objectStore(objectStoreName);
		var data = store.get(allRestKey);
		tx.oncomplete = function () {
			db.close();
		};
		data.onsuccess = function (event) {
			callback(null, event.target.result);
		};
		// callback(null, data);
		// return data;
	};
};

function resturantByID(id, callback) {
	var open = getIDBObject();

	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(objectStoreName);
		var store = tx.objectStore(objectStoreName);
		var data = store.get(id);
		// callback(null, data);
		data.onsuccess = function (event) {
			callback(null, event.target.result);
		};
		tx.oncomplete = function () {
			db.close();
		};
	};
}

function resturantReviews(id, callback) {
	var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

	var open = getIDBObject();

	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(objectStoreName);
		var store = tx.objectStore(objectStoreName);
		var k = resturantReviewsPrefix + id;
		if (k === 1) {
			k = restaurantSingReviewPrefix + id;
		}
		var data = store.get(k);
		data.onsuccess = function (event) {
			callback(null, event.target.result);
		};
		tx.oncomplete = function () {
			db.close();
		};
	};
}

var addAllResturants = function addAllResturants(restJson) {
	var open = getIDBObject();
	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(objectStoreName, 'readwrite');
		var store = tx.objectStore(objectStoreName);
		store.put(restJson, allRestKey);
		tx.oncomplete = function () {
			db.close();
		};
		return;
	};
};

var addResturant = function addResturant(id, restJson) {
	var open = getIDBObject();
	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(objectStoreName, 'readwrite');
		var store = tx.objectStore(objectStoreName);
		store.put(restJson, id);
		tx.oncomplete = function () {
			db.close();
		};
	};
};

var addResturantReviews = function addResturantReviews(id, restReviewsJson) {
	var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

	var open = getIDBObject();
	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(objectStoreName, 'readwrite');
		var store = tx.objectStore(objectStoreName);
		var key = resturantReviewsPrefix + id;
		if (count === 1) {
			key = restaurantSingReviewPrefix + id;
		}
		store.put(restReviewsJson, key);
		tx.oncomplete = function () {
			db.close();
		};
	};
};

var addToSyncListReviews = function addToSyncListReviews(data, category) {
	var open = getIDBObject();
	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(syncObjectStoreName, 'readwrite');
		var store = tx.objectStore(syncObjectStoreName);
		var syncData = { 'data': data, 'category': -1 };
		if (category === 'NewReview') {
			syncData.category = syncCreateNewRestaurantReviewCount;
			// store.put(data, syncCreateNewRestaurantReviewCount);
			// syncCreateNewRestaurantReviewCount++;
		} else if (category === 'DeleteReview') {
			syncData.category = syncDeleteRestaurantReviewCount;

			// store.put(data, syncDeleteRestaurantReviewCount);
			// syncDeleteRestaurantReviewCount++;
		} else if (category === 'UpdateReview') {
			syncData.category = syncUpdateRestaurantReviewCount;
			// store.put(data, syncUpdateRestaurantReviewCount);
			// syncUpdateRestaurantReviewCount++;
		} else if (category === 'Favorite') {
			syncData.category = syncFavoriteRestaurantCount;
			// store.put(data, syncFavoriteRestaurantCount);
			// syncFavoriteRestaurantCount++;
		} else if (category === 'unFavorite') {
			syncData.category = syncUnfavoriteRestaurantCount;
			// store.put(data, syncUnfavoriteRestaurantCount);
			// syncUnfavoriteRestaurantCount++;
		}
		store.put(syncData, syncOperationIndex);
		syncOperationIndex++;

		tx.oncomplete = function () {
			db.close();
		};
	};
};

var getAllPendingReviews = function getAllPendingReviews(resturantID, callback) {
	var open = getIDBObject();
	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(syncObjectStoreName, 'readwrite');
		var store = tx.objectStore(syncObjectStoreName);
		store.openCursor().onsuccess = function (event) {
			var cursor = event.target.result;
			if (cursor) {
				var rev = cursor.value.data;
				if (rev.restaurant_id === resturantID && cursor.value.category < syncFavoriteRestaurantCount) {
					callback(rev);
				}
				cursor.continue();
			}
		};
	};
};

var iterateSyncIDB = function iterateSyncIDB(callback) {
	var open = getIDBObject();
	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(syncObjectStoreName);
		var store = tx.objectStore(syncObjectStoreName);

		store.openCursor().onsuccess = function (event) {
			var cursor = event.target.result;
			if (cursor) {
				var info = cursor.value.data;
				var category = cursor.value.category;
				var cursKey = cursor.key;

				callback(cursKey, info, category);

				cursor.continue();
			}
		};
	};
};

var removeFromSyncIDB = function removeFromSyncIDB(id) {
	var open = getIDBObject();
	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(syncObjectStoreName, 'readwrite');
		var store = tx.objectStore(syncObjectStoreName);
		store.delete(id);
		tx.oncomplete = function () {
			db.close();
		};
	};
};

var removeResturantReviews = function removeResturantReviews(resId) {
	var open = getIDBObject();
	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(objectStoreName, 'readwrite');
		var store = tx.objectStore(objectStoreName);
		var req = store.delete(resturantReviewsPrefix + resId);

		req.onsuccess = function (event) {
			console.log('resturant ' + resId + ' reviews removed successfully from IDB..');
		};

		req.onerror = function (event) {
			console.error('ERROR during removeResturantReviews: ', evt.target.errorCode);
		};
		tx.oncomplete = function () {
			db.close();
		};
		return;
	};
};
//# sourceMappingURL=idb.js.map

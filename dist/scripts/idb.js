'use strict';

var idb_name = 'mws-restaurant-stage-1';
var objectStoreName = 'Restaurants';
var version = 1;

var allRestKey = 'allResturnats';
var resturantReviewsPrefix = 'ReviewsRestuarant_';

var syncObjectStoreName = 'syncRequests';
var syncReviewsCount = 0;

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
		callback(null, data);
		// return data;
	};
};

function resturantByID(id) {
	var open = getIDBObject();

	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(objectStoreName);
		var store = tx.objectStore(objectStoreName);
		var data = store.get(id);
		tx.oncomplete = function () {
			db.close();
		};
		return data;
	};
}

function resturantReviews(id, callback) {
	var open = getIDBObject();

	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(objectStoreName);
		var store = tx.objectStore(objectStoreName);
		var k = resturantReviewsPrefix + id;
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
		return;
	};
};

var addResturantReviews = function addResturantReviews(id, restReviewsJson) {
	var open = getIDBObject();
	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(objectStoreName, 'readwrite');
		var store = tx.objectStore(objectStoreName);
		store.put(restReviewsJson, resturantReviewsPrefix + id);
		tx.oncomplete = function () {
			db.close();
		};
		return;
	};
};

var addToSyncListReviews = function addToSyncListReviews(data) {
	var open = getIDBObject();
	open.onsuccess = function () {
		var db = open.result;
		var tx = db.transaction(syncObjectStoreName, 'readwrite');
		var store = tx.objectStore(syncObjectStoreName);
		store.put(data, syncReviewsCount);
		syncReviewsCount++;
		tx.oncomplete = function () {
			db.close();
		};
		return;
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
				var rev = cursor.value;
				if (rev.restaurant_id === resturantID) {
					callback(rev);
				}
				cursor.continue();
			}
		};
	};
};

// var removeResturantReviews = (resId)=>{
// 	let open = getIDBObject();
// 	open.onsuccess = ()=>{
// 		var db = open.result;
// 		var tx = db.transaction(objectStoreName, 'readwrite');
// 		var store = tx.objectStore(objectStoreName);
// 		let req = store.delete(resturantReviewsPrefix + resId);

// 		req.onsuccess = (event)=>{
// 			console.log('resturant ' + resId + ' reviews removed successfully from IDB..');
// 		}

// 		req.onerror = (event)=>{
// 			console.error( 'ERROR during removeResturantReviews: ' , evt.target.errorCode);
// 		}
// 		tx.oncomplete = function() {
// 	        db.close();
// 	    };
// 		return;
// 	}
// }
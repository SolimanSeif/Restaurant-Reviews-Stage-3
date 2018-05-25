const idb_name = 'mws-restaurant-stage-1';
const objectStoreName =  'Restaurants';
const version = 1;

const allRestKey = 'allResturnats';
const resturantReviewsPrefix = 'ReviewsRestuarant_';

const syncObjectStoreName = 'syncRequests';
var syncReviewsCount = 0;

var getIDBObject =() => {
	var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
	var open = indexedDB.open(idb_name, version);
	open.onupgradeneeded = function() {
		var db = open.result;
		var store = db.createObjectStore(objectStoreName);
		var store = db.createObjectStore(syncObjectStoreName);
	};
	return open;
}

var allResturnats = (callback) => {
	
	let open = getIDBObject();

	open.onsuccess = ()=>{
		var db = open.result;
    	var tx = db.transaction(objectStoreName);
    	var store = tx.objectStore(objectStoreName);
    	var data = store.get(allRestKey);
    	tx.oncomplete = function() {
	        db.close();
	    };
	    callback(null, data);
    	// return data;
	};

}


function resturantByID(id){
	let open = getIDBObject();

	open.onsuccess = ()=>{
		var db = open.result;
    	var tx = db.transaction(objectStoreName);
    	var store = tx.objectStore(objectStoreName);
    	var data = store.get(id);
    	tx.oncomplete = function() {
	        db.close();
	    };
    	return data;
	};
}

function resturantReviews(id, callback){
	let open = getIDBObject();

	open.onsuccess = ()=>{
		var db = open.result;
    	var tx = db.transaction(objectStoreName);
    	var store = tx.objectStore(objectStoreName);
    	let k = resturantReviewsPrefix + id;
    	var data = store.get(k);
    	data.onsuccess =(event)=>{
    		callback(null ,event.target.result);
    	}
    	tx.oncomplete = function() {
	        db.close();
	    };
	};
}

var addAllResturants = (restJson) => {
	let open = getIDBObject();
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(objectStoreName, 'readwrite');
		var store = tx.objectStore(objectStoreName);
		store.put(restJson, allRestKey);
		tx.oncomplete = function() {
	        db.close();
	    };
	    return;
	}
}


var addResturant = (id, restJson) =>{
	let open = getIDBObject();
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(objectStoreName, 'readwrite');
		var store = tx.objectStore(objectStoreName);
		store.put(restJson, id);
		tx.oncomplete = function() {
	        db.close();
	    };
		return;
	}
}

var addResturantReviews = (id, restReviewsJson) =>{
	let open = getIDBObject();
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(objectStoreName, 'readwrite');
		var store = tx.objectStore(objectStoreName);
		store.put(restReviewsJson, resturantReviewsPrefix+id);
		tx.oncomplete = function() {
	        db.close();
	    };
		return;
	}
}

var addToSyncListReviews = (data)=>{
	let open = getIDBObject();
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(syncObjectStoreName, 'readwrite');
		var store = tx.objectStore(syncObjectStoreName);
		store.put(data, syncReviewsCount);
		syncReviewsCount++;
		tx.oncomplete = function() {
	        db.close();
	    };
		return;
	}
}


var getAllPendingReviews = (resturantID, callback)=>{
	let open = getIDBObject();
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(syncObjectStoreName, 'readwrite');
		var store = tx.objectStore(syncObjectStoreName);
		store.openCursor().onsuccess = function(event) {
  			var cursor = event.target.result;
  			if (cursor) {
			    let rev = cursor.value;
			    if(rev.restaurant_id === resturantID){
			    	callback(rev);
			    }
			    cursor.continue();
			  }
  		}
	}
}

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
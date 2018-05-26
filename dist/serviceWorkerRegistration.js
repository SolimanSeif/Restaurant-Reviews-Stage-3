
const cacheName = 'RestaurantReviews';

const IDB_Name = 'mws-restaurant-stage-1';
const IDB_Version = 1;
const SYNC_ObjectStoreName = 'syncRequests';

self.addEventListener('install', function(event) {
	
	self.skipWaiting();
	
	event.waitUntil(
		caches.open(cacheName).then(function(cache){
			return cache.addAll(['/index.html', '/restaurant.html',
				'/styles/ResponsiveDesign.css', '/styles/RestaurantsResponsiveDesign.css','/styles/styles.css',
				'/scripts/dbhelper.js','/scripts/main.js','/scripts/restaurant_info.js','/scripts/sw.js', '/scripts/idb.js'
				]);
		})
	);
	console.log('installation completed..');
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');  
});

self.addEventListener('fetch', function(event) {
	console.log('Start retriving data from caching......' + event);
	if(event.request.method != 'POST'){
		var requestURL = new URL(event.request.url);
		if(requestURL.origin === location.origin){
			if(requestURL.pathname === '/'){
				event.respondWith(caches.match('index.html'));
				return;
			}
		}
		
		event.respondWith(
			caches.open(cacheName).then(function(cache) {
				return cache.match(event.request).then(function (response) {
					return response || fetch(event.request).then(function(response) {
						cache.put(event.request, response.clone());
						return response;
					}).catch(error =>{
						console.log(error);
					});
				});
			})
		);
	}
});


/* for synching the reviews after getting online*/
self.addEventListener('sync', function(event) {
	// console.log('Start sync process...');

	event.waitUntil(
		syncInfo()
	);
	// console.log('Sync completed....');
});


var syncInfo = ()=>{
	//var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
	var open = indexedDB.open(IDB_Name, IDB_Version);
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(SYNC_ObjectStoreName);
		var store = tx.objectStore(SYNC_ObjectStoreName);

		store.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
		 	if (cursor) {
			  	let info = cursor.value;
			    
			  	// console.log('sync the info ==> ' + cursor.key);
			  	// console.log(info);
			  	const cursKey = cursor.key;

			  	fetch('http://localhost:1337/reviews/', {
			  		method: 'POST', 
	        		body: info,
	        		headers: {
	        			'content-type': 'application/json'
	        		}
	        	}).then((response)=>{
        			if(response)
        				return response.json();
        			else 
        				return undefined;
        		}).catch((e)=>{
        			// console.log(e);
        		}).then((response)=>{
        			if(response){ // completed successfully 
        				
        				// console.log(response);
        				removeFromIDB(cursKey);
        			}
        		});

			    cursor.continue();
		  	}
		};

		tx.oncomplete = function() {
	        db.close();
	    };
	}
}


var removeFromIDB = (id)=>{
	var open = indexedDB.open(IDB_Name, IDB_Version);
	open.onsuccess = ()=>{
		var db = open.result;
		var tx = db.transaction(SYNC_ObjectStoreName, 'readwrite');
		var store = tx.objectStore(SYNC_ObjectStoreName);
		store.delete(id);
		tx.oncomplete = function() {
	        db.close();
	    };
	}
}
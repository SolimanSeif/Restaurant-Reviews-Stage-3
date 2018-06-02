
const cacheName = 'RestaurantReviews';

// const IDB_Name = 'mws-restaurant-stage-1';
// const IDB_Version = 1;
// const SYNC_ObjectStoreName = 'syncRequests';

self.addEventListener('install', function(event) {
	
	self.skipWaiting();
	
	event.waitUntil(
		caches.open(cacheName).then(function(cache){
			return cache.addAll(['/index.html', '/restaurant.html',
				'/styles/ResponsiveDesign.css', '/styles/RestaurantsResponsiveDesign.css','/styles/styles.css',
				'/scripts/dbhelper.js','/scripts/main.js','/scripts/restaurant_info.js','/scripts/sw.js', '/scripts/idb.js', 
				'/scripts/common.js', 'scripts/modificationOperations.js',
				'/scripts/workers/restaurantReviewsPreparation.js', '/scripts/workers/resturantSearchWorker.js', '/scripts/workers/searchCriteriaWorker.js'
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
	if(event.request.method != 'POST' && event.request.method != 'PUT' && event.request.method != 'DELETE'){
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
						if(event.request != 'reviews/'){
							cache.put(event.request, response.clone());
						}
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
// self.addEventListener('sync', function(event) {
// 	console.log('Start sync process...');

// 	// event.waitUntil(
// 	// 	syncInfo()
// 	// );
// 	console.log('Sync completed....');
// });

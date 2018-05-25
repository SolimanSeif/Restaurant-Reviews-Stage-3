let restaurant;
var map;
let resturantID;
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
var fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  self.resturantID = id;
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });

    DBHelper.fetchRestaurantReviews(id, 
    //   (error, reviews) => {
    //   if (!reviews) {
    //     console.error(error);
    //     return;
    //   }
    //   fillReviewsHTML(reviews);
    // }
    fillReviewsHTML, afterSubmittingReviewFail);
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
var fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  // TODO picture from HTML and change the requirement from here.
  const picture = document.getElementById('restaurant-img');
  picture.className = 'restaurant-img';
//  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  
  
	let imgsList = DBHelper.imagesUrlForRestaurant(restaurant);
	const img1 = document.createElement('source');
	img1.media = '(min-width: 1500px)';
	img1.srcset = imgsList[0];
	img1.className = 'restaurant-img';
	picture.appendChild(img1);
	const img2 = document.createElement('source');
	img2.media = '(min-width: 800px)';
	img2.srcset = imgsList[1];
	img2.className = 'restaurant-img';
	picture.appendChild(img2);
	const img = document.createElement('img');
	img.alt = restaurant.name + ' restaurant , provide ' + restaurant.cuisine_type + ', Located in ' + restaurant.address;
	img.src = imgsList[2];
	img.className = 'restaurant-img';
	picture.appendChild(img);
  
  
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // // fill reviews
  // fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
var fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
var fillReviewsHTML = (error ,reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  // const title = document.createElement('h3');
  // title.innerHTML = 'Reviews';
  // container.appendChild(title);

  if (error || !reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  ul.innerHTML = '';
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
var createReviewHTML = (review) => {
  const li = document.createElement('div');
  
  const name = document.createElement('p1');
  name.innerHTML = review.name;
//  li.appendChild(name);

  const date = document.createElement('p2');
  // date.innerHTML = review.date;
//  li.appendChild(date);
  let createDate = new Date(review.createdAt);
  date.innerHTML = createDate.toDateString();

  const head = document.createElement('h4');
  head.appendChild(name);
  head.appendChild(date);
  head.className = 'reviewHead';
  li.appendChild(head);
  
  const rating = document.createElement('p3');
  rating.innerHTML = `Rating: ${review.rating}`; 
	rating.className = 'reviewRate ' + getRatingClassName(review.rating);
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

var getRatingClassName = (rate) =>{
	let rateName = 'unknownRate';
	if(rate == 0){
		rateName = 'rate0';
	}else if(rate == 1){
		rateName = 'rate1';
	}else if(rate == 2){
		rateName = 'rate2';
	}else if(rate == 3){
		rateName = 'rate3';
	}else if(rate == 4){
		rateName = 'rate4';
	}else if(rate == 5){
		rateName = 'rate5';
	}
	return rateName;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
var fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumbOL');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
var getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


var submitUserReviewForm = ()=>{
  console.log('executing submitUserReviewForm');
  let name = document.getElementById('reviewerName').value;
  let comm = document.getElementById('reviewerComment').value;
  let rateList = document.getElementsByName('rating');
  let rate = 0;
  for(let i = 0  ; i < rateList.length ;i++){
    if(rateList[i].checked){
      rate= rateList[i].value;
      break;
    }
  }

  if(rate === 0 || name === '' || name === undefined || comm === '' || comm === undefined){
    alert('missing Informations to submit your review...')
  }else{
    let reviewInfo = {'restaurant_id': self.resturantID, 
                    'name': name,
                    'rating': rate,
                    'comments': comm,
                    'createdAt': Date.now()};
    console.log(reviewInfo);
    
    fetch('http://localhost:1337/reviews/', {
        method: 'POST', 
        body: reviewInfo}
      ).then((response)=>{
        if(response){
          return response.json();
        }else{
          return undefined;
        }
        
      }).catch((e)=>{
        console.log(e);

      }).then((jsonObj)=>{
        //TODO 
        // check its completed successfully or not
        if(jsonObj){
          console.log('sucess ......');
          console.log(jsonObj);
          // refetch and update DB
          afterSubmittingReviewSuccess();
        }else{
          // error 
          addToSyncListReviews(reviewInfo);
          afterSubmittingReviewFail(reviewInfo);
          alert('Your review will be submitted when you go online or the review service running..');
        }
      });
     
  }
  

}


var afterSubmittingReviewSuccess = ()=>{
  DBHelper.fetchRestaurantReviews(resturantID, (error, reviews) => {
      if (!reviews) {
        console.error(error);
        return;
      }
      fillReviewsHTML(null ,reviews);
  });
}

var afterSubmittingReviewFail = (review)=>{
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(review));
}


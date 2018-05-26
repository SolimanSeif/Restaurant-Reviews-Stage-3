'use strict';

var restaurant = void 0;
var map;
var resturantID = void 0;
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = function () {
  fetchRestaurantFromURL(function (error, restaurant) {
    if (error) {
      // Got an error!
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
};

/**
 * Get current restaurant from page URL.
 */
var fetchRestaurantFromURL = function fetchRestaurantFromURL(callback) {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  var id = getParameterByName('id');
  self.resturantID = id;
  if (!id) {
    // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, function (error, restaurant) {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
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
};

/**
 * Create restaurant HTML and add it to the webpage
 */
var fillRestaurantHTML = function fillRestaurantHTML() {
  var restaurant = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurant;

  var name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  var address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  // TODO picture from HTML and change the requirement from here.
  var picture = document.getElementById('restaurant-img');
  picture.className = 'restaurant-img';
  //  image.src = DBHelper.imageUrlForRestaurant(restaurant);


  var imgsList = DBHelper.imagesUrlForRestaurant(restaurant);
  var img1 = document.createElement('source');
  img1.media = '(min-width: 1500px)';
  img1.srcset = imgsList[0];
  img1.className = 'restaurant-img';
  picture.appendChild(img1);
  var img2 = document.createElement('source');
  img2.media = '(min-width: 800px)';
  img2.srcset = imgsList[1];
  img2.className = 'restaurant-img';
  picture.appendChild(img2);
  var img = document.createElement('img');
  img.alt = restaurant.name + ' restaurant , provide ' + restaurant.cuisine_type + ', Located in ' + restaurant.address;
  img.src = imgsList[2];
  img.className = 'restaurant-img';
  picture.appendChild(img);

  var cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // // fill reviews
  // fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
var fillRestaurantHoursHTML = function fillRestaurantHoursHTML() {
  var operatingHours = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurant.operating_hours;

  var hours = document.getElementById('restaurant-hours');
  for (var key in operatingHours) {
    var row = document.createElement('tr');

    var day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    var time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
var fillReviewsHTML = function fillReviewsHTML(error) {
  var reviews = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : self.restaurant.reviews;

  var container = document.getElementById('reviews-container');
  // const title = document.createElement('h3');
  // title.innerHTML = 'Reviews';
  // container.appendChild(title);

  if (error || !reviews) {
    var noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  } else {
    var ul = document.getElementById('reviews-list');
    ul.innerHTML = '';
    if (window.Worker) {
      var revWorker = new Worker('scripts/workers/restaurantReviewsPreparation.js');
      revWorker.postMessage({ 'reviews': reviews });
      revWorker.onmessage = function (message) {
        var content = message.data.ul;
        ul.innerHTML = ul.innerHTML + content;
      };
    } else {

      reviews.forEach(function (review) {
        ul.appendChild(createReviewHTML(review));
      });
      container.appendChild(ul);
    }
  }
};

/**
 * Create review HTML and add it to the webpage.
 */
var createReviewHTML = function createReviewHTML(review) {
  var li = document.createElement('div');

  var name = document.createElement('p1');
  name.innerHTML = review.name;
  //  li.appendChild(name);

  var date = document.createElement('p2');
  // date.innerHTML = review.date;
  //  li.appendChild(date);
  var createDate = new Date(review.createdAt);
  date.innerHTML = createDate.toDateString();

  var head = document.createElement('h4');
  head.appendChild(name);
  head.appendChild(date);
  head.className = 'reviewHead';
  li.appendChild(head);

  var rating = document.createElement('p3');
  rating.innerHTML = 'Rating: ' + review.rating;
  rating.className = 'reviewRate ' + getRatingClassName(review.rating);
  li.appendChild(rating);

  var comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

var getRatingClassName = function getRatingClassName(rate) {
  var rateName = 'unknownRate';
  if (rate == 0) {
    rateName = 'rate0';
  } else if (rate == 1) {
    rateName = 'rate1';
  } else if (rate == 2) {
    rateName = 'rate2';
  } else if (rate == 3) {
    rateName = 'rate3';
  } else if (rate == 4) {
    rateName = 'rate4';
  } else if (rate == 5) {
    rateName = 'rate5';
  }
  return rateName;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
var fillBreadcrumb = function fillBreadcrumb() {
  var restaurant = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : self.restaurant;

  var breadcrumb = document.getElementById('breadcrumbOL');
  var li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
var getParameterByName = function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

var submitUserReviewForm = function submitUserReviewForm() {
  console.log('executing submitUserReviewForm');
  var name = document.getElementById('reviewerName').value;
  var comm = document.getElementById('reviewerComment').value;
  var rateList = document.getElementsByName('rating');
  var rate = 0;
  for (var i = 0; i < rateList.length; i++) {
    if (rateList[i].checked) {
      rate = rateList[i].value;
      break;
    }
  }

  if (rate === 0 || name === '' || name === undefined || comm === '' || comm === undefined) {
    alert('missing Informations to submit your review...');
  } else {
    var reviewInfo = { 'restaurant_id': self.resturantID,
      'name': name,
      'rating': rate,
      'comments': comm,
      'createdAt': Date.now() };
    console.log(reviewInfo);

    var jsonData = JSON.stringify(reviewInfo);
    fetch('http://localhost:1337/reviews/', {
      method: 'POST',
      body: jsonData,
      headers: {
        'content-type': 'application/json'
      }
    }).then(function (response) {
      if (response) {
        return response.json();
      } else {
        return undefined;
      }
    }).catch(function (e) {
      console.log(e);
    }).then(function (jsonObj) {
      //TODO 
      // check its completed successfully or not
      if (jsonObj) {
        console.log('sucess ......');
        console.log(jsonObj);
        // refetch and update DB
        afterSubmittingReviewSuccess();
      } else {
        // error 
        addToSyncListReviews(jsonData);
        afterSubmittingReviewFail(reviewInfo);
        alert('Your review will be submitted when you go online or the review service running..');
      }
    });
    clearSubmittedReview(rateList);
  }
};

var afterSubmittingReviewSuccess = function afterSubmittingReviewSuccess() {
  DBHelper.fetchRestaurantReviews(resturantID, function (error, reviews) {
    if (!reviews) {
      console.error(error);
      return;
    }
    fillReviewsHTML(null, reviews);
  });
};

var afterSubmittingReviewFail = function afterSubmittingReviewFail(review) {
  var ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(review));
};

var clearSubmittedReview = function clearSubmittedReview(rateList) {
  document.getElementById('reviewerName').value = '';
  document.getElementById('reviewerComment').value = '';

  for (var i = 0; i < rateList.length; i++) {
    if (rateList[i].checked) {
      rateList[i].checked = false;
      break;
    }
  }
};
//# sourceMappingURL=restaurant_info.js.map

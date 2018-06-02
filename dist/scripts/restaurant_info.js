'use strict';

var restaurant = void 0;
var map;
var resturantID = void 0;
var restaurantReviewsList = void 0;

var CATEGORY_NEW_REVIEW = 'NewReview';
var CATEGORY_DELETE_REVIEW = 'DeleteReview';
var CATEGORY_UPDATE_REVIEW = 'UpdateReview';

var originalModifiedReviewsInnerHTML = new Map();
var EDIT_REVIEW_NAME_ID_PREFIX = 'edit_review_name_';
var EDIT_REVIEW_RATING_ID_PREFIX = 'edit_review_rating_';
var EDIT_REVIEW_COMM_ID_PREFIX = 'edit_review_comm_';
var EDIT_REVIEW_RADIO_NAME_PREF = '_rating_';
var SINGLE_REVIEW_DIV_PREFIX = 'review_';
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

  var heartClass = 'fontawesome-heart-empty';
  if (restaurant.is_favorite === true || restaurant.is_favorite === 'true') {
    heartClass = 'fontawesome-heart';
  }
  var favSpan = document.createElement('button');
  favSpan.id = '' + CONST_FAVORITIFY_ACTION_SPAN_ID_PREFIX + restaurant.id;
  favSpan.className = heartClass;
  favSpan.setAttribute('onclick', 'markRestaurantAsFavorit(' + restaurant.id + ', ' + restaurant.is_favorite + ', -1)');
  favSpan.setAttribute('role', 'presentation');
  favSpan.setAttribute('aria-label', 'Add to Favorite');
  name.appendChild(favSpan);

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
    self.restaurantReviewsList = reviews;
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
  var li = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.createElement('div');

  // const li = document.createElement('div');

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

  createEditAndDeleteButtons(li, review);

  var comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

var createEditAndDeleteButtons = function createEditAndDeleteButtons(div, review) {
  var bt1 = document.createElement('button');
  bt1.setAttribute('onclick', 'editExistingReview(' + review.id + ')');
  var spn1 = document.createElement('span');
  spn1.className = 'fontawesome-edit';
  spn1.innerHTML = 'Edit';
  bt1.className = 'reviewActionButton';
  bt1.setAttribute('role', 'presentation');
  bt1.setAttribute('aria-label', 'Edit Review');
  bt1.appendChild(spn1);

  var btn2 = document.createElement('button');
  btn2.setAttribute('onclick', 'deleteReviewAction(' + review.id + ')');
  var spn2 = document.createElement('span');
  spn2.className = 'fontawesome-cut';
  spn2.innerHTML = 'Delete';
  btn2.className = 'reviewActionButton';
  btn2.setAttribute('role', 'presentation');
  btn2.setAttribute('aria-label', 'Delete Review');
  btn2.appendChild(spn2);

  div.appendChild(btn2);
  div.appendChild(bt1);
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
  var a = document.createElement('a');
  a.href = './restaurant.html?id=' + restaurant.id;
  a.setAttribute('aria-current', 'page');
  a.innerHTML = ' ' + restaurant.name;
  var li = document.createElement('li');
  li.appendChild(a);
  // li.innerHTML = restaurant.name;
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

var getSubmittedReviewInfoAndValidation = function getSubmittedReviewInfoAndValidation(nameID, rateID, commID) {
  var name = document.getElementById(nameID).value;
  var comm = document.getElementById(commID).value;
  var rateList = document.getElementsByName(rateID);
  var rate = 0;
  for (var i = 0; i < rateList.length; i++) {
    if (rateList[i].checked) {
      rate = rateList[i].value;
      break;
    }
  }
  if (rate === 0 || name === '' || name === undefined || comm === '' || comm === undefined) {
    alert('Missing Informations to submit your review...');
    return undefined;
  } else {
    var reviewInfo = { 'restaurant_id': self.resturantID,
      'name': name,
      'rating': rate,
      'comments': comm,
      'createdAt': Date.now() };
    return reviewInfo;
  }
};

var submitUserReviewForm = function submitUserReviewForm() {
  console.log('executing submitUserReviewForm');
  // let name = document.getElementById('reviewerName').value;
  // let comm = document.getElementById('reviewerComment').value;
  // let rateList = document.getElementsByName('rating');
  // let rate = 0;
  // for(let i = 0  ; i < rateList.length ;i++){
  //   if(rateList[i].checked){
  //     rate= rateList[i].value;
  //     break;
  //   }
  // }

  // if(rate === 0 || name === '' || name === undefined || comm === '' || comm === undefined){
  //   alert('Missing Informations to submit your review...')
  // }else{
  //   let reviewInfo = {'restaurant_id': self.resturantID, 
  //                   'name': name,
  //                   'rating': rate,
  //                   'comments': comm,
  //                   'createdAt': Date.now()};

  var reviewInfo = getSubmittedReviewInfoAndValidation('reviewerName', 'rating', 'reviewerComment');
  if (reviewInfo) {
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
        addToSyncListReviews(jsonData, CATEGORY_NEW_REVIEW);
        afterSubmittingReviewFail(reviewInfo);
        alert('Your review will be submitted when you go online or the review service running..');
      }
    });
    clearSubmittedReview('reviewerName', 'rating', 'reviewerComment');
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

var clearSubmittedReview = function clearSubmittedReview(reviewerName, rating, reviewerComment) {
  document.getElementById(reviewerName).value = '';
  document.getElementById(reviewerComment).value = '';
  var rateList = document.getElementsByName(rating);

  for (var i = 0; i < rateList.length; i++) {
    if (rateList[i].checked) {
      rateList[i].checked = false;
      break;
    }
  }
};

var deleteReviewAction = function deleteReviewAction(reviewID) {
  var result = window.confirm('Confirm to delete');
  if (result) {
    console.log('Start deleting action id:' + reviewID);
    var successCallback = function successCallback() {
      DBHelper.fetchRestaurantReviews(self.resturantID, fillReviewsHTML, undefined);
      customNotification('Review Deleted successfully');
    };

    var failCallback = function failCallback(revid) {
      var obj = { 'id': revid, 'restaurant_id': self.resturantID };
      var storedObject = JSON.stringify(obj);
      addToSyncListReviews(storedObject, CATEGORY_DELETE_REVIEW);
      afterDeletingReviewFailure(revid);
    };
    deleteReview(reviewID, successCallback, failCallback);
  }
};

var afterDeletingReviewFailure = function afterDeletingReviewFailure(reviewID) {
  var revDiv = document.getElementById('' + SINGLE_REVIEW_DIV_PREFIX + reviewID);
  revDiv.innerHTML = '';
};

var getReviewByID = function getReviewByID(id) {
  // for(let rev of restaurantReviewsList){
  //   if(rev.id === id){
  //     return rev;
  //   }
  // }
  for (var index = 0; index < restaurantReviewsList.length; index++) {
    if (restaurantReviewsList[index].id === id) {
      return index;
    }
  }
  return undefined;
};

var createEditReviewSection = function createEditReviewSection(reviewID) {
  var revDev = document.getElementById('' + SINGLE_REVIEW_DIV_PREFIX + reviewID);
  originalModifiedReviewsInnerHTML.set(reviewID, revDev.innerHTML);
  revDev.innerHTML = '';
  revDev.className = 'editReviews';
  revDev.setAttribute('role', 'form');
  revDev.setAttribute('aria-labelledby', 'editReviewLabel');

  var hd = document.createElement('h4');
  var p1 = document.createElement('p1');
  p1.innerHTML = 'Edit Review:';
  hd.appendChild(p1);
  hd.className = 'reviewHead';

  revDev.appendChild(hd);

  var index = getReviewByID(reviewID);
  var review = restaurantReviewsList[index];

  var name = document.createElement('input');
  name.type = 'text';
  name.value = review.name;
  name.id = '' + EDIT_REVIEW_NAME_ID_PREFIX + review.id;
  name.setAttribute('maxlength', 50);
  var nmLbl = document.createElement('label');
  nmLbl.innerHTML = 'Reviewer Name: ';
  nmLbl.setAttribute('for', name.id);
  revDev.appendChild(nmLbl);
  revDev.appendChild(name);

  var rateDiv1 = document.createElement('div');
  rateDiv1.className = 'modifyReviewRating';
  rateDiv1.id = '' + EDIT_REVIEW_RATING_ID_PREFIX + review.id;
  rateDiv1.setAttribute('name', rateDiv1.id);
  generateRatingStars(rateDiv1, review.rating, review.id);
  revDev.appendChild(rateDiv1);

  var comm = document.createElement('textarea');
  comm.id = '' + EDIT_REVIEW_COMM_ID_PREFIX + review.id;
  comm.value = review.comments;
  comm.setAttribute('maxlength', 1000);
  var commLbl = document.createElement('label');
  commLbl.className = 'reviewerCommentLabel';
  commLbl.setAttribute('for', comm.id);
  commLbl.innerHTML = 'Edit The Review Comment here';

  revDev.appendChild(commLbl);
  revDev.appendChild(comm);

  // let actionDev = document.createElement('div');
  // actionDev.className = 'reviewActionsDiv';
  // let save = document.createElement('button');
  // save.setAttribute('onclick', `saveUpdatedReview({'reviewID': ${reviewID}, 'index':${index}})`);
  // let sp1 = document.createElement('span');
  // sp1.className = 'fontawesome-save';
  // sp1.innerHTML = 'Save';
  // save.appendChild(sp1);
  // let cancel = document.createElement('button');
  // cancel.setAttribute('onclick', `cancelEditingReview({'reviewID': ${reviewID}, 'index':${index}})`);
  // let sp2 = document.createElement('span');
  // sp2.className = 'fontawesome-remove-sign';
  // sp2.innerHTML = 'Exit';
  // cancel.appendChild(sp2);

  // actionDev.appendChild(save);
  // actionDev.appendChild(cancel);

  // revDev.appendChild(actionDev);
  createEdititedReviewActionsButtons(revDev, reviewID, index);
};

var createEdititedReviewActionsButtons = function createEdititedReviewActionsButtons(div, reviewID, index) {

  var save = document.createElement('button');
  save.setAttribute('onclick', 'saveUpdatedReview({\'reviewID\': ' + reviewID + ', \'index\':' + index + '})');
  var sp1 = document.createElement('span');
  sp1.className = 'fontawesome-save';
  sp1.innerHTML = 'Save';
  save.className = 'editReviewActionButton';
  save.setAttribute('role', 'presentation');
  save.setAttribute('aria-label', 'Save Modified Review');
  save.appendChild(sp1);

  var cancel = document.createElement('button');
  cancel.setAttribute('onclick', 'cancelEditingReview({\'reviewID\': ' + reviewID + ', \'index\':' + index + '})');
  var sp2 = document.createElement('span');
  sp2.className = 'fontawesome-remove-sign';
  sp2.innerHTML = 'Exit';
  cancel.className = 'editReviewActionButton';
  cancel.setAttribute('role', 'presentation');
  cancel.setAttribute('aria-label', 'Discard Review modifications');
  cancel.appendChild(sp2);

  div.appendChild(save);
  div.appendChild(cancel);
};

var generateRatingStars = function generateRatingStars(rateDiv, rating, revID) {
  generateStar(rateDiv, 1, 'Sucks big time', revID, rating);
  generateStar(rateDiv, 2, 'Kinda bad', revID, rating);
  generateStar(rateDiv, 3, 'Meh', revID, rating);
  generateStar(rateDiv, 4, 'Pretty good', revID, rating);
  generateStar(rateDiv, 5, 'Awesome', revID, rating);
};

var generateStar = function generateStar(div, val, txt, revID, rating) {
  var s1 = document.createElement('input');
  s1.type = 'radio';
  s1.id = '_star' + val;
  s1.name = '' + EDIT_REVIEW_RADIO_NAME_PREF + revID;
  s1.value = val;

  var l1 = document.createElement('label');
  // l1.className = 'full';
  l1.setAttribute('for', s1.id);
  l1.title = txt + ' - ' + val + ' stars';
  l1.innerHTML = val + ' &#9734;';

  if (Number.parseInt(rating, 10) === val) {
    s1.setAttribute('checked', true);
  }

  div.appendChild(s1);
  div.appendChild(l1);
};

var editExistingReview = function editExistingReview(reviewID) {
  createEditReviewSection(reviewID);
};

var cancelEditingReview = function cancelEditingReview(info) {
  var result = window.confirm('Discard Changes ?');
  if (result) {
    var reviewID = info.reviewID;
    var index = info.index;
    var revDev = document.getElementById('review_' + reviewID);
    revDev.innerHTML = originalModifiedReviewsInnerHTML.get(reviewID);
    originalModifiedReviewsInnerHTML.delete(reviewID);
  }
};

var saveUpdatedReview = function saveUpdatedReview(info) {
  var reviewID = info.reviewID;
  var index = info.index;
  var reviewInfo = getSubmittedReviewInfoAndValidation('' + EDIT_REVIEW_NAME_ID_PREFIX + reviewID, '' + EDIT_REVIEW_RADIO_NAME_PREF + reviewID, '' + EDIT_REVIEW_COMM_ID_PREFIX + reviewID);

  if (reviewInfo) {
    var result = window.confirm('Confirm to apply the changes?');
    if (result) {
      console.log('Start updating the review: ' + reviewID + 'with below info');
      console.log(reviewInfo);
      reviewInfo.review_id = reviewID;

      var jsonData = JSON.stringify(reviewInfo);

      var failCallback = function failCallback(response) {
        var myRev = restaurantReviewsList[index];
        myRev.name = reviewInfo.name;
        myRev.comments = reviewInfo.comments;
        myRev.rating = reviewInfo.rating;

        addToSyncListReviews(jsonData, CATEGORY_UPDATE_REVIEW);

        var mydiv = document.getElementById('' + SINGLE_REVIEW_DIV_PREFIX + reviewID);
        mydiv.innerHTML = '';
        createReviewHTML(myRev, mydiv);
      };

      updateRestaurantReview(jsonData, afterSubmittingReviewSuccess, failCallback);

      originalModifiedReviewsInnerHTML.delete(reviewID);
    }
  }
};
//# sourceMappingURL=restaurant_info.js.map

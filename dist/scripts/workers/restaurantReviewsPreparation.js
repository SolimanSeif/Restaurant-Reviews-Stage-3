'use strict';

// self.importScripts('../restaurant_info.js');

self.onmessage = function (message) {
	var reviews = message.data.reviews;
	var ul = '<div>';
	reviews.forEach(function (review) {
		ul = ul + generateReviewHTML(review);
	});
	ul = ul + '</div>';
	postMessage({ 'ul': ul });
};

var generateReviewHTML = function generateReviewHTML(review) {

	var name = '<p1>' + review.name + '</p1>';

	var createDate = new Date(review.createdAt);
	var date = '<p2>' + createDate.toDateString() + '</p2>';

	var head = '<h4 class="reviewHead">' + name + date + '</h4>';
	// head.appendChild(name);
	// head.appendChild(date);
	// head.className = 'reviewHead';
	// li.appendChild(head);

	var rating = '<p3 class="reviewRate ' + getRatingClassName(review.rating) + '">Rating: ' + review.rating + '</p3>';
	// rating.innerHTML = `Rating: ${review.rating}`; 
	// rating.className = 'reviewRate ' + getRatingClassName(review.rating);
	// li.appendChild(rating);

	var comments = '<p>' + review.comments + '</p>';
	// comments.innerHTML = review.comments;
	// li.appendChild(comments);


	var li = '<div>' + head + rating + comments + '</div>';
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
//# sourceMappingURL=restaurantReviewsPreparation.js.map

import { Review } from "./customTypes"

const formatElementText = (element: string) => {
  return element.replace(/\n/g, '').trim();
};

const getTrueTimeInstalled = (timeInstalled: string) => {
  let trueTimeInstalled = timeInstalled;
  //remove About
  trueTimeInstalled = trueTimeInstalled.replace('About', '');
  trueTimeInstalled = trueTimeInstalled.replace('Over', '');
  trueTimeInstalled.trim();

  // pull out the number from the string
  const timeInstalledNumber = parseInt(trueTimeInstalled);

  // get the time unit from the string by getting the text after the number in the string
  // do this by converting the number to a string and getting the text after the number
  const timeInstalledUnit = trueTimeInstalled
    .substring(trueTimeInstalled
    .indexOf(
      timeInstalledNumber.toString()
    ) + timeInstalledNumber.toString().length)
    .trim();

  let trueTimeInstalledVal = 1;

  switch (timeInstalledUnit) {
    case 'year':
    case 'years':
      trueTimeInstalledVal = timeInstalledNumber * 31536000;
      break;
    case 'month':
    case 'months':
      trueTimeInstalledVal = timeInstalledNumber * 2592000;
      break;
    case 'day':
    case 'days':
      trueTimeInstalledVal = timeInstalledNumber * 86400;
      break;
    case 'hour':
    case 'hours':
      trueTimeInstalledVal = timeInstalledNumber * 3600;
      break;
    case 'minute':
    case 'minutes':
      trueTimeInstalledVal = timeInstalledNumber * 60;
      break;
    default:
      trueTimeInstalledVal = timeInstalledNumber;
      break;
  }

  return trueTimeInstalledVal;
}

const getReviewsFromPage = (page: cheerio.Root) => {
  const reviewsElement = page('.review-listing');
  const reviewsArray: Review[] = [];

  reviewsElement.each((index, review) => {
    const reviewInnerWrapper = page(review).find('div').first();
    
    // Review Id
    const reviewId = reviewInnerWrapper.attr('data-review-id');
   
    // Review Rating
    const ratingElement = reviewInnerWrapper.find('.ui-star-rating');
    const ratingValue = ratingElement.attr('data-rating');

    // Review Date
    let reviewDate = reviewInnerWrapper.find('.review-metadata__item-label').text();
    let dateString: null|string = null;

    if (reviewDate) {
      let reviewDateWithoutNewLine = reviewDate.replace('Edited', '');
      reviewDate = formatElementText(reviewDateWithoutNewLine);

      const dateObject = new Date(reviewDate);
      dateString = dateObject.toISOString();
    }

    // Reviewer
    const reviewerElementText = reviewInnerWrapper.find('.review-listing-header__text').text();
    const reviewerValue = formatElementText(reviewerElementText);

    // Review Text
    const reviewTextElement = reviewInnerWrapper.find('.review-content').find('p').text();

    // Characterestics
    let location = null;
    let timeInstalled = null;
    const characteristicsElements = reviewInnerWrapper.find('.review-merchant-characteristic__item');
    characteristicsElements.each((index, characteristic) => {
      const characteristicElement = page(characteristic);

      // Location
      if (index == 0) {
        const initialText = characteristicElement.find('span').text();
        location = formatElementText(initialText);
      }

      // Time installed
      if (index == 1) {
        const initialText = characteristicElement.find('span').text();
        timeInstalled = formatElementText(initialText);
      }
    });

    // Push Review to Array
    if (
      reviewId &&
      ratingValue &&
      dateString &&
      reviewerValue &&
      reviewTextElement &&
      location &&
      timeInstalled
    ) {
      reviewsArray.push({
        reviewId: reviewId,
        reviewer: reviewerValue,
        rating: parseInt(ratingValue),
        date: dateString,
        location,
        timeInstalled,
        timeInstalledVal: getTrueTimeInstalled(timeInstalled),
        comment: reviewTextElement
      });
    } else {
      console.log(`Error: Review ${reviewId ? reviewId : ''} not added to array`);
    }
  });

  //console.log(`${reviewsArray.length} reviews added to array`);

  return reviewsArray;
}

export { getReviewsFromPage };
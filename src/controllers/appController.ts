import { Request, Response } from "express"
import axios from 'axios';
import { load } from "cheerio";
import { getReviewsFromPage } from "../helpers/parsePageHelper"
import { Review } from "../helpers/customTypes";

// return a promise that uses axios to make a get request after a given delay
const axiosWithDelay = (url: string, delay: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      axios.get(url)
        .then(response => {
          resolve(response);
        }).catch(error => {
          reject(error);
        })
    }, delay);
  })
}

const appController = async (req: Request, res: Response) => {

  let { search_url } = req.query;
  if (!search_url) {
    return res.status(200).json({
      message: 'No search_url provided'
    });
  }

  // make sure search_url is a valid string
  if (typeof search_url !== 'string') {
    return res.status(200).json({
      message: 'search_url is not a valid string'
    });
  }

  const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
  if (!urlRegex.test(search_url)) {
    return res.status(200).json({
      message: 'Invalid search_url'
    });
  }

  if (!search_url.endsWith('/reviews')) {
    search_url = `${search_url}/reviews`;
  }

  try {
    const { data } = await axios.get(search_url);

    const $ = load(data);

    // find the a tag within the .ui-review-count-summary class
    const reviewsCountElement = $('.ui-review-count-summary').find('a');
    const reviewsCountText = reviewsCountElement.text();
    const reviewsCount = parseInt(reviewsCountText.replace(/[^0-9]/g, ''));

    let reviews: Review[] = [];

    if (reviewsCount <= 10) {
      reviews = getReviewsFromPage($);
    } else {
      const reviewsPerPage = 10;
      const pages = Math.ceil(reviewsCount / reviewsPerPage);
      
      const promises = [];
      const urls = [];
      for (let i = 1; i <= pages; i++) {
        const urlAppend = `?page=${i}&sort_by=recent`;
        const url = `${search_url}${urlAppend}`;
        urls.push(url);
        promises.push(axiosWithDelay(url, i * 1300));
      }

      const responses = await Promise.all(promises);
      const reviewsPages = responses.map((response: any) => {
        const $ = load(response.data);
        return getReviewsFromPage($);
      }).flat();
      reviews = reviewsPages;
    }
    
    res.status(200).json({
      message: 'success',
      reviewsCount: reviewsCount,
      pages: Math.ceil(reviewsCount / 10),
      reviews: reviews,
      reviewsParsed: reviews.length
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export { appController };
import { Request, Response } from "express"
import axios from 'axios';
import { load } from "cheerio";

const partnersController = async (req: Request, res: Response) => {

  try {
    const { data } = await axios.get('https://apps.shopify.com/sitemap');

    const $ = load(data);
    const applications = $('.section--border').eq(1);
    const applicationsGroups = applications.find('.sitemap--section--group');

    if (applicationsGroups.length === 0) {
      return res.status(200).json({
        message: 'No applications found'
      });
    }

    const applicationsList = applicationsGroups.map((index: number, element: any) => {
      const partner = $(element).find('.sitemap--section--header')
      const appList = $(element).find('ul');
      const appLinks = appList.find('a');

      const appDetails = appLinks.map((index: number, element: any) => {
        const appName = $(element).text();
        const appUrl = $(element).attr('href');
        return {
          appName,
          appUrl
        }
      }).get();

      return {
        partner: partner.text(),
        "url": partner.attr('href'),
        "applications": appDetails
      };
    }).get();

    res.status(200).json({
      partnersCount: applicationsGroups.length,
      partnersList: applicationsList
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

export { partnersController };
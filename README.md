
# Shopify Review Scraper

Express API for scraping Shopify reviews


## Installation

Install dependencies

```bash
  npm install
```

Run the server
```bash
  npm run dev
```

Send requests to the server with Postman or any API platform of your choosing.
## API Reference

#### Get Partners
Get all partners with apps deployed on Shopify

```http
  GET /api/v1/partners
```

#### Get apps

```http
  GET /api/vi/app
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `search_url`      | `string` | **Required**. URL of the Shopify app |

Example request:
`http://localhost:8000/api/v1/app?search_url=https://apps.shopify.com/smile-io/reviews`

Example response:
```
{
    "message": "success",
    "reviewsCount": 4689,
    "pages": 469,
    "reviewsParsed": 4648,
    "reviews": [
        {
          {
            "reviewId": "930693",
            "reviewer": "Rider Shop SG",
            "rating": 5,
            "date": "2022-08-10T23:00:00.000Z",
            "location": "Singapore",
            "timeInstalled": "9 months",
            "timeInstalledVal": 23328000,
            "comment": "Very supportive..."
          },
          ...
        }
    ]
}
```

## Additional note

Shopify is quite heavily rate limited so a timeout of 1300ms is used before each page request.

Each Shopify app page shows a total of 10 reviews at a time.


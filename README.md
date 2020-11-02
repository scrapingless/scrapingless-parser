# scrapingless-parser

<h1>
  <br>
  <center>
  <img src="static/logo_black.png"  alt="scrapingless" width="200px" height="200px">
  </center>
  <br>
  <br>
</h1>

![ScrapingLess api-parser](https://img.shields.io/badge/scrapingless-api--parser-blue)
![apache-2-0](https://img.shields.io/github/license/scrapingless/scrapingless-parser)
![issues](https://img.shields.io/github/issues/scrapingless/scrapingless-parser)
![Last version](https://img.shields.io/github/tag/scrapingless/scrapingless-parser.svg?style=flat-square)


> **API** ready to use to __parse and transform__ metadata from any HTML and text. It works with **reusable** rules for extract fields and apply data transformation by JSON configurations.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
- [Start with Docker](#start-whit-docker)
- [How it works](#how-it-works)
- [Templates](#templates)

## Getting Started
This API provide a set of configurable rules to extract/parse data from any website, HTML or text without write any code but by using using a free "community" library extraction rules.

> Example: get html from example.com/products/product and parse calling scrapingless-parser API


```js
var url = "https://example.com/products/product";
var html = http.get(url, function(res) {
  ...
}

var autoParseUrl = "https://scrapingless-parser:3000/parse/auto?url=" + url;

var directParseUrl = "https://scrapingless-parser:3000/direct/ruleName=exampleProduct&version=1&url=" + url;

axios.post(autoParseUrl, {
    body: html
}).then(response =>
    //Json parsed data
    console.log(response.data)
);
```

## Start with docker

TODO

## How it works
> **AUTOPARSE**

Auto-parser API works on 3 levels.  

1. Identify domain or website (example.com)  
2. Identify applicable rules by url (if url match /products/product* apply these rules).
3. Execute each parse rules and join all fields & for each field apply data transformation.

**_**Example**_**:

```markdown
Url is: **example.com/products/product1**

> If domain is example.com
   > If url match /products/* >
      > Extract all field defined in these rules:
          ['extract-head',
          'extract-product-detail',
          'text-summary',
          'product-reviews',
          ...]
      > For each field apply **data transformation** 
          [trim,
          if-Value-Then,
          subString,
          toArray,
          split,
          regex,
          ...
      ]
```

> **DIRECT**

Direct API call a specific set of rule **"pipe"**.  

1. Execute each parse rule of this pipe, join all fields & for each field apply data transformation.

![Diagram](static/scrapingless-parser.png)

## Templates
Often in data parsing/extraction there are same pattern.
To facilitate less configuration writing it's possible to use templates for fields and data transformation.

> **Example**: extract the **second** word from a text

```"Apple Banana Orange"```


Instead or rewrite same rule each time it's possible create a template for e.g. called "secondWord" that split text and get index 1 (Banana).

[CHECK WIKI DOCUMENTATION](https://github.com/scrapingless/scrapingless-parser/wiki)


# docsify-highlight
![](1.png)
## Build From source code

1. `npm install`

2. `npm run build`

## Usage

## Basic Usage

1. Include vue.js

    `<script src="https://unpkg.com/vue/dist/vue.js"></script>`

2. Include js and css

    `<link rel="stylesheet" href="dist/docsify-highlight.css">`

    `<script src="dist/docsify-highlight.umd.min.js"></script>`
    

## Use CDN directly

    
   `<link rel="stylesheet" href="https://unpkg.com/docsify-highlight@latest/dist/docsify-highlight.css">`

   ` <script src="https://unpkg.com/docsify-highlight@latest/dist/docsify-highlight.umd.min.js"></script>`

## Optional usage

1. Use leancloud as remote storage 

```
  window.$docsify = {
      "DocHighlighter": {
        leancloud: {
          appId: "appId",
          appKey: "appKey",
          serverURL: "https://xxxxxxxx",
        }
      },
    };

```
## ScreenShot


  <img src="1.png" style="zoom: 33%;" />

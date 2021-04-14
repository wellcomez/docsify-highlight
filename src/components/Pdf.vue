<template>
  <div>
    <!-- <button id="upload-button" @click="onClickUpload">Select PDF</button> -->
    <!-- <input
      type="file"
      id="file-to-upload"
      accept="application/pdf"
      @change="onTextChange"
    /> -->
    <div id="pdf-main-container">
      <div id="pdf-contents">
        <div id="pdf-meta">
          <div id="page-count-container">
            Page
            <div id="pdf-current-page">{{ CURRENT_PAGE }}</div>
            of
            <div id="pdf-total-pages"></div>
          </div>
        </div>
        <canvas id="the-canvas" width="800"></canvas>
        <!-- <canvas id="pdf-canvas" width="800"></canvas> -->
        <div id="text-layer"></div>
        <div id="page-loader">Loading page ...</div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-undef */
/* eslint-disable vue/no-reserved-keys*/
var PDFJS = require("pdfjs-dist/es5/build/pdf.js");
var PdfjsWorker = require("worker-loader!pdfjs-dist/es5/build/pdf.worker.js");
PDFJS.GlobalWorkerOptions.workerPort = new PdfjsWorker();
export default {
  name: "Pdf",
  computed: {
    layeStyle() {
      let el = document.querySelector("#pdf-canvas");
      return {
        left: el.offsetLeft + "px",
        top: el.offsetTop + "px",
        height: this.__CANVAS.height + "px",
        width: this.__CANVAS.width + "px",
      };
    },
  },
  data() {
    return {
      loading: false,
      __PDF_DOC: undefined,
      __CANVAS: undefined,
      __CANVAS_CTX: undefined,
      CURRENT_PAGE: undefined,
      __TOTAL_PAGES: undefined,
      __PAGE_RENDERING_IN_PROGRESS: 0,
    };
  },
  methods: {
    onClickUpload() {
      document.querySelector("#file-to-upload").click();
    },
    onTextChange() {
      let file = document.querySelector("#file-to-upload").files[0];
      let { type } = file;
      if (["application/pdf"].indexOf(type) == -1) {
        alert("Error : Not a PDF");
        return;
      }
      this.showPDF(URL.createObjectURL(file));
    },
    // eslint-disable-next-line no-unused-vars
    showPDF(pdf_url) {
      var url =
        "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf";

      // Loaded via <script> tag, create shortcut to access PDF.js exports.
      // var pdfjsLib = window["pdfjs-dist/build/pdf"];

      // // The workerSrc property shall be specified.
      // pdfjsLib.GlobalWorkerOptions.workerSrc =
      //   "//mozilla.github.io/pdf.js/build/pdf.worker.js";

      // Asynchronous download of PDF
      var loadingTask = PDFJS.getDocument(url);
      loadingTask.promise.then(
        function (pdf) {
          console.log("PDF loaded");

          // Fetch the first page
          var pageNumber = 1;
          pdf.getPage(pageNumber).then(function (page) {
            console.log("Page loaded");

            var scale = 1.5;
            var viewport = page.getViewport({ scale: scale });

            // Prepare canvas using PDF page dimensions
            var canvas = document.getElementById("the-canvas");
            var context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            var renderContext = {
              canvasContext: context,
              viewport: viewport,
            };
            var renderTask = page.render(renderContext);
            renderTask.promise.then(function () {
              console.log("Page rendered");
              let textContent = page.getTextContent();
              let container = document.querySelector("#text-layer");
              PDFJS.renderTextLayer({
                textContent,
                container,
                viewport: viewport,
                textDivs: [],
              });
            });
          });
        },
        function (reason) {
          // PDF loading error
          console.error(reason);
        }
      );
      // this.loading = true;
      // PDFJS.getDocument({ url: pdf_url })
      //   .promise.then((pdf_doc) => {
      //     this.__PDF_DOC = pdf_doc;
      //     this.__TOTAL_PAGES = this.__PDF_DOC.numPages;
      //     this.showPage(1);
      //   })
      //   .catch((error) => {
      //     alert(error.message);
      //   });
    },
    // showPage(page_no) {
    //   this.__PAGE_RENDERING_IN_PROGRESS = 1;
    //   this.CURRENT_PAGE = page_no;
    //   // Fetch the page
    //   this.__PDF_DOC.getPage(page_no).then((page) => {
    //     // As the canvas is of a fixed width we need to set the scale of the viewport accordingly
    //     var scale_required = this.__CANVAS.width / page.getViewport(1).width;

    //     // Get viewport of the page at required scale
    //     var viewport = page.getViewport(scale_required);

    //     // Set canvas height
    //     this.__CANVAS.height = viewport.height;

    //     var renderContext = {
    //       canvasContext: this.__CANVAS_CTX,
    //       viewport: viewport,
    //     };

    //     // Render the page contents in the canvas
    //     page
    //       .render(renderContext)
    //       .promise.then(() => {
    //         this.__PAGE_RENDERING_IN_PROGRESS = 0;
    //         return page.getTextContent();
    //       })
    //       // eslint-disable-next-line no-unused-vars
    //       .then((textContent) => {
    //         // document.querySelector("#text-layer").innerHTML = "";
    //         // PDFJS.renderTextLayer({
    //         //   textContent: textContent,
    //         //   container: document.querySelector("#text-layer"),
    //         //   viewport: viewport,
    //         //   textDivs: [],
    //         // });
    //       });
    //   });
    // },
  },
  mounted() {
    this.showPDF()
    // this.__CANVAS = document.querySelector("#pdf-canvas");
    // this.__CANVAS_CTX = this.__CANVAS.getContext("2d");
  },
};
</script>
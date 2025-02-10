$(function() {
    console.log("jquery initisilation ....")

    var doc = ''; 
    var specialElementHandlers ='';
    if(jsPDF !== null && jsPDF !== undefined ){  
       doc =    new jsPDF();
     specialElementHandlers = {
        '#editor': function (element, renderer) {
            return true;
        }
    } 
    }
    else { 
      console.log("jsPDF not available....")
    }

    function encode_utf8(s) {
      return unescape(encodeURIComponent(s));
    }
    $("#hidDecrypt").on("click", function () { 

        // SEND to decrypt at server 
        const asciiStr =  global_password;
        const chars = asciiStr.split("");
        const sec = [ '7' , '5' ,'8', '8', '2' ,'3' , '0' ,'4' ,'6' ,'2'  ];
        var arrayCombined = $.map(chars, function(v, i) {
          if(sec[i] !==undefined){
            return   v  + sec[i] ;
          }else {
            return  v ;
          }
          
        });
        const sec2 = [ '8' , '4' ,'5', '9', '4' ,'5' , '4' ,'8' ,'5' ,'5'  ];
        var arrayCombined1 = $.map(arrayCombined, function(v, i) {
           //v.charCodeAt(0)
           if(sec2[i] !==undefined){
            return   v + sec2[i] ;
          }else {
            return  v ;
          }
          // return [v, sec2[i]];
        });


        const hexNumber = arrayCombined1.join("");
       // const m = BigInt(`0x${hexNumber}`);     

        $.ajax({
          type: 'GET', encoding: null,
          url: '/processpdf?password='+hexNumber,
         
          /*xhrFields: {
            responseType: 'blob'
          },*/
          success: function(response, status, xhr) {
            let res = ''
            console.log("status ", status)
            console.log("response ", response)
          }
        });
    });


    $("#todown").on("click", function  (params) {
          // NEEDS this  <script src="../build/pdf.mjs" type="module"></script>
        //  pdfViewer._download(window.location.href, 'filename')

        if(doc !== ''){

          doc.fromHTML($('#pdfViewer').html(), 15, 15, {
            'width': 170,
                'elementHandlers': specialElementHandlers
             });
            doc.save('sample-file.pdf');
        }
        else  { 
          console.log("jsPDF not available. so doc not created ...")

        }
       /* if(PDFViewerApplication !==null && PDFViewerApplication !== undefined)
         { PDFViewerApplication.download()
         }
         else {
          console.log("PDFViewerApplication object not availbable  ")
         } */
    }); 


    $("#download2").on("click", function () {
      let decrptyUrl = "http://localhost:8634/decrypt"
      let urlF = window.location.href
          let FILEREF  = "file=";
          let fileName =   urlF.substring(urlF.indexOf(FILEREF)+FILEREF.length);
          const asciiStr = encodeURIComponent(fileName);
          const chars = asciiStr.split("");
          const hexChars = chars.map((ch) =>
            ch.codePointAt(0).toString(16).padStart(2, "0")
          );
          const hexNumber = hexChars.join("");
          const m = BigInt(`0x${hexNumber}`);     
         window.open(decrptyUrl+"?kn="+fileName);

    });


    $("#download1").on("click", function () {
      $.ajax({
        type: 'GET', encoding: null,
        url: '/decrypt',
        data: { password: global_password,   },
        /*xhrFields: {
          responseType: 'blob'
        },*/
        success: function(response, status, xhr) {
          let res = ''
          console.log("status ", status)
          console.log("response ", response)
          //var pdfData = convertDataURIToBinary('data:application/pdf;base64,' + response);
        //window.open(response);
           var filename = "";                   
          var disposition = xhr.getResponseHeader('Content-Disposition');

           if (disposition) {
              var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
              var matches = filenameRegex.exec(disposition);
              if (matches !== null && matches[1]) filename = matches[1].replace(/['"]/g, '');
          } 
          var linkelem = document.createElement('a');
          try {
              var blob = new Blob([response], { type: 'data:application/pdf;base64,'  }); // 'application/octet-stream'       'application/pdf'                   

              if (typeof window.navigator.msSaveBlob !== 'undefined') {
                  //   IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                  window.navigator.msSaveBlob(blob, filename);
              } else {
                  var URL = window.URL || window.webkitURL;
                  const file = new File([blob], 'pdf', { type: blob.type})
                  readFile(file)
                  var downloadUrl =  file //URL.createObjectURL(blob);
                   // setTimeout(function(){ window.URL.revokeObjectURL(url); }, 3000);
                  console.log("downloadUrl "+downloadUrl)
                  if (filename) { 
                      // use HTML5 a[download] attribute to specify filename
                      var a = document.createElement("a");
                      console.log("File name "+filename)
                      // safari doesn't support this yet
                      if (typeof a.download === 'undefined') {
                          window.location = downloadUrl;
                      } else {
                          a.href = downloadUrl;
                          a.download = filename;
                          document.body.appendChild(a);
                          a.target = "_blank";
                          a.click();
                      }
                  } else {
                      window.location = downloadUrl;
                  }
              }   

          } catch (ex) {
              console.log(ex);
          } 




        /*  console.log(decryptfile.size);
          var link=document.createElement('a');
          link.href=window.URL.createObjectURL(decryptfile);
          link.download="Dossier_" + new Date() + ".pdf";
          link.click();
          */

          // var html = '<a href='+decryptfile+ ' class="btn btn-primary">Download</a> '; 
        
          // ADD OPEN WHIT WINDOW JAVASCRIPT
        //  var pdfData = convertDataURIToBinary('data:application/pdf;base64,' + decryptfile);
         // var blob = new Blob([screen.WebReportsPdfFilesStream.selectedItem.Pdf], { type: "application/pdf;base64" });
        //  var pdfDocument;
         // pdfjsLib.getDocument(pdfData).then(function (pdf) {
         //   pdfDocument = pdf;
            //var url = URL.createObjectURL(blob);
          //   if (PDFView) 
          //    PDFView.load(pdfDocument, 1.5)
         //  })
             




         // window.open(pdfData);
           /*if(   win.pdfjsLib )  {  win.pdfjsLib.getDocument({ data: decryptfile });
            }
            else {
               console.log(" PDF jsLibrary no iniialsed ")
            }*/
        // $('#target').html(html);
        }
      });
    });
  }); // JQUERY INIITIALSIE 

  function readFile(inout){
    const fr = new FileReader()
    fr.readAsDataURL(inout)
    fr.addEventListener('load', () => {
       res = fr.result;
      console.log("FIlreader :   "+ res)
    })
  }
  function convertDataURIToBinary(dataURI) {
    var BASE64_MARKER = ';base64,';
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for(i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    return array;
}

  function getPDFFileNameFromURL(url) {
    var defaultFilename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'document.pdf';
    console.log(url);
    console.log(defaultFilename);
  
    if (isDataSchema(url)) {
      console.warn('getPDFFileNameFromURL: ' + 'ignoring "data:" URL for performance reasons.');
      return defaultFilename;
    }
    var reURI = /^(?:(?:[^:]+:)?\/\/[^\/]+)?([^?#]*)(\?[^#]*)?(#.*)?$/;
    var reFilename = /[^\/?#=]+\.pdf\b(?!.*\.pdf\b)/i;
    var splitURI = reURI.exec(url);
    var suggestedFilename = reFilename.exec(splitURI[1]) || reFilename.exec(splitURI[2]) || reFilename.exec(splitURI[3]);
    if (suggestedFilename) {
      suggestedFilename = suggestedFilename[0];
      if (suggestedFilename.indexOf('%') !== -1) {
        try {
          suggestedFilename = reFilename.exec(decodeURIComponent(suggestedFilename))[0];
        } catch (ex) {}
      }
    }
    return suggestedFilename || defaultFilename;
  }

/*
  DID NOT WORK 

     (function(ow) {
            ow.addEventListener("load", function() { 
              var head = document.getElementsByTagName("head")[0] || document.documentElement;
              var script = document.createElement("script");
              
              script.src = "build5.01/pdf.mjs";
              script.type="module"
              head.insertBefore( script,head.firstChild); // , head.firstChild 
              var script2 = document.createElement("script");
               script2.type="module"
              script2.src = "web/pdf_viewer.mjs";
              head.appendChild( script2 ); // , head.firstChild
              var script3 = document.createElement("script");
              script3.type="module"
             script3.src = "previewviewer.mjs";
             head.appendChild( script3 );//, head.firstChild

              setTimeout(   () => {
                
                if (ow.pdfjsLib.getDocument ) { //&& ow.pdfjsViewer.PDFSinglePageViewer
                // eslint-disable-next-line no-alert
                // alert("Please build the pdfjs-dist library using\n  `gulp dist-install`");
                ow.pdfjsLib.getDocument({ data: decryptfile });
               //  ow.  pdfSinglePageViewer.setDocument();
               // ow. pdfLinkService.setViewer(pdfSinglePageViewer);
                 }
                 else {
                  console.log(" PDF jsLibrary no iniialsed ")
                 }
               }, 23000 )

              }, false);
            //  ow.attachEvent("onload", function() { }, false); 
            })(window.open('preview.html'));


*/

/*
https://stackoverflow.com/questions/43968038/encoding-pdf-binary-data-to-base64-not-working-with-nodejs

https://stackoverflow.com/questions/69017293/node-js-pdfjs-fetching-specific-page-using-pdfjs-dist

https://stackoverflow.com/questions/34586671/download-pdf-file-using-jquery-ajax
https://github.com/chaitanyamogal/pdf-master/tree/main

https://stackoverflow.com/questions/38767151/how-to-create-pdf-file-in-node-js

Agjualr 
https://stackoverflow.com/questions/78706152/unable-to-load-pdfjs-dist-library-in-angular-but-same-thing-working-in-js

https://stackoverflow.com/questions/24535799/pdf-js-and-viewer-js-pass-a-stream-or-blob-to-the-viewer

pdf t o 64
https://stackoverflow.com/questions/69423924/how-to-convert-local-pdf-to-base64

working  How to display ("data:application/pdf;base64," + pdfData) in Viewer.html using PDF.js

https://github.com/mozilla/pdf.js/issues/8308


https://stackoverflow.com/questions/48414749/how-to-use-with-base64string-pdf-data
https://developer.mozilla.org/en-US/docs/Web/URI/Schemes/data

https://stackoverflow.com/questions/38339575/how-to-correctly-convert-pdf-file-to-base64-in-browser


https://stackoverflow.com/questions/37614649/how-can-i-download-and-save-a-file-using-the-fetch-api-node-js/51302466#51302466

https://stackoverflow.com/questions/37614649/how-can-i-download-and-save-a-file-using-the-fetch-api-node-js/51302466#51302466
https://stackoverflow.com/questions/25945714/how-to-download-pdf-file-from-url-in-node-js

http://stackoverflow.com/questions/62620252/decrypting-a-pdf-with-nodejs/62620598#62620598

https://stackoverflow.com/questions/39498047/pdf-file-download-from-ajax-post-success-callback

https://www.aspsnippets.com/Articles/3210/Download-PDF-File-using-AJAX-in-jQuery/

*/
/*
https://github.com/learnnewhere/simpleChatApp/tree/master
https://github.com/mohsinogen/express-file-handling/blob/main/app.js
https://medium.com/@mohsinansari.dev/handling-file-uploads-and-file-validations-in-node-js-with-multer-a3716ec528a3
https://stackoverflow.com/questions/75793118/streaming-multipart-form-data-request-with-native-fetch-in-node-js
https://github.com/adminkit/adminkit
*/

const express = require('express');
const multer = require('multer');
const path = require('path');
var bodyParser = require('body-parser')
var html_to_pdf = require('html-pdf-node');
const qpdf = require('node-qpdf');
var HTMLParser = require('node-html-parser');
// const { decrypt }   =    require("node-qpdf2");
 const decrypt = (...args) => import('node-qpdf2').then(({default: decrypt}) =>   decrypt);
 //import { decrypt } from "node-qpdf2";
 let serverabsfile  =  ''
 let serveruploadfile= '';
 let userpdfpwd='';
var ejs = require('ejs');
const fs=require("fs"); 
 
const PORT = 8634;
const app = express();
const BASE64_MARKER = "data:application/pdf;base64, ";
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'sample')));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client




// Configure storage engine and filename
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload middleware and add file size limit
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 1MB file size limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('myFile'); // 'myFile' is the name attribute of the file input field

// Check file type
function checkFileType(file, cb) {
    const filetypes =  /docx|txt|pdf|doc/   // /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only! (doc, docx, pdf, txt)');
    }
}
function open_grid_page(req, res, next){

  if(req.method == "GET"){
       res.render('gridsample.ejs');
   }
}

async function FileDecrypt(inputFile, outputfile, password)
{
    // Read the entire file into the buffer.
    let buffer = fs.readFileSync(inputFile);

    // Read the first eight bytes as a salt.
    let salt = buffer.slice(0,8);
    let cipherText = buffer.slice(8);

    // use key derivation function to get key and iv.
    let derivedBytes = crypto.pbkdf2Sync(password, salt, 50000, 48, "sha1");
    let key = derivedBytes.slice(0, 32);
    let iv = derivedBytes.slice(32);

    let cipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    // Switch off auto padding in this context
    cipher.setAutoPadding(false);

    let decryptedData = Buffer.concat([cipher.update(cipherText), cipher.final()]);
    fs.writeFileSync(outputfile, decryptedData);    
}

function convertDataURIToBinary(dataURI) {
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));
  
  for (i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
  }
  return array;
  }
function process_creds (req, res, next){
  if(req.method == "GET"){
    let password = req.body.password;
    console.log("password received "+password)
    let kn = req.body.password ? req.body.password  :  req.query.password;
    console.log("kn received "+kn)
     var url = require('url');
     var url_parts = url.parse(req.url, true);
     var query = url_parts.query;
     var querystringParam = require('querystring');
     var state = querystringParam.parse(query).password;
     console.log("state querystringParam received "+state)
     let hexNumber = kn 
     // every 3rd character 
     let  chars = hexNumber.split("");
     let pg=[]; let noteIndx = 0; let lastChars= ''
      chars.forEach( (c,i) => { 
          /* if(i==0){
              pg.push( c)
           } */
           if(i%3 == 0 ){
            pg.push( c)
            noteIndx = i;
            }
      })  
      if(  noteIndx < chars.length  && noteIndx >0){
        lastChars = hexNumber.substring(noteIndx+1)
      }
     const asciiStr = pg.join("")+lastChars;

     console.log("asciiStr pwd "+asciiStr)
     const filename =  asciiStr   //     decodeURIComponent(asciiStr)
     console.log("parsed pwd "+filename)
     userpdfpwd = filename;
     res.send({ proessstatus: "done"});

  }
}
function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}
 

function requestAnimationFrame(f){
  setImmediate(()=>f(Date.now()))
}
function decrypt_pdf_page(req, res, next){

  if(req.method == "GET"){
      // generate decrypt the file 
     //  
     let password = req.body.password;
     let kn = req.body.kn ? req.body.kn  :  req.query.kn;
    /*  let hexNumber = kn.toString(16);
      if (hexNumber.length % 2 === 1) {
        hexNumber = "0" + hexNumber;
      }
      const hexChars = hexNumber.match(/\w{2}/g);
      const chars = hexChars.map((hex) =>
        String.fromCodePoint(parseInt(hex, 16))
      );
      const asciiStr = chars.join("");*/
      const filename =   kn;  // decodeURIComponent(asciiStr)
      console.log("parsed file "+filename);
     (async function () { 
        console.log("recveid request .... ")   
        console.log(" server file "+serverabsfile)
        var options = {
          keyLength: 256,
          password: password,
          outputFile:'uploads/demo.pdf',
          restrictions: {
            modify: 'none',
            extract: 'n'
          }
        }
         console.log(" password .... "+password)     
          const options2 = {
            input: "uploads"+serverabsfile,
            output:'uploads/demo.pdf',
            password: password,
          }
      //await qpdf.decrypt( "uploads"+serverabsfile, password , 'uploads/demo.pdf');

      var exec = require('child_process').exec;
      var pdfsourcepath =  "uploads"+serverabsfile   //'./myInputFile_WithPassword.pdf'; 
      var pdfdestinationpath ="uploads"+'/myoutfileWith_NopasswordProtection.pdf'   // './myoutfileWith_NopasswordProtection.pdf'; 
      var password2 = password
      // var    refererUrl = req.headers.referer; 
     //  console.log("referer "+refererUrl)
       var urlnew  = require('url');
      var querystringParam = require('querystring');
       
     //  var state = querystringParam.parse(urlnew.parse(refererUrl).query).file; // somefile
       let   pdfsource=''
       window=global
       window.requestAnimationFrame = requestAnimationFrame;
          // @ts-expect-error This does not exist outside of polyfill which this is doing
        if (typeof Promise.withResolvers === 'undefined') {
             if (window)
                 // @ts-expect-error This does not exist outside of polyfill which this is doing
                window.Promise.withResolvers = function () {
                    let resolve, reject;
                    const promise = new Promise((res, rej) => {
                        resolve = res;
                        reject = rej;
                    });
                    return { promise, resolve, reject };
                };
         }
        const getTextFromPDF = async(path) => {
          pdfjs1 = await import ('pdfjs-dist');
          let paawsd = "Bench@123_123"
        let doc = await pdfjsLib.getDocument( { url: path, password: paawsd }).promise;
        // await pdfjsLib.getDocument(path).promise;
        
        let page1 = await doc.getPage(1);
        let content = await page1.getTextContent();





          return content.items.map(function(item) {
            return item.str;
          });
        }  //'./sample/MHBAN01266700000014921_2024.pdf'

        
        const crypto = require("crypto");
        const pdfMaster = require("pdf-master");
        const pdfdit = async(path) => {
          pdfjs1 = await import ('pdfjs-dist');
        await  pdfjsLib.getDocument( { url:path, password: userpdfpwd }).promise.then(async function(pdfObj) { 
            const page = await pdfObj.getPage(1);
            let content = await page1.getTextContent();
            let data =   content.items.map(function(item) {
              return item.str;
            });
            let options = {
              displayHeaderFooter: true,
              format: "A4",
             
            };

            var command = 'qpdf --decrypt --password='+password+' '+pdfsourcepath+' '+pdfdestinationpath+'';
      
            await exec(command, function (error){
                  if (error !== null){
                      console.log('exec error: ',error ); //+ error)
                   let tst = JSON.stringify(error);
                   console.log("json error "+tst);
                      let realPath  =   path.resolve("./"+pdfdestinationpath)
                      fs.existsSync(realPath );
                   //fs.existsSync(path.join(__dirname, './'+pdfdestinationpath))// error.indexOf( "operation succeeded with") > -1 ;
                   if (realPath){
                     console.log('Your pdf is decrypted successfully.');
                     console.log('Your pdf is  '+pdfdestinationpath);
                     let basepath  = pdfdestinationpath.replace("uploads","");
                     res.send(basepath);
                   }
                } 
                 else{
                 console.log('Your pdf is decrypted successfully.');
                 console.log('Your pdf is  '+pdfdestinationpath);
                 let basepath  = pdfdestinationpath.replace("uploads","");
                 res.send(basepath);
                 
                 }
                }
               ); 

            const { jsPDF }   = require("jspdf");
              const doc = new jsPDF();
             //654f012d-63b6-438d-b18e-a4b6c3b7667c   https://pdfrest.com/apilab/?n=s
             /*
              curl -X POST "https://api.pdfrest.com/unrestricted-pdf" \
                -H "Accept: application/json" \
                -H "Content-Type: multipart/form-data" \
                -H "Api-Key: 654f012d-63b6-438d-b18e-a4b6c3b7667c" \
                -F "file=@PATH_TO_FILE/52296986_JAN_2025_PaySlip.pdf" \
                -F "current_permissions_password=Bench@123_123" \
            
            
             */
            var PDF = await pdfMaster.generatePdf('public/'+"decrypted.hbs",  data,options);
            //  npm i --save base64topdf
               fs.writeFileSync('./data.pdf', PDF , 'utf-8'); 
               const filePath ='./data.pdf';
               const stream = fs.createReadStream(filePath);
                 res.writeHead(200, {
                     'Content-disposition': 'attachment; filename="' + encodeURIComponent(path.basename(filePath))  + '"',
                     'Content-type': 'application/pdf',
                 });
                 stream.pipe(res);
           /* var viewport = page.getViewport({ scale: 1 });

            const { createCanvas, loadImage } = require('canvas')
            // https://github.com/Automattic/node-canvas/wiki/Installation:-Windows
            // https://github.com/nodejs/node-gyp#on-windows
            const canvas =  createCanvas(viewport.width,viewport.height);
             const ctx = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            var render_context = {
              canvasContext: canvas.getContext("2d"),
              viewport: viewport
            };
            console.log("page lenght", pdfObj.numPages);
           // setWidth(viewport.width);
           // setHeight(viewport.height);
            await page.render(render_context).promise;
            const out = fs.createWriteStream('./uploads' + '/test.png');
            const stream = canvas.createPNGStream();
              stream.pipe(out);
            out.on('finish', () => console.log('The PNG file was created.'));
            //let img = canvas.toDataURL("image/png");
             // and I wrote the file, worked like charm, but this buffer encodes for a png image, which can be rather large, with an image conversion utility like sharp.js you may get better results by compressing the thing.
          // fs.writeFileSync('./uploads/'+"test.pdf", buff);
           fs.writeFileSync('./uploads/'+"test.png", nameBase64);  
           const filePath = './uploads' + '/test.png'  //'./uploads/'+"test.pdf";
           const path = require('path');
           let imageURL = "http://localhost:8634/"+"test.png";
           const stream2 = fs.createReadStream(filePath);
           res.writeHead(200, {
                   'Content-disposition': 'attachment; filename="' + encodeURIComponent(path.basename(filePath))  + '"',
                  'Content-type': 'image/jpg',
             });
             stream2.pipe(res);*/
          // res.setHeader("Content-Type", "text/html")
          // res.write("<img src= " + img + "'>");
          // res.send();
            /*
           // now I need to get the image information and for that I get the operator list
            const operators = await page.getOperatorList();
            // this is for the paintImageXObject one, there are other ones, like the paintJpegImage which I assume should work the same way, this gives me the whole list of indexes of where an img was inserted
           const rawImgOperator = operators.fnArray.map((f, index) => f === pdfjsLib.OPS.paintImageXObject ? index : null).filter((n) => n !== null);
            // now you need the filename, in this example I just picked the first one from my array, your array may be empty, but I knew for sure in page 7 there was an image... in your actual code you would use loops, such info is in the argsArray, the first arg is the filename, second arg is the width and height, but the filename will suffice here
           const filename = operators.argsArray[rawImgOperator[0]][0];
            console.log(" pdfdit  operators.argsArray[rawImgOperator[0]][0] filename  "+filename)
            // now we get the object itself from page.objs using the filename
            page.objs.get(path, async (arg) => {
               // and here is where we need the canvas, the object contains information such as width and height
               const { createCanvas, loadImage } = require('canvas')
               const canvas =  createCanvas(arg.width, arg.height);
              const ctx = canvas.getContext('2d');
            // now you need a new clamped array because the original one, may not contain rgba data, and when you insert you want to do so in rgba form, I think that a simple check of the size of the clamped array should work, if it's 3 times the size aka width*height*3 then it's rgb and shall be converted, if it's 4 times, then it's rgba and can be used as it is; in my case it had to be converted, and I think it will be the most common case
              const data = new Uint8ClampedArray(arg.width * arg.height * 4);
           let k = 0;
           let i = 0;
           while (i < arg.data.length) {
            data[k] = arg.data[i]; // r
            data[k + 1] = arg.data[i + 1]; // g
            data[k + 2] = arg.data[i + 2]; // b
            data[k + 3] = 255; // a
    
            i += 3;
            k += 4;
           }
           // now here I create the image data context
           const imgData = ctx.createImageData(arg.width, arg.height);
           imgData.data.set(data);
           ctx.putImageData(imgData, 0, 0);
           const imData  =ctx.getImageData(0, 0, canvas.width, canvas.height);
           var buffer = imData.data.buffer; 
           var nameBase64 = Buffer.from(buffer).toString('base64')
           // get myself a buffer
           const buff = canvas.toBuffer();
    
          
           //const stream = fs.createReadStream(filePath);
           //  res.writeHead(200, {
          //       'Content-disposition': 'attachment; filename="' + encodeURIComponent(path.basename(filePath))  + '"',
          //       'Content-type': 'application/pdf',
           //  });
         //    stream.pipe(res);
             });
           */
         });  
        
        }
        pdfdit('./uploads/'+filename).then( () => {
          console.log("Procession pdf ")
        } ).catch( err => { 
          console.log(" pdf err  "+err)
          res.render('bootstrapblank.ejs');
        })
         



         
     })(); 
 
   
   }
}
function show_dummy_page(req, res, next){
  
  let   pdfsource=''
  window=global
  // @ts-expect-error This does not exist outside of polyfill which this is doing
  if (typeof Promise.withResolvers === 'undefined') {
    if (window)
        // @ts-expect-error This does not exist outside of polyfill which this is doing
        window.Promise.withResolvers = function () {
            let resolve, reject;
            const promise = new Promise((res, rej) => {
                resolve = res;
                reject = rej;
            });
            return { promise, resolve, reject };
        };
  }
  const getTextFromPDF = async(path) => {
    pdfjs1 = await import ('pdfjs-dist');
    let paawsd = "Bench@123_123"
  let doc = await pdfjsLib.getDocument( { url: path, password: paawsd }).promise;
  // await pdfjsLib.getDocument(path).promise;
  
  let page1 = await doc.getPage(1);
  let content = await page1.getTextContent();
    return content.items.map(function(item) {
      return item.str;
    });
  }  //'./sample/MHBAN01266700000014921_2024.pdf'
    getTextFromPDF('./sample/52296986_DEC_2024_PaySlip.pdf').then(data => {  console.log(data)
    pdfsource = data;

            if(req.method == "GET"){
              // show the decrypted  the file 
            
            let password = req.body.password;
            ejs
            .renderFile(path.join(__dirname, "views/dummyviewer.ejs"),
            {
              serverfile: pdfsource ,
                
            })
            .then(result => {
              emailTemplate = result; 
              res.send(emailTemplate);
            })
            .catch(err => {
              res.status(400).json({
                  message: "Error File Display ",
                  error: err
                });
              });
          }
     } 
    ).catch( err => { 
        
      res.render('bootstrapblank.ejs');
    })







  
}
function open_index_page(req, res, next){

  if(req.method == "GET"){
       res.render('index.ejs');
   }
}
function open_fileup_page(req, res, next){

  if(req.method == "GET"){
       res.render('fileup.ejs');
   }
}
function open_viewer_page(req, res, next){

  if(req.method == "POST"){
       res.render('viewer.ejs');
   }
}
function displayFile( ejs , path , res, msgHeader ,cnt ){

    console.log(" Display file  UI ")
    
   ejs
   .renderFile(path.join(__dirname, "views/viewer.ejs"),
   {
     serverfile: msgHeader.serverabsfile ,
      
   })
   .then(result => {
     emailTemplate = result; 
     res.send(emailTemplate);
   })
   .catch(err => {
     res.status(400).json({
         message: "Error File Display ",
         error: err
       });
     });
}
function renderFileUploadMessage   (   ejs , path , res, msgHeader ,cnt ) {
     
     
   // appR.use('/images', express.static('images'));
   var emailTemplate ="";
   var bas64 = btoa(cnt);
   console.log(" Render Upload UI ")
   console.log(" Content ",bas64)
  ejs
  .renderFile(path.join(__dirname, "views/fileuploadviewer.ejs"),
  {
    fileUpload: msgHeader.filename ,
    size: msgHeader.size,
     type: msgHeader.type,
     actualfile:msgHeader.serverfile,
     link: msgHeader.link
  })
  .then(result => {
    emailTemplate = result; 
    res.send(emailTemplate);
  })
  .catch(err => {
    res.status(400).json({
        message: "Error Rendering File Upload ",
        error: err
      });
    });
  
  }

  //etc. example.com/user/000000?sex=female
  //  const query = req.query;// query = {sex:"female"}
  //  const params = req.params; //params = {id:"000000"}
  // app.get('/user/:id', function(req, res) {
  app.get('/toviewer', function (req, res) {
    console.log("Inside Viewer");
     const actualfile =  req.query.file;

   
        const tests = [
            ['/', '/uploads'],
          /*  ['/foo', '/bar'],
            ['/foo', '/foobar'],
            ['/foo', '/foo/bar'],
            ['/foo', '/foo/../bar'],
            ['/foo', '/foo/./bar'],
            ['/bar/../foo', '/foo/bar'],
            ['/foo', './bar'],
            ['C:\\Foo', 'C:\\Foo\\Bar'],
            ['C:\\Foo', 'C:\\Bar'],
            ['C:\\Foo', 'D:\\Foo\\Bar'], */
        ];
        tests.forEach(([parent, dir]) => {
            const relative = path.relative(parent, dir);
            const isSubdir = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
            if (fs.existsSync(relative+"/"+actualfile)) {
                    let p = relative+"/"+actualfile;
                 console.log(`Server file ${p} exists can render in viewer`);
            }
            if ( isSubdir){
                serverabsfile  =   path.resolve( relative+"/"+actualfile)
                serverabsfile = serverabsfile.replaceAll(path.sep, path.posix.sep) 
                // relative not required as express.static "uploads" included 
                serverabsfile =  "/"+actualfile;  
                console.log(`Server absoulte ${serverabsfile } `);
            }
            console.log(`[${parent}, ${dir}] => ${isSubdir} (${relative})`);
        });  
   
        cnt = 1;
        const msgHeader = { 
            serverabsfile: serverabsfile 
              //myFile-1738453976266.pdf
        }


      displayFile(  ejs , path , res, msgHeader ,cnt )
     //res.sendFile( __dirname + "/" + "fileupload.html" ); 
 })
app.get('/fileupload.html', function (req, res) {
   res.sendFile( __dirname + "/" + "fileupload.html" );
})

//app.get('/',  open_fileup_page);//call for main index page
 app.get('/', open_index_page);//call for main index page
 app.get('/grid', open_grid_page);
 app.get('/decrypt', decrypt_pdf_page);
 app.get('/show', show_dummy_page);
 app.get('/processpdf', process_creds); 
// File upload route
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Please send file' });
        }
        console.log(req.file);
        // SHOW FILE UPLOADED UI WITH VIEW BUTTON 
        // res.send('File uploaded!');
        cnt = 1;

        const msgHeader = { 
            filename: req.file.originalname,
            size : req.file.size,
            type: req.file.mimetype,
            serverfile: req.file. filename , //myFile-1738453976266.pdf
             link: "/toviewer?file="+req.file. filename 
        }
       serveruploadfile = req.file. filename 
        renderFileUploadMessage(  ejs , path , res, msgHeader ,cnt )
    });
});

app.listen(PORT, () => console.log('Server started on port  '+PORT));
/*
https://stackoverflow.com/questions/53220350/how-to-forward-a-multipart-form-data-post-request-in-node-to-another-service

https://codesandbox.io/search?refinementList%5Btemplate%5D=&refinementList%5Bnpm_dependencies.dependency%5D%5B0%5D=pdfjs-dist&page=2&configure%5BhitsPerPage%5D=12

https://github.com/bundled-es-modules/pdfjs-dist/blob/main/demo/index.html

https://stackoverflow.com/questions/70853011/bootstrap-cards-not-working-correctly-with-columns
https://stackoverflow.com/questions/45722195/bootstrap-form-control-and-grid
*/
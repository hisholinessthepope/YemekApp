let express = require('express')
let mongodb = require('mongodb')
let sanitizeHTML = require('sanitize-html')

let app = express()
let db 

let port = process.env.PORT
if(port==null || port == ""){
  port = 3000
}

let moment = require('moment');  
// Why use moment: when axios posts date as json, date gets converted into string. We use moment to convert it back to date before entering into the db

app.use(express.static('public'))


let connectionString = 'mongodb+srv://to_do_user:4lUwwZSahgDfKnqP@cluster0.7qqo4.mongodb.net/Yemek?retryWrites=true&w=majority'

mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client){
  db = client.db()
  app.listen(port)
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))

function passwordProtected(req, res, next) {
  res.set('WWW-Authenticate', 'Basic realm="YemekApp"')
  //console.log(req.headers.authorization)
  if (req.headers.authorization == "Basic S2FwbHVtYmFnYUxlbXVyOlllbWVrMjAyMQ==") {
    next()
  } else {
    res.status(401).send("Authentication required")
  }
}

// function to format date as YYY-MM-DD
function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

app.use(passwordProtected)

app.get('/', function(req, res) {
    db.collection('Yemek').find().sort({"timestamp": -1}).toArray(function(err, items){
      //console.log(items)
      res.send(`<!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="Yemek app Lemur ve Kaplumbaga">
          <title>Lemur Kaplumbaga yemek listesi </title>
          <link rel="stylesheet" type="text/css"   href="/css/test.css">
      </head>
      <body>
        <header class="custom-header"> Lemur & Kaplumbaga </header>
          <h1 id="appHeader">Yemek listesi</h1>
          <div>
              <form id="create-form" action="/feedbacksubmitted" method="POST">
              <div class="custom-div" style="width:200px;">
              <label for="person">Kimsin? Lütfen seç:</label>
              <br><br>
              <select class="select-css" name="person" id="person"> 
                  <option value="lemur">Lemur</option>
                  <option value="kaplumbaga">Kaplumbaga</option>
              </select><br>
              <label for="start">Ne zaman?</label><br><br>
              <input class="select-date-css" type="date" id="tarih" name="tarih">

          </div>
              <br><br>
              <div>
                      <label class="custom-div" for="sabah">Sabah</label>
                      <input type="text" id="sabah" name="sabah">
                      <br>
                      <label class="custom-div" for="ogle">Ögle</label>
                      <input type="text" id="ogle" name="ogle">
                      <br>
                      <label class="custom-div" for="aksam">Aksam</label>
                      <input type="text" id="aksam" name="aksam">
                  </div>
                  <br>
                  <button class = "sendbutton">Gönder!</button>
              </form>
          </div>
          <br><br>
          <div>
            <h2 class = "historyHeader">Son günlerde bunlari yedin...</h2>
            <input type="text" id = "searchYemek" placeholder="Yemekleri ara..." onkeyup="histSearch()"></input><br><br>
            <table id="yemek-history">
              <tr>
                <th class= "tableTitle" id= "yemek-history_th">Tarih</th>
                <th class= "tableTitle" id= "yemek-history_th">Kim?</th>
                <th class= "tableTitle" id= "yemek-history_th">Sabah</th>
                <th class= "tableTitle" id= "yemek-history_th">Ögle</th>
                <th class= "tableTitle" id= "yemek-history_th">Aksam</th>
                <th class= "tableTitle" id= "yemek-history_th">Secenekler</th>
              </tr>
              ${items.slice(-30).map(function(item){//slice -10 shows the last 10 items 
                return`
                <tr id = "item-list">
                  <td>${item.date}</td>
                  <td>${item.person}</td>
                  <td class= "Sabah">${item.sabah}</td>
                  <td class = "Ogle">${item.ogle}</td>
                  <td class = "Aksam">${item.aksam}</td>
                  <td>
                    <button data-id="${item._id}" class = "editbutton">Düzenle</button><br><br>
                    <button data-id="${item._id}" class = "deletebutton">Sil</button>
                  </td>
                </tr>
                `
              }).join('')}
            </table>
          </div>  
      
      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>   
      <script src="/browser.js"></script>
      </body>
    </html>`)
  })
})

app.post('/feedbacksubmitted', function(req, res) {
    //let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
    //let sabah = sanitizeHTML(req.body.sabah, {allowedTags: [], allowedAttributes: {}})
    //let ogle = sanitizeHTML(req.body.ogle, {allowedTags: [], allowedAttributes: {}})
    //let aksam = sanitizeHTML(req.body.aksam, {allowedTags: [], allowedAttributes: {}})
    //let person = req.body.person
    //let timeStamp = new Date()
    //let tarih = req.body.tarih
    
    let correctStamp = moment(req.body.timestamp).toDate()
    let safeSabah = sanitizeHTML(req.body.sabah, {allowedTags: [], allowedAttributes: {}})
    let safeOgle = sanitizeHTML(req.body.ogle, {allowedTags: [], allowedAttributes: {}})
    let safeAksam = sanitizeHTML(req.body.aksam, {allowedTags: [], allowedAttributes: {}})
    db.collection('Yemek').insertOne({timestamp: correctStamp, date: req.body.date, sabah: safeSabah, ogle: safeOgle, aksam: safeAksam, person: req.body.person}, function(err, info){ 
      res.json(info.ops[0])
    })
})

app.post('/update-item', function(req, res){
  let safeSabah = sanitizeHTML(req.body.sabah, {allowedTags: [], allowedAttributes: {}})
  let safeOgle = sanitizeHTML(req.body.ogle, {allowedTags: [], allowedAttributes: {}})
  let safeAksam = sanitizeHTML(req.body.aksam, {allowedTags: [], allowedAttributes: {}})
  db.collection('Yemek').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)}, {$set: {sabah: safeSabah, ogle: safeOgle, aksam: safeAksam }}, function(){
    res.send("Success")
    //console.log(req.body.id)
  })
})

app.post('/delete-item', function(req, res){
  db.collection('Yemek').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, function(){
    res.send("Success")
  })
})
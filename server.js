const express = require('express')
const session = require('express-session');
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
const bcrypt = require('bcrypt');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage})
const app= express()

app.use(express.static('uploads'))
app.use(session({secret: 'backend',saveUninitialized: true,resave: true}));

var sess;
app.listen(3000,function(){
console.log('Shaastra Registration')
})


  MongoClient.connect('mongodb+srv://yoda:Abhishek_25@cluster0-ymccc.mongodb.net/test?retryWrites=true&w=majority', { useUnifiedTopology: true })
    .then(client => {
    console.log('Connected to Database')
    const db = client.db('webops7')
    const storeData = db.collection('user')

    
    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(express.static('public'))



      app.get('/', (req, res) => {
          sess = req.session
          if(sess.email) {
            res.redirect('/info');
          }
          db.collection('user').find().toArray()
          .then(user => {
          res.render('index.ejs', { user: user })
          })
          .catch(error => console.error(error))
          })

      app.get('/info', (req, res) => {
          sess = req.session

          db.collection('user').findOne({email:sess.email})
          .then(user => {
            if(user){
              res.render('info.ejs', { user: user })
            }
            else{
              res.redirect('/')
            }
          })
          .catch(error => console.error(error))
          })

      app.get('/login', (req, res) => {
          sess = req.session
          if(sess.email) {
            res.redirect('/info');
          }
          db.collection('user').find().toArray()
          .then(user => {
          res.render('login.ejs', { user: user })
           })
          .catch(error => console.error(error))
          })

      app.post('/upload', upload.single('photo'), (req, res) => {
          if(req.file) {
              sess = req.session
              db.collection('user').findOneAndUpdate({email:sess.email}, { "$push": { "photos": req.file.filename } }, { 'new': true })
              .then(user => {
                res.redirect('/info')
              })
              .catch(error => console.error(error))

              
          }
          else throw 'error';
      });

      app.post('/info', (req, res) => {
      
           // storeData.drop(req.body)
           
           res.redirect('/')  
           
            })

       app.post('/logout', (req, res) => {
          
          req.session.destroy((err) => {
              if(err) {
                  return console.log(err);
              }
              res.redirect('/');
          });

           })

       app.post('/check', (req, res) => {
      
           storeData.findOne({email:req.body.email})
           .then(result => {
           bcrypt.compare(req.body.password, result.password, function(err, hash) {

             if(hash){
              sess = req.session
              sess.email = req.body.email
              res.redirect('/info')
             }
             else{
              res.redirect('/') 
             }

           })
           // res.redirect('/info')  
           })
           .catch(error => console.error(error))          
           })



        app.post('/user', (req, res) => {
          req.body.photos = []
          bcrypt.hash(req.body.password, 10, function(err, hash) {
          req.body.password=hash
          storeData.insertOne(req.body)
         .then(result => {
              sess = req.session
              sess.email = req.body.email
              res.redirect('/info')  
          })
          .catch(error => console.error(error))

          });

          })
      })
   

          

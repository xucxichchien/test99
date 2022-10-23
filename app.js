var express= require('express');
var path = require('path');
var mongoose = require('mongoose');
require('dotenv').config();
var bodyParser = require('body-parser');
var session = require('express-session');
const { check, validationResult } = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var config = require('./config/database');


//connect to db
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connected to db');
})

//initialize app
var app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//setup public path
// app.use('/public', express.static(path.join(__dirname, 'public')))
app.use( express.static(path.join(__dirname, 'public')))

//global variables for errors
app.locals.errors =null;

//global variable for pages
var PageModel = require('./models/page');

PageModel.find({}).sort({sorting: 1}).exec().then((pages)=>{
  app.locals.pages =pages;
}).catch((err)=>{console.log(err)});


//global variable for categories
var CategoreyModel = require('./models/categories');

CategoreyModel.find({}).then((categories)=>{
  app.locals.categories =categories;
}).catch((err)=>{console.log(err)});


// fileUpload
app.use(fileUpload());
// bodyParser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//sessions
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
  }));

//express validator
// app.use(expressValidator({
//     errorFormater: function(param, msg, value){
//         var namespace = param.split('.')
//         , root = namespace.shift()
//         , formParam = root;

//         while(namespace.length){
//             formParam += '{' + namespace.shift() + '}';
//         }

//         return ({
//             param:formParam,
//             msg:msg,
//             value:value
//         });
//     }
// }))

//express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});



//passport 
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());


//start Cart session
app.get('*', (req, res, next)=>{
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
})

//routes
var pages = require('./routes/pages');
var products = require('./routes/products');
var users = require('./routes/users');
var cart = require('./routes/cart');
var adminPages = require('./routes/adminPages');
var adminCategories = require('./routes/adminCategories');
var adminProducts = require('./routes/adminProducts');

app.use('/users', users);
app.use('/cart', cart);
app.use('/products', products);
app.use('/admin/products', adminProducts);
app.use('/admin/categories', adminCategories);
app.use('/admin/pages', adminPages);
app.use('/', pages);

//start server
const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`server is running on http://localhost:${port}`)
})
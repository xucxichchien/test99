var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

//require categorey model
var CategoreyModel = require('../models/categories');


/* 
* Get Cats index
*/
router.get('/',  isAdmin,  (req, res)=>{
   CategoreyModel.find().then((cats)=>{
       res.render('admin/categories', {
           cats:cats
       });
   }).catch((err)=>{console.log(err)});
})

/*
* function used to update the global variable pages, every
* time we delete or edit or insert anew page
*/

var updateGlobalCategories = (req) =>{
    CategoreyModel.find({}).then((categories)=>{
        req.app.locals.categories =categories;
      }).catch((err)=>{console.log(err)});
}

/* 
* Get add categorey 
*/
router.get('/add_categorey', isAdmin,  (req, res)=>{
    var title = "";
    var slug = "";

    res.render('admin/add_categorey', {
        title: title,
        slug: slug,
    });
})


/* 
* POST add categorey
*/
router.post('/add_categorey',[
    check('title', 'title must have a value').notEmpty(),

] ,(req, res)=>{

     var title = req.body.title;
    var slug = req.body.title.replace(/\s+/g,'-').toLowerCase();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.render( 'admin/add_categorey' ,{ 
        errors: errors.array(),
        title: title,
        slug: slug,
     });
   }

  

   if(slug ==""){ slug= req.body.title.replace(/\s+/g,'-').toLowerCase();}
   
   CategoreyModel.findOne({slug: slug}).then((page)=>{
       if(page){
           req.flash('danger', 'categorey slug exsits, choose another slug');
           res.render('admin/add_categorey', {
            errors: errors.array(),
            title: title,
            slug: slug,
        });
       } else{
           var newCat = new CategoreyModel({
            title: title,
            slug: slug,
           })

           newCat.save((err)=>{
               if(err){console.log(err);}
               req.flash('success', 'categorey added');
               updateGlobalCategories(req);
               res.redirect('/admin/categories');

           });
       }
   }).catch((err)=>{console.log(err)});

  
})



 /* 
* Get Edit Categorey
*/
router.get('/edit-categorey/:slug',  isAdmin,  (req, res)=>{
    CategoreyModel.findOne({slug: req.params.slug})
    .then((cat)=>{
        res.render('admin/edit_categorey', {
            title: cat.title,
            slug: cat.slug,
            id: cat._id
        });
    }).catch((err)=>{console.log(err)});
   
})

/* 
* POST Edit categorey
*/
router.post('/edit-categorey/:slug',[
    check('title', 'title must have a value').notEmpty(),

] ,(req, res)=>{
    
    var title = req.body.title;
    var slug = req.body.title.replace(/\s+/g,'-').toLowerCase();
    // var id = mongoose.mongo.ObjectId(req.body.id);
    //var id = JSON.parse(req.body.id);
    var id = req.body.id.trim();
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.render( 'admin/edit_categorey' ,{ 
        errors: errors.array(),
        title: title,
        slug: slug,
        id: id
     });
   }

      
   CategoreyModel.findOne({slug: slug, _id:{ $ne: id }}).then((cat)=>{
       if(cat){
           req.flash('danger', 'categorey slug exsits, choose another slug');
           res.render('admin/edit_categorey', {
            errors: errors.array(),
            title: title,
            slug: slug,
            id: id
        });
       } else{
           CategoreyModel.findById(id).then((cat)=>{
               cat.title = title;
               cat.slug = slug;

               cat.save((err)=>{
                if(err){console.log(err);}
                req.flash('success', 'categorey Edited');
                updateGlobalCategories(req);
                res.redirect('/admin/categories');
            });
           })
          
       }
   }).catch((err)=>{console.log(err)});

})

/* 
* Get delete categorey
*/
router.get('/delete-categorey/:id',  isAdmin, (req, res)=>{
    CategoreyModel.findByIdAndRemove(req.params.id).then(()=>{
        req.flash('success', 'Categorey Deleted');
        updateGlobalCategories(req);
        res.redirect('/admin/categories');

    }).catch((err)=>{console.log(err)});
 })



//export router 
module.exports= router;
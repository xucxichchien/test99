var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');
var resizeImg = require('resize-img');
var isImg = require('../tests/imageValidator');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

//require Products model
var ProductModel = require('../models/products');

//require Categories model
var CategoreyModel = require('../models/categories');


/* 
* Get products index
*/
router.get('/', isAdmin, (req, res)=>{

    var count;
    ProductModel.count((err, c)=>{ count=c; }) 

   ProductModel.find().then((products)=>{
       res.render('admin/products', {
           products:products,
           count: count
       });
   }).catch((err)=>{console.log(err)});
})

/* 
* Get add product 
*/
router.get('/add_product', isAdmin,  (req, res)=>{
    var title = "";
    var desc = "";
    var price = "";
    CategoreyModel.find().then((cats) =>{
    res.render('admin/add_product', {
        title: title,
        desc: desc,
        price: price,
        cats: cats
    });
  }).catch((err)=>{console.log(err)});
})


/* 
* POST add product 
*/
router.post('/add-prodcut',[
    check('title', 'title must have a value').notEmpty(),
    check('desc', 'Description must have a value').notEmpty(),
    check('price', 'Price must have a decimal value').isDecimal(),
    check('image').custom( (val , {req}) => {
        if(!req.files){return true;}
        var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
        if (!isImg(val, imageFile)){
            throw new Error('You must include an Image');
        };
        return true;
    })

] ,(req, res)=>{
      
   var title = req.body.title;
   var slug = req.body.title.replace(/\s+/g,'-').toLowerCase();
   var price = req.body.price;
   var desc = req.body.desc;
   var categorey = req.body.categorey;
   if(!req.files){ imageFile =""; }
   if(req.files){
   var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
   }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return  CategoreyModel.find().then((cats) =>{
        res.render('admin/add_product', {
            errors: errors.array(),
            title: title,
            desc: desc,
            price: price,
            cats: cats
        });
      }).catch((err)=>{console.log(err)});
   }

   
   ProductModel.findOne({slug: slug}).then((product)=>{
       if(product){
           req.flash('danger', 'product exsits, choose another name');
           CategoreyModel.find().then((cats) =>{
            res.render('admin/add_product', {
                title: title,
                desc: desc,
                price: price,
                cats: cats
            });
          });

       } else{
           var price2  = parseFloat(price).toFixed(2);

           var newProduct = new ProductModel({
            title: title,
            slug: slug,
            desc: desc,
            price: price2,
            categorey: categorey, 
            image: imageFile
           })

           newProduct.save((err)=>{
               if(err){console.log(err);}

               mkdirp('public/images/product_imgs/'+newProduct._id)
               .then(()=>{
                    mkdirp('public/images/product_imgs/'+newProduct._id+'/gallery')
               .then(()=>{
                        mkdirp('public/images/product_imgs/'+newProduct._id+'/gallery/thumbs')
                .then(()=>{
                    if(imageFile != ""){
                        var productImage = req.files.image;
                        var path = 'public/images/product_imgs/'+newProduct._id+'/'+imageFile;

                        productImage.mv(path, (err)=>{
                
                         if(err) return res.status(500).send(err);

                            req.flash('success', 'product added')
                            res.redirect('/admin/products');

                        });

                        
                                     } else{

                                        req.flash('success', 'product added with Default Image')
                                        res.redirect('/admin/products');

                                     }

                        })
                    })
               })

               
           });
       }
   }).catch((err)=>{console.log(err)});

  
})


 /* 
* Get Edit product 
*/
router.get('/edit-product/:id', isAdmin,  (req, res)=>{

    var errors;
    if(req.session.errors){ errors = req.session.errors }
    req.session.errors = null;


    CategoreyModel.find().then((cats) =>{
        ProductModel.findById(req.params.id).then((p)=>{
            var galleryDir = __dirname+'/../public/images/product_imgs/'+p._id+'/gallery';
            var galleryImgs = null;
            fs.readdir(galleryDir).then((files)=>{
                galleryImgs= files;
                res.render('admin/edit_product', {
                    title: p.title,
                    desc: p.desc,
                    price: p.price,
                    cats: cats,
                    categorey: p.categorey,
                    image: p.image,
                    galleryImages: galleryImgs,
                    errors: errors,
                    id: p._id
                });


            })
        })
     
     
       
  }).catch((err)=>{console.log(err)});
   
})

/* 
* POST Edit product 
*/
router.post('/edit-product/:id',[
    check('title', 'title must have a value').notEmpty(),
    check('desc', 'Description must have a value').notEmpty(),
    check('price', 'Price must have a decimal value').isDecimal(),
    check('image').custom( (val , {req}) => {
        if(!req.files) { return true; }
        
        var imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
        if (!isImg(val, imageFile)){
            throw new Error('You must include an Image');
        };
        return true;
    })
] ,(req, res)=>{

    var title = req.body.title;
    var slug = req.body.title.replace(/\s+/g,'-').toLowerCase();
    var price = req.body.price;
    var desc = req.body.desc;
    var categorey = req.body.categorey;
    var imageFile;
    if(!req.files){ imageFile =""; } 
    else if(req.files.image){ imageFile = req.files.image.name }
    console.log('imageFile', imageFile);
    
    //  imageFile = typeof(req.files.image) !== "undefined" ? req.files.image.name : "";
    
    var id = req.params.id.trim();
 var pimage = req.body.pimage;
    // if(!req.body.image){ var image = "" }
    //    var image = req.body.image;


    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       // req.session.errors = errors;

        // return res.redirect('/admin/products/edit-product/'+id)
        // if(req.session.errors){ errors = req.session.errors }
        // req.session.errors = null;

        CategoreyModel.find().then((cats) =>{
            ProductModel.findById(req.params.id).then((p)=>{
                var galleryDir = __dirname+'/../public/images/product_imgs/'+p._id+'/gallery';
                var galleryImgs = null;
                fs.readdir(galleryDir).then((files)=>{
                    galleryImgs= files;
                   return  res.render('admin/edit_product', {
                        title: p.title,
                        desc: p.desc,
                        price: p.price,
                        cats: cats,
                        categorey: p.categorey,
                        image: p.image,
                        galleryImages: galleryImgs,
                        errors: errors.errors,
                        id: p._id
                    });
    
    
                })
            })
         
         
           
      }).catch((err)=>{console.log(err)});
    
   
   }

      
   ProductModel.findOne({slug: slug, _id:{ $ne: id }}).then((p)=>{
       if(p){
           req.flash('danger', 'product slug exsits, choose another Name');
           res.render('admin/edit_product', {
               title: p.title,
               desc: p.desc,
               price: p.price,
               cats: cats,
               categorey: p.categorey,
               image: p.image,
               galleryImgs: galleryImgs,
               errors: errors.array()
        });
       } else{
           ProductModel.findById(id).then((p)=>{
               p.title = title;
               p.slug = title.replace(/\s+/g,'-').toLowerCase();
               p.desc = desc;
               p.price = parseFloat(price).toFixed(2);
               p.categorey = categorey;
               if(imageFile == "") {p.image = pimage;}
               else { p.image = imageFile; }

            //    if(imageFile != ""){ image = imageFile; }
               

               p.save((err)=>{
                if(err){ return  console.log(err);}
                console.log('pimage', pimage);
                if(imageFile != ""){
                    if(pimage != "") {
                        fs.remove('public/images/product_imgs/'+id+'/'+pimage).then( () =>{
                        var productImage = req.files.image; 
                        var path = 'public/images/product_imgs/'+id+'/'+imageFile;

                        productImage.mv(path, (err)=>{
                
                         if(err) return res.status(500).send(err);

                            req.flash('success', 'product Edited')
                            return res.redirect('/admin/products');

                        });

                        }
                        ).catch((err)=>{console.log(err)});
                    }
                        else{
                            var productImage = req.files.image; 
                            var path = 'public/images/product_imgs/'+id+'/'+imageFile;
    
                            productImage.mv(path, (err)=>{
                    
                             if(err) return res.status(500).send(err);
    
                                req.flash('success', 'product Edited, No previous image found')
                                return res.redirect('/admin/products');
    
                            });
                        }

                    } else {

                        req.flash('success', 'product Edited Without a new image')
                         res.redirect('/admin/products');
                        
                       

    
                }


            

                // req.flash('success', 'Product Edited');
                // res.redirect('/admin/products');
            });
           })
          
       }
   }).catch((err)=>{console.log(err)});

})

/*
 * POST product gallery
 */
router.post('/product-gallery/:id', function (req, res) {

    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/images/product_imgs/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/images/product_imgs/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function (err) {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(path), {width: 100, height: 100}).then(function (buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);

});

/*
 * GET delete image
 */
router.get('/delete-image/:image',  isAdmin,  function (req, res) {

    var originalImage = 'public/images/product_imgs/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/images/product_imgs/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    res.redirect('/admin/products/edit-product/' + req.query.id);
                }
            });
        }
    });
});

/*
 * GET delete product
 */
router.get('/delete-product/:id',  isAdmin,   function (req, res) {

    var id = req.params.id;
    var path = 'public/images/product_imgs/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            ProductModel.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            
            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products');
        }
    });

});




//export router 
module.exports= router;
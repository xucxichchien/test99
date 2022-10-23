var express = require('express');
var router = express.Router();
var ProductModel = require('../models/products');
var CategoreytModel = require('../models/categories');
var fs = require('fs-extra');



/*
* Get All products
*/


router.get('/', (req, res)=>{

    ProductModel.find().then((products)=>{
        if(!products){
            res.redirect('/');
        }else{
            res.render('all_products', {
                title: 'All products',
                products: products
            })
        }

    }).catch((err)=>{console.log(err)});

   
})

/*
* Get products by categorey
*/

router.get('/:categorey', (req, res)=>{
    var categoreySlug = req.params.categorey;

    CategoreytModel.findOne({slug: categoreySlug}).then((cat)=>{
        if(!cat){
            res.redirect('/');
        }else{
            ProductModel.find({categorey: categoreySlug}).then((products)=>{
                res.render('cat_products', {
                    title: cat.title,
                    products: products
                })

            })
            
        }

    })

   
})

/*
 * GET product details
 */
router.get('/:category/:product', function (req, res) {

    var galleryImages = null;
     var loggedIn = (req.isAuthenticated()) ? true : false;

    ProductModel.findOne({slug: req.params.product}, function (err, product) {
        if (err) {
            console.log(err);
        } else {
            var galleryDir = 'public/images/product_imgs/' + product._id + '/gallery';

            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                    });
                }
            });
        }
    });

});


//export router 
module.exports= router;
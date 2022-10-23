var express = require('express');
var router = express.Router();
var PageModel = require('../models/page');
var ProductModel = require('../models/products');


/*
* Get Home Page
*/

router.get('/', (req, res)=>{
    ProductModel.find().then((products)=>{
        if(!products){
            res.redirect('/');
        }else{
            res.render('home', {
                title: 'Welcome to Hex LTD Shop',
                products: products
            })
        }

    }).catch((err)=>{console.log(err)});
})


/*
* Get specific Page
*/

router.get('/:slug', (req, res)=>{
    var slug = req.params.slug;

    if(slug == 'delivery'){

        return  res.render('success', {
              title: 'Delivery',
          })
  
      }

    if(slug == 'contact'){

      return  res.render('contact', {
            title: 'Contact US',
        })

    }

    if(slug == 'about'){

      return   res.render('about', {
            title: 'About US',
        })

    }

    PageModel.findOne({slug: slug}).then((page)=>{
        if(!page){
            res.redirect('/');
        }else{
            res.render('index', {
                title: page.title,
                content: page.content
            })
        }

    })

   
})


//export router 
module.exports= router;
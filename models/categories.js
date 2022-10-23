var mongoose = require('mongoose');

//CategoreySchema
var CategoreySchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    slug:{
        type: String,
    },
   

});

var categorey = module.exports = mongoose.model('categorey', CategoreySchema, 'categories');
/**
 * Created by sunzg on 16/3/3.
 */
var express = require('express');
var router = express.Router();
var address=require('../addressConfig');

/* GET home page. */
router.get('/', function(req, res, next) {

    res.render('mobileController', { socket_url: address.socket_url ,
        socket_io_js:address.socket_io_js,userid:req.query.userid
    });
});

module.exports = router;

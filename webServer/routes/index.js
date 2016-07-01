var express = require('express');
var router = express.Router();

var address=require('../addressConfig');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { socket_url: address.socket_url ,
      socket_io_js:address.socket_io_js
  });
});

module.exports = router;

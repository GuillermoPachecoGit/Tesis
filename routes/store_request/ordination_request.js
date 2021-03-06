var express = require('express');
var router = express.Router();

router.post('/runOrdination', function(req,res,next){
    const { fork } = require('child_process');
    const forked = fork('./private_modules/ordination.js');
    forked.send(req.body);
    forked.on('message', (msg) => {
      res.status(200).json(JSON.stringify(msg)); 
      forked.kill();
    });
});

module.exports = router;

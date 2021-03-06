var express = require('express');
var router = express.Router();
var bd=require('../db_connect/db');


var plotly = require('../../private_modules/PlotlyGenerator');
var plotlyGenerator = new plotly();


router.get('/get_datasets', function(req,res,next){
  var project_id = req.query.id;
  bd.query('SELECT dataset_id, dataset_name FROM dataset WHERE project_id_ref = $1 AND show_consensus <> 1',[project_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{
        res.status(200).json(result.rows);
      }
  });
}
);


router.get('/get_only_datasets', function(req,res,next){
  var project_id = req.query.id;
  bd.query('SELECT dataset_id, dataset_name FROM dataset WHERE project_id_ref = $1 AND show_consensus <> 1 AND dataset_id_ref is NULL',[project_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{
        res.status(200).json(result.rows);
      }
  });
}
);


router.get('/get_analisys', function(req,res,next){
  console.log(req.query);
  var dataset_id = req.query.id;
  bd.query('SELECT * FROM dataset WHERE  dataset_id_ref = $1',[dataset_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{
        console.log(result.rows);
        res.status(200).json(result.rows);
      }
  });
}
);

router.get('/get_distances', function(req,res,next){
  var dataset_id = req.query.id;
  bd.query('SELECT * FROM distance WHERE  dataset_id_ref = $1',[dataset_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{
        console.log(result.rows);
        res.status(200).json(result.rows);
      }
  });
}
);

router.get('/get_distances_by_project', function(req,res,next){
  var project_id = req.query.id;
  bd.query('SELECT * FROM distance WHERE project_id_ref = $1 ',[project_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{
        res.status(200).json(result.rows);
      }
  });
}
);



router.get('/get_analisys_PDF', function(req,res,next){
  var dataset_id = req.query.id;
  bd.query('SELECT dataset_name,pdf FROM dataset WHERE dataset_id = $1',[dataset_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{
        res.status(200).json(JSON.stringify(result.rows[0]));
      }
  });
});

router.get('/get_distance_PDF', function(req,res,next){
  var dataset_id = req.query.id;
  bd.query('SELECT distance_name,pdf FROM distance WHERE distance_id = $1',[dataset_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{
        res.status(200).json(JSON.stringify(result.rows[0]));
      }
  });
});

router.get('/get_ordination_PDF', function(req,res,next){
  var ordination_id = req.query.id;
  bd.query('SELECT ordination_name,pdf FROM ordination WHERE ordination_id = $1',[ordination_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{
        res.status(200).json(JSON.stringify(result.rows[0]));
      }
  });
});

router.get('/get_datasetById', function(req,res,next){
  var dataset_id = req.query.id;
  bd.query('SELECT * FROM dataset WHERE dataset_id = $1',[dataset_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{

        bd.query('UPDATE dataset SET send=0 WHERE dataset_id = $1',[dataset_id],function(err, res){
          if(err){
            res.status(200).json({ "error": err});
          }
        });


        var prefix =  result.rows[0]['dataset_name'].split("_")[0];
        var type = 3;
        if(prefix == "GrP")
            type = 2;
        if(prefix == "GlsP")
            type = 1;
        if(result.rows[0].dimention == 3){
          result.rows[0].data_plotly =  plotlyGenerator.generateGraphicsPlotly3D(result.rows[0]);
          result.rows[0].layout = plotlyGenerator.getLayoutPlotly3D(type,result.rows[0]['dataset_name']);
        }else{
          result.rows[0].data_plotly =  plotlyGenerator.generateGraphicsPlotly2D(result.rows[0]);
          result.rows[0].layout = plotlyGenerator.getLayoutPlotly2D(type,result.rows[0]['dataset_name']);
        }   
        res.status(200).json(JSON.stringify(result.rows[0]));
      }
  });
});

router.get('/get_dataset_pending', function(req,res,next){
  var project_id = req.query.id;
  bd.query('SELECT * FROM dataset WHERE project_id_ref = $1 AND send = 1',[project_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{
        res.status(200).json(JSON.stringify(result.rows));
      }
  });
});

router.get('/get_distance_pending', function(req,res,next){
  var project_id = req.query.id;
  bd.query('SELECT * FROM dataset WHERE project_id_ref = $1',[project_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{

        distances = [];
        result.rows.forEach(element => {
          bd.query('SELECT * FROM distance WHERE dataset_id_ref = $1 AND send = 1',[element.dataset_id],function(err, result_dis){
            if(err){
                res.status(200).json({ "error": err});
              }
              else{
                distances = distances.concat(result_dis.rows);
              }
          });
        });
        res.status(200).json(JSON.stringify(distances));
      }
  });

 
});

router.get('/get_ordination_pending', function(req,res,next){
  var project_id = req.query.id;
  bd.query('SELECT * FROM dataset WHERE project_id_ref = $1',[project_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{

        ordinations = [];
        result.rows.forEach(element => {
          bd.query('SELECT * FROM distance WHERE dataset_id_ref = $1',[element.dataset_id],function(err, result_dis){
            if(err){
                res.status(200).json({ "error": err});
              }
              else{
                result_dis.rows.forEach(element_dis => {
                  bd.query('SELECT * FROM ordination WHERE distance_id_ref = $1 AND send = 1',[element_dis.distance],function(err, result_ord){
                    if(err){
                        res.status(200).json({ "error": err});
                      }
                      else{
                         ordinations = ordinations.concat(result_ord.rows);
                      }
                  });
                });
              }
          });
        });
        res.status(200).json(JSON.stringify(ordinations));
      }
  });

});
  
router.get('/get_distanceById', function(req,res,next){
  var distance_id = req.query.id;

  

  bd.query('SELECT * FROM distance WHERE distance_id = $1',[distance_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{

        bd.query('UPDATE distance SET send=0 WHERE distance_id = $1',[distance_id],function(err, res){
          if(err){
            res.status(200).json({ "error": err});
          }
        });
        res.status(200).json(JSON.stringify(result.rows[0]));
      }
  });
});

  
router.get('/get_ordinations', function(req,res,next){
  var distance_id = req.query.distance_id;
  var dataset_id = req.query.dataset_id;
  var project_id = req.query.project_id;

  bd.query('SELECT * FROM ordination WHERE distance_id_ref = $1 AND dataset_id_ref = $2 ',[distance_id,dataset_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{
        res.status(200).json(result.rows);
      }
  });
});

router.get('/get_ordinationById', function(req,res,next){
  var ordination_id = req.query.id;
  bd.query('SELECT * FROM ordination WHERE ordination_id = $1',[ordination_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{
        bd.query('UPDATE ordination SET send=0 WHERE ordination_id = $1',[ordination_id],function(err, res){
          if(err){
            res.status(200).json({ "error": err});
          }
        });


        var prefix =  result.rows[0]['ordination_name'].split("_")[0];
        var type;
        if(prefix == "rUMDS")
            type = 2;
        if(prefix == "lsUMDS")
            type = 1;


        result.rows[0].data_plotly =  plotlyGenerator.generateOrdinationGraphic(result.rows[0]);
        result.rows[0].layout = plotlyGenerator.getLayoutPlotlyOrdination2D(type,result.rows[0]['ordination_name']);

        res.status(200).json(JSON.stringify(result.rows[0]));
      }
  });
});


router.get('/get_user_by_id', function(req,res,next){
  var user_id = req.query.id;
  
  bd.query('SELECT * FROM app_user WHERE user_id = $1',[user_id],function(err, result){
    if(err){
        res.status(200).json({ "error": err});
      }
      else{
        res.status(200).json(result.rows[0]);
      }
  });
});


//agrega un proyecto a la base de datos
router.get('/getDescription',function (req,res,next) {
  var project_id = req.query.id;
  bd.query('SELECT project_name,description FROM project WHERE project_id = $1;',[project_id], function(err, result){
    if(err){
      res.status(200).json( { "result": "Error in the connection with database." });
    }
    else{
        res.status(200).json( { "result": "ok" , "description": result.rows[0].description, "project_name": result.rows[0].project_name });
      }
  })
});


router.post('/update_project', function(req,res,next){
  params = req.body;
  bd.query('SELECT 1 FROM project WHERE user_id =$2 and project_name = $1;',[params.project_name,params.user_id], function(err, result){
    if(err){
      res.status(200).json( { "result": "Error in the connection with database." });
    }
    else{
      if(result.rowCount == 0){
        bd.query('UPDATE project SET description = $1,project_name = $2  WHERE project_id = $3',[params.description,params.project_name, params.project_id],function(err,result){
          if(err){
              res.status(200).json( { "result": "error" });
          }else{
             res.status(200).json( { "result": "ok" } );
          }
      });

      }else
      {
        res.status(200).json( { "result": "Already exist another project with the same name. Please change the project name." });
      }
      
    }
  })
  
});

  module.exports = router;
const express=require('express');
const app=express();

const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extend:true}));
app.use(bodyParser.json());

const MongoClient=require('mongodb').MongoClient;
let server=require('./server');
let config=require('./config');
let middleware=require('./middleware');
const response=require('express');
//const { Db } = require('mongodb');

const url='mongodb://127.0.0.1:27017';
const dbName='ventilatorstatus';
let db

MongoClient.connect(url,{useUnifiedTopology:true},(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected MongoDB: ${url}`);
    console.log(`Database: ${dbName}`);
})
//HOSPITAL DETAILS
app.get('/hospitaldetails',middleware.checkToken, function(req,res){
    console.log("Fetching Details from hdetails");
    var data=db.collection('hdetails').find().toArray()
    .then(result=>res.json(result));
});
//VENTILATOR DETAILS
app.get('/ventilatorsdetails',middleware.checkToken,(req,res)=>{
     console.log("Ventilators Details");
     var ventilatorinfo=db.collection('ventilatordetails').find().toArray().then(result=>res.json(result));
});
//SEARCH VENTILATOR BY STATUS
app.post('/searchbystatus',middleware.checkToken,(req,res)=>{
    var status=req.body.status;
    console.log(status);
    var ventilatorinfo=db.collection('ventilatordetails').find({"status":status}).toArray()
    .then(result=>res.json(result));
});
//SEARCH VENTILATORS DETAILS BY HOSPITAL NAME
app.post('/searchbyname',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var ventilatorinfo=db.collection('ventilatordetails').find({'name':new RegExp(name,'i')}).toArray().
    then(result=>res.json(result));
});
//SEARCH HOSPITAL BY NAME
app.post('/searchhospital',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var hspdetails=db.collection('hdetails').find({'name':new RegExp(name,'i')}).toArray()
    .then(result=>res.json(result));
});
//UPDATE VENTILATOR DETAILS
app.put('/updateventilatordetails',middleware.checkToken,(req,res)=>{
    var ventid={ventilatorId:req.body.ventilatorId};
    console.log(ventid);
    var newvalues={$set:{status:req.body.status}};
    db.collection("ventilatordetails").updateOne(ventid,newvalues,function(err,result){
        res.json("1 document updated");
        if(err) throw err; 
    });
});
//ADD VENTILATOR
app.post('/addventilator',middleware.checkToken,(req,res)=>{
    var hId=req.body.hId;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var name=req.body.name;
    var item={
        hId:hId,ventilatorId:ventilatorId,status:status,name:name
    };
    db.collection('ventilator').insertOne(item,function(err,result){
          res.json("Ventilator Inserted");
    });
});
//DELETE VENTILATOR
app.delete('/deleteventilator',middleware.checkToken,(req,res)=>{
    var myquery=req.query.ventilatorId;
    console.log(myquery);
    var myquery1={ventilatorId:myquery};
    db.collection('ventilatordetails').deleteOne(myquery1,function(err,obj){
        if(err)throw err;
        res.json("1 document deleted");
    });
});
app.listen(3030);
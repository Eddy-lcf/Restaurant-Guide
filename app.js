// CUHK Latitude: 22.4185 Longitude: 114.2041.
// Yelp API key:hPBHzZUSYr4uLu2yH_KUEBiLXKFYszgvma6hRt1qVh-zv5zGsdygwDwvNFVfXh14A_xDATC8EFYO3Becn-q0UQPBUYfdHFeenvU_RADgVoQRAbKe1FjZWCYAPOurXnYx
// https://api.yelp.com/v3/businesses/search?latitude=22.4185&longitude=114.2041&radius=10000

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose")
const axios = require("axios");
const delay = require("delay");
const sha1 = require("sha1");
const bodyParser = require("body-parser");
const csv = require("csv-parser");
const fs = require("fs");
const multer = require("multer");

const app = new express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
const upload = multer({ dest: 'uploads/' });

var Schema = mongoose.Schema;

var dbUri = "mongodb+srv://@cluster0-bw5ok.mongodb.net/test?retryWrites=true&w=majority";
var options = {
user: 'Eddy',
pass: 'Leung',
dbName: 'project'
}
mongoose.connect(dbUri,options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
console.log("Connection is open...");
})

//var dbUri = "mongodb://localhost/project"; // ***need to be changed***
//mongoose.connect(dbUri, { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

//var db = mongoose.connection;

//db.on("error", console.error.bind(console, "datbase connection error:"));
//db.once("open", function () {
 //   console.log("database connection is open...");
//})

var UserSchema = new Schema({
    userLoginID: { type: String, unique: true, required: true},
    userPW: { type: String, required: true },
    userNickname: { type: String, unique: true, required: true },
    userFav : [String], //arr of restID
    favCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    lat : Number,
    long: Number
});

var RestSchema = new Schema({
    restID: { type: String, required: true, unique: true },
    restName: { type: String, required: true },
    restPhone: String, 
    restPrice: String,
    restURL: String,
    restLocation: String,
    restRating: String,
    restLat: String,
    restLong: String,
    restIsOpen: Boolean,
    restImg: String,
    restCat: String,
    viewCount : {type : Number, default: 0},
    favCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 }
})

var CommentSchema = new Schema({
    restID: String,
    title: String,
    content: String,
    emoji: 0,
    userID: String
})

UserModel = mongoose.model("User", UserSchema);
RestModel = mongoose.model("Rest", RestSchema);
CommentModel = mongoose.model("Comment", CommentSchema)


app.post("/login",(req,res)=>{
    var id = req.body["id"], pw = req.body["pw"];
    var hash = sha1(pw);
    UserModel.findOne({userLoginID : id })
    .exec((err,user)=>{
        if(err){
            console.log(err);
            res.send("fail")
            return;
        }
        else if(!user){
            res.send("Could not find your account")
        }
        else //(hash == user.userPW){
        {res.cookie("userID", id, {
                path:"/user",
                expires: new Date(Date.now() + 3600000)
            });
            res.send("success "+user.userNickname)
        }
        //else{
            //res.send("Wrong Password")
        //}
    })
});

app.post("/admin/flush", async (req, res) => {
    console.log("Flushing data......")
    
    let offset = 0;
    let loopCtrl = true;

    while (loopCtrl && offset < 1000){
        await delay(750);// To avoid TOO MANY REQUEST error
        console.log("Current offset: " + offset);
        let yelpConfig = {
            params: {
                latitude: 22.4185,
                longitude: 114.2041,
                radius: 10000,
                sort_by: "distance",
                limit: 50,
                offset: offset,
                locale: "en_US"
            },
            headers: {
                "Authorization": "Bearer hPBHzZUSYr4uLu2yH_KUEBiLXKFYszgvma6hRt1qVh-zv5zGsdygwDwvNFVfXh14A_xDATC8EFYO3Becn-q0UQPBUYfdHFeenvU_RADgVoQRAbKe1FjZWCYAPOurXnYx"
            }
        };
        //Get data from yelp api using the above config
        await axios.get("https://api.yelp.com/v3/businesses/search", yelpConfig)
            .then(yelpResponse => {
                for (let rest of yelpResponse.data.businesses){
                    if (rest.distance > 10000){
                        loopCtrl = false;
                        break;
                    }
                    RestModel.findOneAndUpdate({ restID: rest.id },{
                        restName: rest.name,
                        restPhone: rest.phone ,
                        restPrice: rest.price,
                        restURL: rest.url,
                        restLocation: rest.location.display_address.toString(),
                        restRating: rest.rating,
                        restLat: rest.coordinates.latitude,
                        restLong: rest.coordinates.longitude,
                        restIsOpen: !rest.is_closed,
                        restImg: rest.image_url,
                        restDistanceFromCU: rest.distance,
                        restCat: rest.categories.map(cat => cat.title).toString()
                    }, { setDefaultsOnInsert: true, new : true, upsert: true },
                    err=>{
                        if(err){
                            console.log(err.response.statusText);
                            res.send("Error");
                        }
                    });
                }
            })
            .catch(err => console.log(err.request))
        offset +=50;
    }
    console.log("success")
    res.send("success");
    
});

app.post('/admin/csv_upload', upload.single('myfile'), (req, res) => {
    let results = [];
    let path = req.file.path;
    let isErr = false;
    fs.createReadStream(path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            for(let rest of results){
                if(rest.restIsOpen == "TRUE" ){
                    rest.restIsOpen = true;
                }
                else {
                    rest.restIsOpen = false
                }
                RestModel.findOneAndUpdate(
                    { restID: rest.restID }, rest,
                    { new: true, upsert: true },
                    err=>{
                        if(err && isErr == false){
                            console.log(err);
                            res.send(err.errmsg);
                            isErr=true;
                        }
                    });
            }
        });

    fs.unlink(path, (err) => {
        if (err) {
            console.error(err);
        }
        //file removed
    });
    if(!isErr){
        res.send("success");
    }    
});

app.get("/admin/restSchema",(req,res)=>{
    let tmp = Object.keys(RestSchema.paths);
    res.send(tmp.slice(0 , tmp.length - 2 ));//_id & __v will not be send
});

//Create rest
app.put("/admin/createRest", (req, res)=>{
    let data = req.body;
    if(data.viewCount === ""){
        data.viewCount = 0;
    }
    if (data.favCount === "") {
        data.favCount = 0;
    }
    if (data.commentCount === "") {
        data.commentCount = 0;
    }
    RestModel.create(data,
        err => {
            if(err){
                console.log(err);
                res.send(err.errmsg);
            }
            else{
                res.send("success");
            }            
        });
});

//Retrive rest
app.get("/admin/restData", (req, res)=>{
    RestModel.find({})
        .exec((err,rests)=>{
            if(err){
                console.log(err);
                res.send(err.errmsg);
                return;
            }
            else {
                res.send(rests);
            }
        })
});

//Update rest
app.post("/admin/editRest/:current_id", (req,res)=>{
    RestModel.findOneAndUpdate({ _id: req.params.current_id }, req.body,
        err=>{
            if(err){
                console.log(err);
                res.send(err.errmsg);
            }
            else{
                res.send("success");
            }
        }
        
    );
});

//Delete rest
app.delete("/admin/restData/:restID",(req, res)=>{
    RestModel.findOneAndRemove({restID:req.params.restID})
        .exec((err,result)=>{
            if(err){
                console.log(err);
                res.send(err.errmsg);
            }
            else{
                res.send("success");
            }
        })
});

app.get("/admin/userSchema", (req, res) => {
    let tmp = Object.keys(UserSchema.paths);
    res.send(tmp.slice(0, tmp.length - 2));//_id & __v will not be send
});

//Create User
app.put("/admin/createUser", (req, res) => {
    let data = req.body;
    data["userPW"] = sha1(req.body["userPW"]);
    if(data.favCount === ""){
        data.favCount = 0
    }
    if (data.commentCount === "") {
        data.commentCount = 0
    }
    data.userFav = data.userFav.split(",");
    UserModel.create(data,
        err => {
            if (err) {
                console.log(err);
                res.send(err.errmsg);
            }
            else {
                res.send("success");
            }
        });
});

//Retrive User
app.get("/admin/userData", (req, res) => {
    UserModel.find({})
        .exec((err, users) => {
            if (err) {
                console.log(err);
                res.send(err.errmsg);
            }
            else{
                res.send(users);
            }
        })
});

//Update User
app.post("/admin/editUser/:current_id", (req, res) => {
    let data = req.body;
    if (data["userPW"] == ""){
        delete data["userPW"]
    }
    else{
        data["userPW"] = sha1(req.body["userPW"]);
    }

    UserModel.findOneAndUpdate({ _id: req.params.current_id }, data,
        err => {
            if (err) {
                console.log(err);
                res.send(err.errmsg);
            }
            else {
                res.send("success");
            }
        }
    );
});

//delete User
app.delete("/admin/userData/:_id", (req, res) => {
    UserModel.findOneAndRemove({ _id: req.params._id })
        .exec((err, result) => {
            if (err) {
                console.log(err);
                res.send(err.errmsg);
                return;
            }
            else {
                res.send("success");
            }        
        })
});

app.get("/admin/chart/data/comment", (req,res)=>{
    UserModel.find({}, "userLoginID commentCount")
        .sort({commentCount: -1})
        .limit(5)
        .exec((err,result)=>{
            if(err){
                console.log(err);
                res.send("Error")
            }
            else{
                res.send(result)
            }
        })
})

app.get("/admin/chart/data/fav", (req, res) => {
    UserModel.find({}, "userLoginID favCount")
        .sort({ favCount: -1 })
        .limit(5)
        .exec((err, result) => {
            if (err) {
                console.log(err);
                res.send("Error")
            }
            else {
                res.send(result)
            }
        })
})

app.post("/user/fav", (req,res)=>{
    var conditions={userNickname:req.body['userNickname']};
    var restID=req.body['restID'];
    UserModel.findOne(conditions,function(err,user){
        if (err){
            console.log(err);
            res.send("Error")
        }
        if (user!=null){
            user.favCount++;
            user.userFav.push(restID);
            user.save();
        }
        RestModel.findOne({restID:restID},function(err,rest){
            if (err){
                console.log(err);
                res.send("Error")
            }
            if (rest!=null){
                rest.favCount++;
                rest.save();
                res.send("success");
            }
        }
    )})   
})

app.post("/user/unfav",(req,res)=>{
    var conditions={userNickname:req.body['userNickname']};
    var restID=req.body['restID'];
    UserModel.findOne(conditions,function(err,user){
        if (err){
            console.log(err);
            res.send("Error")
        }
        if (user!=null){
            user.favCount--;
            user.userFav.pull(restID);
            user.save();
        }
        RestModel.findOne({restID:restID},function(err,rest){
            if (err){
                console.log(err);
                res.send("Error")
            }
            if (rest!=null){
                rest.favCount--;
                rest.save();
                res.send("success");
            }
        }
    )
    })
})

app.get("/admin/restSchema",(req,res)=>{
    let tmp = Object.keys(RestSchema.paths);
    res.send(tmp.slice(0 , tmp.length - 2 ));//_id & __v will not be send
});

app.post("/user/homeLocation",(req,res)=>{
 UserModel.findOne({userNickname:req.body['userNickname']},function(err,user){
     console.log(req.body['userNickname'])
            console.log(req.body['userLong'])
        console.log(user);
        if (err){
            console.log(err);
            res.send("Error")
        }
        if (user!=null){
            console.log(user);
            user.lat=req.body['userLat'];
            console.log(req.body['userLat'])
            console.log(req.body['userLong'])
            user.long=req.body['userLong'];
            user.save();
            res.send("saved user location")
        }
    })
})

app.post("/user/comment",(req,res)=>{
    var newComment= new CommentModel({
    restID:req.body['restID'], title: req.body['title'],
    content:req.body['content'],emoji: req.body['emoji'],
    userID:req.body['userNickname']});
    newComment.save(function(err){
    if (err)
        console.log(err);
    else
        console.log("saved new comment");
    UserModel.findOne({userNickname:req.body['userNickname']},function(err,user){
        if (err){
            console.log(err);
            res.send("Error")
        }
        if (user!=null){
            user.commentCount++;
            user.save();
        }
        RestModel.findOne({restID:req.body['restID']},function(err,rest){
            if (err){
                console.log(err);
                res.send("Error")
            }
            if (rest!=null){
                rest.commentCount++;
                rest.save();
                res.send("success");
            }
        }
    )  
    })
    })
})

app.get("/user/getcomment",(req,res)=>{
    CommentModel.find({},function(err,e){
        if(err) res.send(err);
        else
        res.send(e);
    })       
})

app.use("/uploads", express.static('uploads'));
app.use("/jsx", express.static("jsx"));

app.get("*", (req, res) => { res.sendFile(__dirname + "/index.html"); });

const server = app.listen(3001);

var express = require('express');
var router = express.Router();
var Cloudant = require('cloudant');

var me = '24919f5e-53bd-45ca-90f2-e3ae3f051c41-bluemix'; // Set this to your own account
var password = "db76626130ea3e6d55b931bc0ab914ce303d1863a71b4bc0cbfd5d8725d87ae6";
// Initialize the library with my account.
var cloudant = Cloudant({account:me, password:password});
var db = cloudant.db.use("users");

// WEATHER AVERAGE VALUE:
var weather = 10;
//DATAAAAAA
var data = {
	"subject": "Farmorama",
	"columns": [
	{
		"key": "weather",
		"full_name": "Weather",
		"type": "numeric",
		"is_objective": true,
		"goal": "min",
		"format": "number:0 | taPrefix:'$'",
		"description": "Weather conditions for wheat"
	},
	{
		"key": "soil",
		"full_name": "Soil",
		"type": "numeric",
		"is_objective": true,
		"range": { "low": 5, "high": 20 },
		"goal": "max",
		"format": "number:0 | taPrefix:'$'",
		"description": "Manufacturer's Suggested Retail Price (MSRP)"
	},
	{
		"key": "vehicles",
		"full_name": "Vehicles",
		"type": "numeric",
		"is_objective": true,
		"goal": "max",
		"range": { "low": 2, "high": 6 },
		"format": "number:0 | taPrefix:'$'",
		"description": "Manufacturer's Suggested Retail Price (MSRP)"
	},
	{
		"key": "rotValue",
		"full_name": "Rotation value",
		"type": "numeric",
		"is_objective": true,
		"goal": "max",
		"range": { "low": 3, "high": 20 },
		"format": "number:0 | taPrefix:'$'",
		"description": "Manufacturer's Suggested Retail Price (MSRP)"
	}]
};
    /*
    OPTION ITEM
    {
      "key": 401583116,
      "name": "Acura TLX",
      "description": "Technology Package 4dr Sedan (2.4L 4cyl 8AM)",
      "values": {
        "price": 35750,
        "engineSize": 2.4,
        "power": 206,
        "MPGCombined": 29,
        "averageRating": 4.429,
        "reviewsCount": 14
      }
    },
    */
//calculate norm. weather measures for the 3 crops
var wW = Math.abs(10 - weather);
var wM = Math.abs(15 - weather);
var wR = Math.abs(20 - weather);
var current_rotation = 'mmw';
var current_rotation_value = 6;
var v = [7,2,1];
//var soil = 3;
var sW = 6;
var sM = 2;
var sR = 7;
var rotations = {
	"1": [5,[1,1,1], "wmr"],
	"2": [4,[1,1,1],"mrw"],
	"3": [4,[1,2,0],"mmw"],
	"4": [2.5,[0,2,1],"mmr"],
	"5": [1,[0,3,0],"mmm"],
	"6": [2,[2,1,0],"wwm"],
	"7": [2,[2,0,1],"wwr"],
	"8": [.5,[3,0,0],"www"],
	"9": [1.5,[0,1,2],"rrm"],
	"10": [2,[1,0,2],"rrw"],
	"11": [.5,[0,0,3],"rrr"]
};
var priority = Array(11);
// GENERAL
var i = 0;
for(var key in rotations){
    // Put initial stuff in option list
    priority[i] =rotations[key][0];
    i++;
}
//WEATHER
var i = 0;
for(var key in rotations){
	var weather_sum = 0;
	rotations[key].push([]);
	weather_sum += rotations[key][1][0] * wW;
	weather_sum += rotations[key][1][1] * wM;
	weather_sum += rotations[key][1][2] * wR;
	priority[i] -= weather_sum;
	rotations[key][3].push(weather_sum);
	i++;
}
// SOIL
var i = 0;
for(var key in rotations){
	var soil_sum = 0;
	rotations[key].push([]);
	soil_sum += rotations[key][1][0] * sW;
	soil_sum += rotations[key][1][1] * sM;
	soil_sum += rotations[key][1][2] * sR;
	priority[i] += soil_sum;
	rotations[key][4].push(soil_sum);
	i++;
}
//Vehicles
var i = 0;
for(var key in rotations){
	var v_sum = 0;
	rotations[key].push([]);
	v_sum += (rotations[key][1][0] * v[0] / 2);
	v_sum += rotations[key][1][1] * v[1] / 2;
	v_sum += rotations[key][1][2] * v[2] / 2;
	priority[i] += v_sum;
	rotations[key][5].push(v_sum);
	i++;
}
options = [];
// CREATE OPTIONS ARRAY FROM ROTATIONS!
var i = 0
for(var key in rotations){
	options.push({
		"key": i,
		"name": rotations[key][2],
		"description": "Crop Rotation + params",
		"values": {
			"weather" : rotations[key][3][0],
			"soil" : rotations[key][4][0],
			"vehicles" : rotations[key][5][0],
			"rotValue" : rotations[key][0]
		}
	});
	i++;
}
// add options to data
data["options"] = options;
var max = priority.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
//SEND IT TO THE TRADEOFF FUN!
var watson = require('watson-developer-cloud');

var tradeoff_analytics = watson.tradeoff_analytics({
	password: "5Sl6rzaj8lBO",
	username: "f86f1c87-dab1-4838-a54d-9dbfe6a19e57",
	version: 'v1'
});

var res = [];
tradeoff_analytics.dilemmas(data, function(error, resolution) {
	console.log(resolution);
	resolution["resolution"]["solutions"].forEach(function(entry){
		if(entry["status"] == "FRONT"){
			res.push(entry["solution_ref"]);
		}
	});
});

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('start', { title: 'Express' });
});

router.get('/main', function(req, res, next) {
	res.render('main', { title: [rotations, res, max] });
});

router.post('/userdata', function(req, res, next) {
	db.insert(req.body);
});

module.exports = router;

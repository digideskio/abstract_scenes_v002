var hitID = '';
var assignmentID = '';
var workerID = '';
var curScene = 0;

// Xinlei instruction example related
var ex_total_options = {
                        "Park": 960,
                        "Living": 930
                        }
var EX_TOTAL = 6;

// Part of Xinlei's instruction example
// EX_TOTAL = sceneConfigData[sceneTypeList[curScene]].exTotal;
        
var RandomFactor = 0.9999; // Try to remove

// SA: TODO Add these to scene_config.json!
var DEFAULT_ZSIZE = 2;
var IMG_PAD_NUM = 2; // How many zeros to pad image-related names
var MIN_NUM_OBJ = 6; // How many clipart objects they need to use.
var MIN_PER_TYPE = 1; // How many clipart of each type is required. Currently not used.
var NOT_USED = -10000;
var NUM_ZSCALES = 5;
var NUM_DEPTH0 = 3;
var NUM_DEPTH1 = 10;
var NUM_FLIP = 2;

// Keep for Xinlei's examples
var exampleBaseURL = "http://ladoga.graphics.cs.cmu.edu/xinleic/genSents/Interface/";

// Current interface location
// var baseURL = "./"
var baseURL = "http://vision.ece.vt.edu/abstract_scenes_v002/site/";
var baseURL = './'
var baseURLInterface = baseURL + "../interface/";
var dataURL = baseURL + "../data/";

var restrictInputStr = decode(gup("restrictInput"));

if (restrictInputStr == "") {
    restrictInput = true;
} else {
    if (restrictInputStr != "0") {
        restrictInput = true;
    } else {
        restrictInput = false;
    }
}

// Maybe want to parse list of scene types in the future
var sceneTypeList = [];
var sceneTypeStr = decode(gup("sceneType"));

if (sceneTypeStr == "") {
    sceneType = "Living";
} else {
    sceneType = sceneTypeStr;
}

var numScenesStr = decode(gup("numScenes"));
var numScenes;
if (numScenesStr == "") {
    // Default "demo" settings
    numScenes = 3;
    sceneTypeList = ["Living", "Park", "Living"];
    
} else {
    numScenes = Number(numScenesStr);

    for (var i = 0; i < numScenes; i++) {
        sceneTypeList.push(sceneType);
    }
}

curSceneType = sceneTypeList[0];
var titleStr;
if (curSceneType == "Park") {
    titleStr = curSceneType
} else {
    titleStr = "Living/Diving Room";
}
    
var randInitStr = decode(gup("randInit"));
var randInit = true;
if (randInitStr == "") {
    randInit = true;
} else {
    if ( randInitStr == "0") {
        randInit = false;
    } else {
        randInit = true;
    }
}

// Contain all scene objects, which each will contain all info (and more) 
// needed to render an image or load it back into the interface later
var sceneData = Array(numScenes);

// ===========================================================
// Functions to help parse the URL query string for AMT data
// ===========================================================
function gup(name) {
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var tmpURL = window.location.href;
    var results = regex.exec(tmpURL);
    if (results == null) {
        return "";
    } else {
        return results[1];
    }
}

function decode(strToDecode) {
    var encoded = strToDecode;
    return unescape(encoded.replace(/\+/g, " "));
}

function get_random_int(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function zero_pad(num, numZeros) {
    var n = Math.abs(num);
    var zeros = Math.max(0, numZeros - Math.floor(n).toString().length );
    var zeroString = Math.pow(10,zeros).toString().substr(1);
    if( num < 0 ) {
        zeroString = '-' + zeroString;
    }

    return zeroString+n;
}

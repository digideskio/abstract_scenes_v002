// HIT-related Info
var init_time = $.now();
var hitID = '';
var assignmentID = '';
var workerID = '';
var submitAction; // Value set in the main HTML JS

// Xinlei instruction example related
var EX_TOTAL;
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

var curScene = 0;

// Keep for Xinlei's examples
var exampleBaseURL = "http://ladoga.graphics.cs.cmu.edu/xinleic/genSents/Interface/";

// Current interface location
// var baseURL = "./"
var baseURL = "http://vision.ece.vt.edu/abstract_scenes_v002/site/";
var baseURLInterface = baseURL + "../interface/";
var dataURL = baseURL + "../data/";

// Contain all scene objects, which each will contain all info (and more) 
// needed to render an image or load it back into the interface later
var sceneData = Array(numScenes);

var NUM_TABS;
// Names of the object types (e.g., smallObject)
// in a defined order that governs their index
// into availableObject
var objectTypeOrder;
// objectType name -> idx for menu stuff
var objectTypeToIdx; 
var numObjTypeShow;

 // Start off on which tab? Set in scene config file.
var selectedTab;
var selectedTabIdx;

var curLoadAll;
var numAvailableObjects = 0; // Gets updated in store_json_and_init
// Array with start index of different categories
var clipartIdxStart;

// Contain all scene objects, which each will contain all info (and more) 
// needed to render an image or load it back into the interface later
var sceneData = Array(numScenes);
// Data for the current (rendered) scene
var curSceneData;
var curAvailableObj;
var curUserSequence = {};
var curClipartImgs = [];
var curPeopleExprImgs = [];
var curDepth0Used;
var curDepth1Used;

//
// global variables for the page
////// MULTIPLE OBJECTS FOR THE CURRENT SCENE ///////
// Various variables setting up the appearence of the interface
var CANVAS_WIDTH = 700;
var CANVAS_HEIGHT = 400;
var CANVAS_ROW = 106;
var CANVAS_COL = 20;
var TAB_WIDTH = 334;
var TAB_HEIGHT = 62;
var CLIPART_WIDTH = TAB_WIDTH;
var CLIPART_HEIGHT = CANVAS_HEIGHT;
var CLIPART_ROW = CANVAS_ROW;
var CLIPART_COL = CANVAS_WIDTH + 50;
var CLIPART_BUFFER = 10;
// the row of canvas and the buffer, looks like the starting point
var ATTR_ROW = CANVAS_ROW + CANVAS_HEIGHT + CLIPART_BUFFER; 
var ATTR_COL = CANVAS_COL; // so row should be the vertial direction
var ATTR_WIDTH = 700;
var ATTR_HEIGHT = 82;
var ATTR2_ROW = ATTR_ROW + ATTR_HEIGHT + CLIPART_BUFFER;
var ATTR2_COL = CANVAS_COL;
var ATTR2_WIDTH = 700;
var ATTR2_HEIGHT = 82;
// Grid size of shown clipart objects
var NUM_CLIPART_VERT = 5;
var NUM_CLIPART_HORZ = 4;
var CLIPART_SKIP = (CLIPART_HEIGHT - CLIPART_BUFFER) / NUM_CLIPART_VERT;
var CLIPART_SIZE = CLIPART_SKIP - 2 * CLIPART_BUFFER;
// Number of clip art to show of the other objects
var CLIPART_OBJECT_COL = CLIPART_COL + CLIPART_SKIP * NUM_CLIPART_HORZ + 24;
// Button size
var SCALE_COL = 97;
var SCALE_ROW = 65;
var SCALE_WIDTH = 170;
var SCALE_HEIGHT = 29;
var FLIP_COL = 350;
var FLIP_ROW = 54;
var ScaleSliderDown = false;
var wasOnCanvas = false;

var i, j, k, l, m;
var bgImg;
var selectedImg;
var buttonImg;
var tabsImg;
var objectBoxImg;
var titleImg;
var attrBoxImg;
var attr2BoxImg;
var slideBarImg;
var slideMarkImg;
var noLeftImg;
var numBorderImg;
var canvas_fix;
var ctx;
var image_name;
var category_name;
var selectedIdx = NOT_USED;
var selectedIns = NOT_USED; // newly added
var lastIdx = NOT_USED;
var lastIns = NOT_USED; // newly added
var lastX = NOT_USED;
var lastY = NOT_USED;
var lastZ = NOT_USED; // newly added
var moveClipart = false;
var mouse_offset_X = 0;
var mouse_offset_Y = 0;

//current location
var cx = 0;
var cy = 0;
var buttonW = 0;
var buttonH = 0;

// get response from keyboard
var CTRL_DOWN = false;

// ===========================================================
// Top-level initialization of the website and canvas
// ===========================================================
function init() {
    
    $("#dialog-modal").dialog({
        autoOpen: false,
        height: 250,
        modal: true,
        buttons: {
            'OK':function() {
                $( this ).dialog( "close" );
            },
        }
    });
    add_dialog();
    $("#dialog-modal" ).hide();
    $('#next').bind('click', function() {next();});
    $('#prev').bind('click', function() {prev();});

    // Setup the HTML canvas that the entire interactive part will be displayed on
    canvas_fix = document.getElementById("scene_canvas");
    ctx = canvas_fix.getContext("2d");

    canvas_fix.onmousemove = mousemove_canvas;
    canvas_fix.onmousedown = mousedown_canvas;
    canvas_fix.onmouseup = mouseup_canvas;
    document.onkeydown = handle_key_down;
    document.onkeyup = handle_key_up;

    
    // Load all of the images for menus
    selectedImg = new Image();
    selectedImg.src = baseURLInterface + 'selected.png';
    buttonImg = new Image();
    buttonImg.src = baseURLInterface + 'buttons.png';
    titleImg = new Image();
    titleImg.src = baseURLInterface + 'title.png';
    tabsImg = new Image();
    tabsImg.src = baseURLInterface + 'tabs.png';
    objectBoxImg = new Image();
    objectBoxImg.src = baseURLInterface + 'objectBox.png';
    attrBoxImg = new Image();
    attrBoxImg.src = baseURLInterface + 'attrBox.png';
    attr2BoxImg = new Image();
    attr2BoxImg.src = baseURLInterface + 'attrBox.png';
    slideBarImg = new Image();
    slideBarImg.src = baseURLInterface + 'slidebar.png';
    slideMarkImg = new Image();
    slideMarkImg.src = baseURLInterface + 'slidemark.png';
    noLeftImg = new Image();
    noLeftImg.src = baseURLInterface + 'noleft1.png';
    numBorderImg = new Image();
    numBorderImg.src = baseURLInterface + 'num.png';
    
    // Call draw_canvas() when respective img is dled
    buttonImg.onload = draw_canvas;
    // selectedImg.onload = draw_canvas;
    titleImg.onload = draw_canvas;
    tabsImg.onload = draw_canvas;
    objectBoxImg.onload = draw_canvas;
    attrBoxImg.onload = draw_canvas;
    attr2BoxImg.onload = draw_canvas;
    slideBarImg.onload = draw_canvas;
    slideMarkImg.onload = draw_canvas;
    // noLeftImg.onload = draw_canvas;
    // numBorderImg.onload = draw_canvas;

    reset_scene();
    draw_canvas();
}

function reset_scene() {
    curSceneData = sceneData[curScene];
    curSceneType = sceneTypeList[curScene];
    
    if (curSceneType == "Park") {
        titleStr = curSceneType
    } else {
        titleStr = "Living/Diving Room";
    }
    
    document.getElementById('titleScene').innerHTML = titleStr;
    document.getElementById('counter').innerHTML = "Scene " + (curScene+1) + 
                                                    "/" + numScenes;
    if (document.getElementById('examplesToggle').value == 'Hide Instructions' ) {
        document.getElementById('minNumClipart').innerHTML = MIN_NUM_OBJ + " piece" + ( (MIN_NUM_OBJ==1) ? "" : "s");
    }
    
    must_init_before_render();
//     select_good();
    
    curZScale = Array(NUM_ZSCALES);
    curZScale[0] = 1.0;
    for (i = 1; i < NUM_ZSCALES; i++) {
        curZScale[i] = curZScale[i - 1] * sceneConfigData[sceneTypeList[curScene]].zSizeDecay;
    }
    
    clipartIdxStart = []
    clipartIdxStart.push(0);
    for (i = 1; i < objectTypeOrder.length; i++) {
        clipartIdxStart.push(numObjTypeShow[objectTypeOrder[i-1]] + clipartIdxStart[i - 1]); // just for indexing, mark the starting point of each
    }

    selectedIdx = NOT_USED;
    selectedIns = NOT_USED;
    moveClipart = false;
    mouse_offset_X = 0;
    mouse_offset_Y = 0;
    
    // Load the background of the scene
    bgImg = new Image();
    // SA: TODO Need to deal with baseURLInterface path
    bgImg.src = baseURLInterface + 
                sceneConfigData[curSceneType].baseDir+ "/" 
                + sceneConfigData[curSceneType].bgImg;
    bgImg.onload = draw_canvas;
    
    if (curSceneData != undefined) { // Scene exists from current session
        
        curAvailableObj = curSceneData.availableObjects;
        curClipartImgs = curSceneData.clipartImgs;
        curPeopleExprImgs = curSceneData.peopleExprImgs;
        curUserSequence = curSceneData.userSequence;
        curLoadAll = curSceneData.loadAll;
        curDepth0Used = curSceneData.depth0Used;
        curDepth1Used = curSceneData.depth1Used;
        curSceneType = curSceneData.sceneType;
        
    } else { // Randomly or from previous JSON initialization
        // SA: TODO Make it easy to load existing scenes from JSON.
        // This will require us to load the images again, but not other data.
        
        curLoadAll = Array(numObjTypeShow["human"]); // flag if to have load all
        for (i = 0; i < curLoadAll.length; i++) {
            curLoadAll[i] = 0;
        }
        
        if (randInit) {
            random_obj_init();
        } else { // From previous JSON object
            // SA: TODO Add support for initializing
            // from old/previous HIT JSON object
        }
        
        // SA: TODO Should probably wrap this in a nice class initialization or something
        curSceneData.availableObjects = curAvailableObj;
        curSceneData.clipartImgs = curClipartImgs;
        curSceneData.peopleExprImgs = curPeopleExprImgs;
        curSceneData.loadAll = curLoadAll;
        curSceneData.userSequence = curUserSequence;
        curSceneData.depth0Used = curDepth0Used;
        curSceneData.depth1Used = curDepth1Used;
        curSceneData.sceneType = curSceneType;
        
        // Load the clip art images
        for (i = 0; i < numObjTypeShow['human']; i++) {
            curLoadAll[i] = 0; // set the variable to be zero
            curClipartImgsIdx = curAvailableObj[i].instance[0].poseID*curAvailableObj[i].instance[0].numExpression + 
                                curAvailableObj[i].instance[0].expressionID;
            curClipartImgs[i] = Array(curAvailableObj[i].instance[0].numPose * curAvailableObj[i].instance[0].numExpression); // two dimensional array
            curClipartImgs[i][curClipartImgsIdx] = new Image();
            curClipartImgs[i][curClipartImgsIdx].src = 
                baseURLInterface + 
                objectData['human'].baseDirectory + "/" +
                curAvailableObj[i].instance[0].name +
                zero_pad(curAvailableObj[i].instance[0].styleID+1, IMG_PAD_NUM) + "/" + 
                zero_pad(curAvailableObj[i].instance[0].poseID+1, IMG_PAD_NUM) + 
                zero_pad(curAvailableObj[i].instance[0].expressionID+1, IMG_PAD_NUM) + 
                '.png';

            curPeopleExprImgs[i] = Array(curAvailableObj[i].instance[0].numExpression);
            curPeopleExprImgs[i][curAvailableObj[i].instance[0].expressionID] = new Image();
            curPeopleExprImgs[i][curAvailableObj[i].instance[0].expressionID].src = 
                baseURLInterface + 
                objectData['human'].baseDirectory + "/" +            
                curAvailableObj[i].instance[0].name +
                zero_pad(curAvailableObj[i].instance[0].expressionID+1, IMG_PAD_NUM) + 
                '.png';
        }

        // now for the rest of the objects
        // SA: TODO Fix this so it doesn't assume order on human/animal/etc.
        for (i = numObjTypeShow['human']; i < numAvailableObjects; i++) {
            curClipartImgs[i] = Array(curAvailableObj[i].instance[0].numPose);
            for (j = 0; j < curAvailableObj[i].instance[0].numPose; j++) {
                curClipartImgs[i][j] = new Image();
                
                 // SA: TODO Generalize beyond current categories
                if (curAvailableObj[i].instance[0].type == "animal") {                
                    curClipartImgs[i][j].src =  baseURLInterface + 
                            objectData[curAvailableObj[i].instance[0].type].baseDirectory + "/" +
                            curAvailableObj[i].instance[0].name + 
                            zero_pad(j+1, IMG_PAD_NUM) + '.png';
                } else { // Currently largeObject and smallObject
                    curClipartImgs[i][j].src = baseURLInterface + 
                        objectData[curAvailableObj[i].instance[0].type].baseDirectory[curAvailableObj[i].instance[0].baseDir] + 
                        "/" + curAvailableObj[i].instance[0].name + 
                        zero_pad(j+1, IMG_PAD_NUM) + '.png';
                }
            }
        }

        // Update the canvas once the images are loaded
        for (i = 0; i < numObjTypeShow['human']; i++) {
            curClipartImgsIdx = curAvailableObj[i].instance[0].poseID*curAvailableObj[i].instance[0].numExpression + 
                                curAvailableObj[i].instance[0].expressionID;
            curClipartImgs[i][curClipartImgsIdx].onload = draw_clipart;
            curPeopleExprImgs[i][curAvailableObj[i].instance[0].expressionID].onload = draw_clipart;
        }

        for (i = numObjTypeShow['human']; i < numAvailableObjects; i++) {
            curClipartImgs[i][curAvailableObj[i].instance[0].poseID].onload = draw_clipart;
        }

        // then load all the images to be possibly displayed ?
        for (i = 0; i < numObjTypeShow['human']; i++) {
            var s;
            k = 0;
            for (j = 0; j < curAvailableObj[i].instance[0].numPose; j++) {   
                s = j * curAvailableObj[i].instance[0].numExpression;
                
                curClipartImgs[i][s] = new Image();
                curClipartImgs[i][s].src = 
                    baseURLInterface + 
                    objectData['human'].baseDirectory + "/" +
                    curAvailableObj[i].instance[0].name +
                    zero_pad(curAvailableObj[i].instance[0].styleID+1, IMG_PAD_NUM) + "/" +
                    zero_pad(j+1, IMG_PAD_NUM) +
                    zero_pad(k+1, IMG_PAD_NUM) + '.png';
            }

            // also load the expression only images
            for (j = 0; j <  curAvailableObj[i].instance[0].numExpression; j++) {
                if (curPeopleExprImgs[i][j] != undefined) { // already loaded
                    continue;
                }
                curPeopleExprImgs[i][j] = new Image();
                curPeopleExprImgs[i][j].src = 
                    baseURLInterface + 
                    objectData['human'].baseDirectory + "/" +            
                    curAvailableObj[i].instance[0].name +
                    zero_pad(j+1, IMG_PAD_NUM) + '.png';
            }

            curLoadAll[i] = 1; // set the variable to be true
        }

        // do not need for curPeopleExprImgs because they are displayed later

        // set onload
        for (i = 0; i < numObjTypeShow['human']; i++) {
            var s;
            k = 0;
            for (j = 0; j <  curAvailableObj[i].instance[0].numPose; j++) {
                if (curClipartImgs[i][s] != undefined) { // already loaded
                    continue;
                }
                s = j * curAvailableObj[i].instance[0].numExpression;
                curClipartImgs[i][s].onload = draw_clipart;
            }
        
            // also load the expression only images
            for (j = 0; j <  curAvailableObj[i].instance[0].numExpression; j++) {
                if (curPeopleExprImgs[i][j] != undefined) { // already loaded
                    continue;
                }
                curPeopleExprImgs[i][j].onload = draw_clipart;
            }
        }
    }
}

function random_obj_init() {
       
    curSceneData = {};
    curAvailableObj = [];
    curClipartImgs = Array(numAvailableObjects);
    curPeopleExprImgs = Array(numObjTypeShow['human']);
    curUserSequence = { selectedIdx: [],
                        selectedIns: [],
                        present: [],
                        poseID: [],
                        expressionID: [],
                        x: [],
                        y: [],
                        z: [],
                        flip: [],
                        depth1: []
                      };

    curDepth0Used = Array(NUM_DEPTH0);
    curDepth1Used = Array(NUM_DEPTH1);
    
    for (i = 0; i < NUM_DEPTH0; i++) {
        curDepth0Used[i] = 0;
    }
    
    for (i = 0; i < NUM_DEPTH1; i++) {
        curDepth1Used[i] = 0;
    }
    
    var curIdx = 0; // Keep track of how many objects are being added
    for (var objectType in objectData) {
        if (objectData.hasOwnProperty(objectType)) {
            curObjectType = objectData[objectType];
            numSelObj = numObjTypeShow[curObjectType.objectType];
            var validIdxs = [];
            for ( var k = 0; k < curObjectType.type.length; k++ ) {
                for ( var m = 0; m < curObjectType.type[k].availableScene.length; m++ ) {
                    if ( curObjectType.type[k].availableScene[m].scene == curSceneType ) {
                        validIdxs.push([k, m])
                    }
                }
            }
            var numValidTypes = validIdxs.length;
            
            for ( var j = 0; j < numSelObj; j++ ) {
                var found = true;
                while (found) {
                    idxType = get_random_int(0, numValidTypes);
                    idxValidType = validIdxs[idxType][0];
                    idxScene = validIdxs[idxType][1];
                    
                    found = false;
                    for (var idxFound = 0; idxFound < curIdx; idxFound++) {
                        if (curAvailableObj[idxFound].instance[0].name == curObjectType.type[idxValidType].name 
                            && curAvailableObj[idxFound].instance[0].type == curObjectType.objectType) {
                            found = true;
                            break;
                        }
                    }
                }
                
                var objs = []; // Array of all individual instances
                var numTotalInstance = curObjectType.type[idxValidType].availableScene[idxScene].numInstance;
                for ( var k = 0; k < numTotalInstance; k++ ) {
                    
                    idxPose = get_random_int(0, curObjectType.type[idxValidType].numPose);
                    var objInstance = {};
                    objInstance.type = curObjectType.objectType;
                    objInstance.name = curObjectType.type[idxValidType].name;
                    objInstance.numPose = curObjectType.type[idxValidType].numPose;
                    objInstance.poseID = idxPose;
                    objInstance.instanceID = k;
                    objInstance.present = false;
                    objInstance.x = NOT_USED;
                    objInstance.y = NOT_USED;
                    objInstance.z = DEFAULT_ZSIZE;
                    objInstance.flip = get_random_int(0, NUM_FLIP);
                    objInstance.depth0 = curObjectType.type[idxValidType]
                        .availableScene[idxScene].depth0;
                    objInstance.depth1 = curObjectType.type[idxValidType]
                        .availableScene[idxScene].depth1;
                    
                    // Currently, only humans have additional fields/aren't consistent with others
                    if ( curObjectType.objectType == "human" ) {
                        idxStyle = get_random_int(0, curObjectType.type[idxValidType].numStyle);
                        objInstance.numStyle = curObjectType.type[idxValidType].numStyle;
                        objInstance.styleID = idxStyle;
                        objInstance.numExpression = curObjectType.type[idxValidType].numExpression;
                        objInstance.expressionID = 0; // No face
                    } else if (curObjectType.objectType == "largeObject" || curObjectType.objectType == "smallObject") {
                        // SA: Do we want this at instance-level?
                        objInstance.baseDir = curObjectType.type[idxValidType].baseDir;
                    }
                    
                    curDepth0Used[objInstance.depth0]++; // just the count
                    curDepth1Used[objInstance.depth1]++;
                    
                    objs.push(objInstance);
                }
                
                
                var oneObjectType = {};
                // SA: TODO Move numPose/numExpression stuff into here now or keep it on an instance level?
                // We might want the flexibility of per instance later (if other style/pose settings can change).
                oneObjectType.numInstance = numTotalInstance;
                oneObjectType.smallestUnusedInstanceIdx = 0;
                oneObjectType.instance = objs;
                curAvailableObj.push(oneObjectType);
                curIdx++;
            }
        }
    }
}

// ===========================================================
// Functions to render the abstract scenes
// ===========================================================
// draw canvas
function draw_canvas() {
    CANVAS_WIDTH = bgImg.width;
    CANVAS_HEIGHT = bgImg.height;
    TAB_WIDTH = tabsImg.width;
    TAB_HEIGHT = tabsImg.height / NUM_TABS;
    ATTR_ROW = CANVAS_ROW + CANVAS_HEIGHT + CLIPART_BUFFER;
    ATTR_COL = CANVAS_COL;
    ATTR_WIDTH = CANVAS_WIDTH + TAB_WIDTH + 8;
    ATTR_HEIGHT = CLIPART_SKIP + 2 * CLIPART_BUFFER;
    ATTR2_ROW = ATTR_ROW + ATTR_HEIGHT + CLIPART_BUFFER / 2;
    ATTR2_COL = CANVAS_COL;
    ATTR2_WIDTH = CANVAS_WIDTH + TAB_WIDTH + 8;
    ATTR2_HEIGHT = ATTR_HEIGHT;
    CLIPART_WIDTH = objectBoxImg.width;
    CLIPART_HEIGHT = CANVAS_HEIGHT;
    CLIPART_COL = CANVAS_COL + CANVAS_WIDTH + CLIPART_BUFFER;
    CLIPART_ROW = CANVAS_ROW;
    SIZE_HEIGHT = slideMarkImg.height;
    
    //draw the image
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    draw_scene();
    draw_clipart();
    draw_buttons();
}

function draw_scene() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas_fix.width, canvas_fix.height);

    ctx.drawImage(bgImg, CANVAS_COL, CANVAS_ROW, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Make sure we get the depth ordering correct (render the objects using their depth order)
    for (k = NUM_DEPTH0 - 1; k >= 0; k--) {
        if (curDepth0Used[k] <= 0) { // not used, just to accelerate the process
            continue;
        }
        for (j = NUM_ZSCALES - 1; j >= 0; j--) {
            // for people, choose both the expression and the pose
            for (l = NUM_DEPTH1 - 1; l >= 0; l--) {
                if (curDepth1Used[l] <= 0) { // not used, just to accelerate the process
                    continue;
                }
                
                for (i = 0; i < numObjTypeShow['human']; i++) {
                    if (curAvailableObj[i].instance[0].depth0 == k) {
                        for (m = 0; m < curAvailableObj[i].numInstance; m++) {
                            if (curAvailableObj[i].instance[m].present == true && 
                                curAvailableObj[i].instance[m].z == j && 
                                curAvailableObj[i].instance[m].depth1 == l) {
                                
                                var scale = curZScale[curAvailableObj[i].instance[m].z]
                                var indexP = curAvailableObj[i].instance[m].poseID*curAvailableObj[i].instance[m].numExpression +
                                             curAvailableObj[i].instance[m].expressionID;
                                var w = curClipartImgs[i][indexP].width;
                                var h = curClipartImgs[i][indexP].height;

                                var rowOffset = -h / 2;
                                var colOffset = -w / 2;
                                rowOffset *= scale;
                                colOffset *= scale;

                                if (curAvailableObj[i].instance[m].flip == 0) {
                                    ctx.drawImage(curClipartImgs[i][indexP], 0, 0, w, h, 
                                                  curAvailableObj[i].instance[m].x + colOffset + CANVAS_COL, 
                                                  curAvailableObj[i].instance[m].y + rowOffset + CANVAS_ROW, 
                                                  w * scale, h * scale);
                                } else if (curAvailableObj[i].instance[m].flip == 1) {
                                    ctx.setTransform(-1, 0, 0, 1, 0, 0);
                                    ctx.drawImage(curClipartImgs[i][indexP], 0, 0, w, h, 
                                                  -curAvailableObj[i].instance[m].x + colOffset - CANVAS_COL, 
                                                  curAvailableObj[i].instance[m].y + rowOffset + CANVAS_ROW, 
                                                  w * scale, h * scale);
                                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                                }
                            }
                        }
                    }
                }

                // remain the same for objects
                for (i = numObjTypeShow['human']; i < numAvailableObjects; i++) {
                    if (curAvailableObj[i].instance[0].depth0 == k) {
                        for (m = 0; m < curAvailableObj[i].numInstance; m++) {
                            if (curAvailableObj[i].instance[m].present == true && curAvailableObj[i].instance[m].z == j && curAvailableObj[i].instance[m].depth1 == l) {
                                var scale = curZScale[curAvailableObj[i].instance[m].z];

                                var w = curClipartImgs[i][curAvailableObj[i].instance[m].poseID].width;
                                var h = curClipartImgs[i][curAvailableObj[i].instance[m].poseID].height;

                                var rowOffset = -h / 2;
                                var colOffset = -w / 2;
                                rowOffset *= scale;
                                colOffset *= scale;

                                if (curAvailableObj[i].instance[m].flip == 0) {
                                    ctx.drawImage(curClipartImgs[i][curAvailableObj[i].instance[m].poseID], 0, 0, w, h, curAvailableObj[i].instance[m].x + colOffset + CANVAS_COL, curAvailableObj[i].instance[m].y + rowOffset + CANVAS_ROW, w * scale, h * scale);
                                } else if (curAvailableObj[i].instance[m].flip == 1) {
                                    ctx.setTransform(-1, 0, 0, 1, 0, 0);
                                    ctx.drawImage(curClipartImgs[i][curAvailableObj[i].instance[m].poseID], 0, 0, w, h, -curAvailableObj[i].instance[m].x + colOffset - CANVAS_COL, curAvailableObj[i].instance[m].y + rowOffset + CANVAS_ROW, w * scale, h * scale);
                                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CANVAS_COL, canvas_fix.height);
    ctx.fillRect(0, 0, CANVAS_COL + CANVAS_WIDTH, CANVAS_ROW);
    ctx.fillRect(CANVAS_COL + CANVAS_WIDTH, 0, CLIPART_COL, canvas_fix.height);
    ctx.fillRect(0, CANVAS_ROW + CANVAS_HEIGHT, CLIPART_COL, canvas_fix.height);

    ctx.fillStyle = 'grey';
    ctx.fillRect(0, 10, canvas_fix.width, 5);

    ctx.drawImage(titleImg, CANVAS_COL, 15);
}

function draw_clipart() {
    var w = tabsImg.width;
    var h = tabsImg.height / NUM_TABS;

    ctx.drawImage(tabsImg, 0, h * selectedTabIdx, w, h, CLIPART_COL, CLIPART_ROW - TAB_HEIGHT + 10, w, h);
    ctx.drawImage(objectBoxImg, 0, 0, objectBoxImg.width, objectBoxImg.height, CLIPART_COL, CLIPART_ROW, CLIPART_WIDTH, CLIPART_HEIGHT);
    ctx.drawImage(attrBoxImg, 0, 0, attrBoxImg.width, attrBoxImg.height, ATTR_COL, ATTR_ROW, ATTR_WIDTH, ATTR_HEIGHT);
    ctx.drawImage(attr2BoxImg, 0, 0, attr2BoxImg.width, attr2BoxImg.height, ATTR2_COL, ATTR2_ROW, ATTR2_WIDTH, ATTR2_HEIGHT);
        
    curType = objectData[selectedTab].objectType;
   
    for (r = 0; r < NUM_CLIPART_VERT; r++) {
        for (c = 0; c < NUM_CLIPART_HORZ; c++) {
            var idx = r * NUM_CLIPART_HORZ + c;

            // Only do something if there is an object of that type for selected idx 
            if ( idx < numObjTypeShow[curType] ) {
                idx += clipartIdxStart[selectedTabIdx]; // to that page
                if (selectedIdx == idx) { // Draws the "select" box background
                    ctx.drawImage(selectedImg, CLIPART_COL + c * CLIPART_SKIP + CLIPART_BUFFER / 2, CLIPART_ROW + r * CLIPART_SKIP + CLIPART_BUFFER / 2, CLIPART_SKIP, CLIPART_SKIP);
                }
                
                var indexCR;
                var left = 1;
                var Size = 13;
                var locationOffset = 11;

                if ( curType == "human" ) {

                    if (curAvailableObj[idx].smallestUnusedInstanceIdx < curAvailableObj[idx].numInstance) {
                        indexCR = curAvailableObj[idx].instance[curAvailableObj[idx].smallestUnusedInstanceIdx].expressionID;
                    } else {
                        ctx.drawImage(noLeftImg, 
                                      CLIPART_COL + c * CLIPART_SKIP + CLIPART_BUFFER / 2, 
                                      CLIPART_ROW + r * CLIPART_SKIP + CLIPART_BUFFER / 2, 
                                      CLIPART_SKIP, CLIPART_SKIP);
                        continue;
                    }

                    if (typeof curPeopleExprImgs[idx] == "undefined") { // just sometimes it is not even loaded yet...
                        continue;
                    }

                    for (i = curAvailableObj[idx].smallestUnusedInstanceIdx + 1; i < curAvailableObj[idx].numInstance; i++) {
                        if (curAvailableObj[idx].instance[i].present == false) {
                            left++;
                        }
                    }
                    
                    var w = curPeopleExprImgs[idx][indexCR].width;
                    var h = curPeopleExprImgs[idx][indexCR].height;
                    
                    var newW = Math.min(w, CLIPART_SIZE * w / Math.max(w, h));
                    var newH = Math.min(h, CLIPART_SIZE * h / Math.max(w, h));

                    var rowOffset = (CLIPART_SIZE - newH) / 2 + CLIPART_BUFFER / 2;
                    var colOffset = (CLIPART_SIZE - newW) / 2 + CLIPART_BUFFER / 2;
                    var xo = CLIPART_COL + c * CLIPART_SKIP + CLIPART_BUFFER + colOffset;
                    var yo = CLIPART_ROW + r * CLIPART_SKIP + CLIPART_BUFFER + rowOffset;

                    ctx.drawImage(curPeopleExprImgs[idx][indexCR], 0, 0, w, h, 
                                  Math.floor(xo), Math.floor(yo), newW, newH);
                    xo = CLIPART_COL + (c + 1) * CLIPART_SKIP - 1;
                    yo = CLIPART_ROW + (r + 1) * CLIPART_SKIP - locationOffset;
                    ctx.drawImage(numBorderImg, 
                                  Math.floor(xo - Size + 1), Math.floor(yo - Size + 1), Size, Size);

                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.font = '10pt Calibri';
                    ctx.fillStyle = "#444444";
                    var optionsW = ctx.measureText("0").width;
                    var optionsH = Size;
                    xo = CLIPART_COL + (c + 1) * CLIPART_SKIP;
                    yo = CLIPART_ROW + (r + 1) * CLIPART_SKIP;
                    ctx.fillText(left, Math.floor(xo - optionsW), Math.floor(yo - optionsH));
                    ctx.restore();
                    
                } else {
                    if (curAvailableObj[idx].smallestUnusedInstanceIdx < curAvailableObj[idx].numInstance) {
                        indexCR = curAvailableObj[idx].instance[curAvailableObj[idx].smallestUnusedInstanceIdx].poseID;
                    } else {
                        ctx.drawImage(noLeftImg, 
                                      CLIPART_COL + c * CLIPART_SKIP + CLIPART_BUFFER / 2, 
                                      CLIPART_ROW + r * CLIPART_SKIP + CLIPART_BUFFER / 2, 
                                      CLIPART_SKIP, CLIPART_SKIP);
                        continue;
                    }

                    if (typeof curClipartImgs[idx] == "undefined") { // just sometimes it is not even loaded yet...
                        continue;
                    }

                    for (i = curAvailableObj[idx].smallestUnusedInstanceIdx + 1; i < curAvailableObj[idx].numInstance; i++) {
                        if (curAvailableObj[idx].instance[i].present == false) {
                            left++
                        }
                    }

                    var w = curClipartImgs[idx][indexCR].width;
                    var h = curClipartImgs[idx][indexCR].height;
                    
                    var newW = Math.min(w, CLIPART_SIZE * w / Math.max(w, h));
                    var newH = Math.min(h, CLIPART_SIZE * h / Math.max(w, h));

                    var rowOffset = (CLIPART_SIZE - newH) / 2 + CLIPART_BUFFER / 2;
                    var colOffset = (CLIPART_SIZE - newW) / 2 + CLIPART_BUFFER / 2;
                    var xo = CLIPART_COL + c * CLIPART_SKIP + CLIPART_BUFFER + colOffset;
                    var yo = CLIPART_ROW + r * CLIPART_SKIP + CLIPART_BUFFER + rowOffset;

                    ctx.drawImage(curClipartImgs[idx][indexCR], 0, 0, w, h, 
                                  Math.floor(xo), Math.floor(yo), newW, newH);
                    xo = CLIPART_COL + (c + 1) * CLIPART_SKIP - 1;
                    yo = CLIPART_ROW + (r + 1) * CLIPART_SKIP - locationOffset;
                    ctx.drawImage(numBorderImg, 
                                  Math.floor(xo - Size + 1), Math.floor(yo - Size + 1), Size, Size);

                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.font = '10pt Calibri';
                    ctx.fillStyle = "#444444";
                    var optionsW = ctx.measureText("0").width;
                    var optionsH = Size;
                    xo = CLIPART_COL + (c + 1) * CLIPART_SKIP;
                    yo = CLIPART_ROW + (r + 1) * CLIPART_SKIP;
                    ctx.fillText(left, Math.floor(xo - optionsW), Math.floor(yo - optionsH));
                    ctx.restore();
                }
            }
        }
    }
    if (selectedIdx != NOT_USED) {
        if (selectedIdx < numObjTypeShow['human']) {
            // people
            for (i = 0; i < curAvailableObj[selectedIdx].instance[0].numPose; i++) {
                // just to show it is selected
                if (i == curAvailableObj[selectedIdx].instance[selectedIns].poseID) {
                    ctx.drawImage(selectedImg, 
                                  ATTR_COL + i * CLIPART_SKIP + CLIPART_BUFFER / 2, 
                                  ATTR_ROW + CLIPART_BUFFER, 
                                  CLIPART_SKIP, CLIPART_SKIP);
                }
                var indexP = i * curAvailableObj[selectedIdx].instance[0].numExpression

                var w = curClipartImgs[selectedIdx][indexP].width;
                var h = curClipartImgs[selectedIdx][indexP].height;

                var newW = Math.min(w, CLIPART_SIZE * w / Math.max(w, h));
                var newH = Math.min(h, CLIPART_SIZE * h / Math.max(w, h));

                var rowOffset = (CLIPART_SIZE - newH) / 2 + CLIPART_BUFFER / 2;
                var colOffset = (CLIPART_SIZE - newW) / 2 + CLIPART_BUFFER / 2;

                var xo = ATTR_COL + i * CLIPART_SKIP + CLIPART_BUFFER + colOffset;
                var yo = ATTR_ROW + CLIPART_BUFFER + rowOffset;

                // only draw the first one
                ctx.drawImage(curClipartImgs[selectedIdx][indexP], 0, 0, w, h, 
                              Math.floor(xo), Math.floor(yo), newW, newH);
            }
            // then expressions
            for (i = 1; i < curAvailableObj[selectedIdx].instance[0].numExpression; i++) {
                // just to show it is selected
                if (i == curAvailableObj[selectedIdx].instance[selectedIns].expressionID)
                    ctx.drawImage(selectedImg, 
                                  ATTR2_COL + (i - 1) * CLIPART_SKIP + CLIPART_BUFFER / 2, 
                                  ATTR2_ROW + CLIPART_BUFFER, 
                                  CLIPART_SKIP, CLIPART_SKIP);

                var w = curPeopleExprImgs[selectedIdx][i].width;
                var h = curPeopleExprImgs[selectedIdx][i].height;
                var newW = Math.min(w, CLIPART_SIZE * w / Math.max(w, h));
                var newH = Math.min(h, CLIPART_SIZE * h / Math.max(w, h));

                var rowOffset = (CLIPART_SIZE - newH) / 2 + CLIPART_BUFFER / 2;
                var colOffset = (CLIPART_SIZE - newW) / 2 + CLIPART_BUFFER / 2;

                var xo = ATTR2_COL + (i - 1) * CLIPART_SKIP + CLIPART_BUFFER + colOffset;
                var yo = ATTR2_ROW + CLIPART_BUFFER + rowOffset;

                // only draw the first one
                ctx.drawImage(curPeopleExprImgs[selectedIdx][i], 0, 0, w, h, Math.floor(xo), Math.floor(yo), newW, newH);
            }
        } else { // Not human
            for (i = 0; i < curAvailableObj[selectedIdx].instance[0].numPose; i++) {
                if (i == curAvailableObj[selectedIdx].instance[selectedIns].poseID) {
                    ctx.drawImage(selectedImg, 
                                  ATTR_COL + i * CLIPART_SKIP + CLIPART_BUFFER / 2, 
                                  ATTR_ROW + CLIPART_BUFFER, 
                                  CLIPART_SKIP, CLIPART_SKIP);
                }

                var w = curClipartImgs[selectedIdx][i].width;
                var h = curClipartImgs[selectedIdx][i].height;
                var newW = Math.min(w, CLIPART_SIZE * w / Math.max(w, h));
                var newH = Math.min(h, CLIPART_SIZE * h / Math.max(w, h));

                var rowOffset = (CLIPART_SIZE - newH) / 2 + CLIPART_BUFFER / 2;
                var colOffset = (CLIPART_SIZE - newW) / 2 + CLIPART_BUFFER / 2;

                var xo = ATTR_COL + i * CLIPART_SKIP + CLIPART_BUFFER + colOffset;
                var yo = ATTR_ROW + CLIPART_BUFFER + rowOffset;

                ctx.drawImage(curClipartImgs[selectedIdx][i], 0, 0, w, h, 
                              Math.floor(xo), Math.floor(yo), newW, newH);
            }
        }
    }
}

function draw_buttons() {
    buttonW = buttonImg.width / 2;
    buttonH = buttonImg.height / 5;
    w = buttonW;
    h = buttonH;

    if (w > 0 && h > 0) {
        var wMark = slideMarkImg.width;
        var hMark = slideMarkImg.height;
        var wSlide = slideBarImg.width;
        var hSlide = slideBarImg.height;

        ctx.drawImage(slideBarImg, 0, 0, wSlide, hSlide, 
                      CANVAS_COL + SCALE_COL, 
                      SCALE_ROW + (SCALE_HEIGHT - hSlide) / 2, 
                      SCALE_WIDTH, hSlide);
        if (selectedIdx != NOT_USED)
            ctx.drawImage(slideMarkImg, 0, 0, wMark, hMark, 
                          CANVAS_COL + SCALE_COL + 
                          curAvailableObj[selectedIdx].instance[selectedIns].z * (SCALE_WIDTH / (NUM_ZSCALES - 1)) - 
                          wMark / 2, 
                          SCALE_ROW, wMark, SCALE_HEIGHT);

        for (i = 0; i < 2; i++) {
            if (selectedIdx != NOT_USED) {
                if (i == curAvailableObj[selectedIdx].instance[selectedIns].flip) {
                    ctx.drawImage(buttonImg, w, (i + 3) * h, w, h, 
                                  i * w + CANVAS_COL + FLIP_COL, 
                                  FLIP_ROW, w, h);
                }
                else {
                    ctx.drawImage(buttonImg, 0, (i + 3) * h, w, h, 
                                  i * w + CANVAS_COL + FLIP_COL, 
                                  FLIP_ROW, w, h);
                }
            } else {
                ctx.drawImage(buttonImg, 0, (i + 3) * h, w, h, 
                              i * w + CANVAS_COL + FLIP_COL, 
                              FLIP_ROW, w, h);
            }
        }
    }
}

// ===========================================================
// Code to allow for mouse-based user interaction.
// Let's users drag-and-drop objects in/onto the scene,
// select object size, flip, pose, expression (for humans).
// ===========================================================
function mouseup_canvas(event) {
    moveClipart = false;

    if (selectedIdx >= 0) {
        // record the movement data
        if (selectedIdx != lastIdx || selectedIns != lastIns || 
                curAvailableObj[selectedIdx].instance[selectedIns].x != lastX || 
                curAvailableObj[selectedIdx].instance[selectedIns].y != lastY || 
                curAvailableObj[selectedIdx].instance[selectedIns].z != lastZ) {

            log_user_data("mouseup1");

            lastIdx = selectedIdx;
            lastIns = selectedIns;
            lastX = curAvailableObj[selectedIdx].instance[selectedIns].x;
            lastY = curAvailableObj[selectedIdx].instance[selectedIns].y;
            lastZ = curAvailableObj[selectedIdx].instance[selectedIns].z;
        }

        if (curAvailableObj[selectedIdx].instance[selectedIns].present == false) {
            // should find a smart way to deal with the pointer
            if (selectedIns < curAvailableObj[selectedIdx].smallestUnusedInstanceIdx) {
                curAvailableObj[selectedIdx].smallestUnusedInstanceIdx = selectedIns;
                curAvailableObj[selectedIdx].smallestUnusedInstanceIdx = selectedIns;
            }

            selectedIdx = NOT_USED;
            selectedIns = NOT_USED;
            log_user_data("mouseup2"); // SA: TODO Add? Doesn't seem to get triggered

            draw_canvas();
        }
    }

    ScaleSliderDown = false;
}

function mousedown_canvas(event) {
    
    // XL: Handle bug related to user moving outside of canvas
    // and letting object be lost to the void.
    if ( moveClipart == true ) {
        mouseup_canvas(event);
    }
    
    var ev = event || window.event;

    ScaleSliderDown = false;

    if (ev.pageX) {
        cx = ev.pageX;
    } else if (ev.clientX) {
        cx = ev.clientX;
        if (document.documentElement.scrollLeft) {
            cx += document.documentElement.scrollLeft;
        } else {
            cx += document.body.scrollLeft;
        }
    }
    
    if (ev.pageY) {
        cy = ev.pageY;
    } else if (ev.clientY) {
        cy = ev.clientY;
        if (document.documentElement.scrollTop) {
            cy += document.documentElement.scrollTop;
        } else {
            cy += document.body.scrollTop;
        }
    }
    // Select clipart object type using tabs
    var tabsX = cx - CLIPART_COL - canvas_fix.offsetLeft;
    var tabsY = cy - (CLIPART_ROW - TAB_HEIGHT) - canvas_fix.offsetTop;

    if (tabsX < CLIPART_WIDTH && tabsX > 0 && tabsY < TAB_HEIGHT && tabsY > 0) {
        selectedTabIdx = Math.floor(tabsX / Math.floor(CLIPART_WIDTH / NUM_TABS));
        selectedTab = objectTypeOrder[selectedTabIdx];
        //log_user_data("tab"); // SA: TODO Add?
        draw_canvas();
    }

    // Select clipart objects to add to canvas
    var clipartX = cx - CLIPART_COL - canvas_fix.offsetLeft;
    var clipartY = cy - CLIPART_ROW - canvas_fix.offsetTop;

    if (clipartX < CLIPART_SKIP * NUM_CLIPART_HORZ && clipartX > 0 && 
            clipartY < CLIPART_SKIP * NUM_CLIPART_VERT && clipartY > 0) {

        selectedIdx = Math.floor(clipartY / CLIPART_SKIP);
        selectedIdx *= NUM_CLIPART_HORZ;
        selectedIdx += Math.floor(clipartX / CLIPART_SKIP);

        // SA: TODO Fix it so selectedTabIdx corresponds to objectTypeOrder
        // Currently, the menu positions are hardcoded (by the menu image), which is sub-optimal.
        if (selectedIdx < numObjTypeShow[objectTypeOrder[selectedTabIdx]]) {
            selectedIdx += clipartIdxStart[selectedTabIdx];

            if (curAvailableObj[selectedIdx].smallestUnusedInstanceIdx == curAvailableObj[selectedIdx].numInstance) {
                // deselect it
                selectedIdx = NOT_USED;
                selectedIns = NOT_USED;
            } else {
                for (i = curAvailableObj[selectedIdx].smallestUnusedInstanceIdx; i < curAvailableObj[selectedIdx].numInstance; i++) {
                    if (curAvailableObj[selectedIdx].instance[i].present == false) {
                        selectedIns = i;
                        // Find smallest unused instance index
                        for (j = i + 1; j < curAvailableObj[selectedIdx].numInstance && 
                                curAvailableObj[selectedIdx].instance[j].present == true; j++)
                            ;
                        curAvailableObj[selectedIdx].smallestUnusedInstanceIdx = j;
                        break;
                    }
                }

                mouse_offset_X = 0;
                mouse_offset_Y = 0;
                wasOnCanvas = false;
                moveClipart = true;
                // log_user_data("Transition to scene?"); // SA: TODO Add?
                draw_canvas();
            }
        }

        if (selectedIdx != NOT_USED && selectedTabIdx == 0 && curLoadAll[selectedIdx] == 1) {
            // should do some loading
            var s = 0;
            for (j = 0; j < curAvailableObj[selectedIdx].instance[0].numPose; j++) {
                s++; // for the first one
                for (k = 1; k < curAvailableObj[selectedIdx].instance[0].numExpression; k++) { // start with the first one
                    
                    if (j == curAvailableObj[selectedIdx].instance[selectedIns].poseID && 
                            curAvailableObj[selectedIdx].instance[selectedIns].expressionID == k) { // already loaded
                        s++;
                        continue;
                    }

                    curClipartImgs[selectedIdx][s] = new Image();
                    curClipartImgs[selectedIdx][s].src =
                        baseURLInterface + 
                        objectData['human'].baseDirectory + "/" +
                        curAvailableObj[selectedIdx].instance[selectedIns].name +
                        zero_pad(curAvailableObj[selectedIdx].instance[selectedIns].styleID+1, IMG_PAD_NUM) + "/" +
                        zero_pad(j+1, IMG_PAD_NUM) +
                        zero_pad(k+1, IMG_PAD_NUM) + '.png';
                    curClipartImgs[selectedIdx][s].onload = draw_canvas;
                    s++;
                }
            }
            curLoadAll[selectedIdx] = 2; // all loaded
        }
    }

    // Select clipart attributes
    var attrX = cx - ATTR_COL - canvas_fix.offsetLeft;
    var attrY = cy - ATTR_ROW - canvas_fix.offsetTop;

    if (selectedIdx != NOT_USED) {
        var numAttr = curAvailableObj[selectedIdx].instance[0].numPose;
        
        if (attrX < CLIPART_SKIP * numAttr && attrX > 0 && attrY < CLIPART_SKIP && attrY > 0) {
            curAvailableObj[selectedIdx].instance[selectedIns].poseID = Math.floor(attrX / CLIPART_SKIP);
            log_user_data("pose");
            draw_canvas();
        }
    }

    // Select the 2nd clipart attributes for people expressions
    var attr2X = cx - ATTR2_COL - canvas_fix.offsetLeft;
    var attr2Y = cy - ATTR2_ROW - canvas_fix.offsetTop;

    if (selectedIdx != NOT_USED) {
        var numAttr = curAvailableObj[selectedIdx].instance[0].numExpression; // the total number

        if (attr2X < CLIPART_SKIP * (numAttr - 1) && attr2X > 0 && attr2Y < CLIPART_SKIP && attr2Y > 0) {
            curAvailableObj[selectedIdx].instance[selectedIns].expressionID = Math.floor(attr2X / CLIPART_SKIP) + 1; 
            log_user_data("expression");
            draw_canvas();
        }
    }

    // Select clipart on the canvas
    var canvasX = cx - CANVAS_COL - canvas_fix.offsetLeft;
    var canvasY = cy - CANVAS_ROW - canvas_fix.offsetTop;

    if (canvasX < CANVAS_WIDTH && canvasX > 0 && canvasY < CANVAS_HEIGHT && canvasY > 0) {

        selectedIdx = NOT_USED;
        selectedIns = NOT_USED;

        // Make sure we get the depth ordering correct
        for (k = NUM_DEPTH0 - 1; k >= 0; k--) {
            if (curDepth0Used[k] <= 0) { // not used, just to accelerate the process
                continue;
            }
            
            for (j = NUM_ZSCALES - 1; j >= 0; j--) {
                for (l = NUM_DEPTH1 - 1; l >= 0; l--) {
                    if (curDepth1Used[l] <= 0) {// not used, just to accelerate the process
                        continue;
                    }
                    for (i = 0; i < numAvailableObjects; i++) {
                        if ( curAvailableObj[i].instance[0].depth0 == k && curAvailableObj[i].instance[0].depth1 == l) {
                            for (m = 0; m < curAvailableObj[i].numInstance; m++) {
                                if (curAvailableObj[i].instance[m].present == true && curAvailableObj[i].instance[m].z == j) {
                                    var scale = curZScale[curAvailableObj[i].instance[m].z];

                                    // so it assumes all clip art images are of the same size??
                                    var w = scale * curClipartImgs[i][0].width;
                                    var h = scale * curClipartImgs[i][0].height;
                                    var rowOffset = -h / 2;
                                    var colOffset = -w / 2;

                                    var x = curAvailableObj[i].instance[m].x + colOffset;
                                    var y = curAvailableObj[i].instance[m].y + rowOffset;
                                    if (canvasX >= x && canvasX < x + w && canvasY >= y && canvasY < y + h) {
                                        selectedIdx = i;
                                        selectedIns = m;
                                        // log_user_data("mousedown_selected"); // Doesn't seem necessary
                                        
                                        mouse_offset_X = (x + w / 2) - canvasX;
                                        mouse_offset_Y = (y + h / 2) - canvasY;
                                        
                                        // Switch the tab to whatever group the selected (on canvas) object belongs to
                                        // SA: TODO Do this better?
                                        selectedTab = curAvailableObj[selectedIdx].instance[selectedIns].type;
                                        selectedTabIdx = objectTypeToIdx[selectedTab];
                                        // log_user_data("tab"); // SA: TODO Add?
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (selectedIdx >= 0) {
            if (moveClipart === true) {
                curAvailableObj[selectedIdx].instance[selectedIns].x = canvasX + mouse_offset_X;
                curAvailableObj[selectedIdx].instance[selectedIns].y = canvasY + mouse_offset_Y;
                // log_user_data("mousedown_if"); // Doesn't seem necessary?, Also, never seems to happen.
                moveClipart = false;
            } else {
                curAvailableObj[selectedIdx].instance[selectedIns].x = canvasX + mouse_offset_X;
                curAvailableObj[selectedIdx].instance[selectedIns].y = canvasY + mouse_offset_Y;
                // log_user_data("mousedown_else"); // Doesn't seem necessary?
                moveClipart = true;
            }
            draw_canvas();
        }
    }

    // Scale clipart objects
    var scaleSliderX = cx - CANVAS_COL - canvas_fix.offsetLeft - SCALE_COL;
    var scaleSliderY = cy - canvas_fix.offsetTop - SCALE_ROW;

    if (scaleSliderX >= 0 && scaleSliderX < SCALE_WIDTH && scaleSliderY >= CANVAS_COL - SCALE_COL && scaleSliderY < SCALE_HEIGHT) {
        if (selectedIdx != NOT_USED) {
            var position = Math.floor(scaleSliderX / (SCALE_WIDTH / (2 * (NUM_ZSCALES - 1))));
            position += 1;
            position /= 2;
            position = Math.floor(position);
            curAvailableObj[selectedIdx].instance[selectedIns].z = Math.max(0, Math.min(NUM_ZSCALES - 1, position));
//             log_user_data("scale"); // Isn't needed, gets logged via mouse-up
            draw_canvas();
            ScaleSliderDown = true;
        }
    }

    // Flip clipart objects
    var flipButtonX = cx - CANVAS_COL - canvas_fix.offsetLeft - FLIP_COL;
    var flipButtonY = cy - canvas_fix.offsetTop - FLIP_ROW;

    if (flipButtonX >= 0 && flipButtonX < buttonW * 2 && flipButtonY >= 0 && flipButtonY < buttonH) {
        if (selectedIdx != NOT_USED) {
            curAvailableObj[selectedIdx].instance[selectedIns].flip = Math.floor(flipButtonX / buttonW);
            log_user_data("flip");
            draw_canvas();
        }
    }
}

//update the current location of the keypoint
function mousemove_canvas(event) {
    
    var ev = event || window.event;

    if (ev.pageX) {
        cx = ev.pageX;
    } else if (ev.clientX) {
        cx = ev.clientX;
        if (document.documentElement.scrollLeft) {
            cx += document.documentElement.scrollLeft;
        } else {
            cx += document.body.scrollLeft;
        }
    }
    
    if (ev.pageY) {
        cy = ev.pageY;
    } else if (ev.clientY) {
        cy = ev.clientY;
        if (document.documentElement.scrollTop) {
            cy += document.documentElement.scrollTop;
        } else {
            cy += document.body.scrollTop;
        }
    }
    
    if (selectedIdx != NOT_USED && moveClipart == true && wasOnCanvas === true) {
        curAvailableObj[selectedIdx].instance[selectedIns].present = false;
//         log_user_data("mousemove_unselect"); // Changes too frequently with mouse movement
        draw_canvas();
    }

    var canvasX = cx - CANVAS_COL - canvas_fix.offsetLeft;
    var canvasY = cy - CANVAS_ROW - canvas_fix.offsetTop;

    if (canvasX < CANVAS_WIDTH && canvasX > 0 && canvasY < CANVAS_HEIGHT && canvasY > 0) {
        wasOnCanvas = true;

        if (selectedIdx != NOT_USED && moveClipart === true) {
            curAvailableObj[selectedIdx].instance[selectedIns].x = canvasX + mouse_offset_X;
            curAvailableObj[selectedIdx].instance[selectedIns].y = canvasY + mouse_offset_Y;
            curAvailableObj[selectedIdx].instance[selectedIns].present = true;
//             log_user_data("mousemove_select"); // Changes too frequently with mouse movement
            draw_canvas();
        }
    }

    if (ScaleSliderDown == true) {
        var scaleSliderX = cx - CANVAS_COL - canvas_fix.offsetLeft - SCALE_COL;
        var scaleSliderY = cy - canvas_fix.offsetTop - SCALE_ROW;

        if (selectedIdx != NOT_USED) {
            var position = Math.floor(scaleSliderX / (SCALE_WIDTH / (2 * (NUM_ZSCALES - 1))));
            position += 1;
            position /= 2;
            position = Math.floor(position);
            curAvailableObj[selectedIdx].instance[selectedIns].z = Math.max(0, Math.min(NUM_ZSCALES - 1, position));
            // log_user_data("zScale slider movement"); // Doesn't seem necessary
            draw_canvas();
        }
    }
}

function validate_scene() {
    var numAvailableObjectsUsed;
    var validScene = true;
    
    if (!restrictInput) {
        return validScene;
    }

//     ////////////////////// NO REQUIREMENT FOR CATEGORY //////////////////////
//     for (i = 0; i < objectTypeOrder.length; i++) {
//         numAvailableObjectsUsed = 0;
//         for (j = 0; j < numObjTypeShow[objectTypeOrder[i]]; j++) {
//                 curObjIdx = clipartIdxStart[i] + j;
//             for (m = 0; m < curAvailableObj[curObjIdx].numInstance; m++) {
//                 if (curAvailableObj[curObjIdx].instance[m].present == true) {
//                     numAvailableObjectsUsed++;
//                     break;
//                 }
//             }
//             if (numAvailableObjectsUsed > MIN_PER_TYPE) {
//                 break;
//             }
//         }
//         if (numAvailableObjectsUsed < MIN_PER_TYPE) {
//             render_dialog("minType");
//             validScene = false;
//             return validScene;
//         }
//     }

    numAvailableObjectsUsed = 0;
    for (i = 0; i < numObjTypeShow['human']; i++) {
        for (m = 0; m < curAvailableObj[i].numInstance; m++) {
            if (curAvailableObj[i].instance[m].present) {
                numAvailableObjectsUsed++;
                if (curAvailableObj[i].instance[m].expressionID == 0) {
                    render_dialog("expression");
                    validScene = false;
                    return validScene;
                }
            }
        }
    }
    
    for (i = numObjTypeShow['human']; i < numAvailableObjects; i++) {
        for (m = 0; m < curAvailableObj[i].numInstance; m++) {
            if (curAvailableObj[i].instance[m].present) {
                numAvailableObjectsUsed++;
            }
        }
    }

    if (numAvailableObjectsUsed < MIN_NUM_OBJ) {
        render_dialog("minClipart");
        validScene = false;
        return validScene;
    }
    
    return validScene;
}

function prev() {

    // Store current scene before going to previous scene
    sceneData[curScene] = curSceneData;
    
    if (curScene > 0) {
        curScene -= 1;
    }
    // SA: TODO Is necessary?
    curSceneData = sceneData[curScene];
    
    log_user_data("prev"); // SA: TODO Add?
    reset_scene();
    draw_canvas();   

}

// grab the results and submit to the server
function next() {

    // Make sure scene meets requirements
    if (!validate_scene()) {
        return -1;
    }
    
    sceneData[curScene] = curSceneData;
    curScene++;

    if (curScene == numScenes) {
        curScene = numScenes-1; // Cap to not create new scene
        $("#dialog-confirm").dialog('open');
        // Put cursor in comment box for convenience :)
        $("#hit_comment").each( function(idx) { 
            if ( idx == 0 ) {
                $(this).focus();
            }
        });
    }

    // SA: TODO Is necessary?
    curSceneData = sceneData[curScene];
    log_user_data("next"); // SA: TODO Add?
    reset_scene();
    draw_canvas();
}

// ===========================================================
// Let users use keyboard shortcuts for certain features.
// Selected can be shrunk/enlarged (CTRL + a/CTRL + z), 
// sent backward/forward like PPT (CTRL + s/ CTRL + x),
// and its flip toggled (CTRL + c).
// ===========================================================
function handle_key_down(event) {
    
    var e = window.event || event;
    
    // "17" == control key
    if (e.keyCode == "17") {
        CTRL_DOWN = true;
    } else if (CTRL_DOWN == true) {
        
        if (e.keyCode == "83") {// s
            e.preventDefault();
            //alert("Move object back.");
            if (selectedIdx != NOT_USED) {
                curDepth1Used[curAvailableObj[selectedIdx].instance[selectedIns].depth1]--;
                curAvailableObj[selectedIdx].instance[selectedIns].depth1 = Math.min(curAvailableObj[selectedIdx].instance[selectedIns].depth1+1, NUM_DEPTH1-1);
                curDepth1Used[curAvailableObj[selectedIdx].instance[selectedIns].depth1]++;
                log_user_data("key press");
                draw_canvas();
            }
        } else if (e.keyCode == "88") { // x
            e.preventDefault();
            //alert("Move object forward.");
            if (selectedIdx != NOT_USED) {
                curDepth1Used[curAvailableObj[selectedIdx].instance[selectedIns].depth1]--;
                curAvailableObj[selectedIdx].instance[selectedIns].depth1 = Math.max(curAvailableObj[selectedIdx].instance[selectedIns].depth1-1, 0);
                curDepth1Used[curAvailableObj[selectedIdx].instance[selectedIns].depth1]++;
                log_user_data("key press");
                draw_canvas();
            }
        } else if (e.keyCode == "90") { // z
            e.preventDefault();
            //alert("Increase object size.");
            if (selectedIdx != NOT_USED) {
                curAvailableObj[selectedIdx].instance[selectedIns].z = Math.max(curAvailableObj[selectedIdx].instance[selectedIns].z-1, 0);
                log_user_data("key press");
                draw_canvas();
            }
        } else if (e.keyCode == "65") { // a
            e.preventDefault();
            //alert("Decrease object size.");
            if (selectedIdx != NOT_USED) {
                curAvailableObj[selectedIdx].instance[selectedIns].z = Math.min(curAvailableObj[selectedIdx].instance[selectedIns].z+1, NUM_ZSCALES-1);
                log_user_data("key press");
                draw_canvas();
            }
        } else if (e.keyCode == "67") { // c
            e.preventDefault();
            //alert("Change flip.");
            if (selectedIdx != NOT_USED) {
                /// Flip is 0 or 1, so this is a clever way to flip
                curAvailableObj[selectedIdx].instance[selectedIns].flip = 1 - curAvailableObj[selectedIdx].instance[selectedIns].flip;
                log_user_data("key press");
                draw_canvas();
            }
        }
    }
}

function handle_key_up(event) {
    var e = window.event || event;
    // "17" == control key
    if (e.keyCode == "17") {
        CTRL_DOWN = false;
    }
}

function log_user_data(msg) {
    curUserSequence.selectedIdx.push(selectedIdx);
    curUserSequence.selectedIns.push(selectedIns);
    // SA: TODO Verify that this is correct/reasonable
    if ( selectedIdx != NOT_USED && selectedIns != NOT_USED) {
        curUserSequence.poseID.push(curAvailableObj[selectedIdx].instance[selectedIns].posedID);
        curUserSequence.expressionID.push(curAvailableObj[selectedIdx].instance[selectedIns].expressionID);
        curUserSequence.present.push(curAvailableObj[selectedIdx].instance[selectedIns].present);
        curUserSequence.x.push(curAvailableObj[selectedIdx].instance[selectedIns].x);
        curUserSequence.y.push(curAvailableObj[selectedIdx].instance[selectedIns].y);
        curUserSequence.z.push(curAvailableObj[selectedIdx].instance[selectedIns].z);
        curUserSequence.flip.push(curAvailableObj[selectedIdx].instance[selectedIns].flip);
        curUserSequence.depth1.push(curAvailableObj[selectedIdx].instance[selectedIns].depth1);
    } else {
        curUserSequence.poseID.push(NOT_USED);
        curUserSequence.expressionID.push(NOT_USED);
        curUserSequence.present.push(NOT_USED);
        curUserSequence.x.push(NOT_USED);
        curUserSequence.y.push(NOT_USED);
        curUserSequence.z.push(NOT_USED);
        curUserSequence.flip.push(NOT_USED);
        curUserSequence.depth1.push(NOT_USED);
    }
    if (msg != undefined) {
        console.log(msg + ": " + curUserSequence.flip.length);
    }
}

// ================================================================
// Function to submit form to the server
// The form is submitted to AMT after server successfully process the submission
// The HIT is completed after AMT server receives the submission
// ================================================================
function submit_form() {

    var duration = ($.now()-init_time)/1000;
    duration = duration.toString();
    var comment;
    $('#dialog-confirm textarea').each( function(){ comment = this.value; });
    
    // process answers
    // pack user's response in a dictionary structure and send to the server in JSON format
    var answers = [];
    for (i = 0; i < sceneData.length; i++) {
        answers.push( {
                // Don't need the image files
                // SA: TODO Add new scene data here?
                availableObjects: sceneData[i].availableObjects,
                userSequence: sceneData[i].userSequence,
                sceneType: sceneData[i].sceneType
            }
        );
    }
    var ans = JSON.stringify(answers);

    $("input[name='hitDuration']").val(duration);
    $("input[name='hitResult']").val(ans);
    $("input[name='hitComment']").val(comment);

    // set the resp to send back to the server here
    // the values to send to MTurk has already defined inside #mturk_form
    // if you don't need to bother to set value here
    var resp =
    {
    // TODO: set the data to be submitted back to server
    };
    
    // post ajax request to server
    // if there's no backend to process the request, form can be directly submitted to MTurk
    
    debugger;
    // If running local, don't bother submitting
    if ( submitAction ) {
        $.ajax({
                type: "POST",
                // "TODO: set the url of server to process the data",
                url: "",
                data: {'resp': JSON.stringify(resp)}
            }).done(function(data) {
                $('#mturk_form').submit();
            });
    }
}

// ===========================================================
// add dialog for the website
// ===========================================================
function render_dialog(errorMsg) {
    
    if ( errorMsg == "expression" ) {
        var text = "Please pick facial expressions for people. Thanks!";
    } else if (errorMsg == "minClipart") {
        var text = "Please use at least " + MIN_NUM_OBJ + " piece" + ((MIN_NUM_OBJ==1) ? "" : "s") + " of clipart. Thanks!";
    } else if (errorMsg == "minType") {
        var text = "Please use at least " + MIN_PER_TYPE + " piece" + ((MIN_PER_TYPE==1) ? "" : "s") + " of clipart from each type. Thanks!";
    }
    
    $("#dialog-modal").text(text);
    $("#dialog-modal").dialog('open');
}

// ===========================================================
// add dialog for the website
// ===========================================================
function add_dialog() {
    $( "#dialog-confirm" ).dialog({
        autoOpen: false,
        resizable: true,
        height:240,
        modal: true,
        buttons: {
        "Yes": function() {
            $( this ).dialog( "close" );
            submit_form();
        },
        Cancel: function() {
            $( this ).dialog( "close" );
        }
        }
    });
    $( ".ui-dialog" ).css('position', 'absolute');
}

// ===========================================================
// disable paste on input text // More as reference for future use
// ===========================================================
$(document).ready(function() {
    $(document).on("paste","#dialog-confirm", function(e) {
        e.preventDefault();
    });
});

//
//

var jsonIdx = -1; // Start with -1 because of config
var sceneConfigFile = "abstract_scenes_v002_data_scene_config.json";
var sceneConfigData ;
var objectData = {};

function load_json(result) {
    
    // From site init
    if (result == undefined) {
        curFile = sceneConfigFile;
        callback = load_json;
    } else if (jsonIdx == -1) {
        // Load scene config data
        sceneConfigData = result;
        callback = load_json;
        jsonIdx++;
    } 
    
    if (jsonIdx == 0) {
        curFile = sceneConfigData.clipartObjJSONFile[jsonIdx].file;
        callback = load_json;
        jsonIdx++;
    } else if (jsonIdx >= 0) {
        if (jsonIdx < sceneConfigData.clipartObjJSONFile.length) {
            curFile = sceneConfigData.clipartObjJSONFile[jsonIdx].file;
            callback = load_json;
        } else {
            callback = store_json_and_init;
        }
        objectData[result.objectType] = result;
        jsonIdx += 1;
    }
    
    // SA: TODO Do something with file paths
    $.getJSON(dataURL+curFile).done( function(data) { callback(data); } )
                        .fail( function() { console.log("Loading JSON " + curFile +" failed."); } );
}

function must_init_before_render() {
    
    objectTypeOrder = sceneConfigData[sceneTypeList[curScene]].objectTypeOrder;
    numObjTypeShow = sceneConfigData[sceneTypeList[curScene]].numObjTypeShow;

    // Need to initialize this otherwise interface won't load properly
    numAvailableObjects = 0;
    objectTypeToIdx = {};
    for (var i = 0; i < objectTypeOrder.length; i++) {
        numAvailableObjects += numObjTypeShow[objectTypeOrder[i]];
        objectTypeToIdx[objectTypeOrder[i]] = i;
    }
    
    selectedTab = sceneConfigData[sceneTypeList[curScene]].startTab;
    selectedTabIdx = objectTypeToIdx[selectedTab];
    
    // SA: TODO Currently objectTypeOrder.length is assumed
    // to be the number of tabs, which is hardcoded to 4.
    NUM_TABS = objectTypeOrder.length;
    
    // Part of Xinlei's instruction example
    EX_TOTAL = sceneConfigData[sceneTypeList[curScene]].exTotal;
}

function store_json_and_init(result) {
    objectData[result.objectType] = result;
    must_init_before_render();
    select_good(); // Examples
    init();
}

// select good examples
var selectedGood = Array(5);
// To draw good example images on the instructions

// Select good examples to show workers
function select_good() {
    for (i = 0; i < 5; i++) {
        var found = true;
        while (found == true) {
            selectedGood[i] = Math.floor(RandomFactor * EX_TOTAL * Math.random());
            found = false;
            for (j = 0; j < i; j++) {
                if (selectedGood[j] == selectedGood[i]) {
                    found = true;
                    break;
                }
            }
        }
    }
    // alert(selectedGood);
    var goodImageHTML = '';
    for (i = 0; i < 5; i++) {
        goodImageHTML += "<td><img src='" + exampleBaseURL + "GoodPark/" + selectedGood[i] + ".png' width=218></td>";
    }

    document.getElementById('goodimagewrapper').innerHTML = goodImageHTML;
}

var exampleHTML = ' ';
function hideExamples() {
    
    exampleHTML = document.getElementById('examples').innerHTML;
    document.getElementById('examples').innerHTML = ' ';
//     document.getElementById("examples").style.visibility = "collapse";
    document.getElementById('examplesToggle').value = 'Show Instructions';
    document.getElementById('examplesToggle').onclick = showExamples;
}

function showExamples() {
    console.log(exampleHTML);
    debugger;
//     document.getElementById("examples").style.visibility = "visible";
    document.getElementById('examples').innerHTML = exampleHTML;
    document.getElementById('examplesToggle').value = 'Hide Instructions';
    document.getElementById('examplesToggle').onclick = hideExamples;
}
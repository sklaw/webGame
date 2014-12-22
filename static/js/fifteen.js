$ = function(id) {
	return document.getElementById(id);
}

$$ = function(selector) {
	return document.querySelectorAll(selector);
}

window.addEventListener("load", loadHandler, false);

var divmap;
var gamemap;
var divtomove;
var pieces;
var counterTimer;
var beginTime;
var bestOfTime = [];
var bestOfSteps = [];
var clicks;

var win = false;



var grids = 4;
var picSize = 400;
var pieceSise;
var boderWidth = 2;

function loadHandler() {
	readCookie();
	printRecord();
	divmap = [];
	gamemap = [];
	divtomove = [];
	pieces = [];
	pieceSise = picSize/grids;

	gridAdjustment();

	pieces = $$("#puzzlearea div");
	$("puzzlearea").style.position = "relative";
	for (var i = 0; i < pieces.length; i++) {
		divmap[i] = i;
		gamemap[i] = i;
		pieces[i].className = "puzzlepiece";

		pieces[i].style.height = (pieceSise-boderWidth*2).toString()+"px";
		pieces[i].style.width = (pieceSise-boderWidth*2).toString()+"px";
		pieces[i].style.lineHeight = (pieceSise-boderWidth*2).toString()+"px";

		pieces[i].addEventListener("mouseover", pieceMouseoverHandler, false);
		pieces[i].addEventListener("mouseout", pieceMouseoutHandler, false);
		pieces[i].addEventListener("click", pieceClickHandler, false);
		var x = -(i%grids)*pieceSise;
		var y = -Math.floor(i/grids)*pieceSise;
		pieces[i].style.backgroundPosition = x.toString() + "px " + y.toString() +"px";
		pieces[i].style.left = "0px";
		pieces[i].style.top = "0px";
		
	}
	drawMap();
	gamemap[grids*grids-1] = -1;
	gamemap["blank"] = grids*grids-1;

	$("shufflebutton").addEventListener("click", shuffle, false);
	$("size_select").addEventListener("change", resizeHandler, false);
	$("counter").style.textAlign = "center";
	$("clicks").style.textAlign = "center";
	win = true;
}

function readCookie() {
	coo = document.cookie;
	coolist = coo.split(';');

	var re = /^\s*g(\d+)bo(t|s)\s*$/;
	for (var i = 0; i < coolist.length; i++) {
		var pair = coolist[i].split('=');
		var nameMatch = re.exec(pair[0]);
		console.log(pair);
		console.log(nameMatch);
		var value = parseInt(pair[1])
		console.log(value);
		if (value && nameMatch) {
			console.log("set a record.");
			var gridsNum = parseInt(nameMatch[1]);
			if (nameMatch[2] == "t") {
				bestOfTime[gridsNum] = value;
			}
			else {
				bestOfSteps[gridsNum] = value;
			}
		}
	}
}

function analyseTime(time) {
	this.seconds = 1000;
	this.minutes = 1000 * 60;
	this.hours = minutes * 60;
	//this.days = hours * 24;
	//this.years = days * 365;
	console.log("analysing:"+time);
	var result = [];
	result["seconds"] = Math.floor(time/seconds)%60;
	result["minutes"] = Math.floor(time/minutes)%60;
	result["hours"] = Math.floor(time/hours)%24;
	return result;
}

function printRecord() {
	if (bestOfTime[grids]) {
		var result = analyseTime(bestOfTime[grids]);
		$("record").innerHTML = "Best solved time: ";
		if (result["hours"] != 0) {
			$("record").innerHTML += result["hours"] + "h ";
		}
		if (result["minutes"] != 0) {
			$("record").innerHTML += result["minutes"] + "m ";
		}
		$("record").innerHTML += result["seconds"] + "s ";
	}
	else {
		$("record").innerHTML = "Best solved time : void";
	}
	if (bestOfSteps[grids]) {
		$("record").innerHTML += "<br>Best solved steps: ";
		$("record").innerHTML += bestOfSteps[grids];
	}
	else {
		$("record").innerHTML += "<br>Best solved steps: void";
	}
}

function counterOff() {
	clearInterval(counterTimer);
}

function counterRun() {
	clearInterval(counterTimer);
	
	var d = new Date();
	beginTime = d.getTime();
	

	var s = 0;
	var m = 0;
	var h = 0;
	counterTimer = setInterval(function() {
		s++;
		if (s == 60) {
			s = 0;
			m++;
		}
		if (m == 60) {
			m = 0;
			h++;
		}
		if (h == 24) {
			h = 0;
			clearInterval(counterTimer);
			alert("time out!");
			$("counter").innerHTML = "";
			loadHandler();
		}

		$("counter").innerHTML = h + " hours " + m + " minuntes " + s + " seconds ";
	}, 1000);
}

function writeNewRecord(gridsNum, type, value) {
	console.log("got a new record.");
	if (type == "t") {
		bestOfTime[gridsNum] = value;
		var string = "g" + gridsNum.toString() + "bot";
		document.cookie = string+"="+value.toString();
	}
	else if (type == "s") {
		bestOfSteps[gridsNum] = value;
		var string = "g" + gridsNum.toString() + "bos";
		document.cookie = string+"="+value.toString();
	}
}

function checkWin() {
	for (var i = 0; i < divtomove.length; i++) {
		var divNum = divtomove[i];
		if (divmap[divNum] != divNum) {
			console.log("now win.");
			return;
		}
	}
	for (var i = 0; i < grids*grids-1; i++) {
		if (divmap[i] != i) {
			console.log("now win.");
			return;
		}
	}
	counterOff();
	var d = new Date();
	console.log(d.getTime());
	console.log(beginTime);
	var timeUsed = d.getTime()-beginTime;
	if (bestOfTime[grids]) {
		if (timeUsed < bestOfTime[grids]) {
			//bestOfTime[grids] = timeUsed;
			writeNewRecord(grids, "t", timeUsed);
		}
	}
	else {
		//bestOfTime[grids] = timeUsed;
		writeNewRecord(grids, "t", timeUsed);
	}
	if (bestOfSteps[grids]) {
		if (clicks < bestOfSteps[grids]) {
			//bestOfSteps[grids] = clicks;
			writeNewRecord(grids, "s", clicks);
		}
	}
	else {
		//bestOfSteps[grids] = clicks;
		writeNewRecord(grids, "s", clicks);
	}


	printRecord();
	win = true;
	
	$$("body")[0].style.backgroundImage = "url('../../static/image/win.jpg')";
	$$("body")[0].style.backgroundRepeat = "no-repeat";
	$$("body")[0].style.backgroundPosition = "center";
}

function resizeHandler() {
	cleanTheSite();
	grids = parseInt(this.value);
	loadHandler();
}

function cleanTheSite() {
	counterOff();
	$$("body")[0].style.backgroundImage = "";
	$("counter").innerHTML = "";
	$("clicks").innerHTML = "";
}

function shuffle() {
	counterOff();
	cleanTheSite();
	win = true;
	clearTimeout(this.timer1);
	clearTimeout(this.timer2);
	this.timer1 = setTimeout(function() {
	var direction = [-1, 1, -grids, +grids];
	var shuffleTime = 1000;
	for (var i = 0; i < shuffleTime; i++) {
		var outcome = Math.floor(Math.random()*4);
		var exchange = gamemap["blank"]+direction[outcome];
		if (exchange >= grids*grids || exchange < 0) {
			continue;
		}
		if (Math.floor(exchange/grids) != Math.floor(gamemap["blank"]/grids)
			&& exchange%grids != gamemap["blank"]%grids) {
			continue;
		}
		var divToChange = gamemap[exchange];
		console.log("exchange div "+(divToChange+1)+" to blank "+ (gamemap["blank"]+1));
		moveDivToBlank(divToChange);
	}


	for (var i = 0; i < grids*grids-1; i++) {
 		divtomove[i] = i;
 	}
 	drawMap();
 	}, 500);
 	this.timer2 = setTimeout(function() {
 		win = false;
 		
 	}, 1000);
 	counterRun();
 	clicks = 0;
 	$("clicks").innerHTML = "clicks amount : 0"
}

function gridAdjustment() {
	if (grids < 2) {
		grids = 4;
	}
	var amount = grids*grids-1;
	pieces = $$("#puzzlearea div");
	if (pieces.length < amount) {
		var gap = amount-pieces.length;
		console.log("not enough grids, gap is: "+gap);
		var l = pieces.length;
		for (var i = 0; i < gap; i++) {
			var div = document.createElement("div");
			div.innerHTML = (l+i+1).toString();
			$("puzzlearea").appendChild(div);
		}
	}
	else if (pieces.length > amount) {
		var gap = pieces.length-amount;
		console.log("too many grids, gap is: "+gap);
		var l = pieces.length;
		for (var i = 0; i < gap; i++) {
			pieces[l-1-i].remove();
		}
 	}
 	for (var i = 0; i < amount; i++) {
 		divtomove[i] = i;
 	}
}

function moveAllMoveables() {
	for (var i = 0; i < divtomove.length; i++) {
		moveDivToBlank(divtomove[i]);
	}
}

function moveDivToBlank(divNum) {
	var b = gamemap["blank"];

	gamemap["blank"] = divmap[divNum];

	divmap[divNum] = b;
	gamemap[b] = divNum;
}

function pieceMouseoutHandler(e) {
	if (win) {
		return;
	}
	uncolorMoveableOnes();
	this.moveable = false;
}

function uncolorMoveableOnes() {
	for (var i = 0; i < divtomove.length; i++) {
		pieces[divtomove[i]].style.borderColor = "black";
		pieces[divtomove[i]].style.color = ""
		pieces[divtomove[i]].style.textDecoration = "";
	}
}

function colorMoveableOnes() {
	for (var i = 0; i < divtomove.length; i++) {
		pieces[divtomove[i]].style.borderColor = "red";
		pieces[divtomove[i]].style.color = "#006600";
		pieces[divtomove[i]].style.textDecoration = "underline";
	}
}

function pieceMouseoverHandler(e) {
	if (win) {
		return;
	}
	var divNum =  parseInt(this.innerHTML)-1;
	var now_at = divmap[divNum];
	console.log("point at div "+(divNum+1)+" at location "+(now_at+1));
	if (Math.floor(now_at/grids) == Math.floor(gamemap["blank"]/grids)) {
		var distant = (now_at-gamemap
["blank"]);
		var step = 1;
	}
	else if (now_at%grids == gamemap["blank"]%grids) {
		var distant = (now_at-gamemap
["blank"]);
		var step = grids;
	}
	else {
		console.log("not moveable.");
		this.moveable = false;
		return ;
	}
	if (distant < 0) {
		step = -step;
	}
	console.log("distant from black to this location "+distant);
	console.log("step width taken by blank should be "+step);
	divtomove = [];

	for (var b = gamemap["blank"]; b != now_at; b += step) {
		var div_now = gamemap[b+step];
		divtomove[divtomove.length] = div_now;
	}
	console.log("if click will move following divs: ");
	for (var i = 0; i < divtomove.length; i++) {
		console.log(divtomove[i]+1);
	}
	colorMoveableOnes();
	this.moveable = true;
}

function pieceClickHandler(e) {
	if (win) {
		return;
	}
	if (this.moveable) {
		console.log("this is moveable!");
		clicks++;
		$("clicks").innerHTML = "clicks amount: " + clicks;
		uncolorMoveableOnes();
		this.moveable = false;
		moveAllMoveables();
		drawMap();
		checkWin();
	}
	else {
		console.log("this is NOT moveable!");
	}
}

function drawMap() {
	var frames = 10;
	var steps = [];
	for (var j = 0; j < divtomove.length; j++) {
		i = divtomove[j];
		var now_at = divmap[i];

		var new_left = (now_at%grids)*pieceSise;
		var new_top = Math.floor(now_at/grids)*pieceSise;

		var old_left = parseInt(pieces[i].style.left);
		var old_top = parseInt(pieces[i].style.top);

		var steptoleft = (new_left-old_left)/frames;
		var steptotop = (new_top-old_top)/frames;
		l = steps.length;
		steps[l] = [];
		steps[l]["divIndex"] = i;
		steps[l]["toleft"] = steptoleft;
		steps[l]["totop"] = steptotop;
	}
	var counter = 0;
	var timer = setInterval(function() {
			counter++;
  			for (var i = 0; i < steps.length; i++) {
  				/*console.log(steps[i]["toleft"]);
  				console.log(steps[i]["totop"]);*/
  				index = steps[i]["divIndex"];
  				pieces[index].style.left = parseInt(pieces[index].style.left)+steps[i]["toleft"]+"px";
  				pieces[index].style.top = parseInt(pieces[index].style.top)+steps[i]["totop"]+"px";
  			}
  			if(counter === frames) clearInterval(timer);
  	}, 15);
}
var IS_SP = navigator.userAgent.match(/iPhone|iPod|Android|Mobile/i) ? 1 : 0;
var IS_PC = IS_SP == 0 ? 1 : 0;
var nowRoom;

/* ログインチェッカー */
function talk_parts_update(){
	if(
		(nowRoom == "main" && getCookie("ic")) ||
		nowRoom != "main"
	){
		$(".talk_parts").show()
		$(".twiter_alert").hide();
	} else {
		$(".talk_parts").show()
		$(".twiter_alert").hide();
	}
}

/* 過去ログ */
$(function(){

	$(".scroll-paging-button").click(function(){
		var val = $(this).attr("val");
		if(val == "down"){
			var max = $("#chat").get(0).scrollHeight - $("#chat").outerHeight(); ;
			$("#chat").animate({scrollTop:max},500);
		} else {
			$("#chat").animate({scrollTop:0},500);
		}
	})

	$("#chat").on("scroll",function(){

	var now = $("#chat").scrollTop();
	var max = $("#chat").get(0).scrollHeight - $("#chat").outerHeight(); ;
	var per = parseInt(now/max*100);

	if(per < 98){
		$(".scroll-paging").fadeIn("slow");
	} else {
		$(".scroll-paging").fadeOut("slow");
	}



		

		if($("#chat").hasClass("room-loading") || $(".ll").length < 10){
			return ;
		}

		if(!$(this).hasClass("loading") && $("#chat").scrollTop() == 0){


			$(this).addClass("loading");

			var loading = $('<div style="position:absolute;left:45%;" class="loadingChat"><i style="color:rgba(0,0,0,.5);font-size:30pt;padding:3px" class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');


			$("#chat").prepend(loading);

			loading.hide().fadeIn("fast");


			var time = $(".ll:first").attr("time");
			var data = {"room" : nowRoom, "time" : time};
			console.log(time);

			console.log(data);

			$.ajax({
				url : "/ajax/chat/get_chat.cgi",
				type: 'POST',
				data : data,
				cache: false,
				dataType : "json",

			}).done(function(res){

				console.log(res);

				var def = $("#chat").get(0).scrollHeight - $("#chat").outerHeight();


				$(res).each(function(i,r){
					r.is_log = 1;
					insertTalk(r);
				});



				$(".loading").removeClass("loading");
				$(".loadingChat").fadeOut("slow",function(){
					$(this).remove();
				});

				var now = $("#chat").get(0).scrollHeight - $("#chat").outerHeight();
				var diff = now - def;
				$("#chat").scrollTop(diff);


			})

		}
	})


})
	


function time2date(_time){
		var time = _time * 1000;
    var d = new Date( time );
		var is_today = (new Date().toLocaleDateString() == d.toLocaleDateString()) ? 1 : 0;

    var month = d.getMonth() + 1;
    var day  = d.getDate();
    var hour = ( '0' + d.getHours() ).slice(-2);
    var min  = ( '0' + d.getMinutes() ).slice(-2);
    var sec   = ( '0' + d.getSeconds() ).slice(-2);

    return is_today ? ( hour + ':' + min )
		                : ( month + '/' + day);

}



/* /過去ログ */

function fgClose(callback){
	$(".fg").fadeOut("fast",function(){
		$(this).remove();
		if(callback){
			callback();
		}
	});
}

function doCloseFg(){
	fgClose(function(){
		$(".wrapper").removeClass("fixed");
		$( 'html, body' ).prop( { scrollTop: $( window ).scrollTop() } );
	});
}

$(function(){
	$(document).on("click",".fg",function(){
			doCloseFg();
	});
});



//Icon
$(function(){

	$(".view_icon").click(function(){
		var flag = $(this).is(":checked") ? 1 : 0;
		setCookie("view_icon",flag);
		socket.emit("use_icon",flag);

	})

	console.log("icon:" + getCookie("view_icon"));

	if(getCookie("view_icon") == 1){
		$(".view_icon").attr("checked",true);
	}


})


//voice
$(function(){
	$("#voice").change(function(){
		if ('speechSynthesis' in window) {
			var text;
			if($(this).is(":checked")){
				text = "読むオン";
			} else {
				text = "読みオフ";
			}
				speechSynthesis.speak(new SpeechSynthesisUtterance(text))
		}
	});
});


//初期選択関連
var defaultRoom;

$(function(){

	if(new String(location.href).match(/#/)){
	 defaultRoom = (new String(location.href).split("#"))[1];
	}

	var lists = ["pedal","voice","talkSound",""];
	for(var i in lists){
		var key = lists[i];


/*
		if(getCookie(key) == 1){
			$("#"+key).attr("checked",true);
		}

		$("#"+key).change(function(){
			setCookie($(this).attr("id"),$(this).is(":checked") ? 1 : 0);
		});
*/

	}


});

//部屋移動
$(function(){
	$(document).on("change","#room",(function(){
		$("#chat").fadeOut("fast",function(){
			$("#chat").html("").show();
			socket.emit("room_set",$("#room").val());
		});
	}));
})




//退出ボタン
$(function(){
	$("#logout").click(function(){
		location.href = "/";
	});
});


//キーボードを描く(createJS)
var stage;

var keys = [];
	keys.push("a-1","as-1","b-1");
	for(var i=0;i<=6;i++){
		keys.push("c"+i,"cs"+i,"d"+i,"ds"+i,"e"+i,"f"+i,"fs"+i,"g"+i,"gs"+i,"a"+i,"as"+i,"b"+i);
	}
keys.push("c7");

$(function(){
	var canvas = document.getElementById('canvas');
	stage = new createjs.Stage(canvas);

	//スマホ対応
	if(isSmartPhone == 1){
		createjs.Touch.enable(stage);
	}

		var manifest = [
			{src: "s.png", id: "s"},
			{src: "ss.png", id: "ss"},
			{src: "so.png", id: "so"},
			{src: "k.png", id: "k"},
			{src: "ks.png", id: "ks"},
			{src: "ko.png", id: "ko"}
		];

		preload = new createjs.LoadQueue(true);
		preload.on("complete", handleComplete);
		preload.loadManifest(manifest, true, "images/key/");
});

var images = {};
var pianoKeyObj = {};
function handleComplete(e){

	images = e.target._loadedResults;

	//通常キー
	{
		var n = 0;
		for (var i in keys) {
			var key = keys[i];
			var _width = 20;

			if(!key.match(/s/)){
				var obj = new createjs.Bitmap(images["k"]);
				stage.addChild(obj);
				obj.note = key;
				obj.type = "k";
				obj.x = n*_width;
				obj.addEventListener("mousedown",handleMouseDown);
				obj.addEventListener("pressup",handleMouseUp);

				//鍵盤動作
				obj.addEventListener("mousedownSelf",handleMouseDownSelf);
				obj.addEventListener("mousedownOther",handleMouseDownOther);

				obj.alpha = .5;
				pianoKeyObj[key] = obj;
				n++;
			}
		}
	}


	//シャープ
	{
		var n = 0;
		for (var i in keys) {
			var key = keys[i];
			var _width = 20;

			if(key.match(/s/)){
				var obj = new createjs.Bitmap(images["s"]);
				stage.addChild(obj);

				obj.type = "s";
				obj.note = key;
				obj.alpha = .5;
				obj.x = (n*_width) - 7.5;
				obj.addEventListener("mousedown",handleMouseDown);
				obj.addEventListener("pressup",handleMouseUp);

				//鍵盤動作
				obj.addEventListener("mousedownSelf",handleMouseDownSelf);
				obj.addEventListener("mousedownOther",handleMouseDownOther);

				pianoKeyObj[key] = obj;

			} else {
				n++;
			}
		}
	}
	
	stage.update();

	//mp3のロードを開始
	startSoundLoad();

}

function handleMouseDown(e){
	var target = e.target;

	press(target.note);
}

function handleMouseUp(e){

	var target = e.target;
	release(target.note);

}


function handleMouseDownOther(e){
	var target = e.target;
	target.image = images[target.type == "k" ? "ko" : "so"];
	target.y = 3;
	stage.update();
	setTimeout(function(target){ 
		target.image = images[target.type == "k" ? "k" : "s"];
		target.y = 0;

		stage.update();
	},100,target)

//	console.log("up");
}

function handleMouseDownSelf(e){
	var target = e.target;
	target.image = images[target.type == "k" ? "ks" : "ss"];
	target.y = 3;
	stage.update();
	setTimeout(function(target){ 
		target.image = images[target.type == "k" ? "k" : "s"];
		target.y = 0;

		stage.update();
	},100,target)

//	console.log("up");
}


//ぼりゅーむ
var defaultVolume = 0.8;


/*

	var volume_slider = new VolumeSlider(document.getElementById("volume"), function(v) {
		if(window.localStorage) localStorage.volume = v;
	});
});


var VolumeSlider = function(ele, cb) {
	this.rootElement = ele;
	this.cb = cb;
	var range = document.createElement("input");
	try {
		range.type = "range";
	} catch(e) {
		// hello, IE9
	}
	if(range.min !== undefined) {
		this.range = range;
		$("#volume").append($(range));

		range.className = "volume";
		range.min = "0.0";
		range.max = "1.0";
		range.step = "0.05";
		range.value = localStorage.volume ? localStorage.volume : defaultVolume;

		$(range).on("input", function(evt) {
			console.log(range.value);
			localStorage.volume = range.value;
		});
	} else {
		if(window.console) console.log("warn: no slider");
		// todo
	}
};

VolumeSlider.prototype.set = function(v) {
	if(this.range !== undefined) {
		this.range.value = v;
	} else {
		// todo
	}
};
*/

//一人練習モード
var options = {reconnect:true};
var socket = new Object();
var loginInfo = {};
var sourceObj = {};

var ignoreList = new Object();

function completeMidiDevice(){
	if($("#midi-in").children().length > 1){
		$("#javaGuide").slideUp("fast");
	} else {
		alert("midiデバイスが見つかりませんでした。");
		$("#connectJava").slideDown("fast");
		$("#content").html("");
	}
}


$(function(){


	$("#connectJava").click(function(){

		$(this).fadeOut("fast",function(){
			loadMidiPanel();
		});
	});

})

function updateList(list){

	var htmls = new Array();
	$(list).each(function(i){
		var uid = list[i];
		var isIgnore = ignoreList[uid] ? "class='ignore' style='text-decoration:line-through;background:#999'" : "";
		var view_uid = uid.substr(0,list.length > 10 ? 2 : 3);
		htmls.push("<span class=user "+isIgnore+" uid="+uid+">"+view_uid+"</span>");
	});
	$("#users").html( htmls.join(""));
	$("#onlineNumber").html( htmls.length );

}

	var rooms = [
		{"key":"main","text":"主戦場(メイン)"},
		{"key":"zatsudan","text":"雑談所(雑談部屋)"},
		{"key":"ongaku","text":"音楽室"},
//	{"key":"rendan1","text":"連弾部屋"},
//	{"key":"rendan2","text":"連弾部屋2"},
		{"key":"kodomo","text":"ガキ戦場(小中学生)"},
		{"key":"newbe1","text":"軍事訓練部屋(練習部屋1)"},
//	{"key":"newbe2","text":"練習部屋2"},
//	{"key":"newbe3","text":"練習部屋3"},
//	{"key":"middle1","text":"コンサート"},
		{"key":"middle2","text":"ピアノ教室"},
//	{"key":"izakaya","text":"居酒屋"},
//	{"key":"lounge","text":"ラウンジ"},
		{"key":"pianist","text":"ピアニスト"},
		{"key":"pasonist","text":"パソニスト"},
		{"key":"piko","text":"ピコピコ"},

		{"key":"anon_1","text":"匿名戦場(匿名1)"}
//		{"key":"anon_2","text":"匿名2"}

	];

	var room2name = {};
	for(var i=0;i<rooms.length;i++){
		room2name[rooms[i].key] = rooms[i].text;
	}

$(function(){
	setupRoomSelect();
});

function setupRoomSelect(){

	var html = "<select id=room>";


	for(var i=0;i<rooms.length;i++){
		var room = rooms[i];
		var selected = room.key == defaultRoom ? "checked" : "";
		html += "<option value="+room.key+"></option>";
	}

	html += "</select>";

	$(".room").html(html);

}

function updateRoomNinzu(info){

	var total = 0;

	//ルームの人数を更新
	for(var i=0;i<rooms.length;i++){
		var room = rooms[i];
		var ninzu = info[room.key] || 0;
		$("option[value='"+room.key+"']").text(room.text + " ("+ninzu+")");
		total += ninzu;
	}

	//トータル人数を更新
	$("#totalNumber").html(total);

//info.total

}

$(function(){
	setTimeout("scrollTo(0,1)", 100);

//Port
//	socket = io.connect("nodejs.v2.epiano.jp:1234",options);
//	socket = io.connect("https://epiano.jp:2087",options); //debug
		socket = io.connect("https://epiano.jp:2096",options); //honban
//	socket = io.connect("https://node.epiano.jp:2096",options); //honban

//	socket = io.connect("https://nodejs.epiano.jp:2096",options);

	$(document).on("click",".chart_uid",function(){

		var val = ">" + $(this).attr("val");
		var regexp = new RegExp(val,"g");
		var text = $("#text").val();

		if( text.match(regexp) ){

			$("#text").val(text.replace(regexp,""));

		} else {
			$("#text").val( text + val );
		}
	});


	$(document).on("click",".user",function(){
		$(this).stop();
		set_ignore($(this));
		return false;
	});

	socket.on('room_change',function(roomid){
		nowRoom = roomid;
		talk_parts_update();

		console.log("room:" + roomid);
		$(".login_div").show();


		if(roomid == "main"){
			$(".view_icon").prop("checked",true).prop("disabled",true);

		} else if(roomid == "anon_1"){
			$(".login_div").hide();

		} else {

			console.log("ck:" + getCookie("view_icon"));

			$(".view_icon").prop({"disabled":""});
			if(getCookie("view_icon") == 0){
				$(".view_icon").prop({"checked":""});
			}
		}


		var is_default_room = roomid in room2name ? 1 : 0;
		var title = is_default_room ? room2name[roomid] : roomid;

			$("#room_title").html( title );
			document.title = title;
			location.href = "#"+roomid;

			$(".voicha").attr("src","/voicha/room.cgi/epiano/"+roomid);
		

	});



	socket.on('update:room_member',function(list){
		updateList(list);
	});


	socket.on('update:room_info',function(rooms){
		updateRoomNinzu(rooms);
	});


	function set_ignore(element){

		var uid = $(element).attr("uid");

		if(ignoreList[uid] === undefined){

			$("."+uid).slideUp("fast");

			ignoreList[uid] = 1;
			$(element)
				.addClass("ignore")
				.css("text-decoration","line-through")
				.css("backgroundColor","#999");

		} else {
			delete ignoreList[uid];
			$("."+uid).slideDown("fast");

			$(element)
				.removeClass("ignore")
				.css("text-decoration","")
				.css("backgroundColor","");
		}
	}

	

// いいね関連処理
	setInterval(iine_cleaner,1000);

	function iine_cleaner(){
		var now = new Date();
		var keika = parseInt((now.getTime() - iineDate.getTime()) / 1000);

		if($("#iineKun").css("display") != "none" && keika > 30){
			$("#iineKun").fadeOut();
			myiineCounter = iineCounter = 0;

			$("#iineButton").removeAttr("disabled").removeClass("disabled-iine");

		}
	}

var iineLimit = 999999999999999999999999999999999999999999999999999999999;
var myiineCounter = 0;

{ //拍手関連

	$("#iineButton").css({"cursor":"pointer"});

	$("#iineButton").bind("click",function(e){ 

		e.preventDefault();

		if(myiineCounter++ < iineLimit){
			socket.emit('iine' ,loginInfo.myID);
			return false;
		} else {
			$(this).attr("disabled",true).addClass("disabled-iine");
		}
		return false;
	});

	socket.emit("lock",function(val){
		alert("lock:" + val);
	});


	socket.on('iine',function(uid){
		iine(uid)
	});


	var iineDate = new Date();
	var iineCounter = 0;

	function iine(uid){

		if(ignoreList[uid]){
			return;
		}

		$("#iineCounter").html("+" + ++iineCounter);

		//Playerリストを光らせる
		$("#users").find("[uid="+uid+"]").css("backgroundColor","#FFFF00");
		setTimeout(function(){ $("#users").find("[uid="+uid+"]").css("backgroundColor","") },200);


		if($("#disconnect").is(":checked") == 0){
//			new _play("T180 v1 o5 l32 @2 b<e>").play();
			playBuffer("crap",.1);
		}

		var nowLeft = $("#iineKun").position().left;
		$("#iineKun")
			.stop(true)
			.show()
			.animate({ left: "0%" }, 50).animate({ left: "20%" }, 50)
			.animate({ left: "0%" }, 50).animate({ left: "20%" }, 50)
			.animate({ left: "0%" }, 50);


		iineDate = new Date();

/*
		$("#iineButton").css("backgroundColor","#FFFF00");
		setTimeout(function(){ $("#iineButton").css("backgroundColor","") },200)
*/

	}
}

});

var DEFAULT_VELOCITY = 0.5;

var playings = {};


function playBuffer(key,vol,uid){

	if(vol == undefined || vol < 0){
		vol = DEFAULT_VELOCITY;
	} else if(vol > 1.5){
		vol = 1.5;
	} 

	if( !new String(key).match(/(crap|chat|z0)/) && $("#room").val() == "piko"){

		var match = key.match(/(\w+)((?:-|)\d+)$/);
		var g = match[1];
		    g = g.replace(/s/,"\+");

		var o = parseInt(match[2])+2;

		new _play("@3 T180 o5 l8 v2 o"+o+g).play();

	} else if(key in buffers){

		var source = context.createBufferSource();
		source.buffer = buffers[key];

		var gainNode = context.createGain();
		gainNode.connect(context.destination);

//		gainNode.gain.value = vol * ($(".volume").get(0).value);
		gainNode.gain.value = vol * ($(".volume").get(0).value);


		source.connect(gainNode);
		source.start(0);

		if(!playings[uid+key]){
			playings[uid+key] = [];
		}

		playings[uid+key].push([source,gainNode.gain]);

	} else {
//		console.log("no buffer:" + key);
	}
}

function releaseBuffer(key,uid){

	var id = uid+key;

	if(id in playings){
		for(i in playings[id]){
			var ar = playings[id][i];
			var time = context.currentTime;
			var source = ar[0]
			var gain = ar[1];

			gain.setValueAtTime(gain.value, time);

			var plus = 0.5;
			gain.linearRampToValueAtTime(gain.value * 0.1, time + 0.16 + plus);
			gain.linearRampToValueAtTime(0.0, time + 0.4 + plus);
			source.stop(time + 0.41 + plus);
		}

		delete playings[id];
	} else {
//	console.log("no playings:" + id);
	}
}



var hensinLock;
var onlineNumber;

$(function($) {

	socket.on('login',function(obj){
		loginInfo = obj;
		var room = defaultRoom ? defaultRoom : "main";

		if($("body").prop("midi")){
			socket.emit("midi",$("body").prop("midi"));
		}

		socket.emit("room_set",room);
		$("#room").val(room);
	});

	socket.on("disconnect",function(){
		if(confirm("切断されました。")){
			location.href = "?#"+nowRoom;
		}
		socket = {};
	});

	//弾く
	socket.on('p',function(id,uid,vol){

		if($("#disconnect").is(":checked") == 0){
			playPiano(id,uid,vol);
		}
	});

	//離す
	socket.on('r',function(id,uid){

		if($("#disconnect").is(":checked") == 0){
			releasePiano(id,uid);
		}
	});


});

function releasePiano(id,uid){

	if(ignoreList[uid]){
		return;
	}

	releaseBuffer(id,uid);
}


function playPiano(id,uid,vol){

	var pikaColor = uid == loginInfo.myID ? "#00FF00" : "#FF0000";
	var target = $("#"+id);

	setTimeout(function(){ target.css("backgroundColor","") },100)

	//Playerリストを光らせる
	if($("#disconnect").is(":checked") == 0){

		$("[uid="+uid+"]").css("backgroundColor",pikaColor)
			.stop(true)
			.show()
			.animate({ top: "5px" }, 100).animate({ top: "0px" }, 100)
	}

	setTimeout(function(){ 
		$("[uid="+uid+"]").css("backgroundColor","")
	},200);


	if(ignoreList[uid]){
		return;
	}

	playBuffer(id,vol,uid);

	//鍵盤の動作発動
	if(id in pianoKeyObj){
		pianoKeyObj[id].dispatchEvent(uid == loginInfo.myID ? "mousedownSelf" : "mousedownOther");
	}
}




/* チャット関連 */
var last_submit;
var chat_count = 0;
var chat_max = 999999999999999999999999999999999;
var waitSec = 0;
var seigenCount = 0;

var rentoTimer;
var rentoTimerStart;


$(function(){

	$("form").submit(function(e){
		e.preventDefault();

		var diff = last_submit ? Math.floor((new Date().getTime() - last_submit)/1000) : 0;

		if($("#text").val()){
			socket.emit('talk' ,$("#text").val());
			last_submit = new Date().getTime();

			if(chat_count>=(chat_max-1)){ //制限開始

				waitSec = waitSec* (++seigenCount);

				$("#talkButton").prop("disabled",true);

				$("#text").prop("readonly",true).attr("placeholder","「連投により発言制限中」..?制限外したんだけど? 0/"+waitSec+"..");

				rentoTimerStart = new Date().getTime();

				rentoTimer = setInterval(function(){
					var keika = Math.floor((new Date().getTime() - rentoTimerStart)/1000);
					$("#text").prop("readonly",true).attr("placeholder","連投により発言制限中 "+keika+"/"+waitSec+"..");
				},1000);

				setTimeout(function(){
					$("#talkButton").prop("disabled","");
					chat_count=0;
					clearInterval(rentoTimer);
					$("#text").prop("readonly",false).attr("placeholder","");

				},(waitSec+1)*1000);


			} else { //制限開始

				if(diff < 5){
					chat_count++;
				} else if(chat_count > 0){
					chat_count--;
				}

			}


			$("#text").val("");
		}
	});

	socket.on('log',function(list){

		$("#chat").html("").hide();

		for(var i in list){
			var obj = list[i];
			insertTalk(obj);
		}

		$("#chat").addClass("log_done").show();

		setTimeout(function(){
			setScrollMax();
		},1000);

	});


//	socket.on('talk',function(uid,text,twid,icon){
		socket.on('talk',function(obj){

		var text = obj.comment;
		var uid = obj.uid;

//	alert(text);

		if(ignoreList[uid] === undefined){
				insertTalk(obj);

			if($("#talkSound").is(":checked")){
				playBuffer("chat",.05);
			}

			if( $("#voice").is(":checked") && ! text.match(/http/)){
				if ('speechSynthesis' in window) {

					var _text = text;
					_text = _text.replace("弾","ひ");
					_text = _text.replace("管理人","さとる");

					var uttr = new SpeechSynthesisUtterance();
					uttr.lang = "ja-JP";
					uttr.text = _text;
					speechSynthesis.speak(uttr);

				}
			}
		}



	});
});

function setScrollMax(){
//	var max = $("#chat").get(0).scrollHeight - $("#chat").outerHeight(); ;
	var max = $("#chat").get(0).scrollHeight + 1000; ;
	$("#chat").scrollTop(max);
//	console.log(max);
}


$(function(){
	$("body").append(
		"<style>" + 
		".chart_uid{cursor:pointer}" + 
		".get_anka{background:#ffeeee}" + 
		".self{color:lightgreen}" + 
		".anka{font-size:7pt;padding:1px;background:#fff;color:#444;border:1px solid #ddd;text-decoration:none;border-radius:3px;margin-right:3px;margin-left:3px}" + 

		".ankaSelected{background:#eeeeff}" + 
		".ankaSelectedIcon{color:red;font-weight:bold;border:1px solid red}" + 


		"</style>"
	);

	$(document).on("click",".anka",function(e){
		var id = $(this).attr("val");

		if($(this).hasClass("ankaSelectedIcon")){
			$(this).removeClass("ankaSelectedIcon");
		} else {
			$(this).addClass("ankaSelectedIcon");
		}

		$("."+id).each(function(){
			if($(this).hasClass("ankaSelected")){
				$(this).removeClass("ankaSelected");
			} else {
				$(this).addClass("ankaSelected");
			}
		})

		e.preventDefault();
	});

})

$(function(){

	$("body").append(
		'<style>.youtube_wrap{position:relative;display:inline-block} ' + 
		'.youtubePlayButton{background:rgba(255,0,0,.9);text-align:right;border-radius:4px;padding:2px;position:absolute;bottom:2px;right:2px;color:white;opacity:.8;font-size:4pt;display:inline-block}' + 

		'.url_wrap{padding:1px;position:relative;top:2px;;background:#eee;display:inline-block;overflow: hidden; text-overflow: ellipsis; white-space: nowrap;max-width:150px;font-size:8pt}' + 

		'</style>'
	);

})


$(function(){
	$(document).on("click",".youtube",function(e){

		var vid = $(this).attr("vid");
		openYoutube(vid);
		e.preventDefault();
	})

})


function openYoutube(vid){

		var direct_url = "https://youtu.be/"+vid ;
		var url = "https://www.youtube.com/embed/"+vid ;
		var  current_scrollY = $( window ).scrollTop(); 
		
		$(".wrapper").addClass("fixed");
	
		var fg = $("<div class=fg style='z-index:10000;background:rgba(0,0,0,.3);position:fixed;top:0;left:0;width:100%;height:100%;text-align:center'></div>");

		    fg.append(
				"<iframe frameborder=0 allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' style='background:white;margin-top:20px;width:95%;height:70%;text-align:center' width=100% src='"+url+"'>" + 
				"</iframe>" + 
				"<div style='margin-top:5px'>" + 
				'<div><button class="bt" url='+direct_url+' val="viewmore" style="border-radius:5px;background:#eee;width:200px;margin:5px" type=button><i class="fa fa-external-link" aria-hidden="true"></i>別窓で開く</button></div>' + 
				'<div><button class="bt" val="close" style="border-radius:5px;background:#eee;width:200px;margin:5px" type=button><i class="fa fa-times" aria-hidden="true"></i>閉じる</button></div>' + 
				"</div>" 
				);

		$(".wrapper").css({
			top: (-1 * current_scrollY) + 8
		});

		$(".modal").append(fg);
		fg.hide().fadeIn("fast");
}

function html_parse(html){

	var text = html;
	text = text.replace(/https:\/\/i.imgur.com\/([^\.]+)\.(png|jpg|gif)/g, '[imgur:$1:$2]');
	text = text.replace(/https:\/\/(?:www|\m).youtube.com\/watch\?v=([\d\w_\-]+)(?:&[;\?a-z\.\&=]+|)/g, '[youtube:$1]');
	text = text.replace(/https:\/\/youtu.be\/([\d\w_\-]+)/g, '[youtube:$1]');

	text = text.replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, function($1){
		var url = $1;
		var text = url.replace(/https:\/\/|www\./g,"");

		return '<a target=_blank href="'+url+'"><div class=url_wrap><i class="fa fa-external-link" aria-hidden="true"></i>'+text+'</div></a>'
	});

	text = text.replace(/\[youtube:[^\]]+]/g, function($1){
		var val = $1.match(/\[(.*)\]/)[1].split(/:/);
		var vid = val[1];
		var thumb = "http://img.youtube.com/vi/" +vid + "/default.jpg";
		var url   = "https://www.youtube.com/watch?v=" +vid;
		return '<div class=youtube_wrap><i class="fa fa-play youtubePlayButton" aria-hidden="true"></i>' + 
		'<a class=youtube href="'+url+'" vid="'+vid+'"><img style="height:40px" src='+thumb+'></a></div>';
	});


	text = text.replace(/\[imgur:[^\]]+]/g, function($1){
		var val = $1.match(/\[(.*)\]/)[1].split(/:/);
		var imid = val[1];
		var kaku = val[2];
		var thumb = "https://i.imgur.com/" +imid + "s."+kaku;
		var url   = "https://i.imgur.com/" +imid + "." +kaku;
		return '<a class=imgur data-lightbox="imgur" title="<a href=# class=share_pic>コラボする</a>" href='+url+'><img style="height:40px" src='+thumb+'></a>';
	});
	
	return text;
}


function time2date(_time){
		var time = _time * 1000;
    var d = new Date( time );
		var is_today = (new Date().toLocaleDateString() == d.toLocaleDateString()) ? 1 : 0;

    var month = d.getMonth() + 1;
    var day  = d.getDate();
    var hour = ( '0' + d.getHours() ).slice(-2);
    var min  = ( '0' + d.getMinutes() ).slice(-2);
    var sec   = ( '0' + d.getSeconds() ).slice(-2);

    return is_today ? ( hour + ':' + min )
		                : ( month + '/' + day + " " + hour + ':' + min);

}

//function insertTalk(uid,_text,twid,icon){
function insertTalk(obj){

	var _text = obj.comment;
	var uid = obj.uid;

	var twid = obj.twid;
	var icon = obj.icon;

	var time = obj.time;

	if(nowRoom.match(/anon/)){
		twid = "";
		icon = "";
	}


//	var text = _text;
//	text = text.replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a target=_blank href="$1">$1</a> ');
//	text = new String(text).replace(/(&gt;)([A-Z0-9]{3})/g,"<a val='$2' class=anka href=#>$1$2</a>");

	var text = html_parse(_text);

	var turl = "https://twitter.com/" + twid;

	var new_line;

	if(icon){
		new_line  = $("<div time="+time+" class='ll anon_line lines hide "+uid+"'>" + 
		("<table><tr valign=top><td align=center>" + 


		"<a href='"+turl+"' target=_blank><img class=icon border=0 width=20 height=20 src="+icon + "></a><br>") + 
		"<div style='color:#888;font-size:7pt;' val="+uid+" class='chart_uid'><b>" + uid + "</b></div>"+



		"</td><td>" + 

		"<div class=huki_wrap><div class=huki>" + text + "</div></div>" + 

		"<font color=#999 style='font-size:5pt'>&nbsp;&nbsp;" + time2date(time) + " </font>"+

		"</td></table>" + 

		
									"</div>");

	} else {
		new_line  = $("<div time="+time+" class='ll lines hide "+uid+"'>" + 
									"<b style='word-wrap: normal;color:#888' val="+uid+" class='chart_uid'>" + uid + "：</b>" + text + 
									"<font color=#999 style='font-size:5pt'>&nbsp;" + time2date(time) + " </font>"+
									"</div>");
	}

	if(new String(text).match(new RegExp("&gt;" + loginInfo.myID))){
		new_line.addClass("get_anka");
	}

	if(uid == loginInfo.myID){
		new_line.find(".chart_uid").addClass("self");
	}


	if(obj.is_log){
		$("#chat").prepend(new_line);
	} else {
		$("#chat").append(new_line);
	}

//	console.log("<b>" + uid + "</b>：" + text);
	
	$(new_line).slideDown("fast",function(){ $(this).removeClass("hide") });


	if($("#chat").position().top < 0){
		$("#chat div:first").remove();
	}

	if($("#chat").hasClass("log_done")){

		var now = $("#chat").scrollTop();
		var max = $("#chat").get(0).scrollHeight - $("#chat").outerHeight(); ;
		var per = parseInt(now/max*100);

		console.log("now:" + now + ":per:" + per);

		if($(".ll").length > 20){
			if(per > 90){
				console.log("!set-scroll:" + per);
				setTimeout(function(){
					setScrollMax();
				},500);
			} else {
				console.log("not scroll:" + per);
			}
		} else {
			setScrollMax();
		}

	}


}




/* キーボード関連 */
$(function(){

	function captureKeyboard() {
		if(IS_SP){
			return;
		}

		$(document).on("keydown", handleKeyDown );
		$(document).on("keyup", handleKeyUp);
		$(window).on("keypress", handleKeyPress );
	};

	function releaseKeyboard() {
		if(IS_SP){
			return;
		}

		$(document).off("keydown", handleKeyDown );
		$(document).off("keyup", handleKeyUp);
		$(window).off("keypress", handleKeyPress );
	};

	captureKeyboard();

	$("#text")
	.on("focus",function(){
		releaseKeyboard();
//	console.log("f");
	})
	.on("blur",function(){

		captureKeyboard();
//	console.log("b");
	});



	var Note = function(note, octave) {
		this.note = note;
		this.octave = octave || 0;
	};

	var n = function(a, b) { return {note: new Note(a, b), held: false}; };
	var key_binding = {
		65: n("gs"),
		90: n("a"),
		83: n("as"),
		88: n("b"),
		67: n("c", 1),
		70: n("cs", 1),
		86: n("d", 1),
		71: n("ds", 1),
		66: n("e", 1),
		78: n("f", 1),
		74: n("fs", 1),
		77: n("g", 1),
		75: n("gs", 1),
		188: n("a", 1),
		76: n("as", 1),
		190: n("b", 1),
		191: n("c", 2),

//	222: n("cs", 2),
		222: n("ds", 3),

		49: n("gs", 1),
		81: n("a", 1),
		50: n("as", 1),
		87: n("b", 1),
		69: n("c", 2),
		52: n("cs", 2),
		82: n("d", 2),
		53: n("ds", 2),
		84: n("e", 2),
		89: n("f", 2),
		55: n("fs", 2),
		85: n("g", 2),
		56: n("gs", 2),
		73: n("a", 2),
		57: n("as", 2),
		79: n("b", 2),
		80: n("c", 3),
		189: n("cs", 3),

//	187: n("ds", 3),

		219: n("e", 3),
		192: n("d",3),
		226: n("d",2),

		186: n("cs",2),
		221: n("ds",2),


//	187: n("ds", 3),
//	187: n("ds", 3),

//	221: n("e", 3)
	};

	var capsLockKey = false;
	
	function handleKeyDown(evt) {

//	console.log("DOWN:" + evt.keyCode);

		var code = parseInt(evt.keyCode);
		if(key_binding[code] !== undefined){
			var binding = key_binding[code];
			if(!binding.held) {

				binding.held = true;
				var note = binding.note;
				var octave = 1 + note.octave;
				if(evt.shiftKey) ++octave;
				else if(capsLockKey) --octave;

				var key = (note.note + octave);

				press(key)

			}

			evt.preventDefault();
			evt.stopPropagation();
			return false;


		} else if(code == 240) { // Caps Lock
			capsLockKey = !capsLockKey;
			evt.preventDefault();
		} else if(code== 32){
			$(document).trigger("pressSustain");
			evt.preventDefault();
		}

	};

	function handleKeyUp(evt) {

//	console.log("up:" + evt.keyCode);

		var code = parseInt(evt.keyCode);

		if(key_binding[code] !== undefined) {
			var binding = key_binding[code];
			if(binding.held) {
				binding.held = false;

				var note = binding.note;
				var octave = 1 + note.octave;
				if(evt.shiftKey) ++octave;
				else if(capsLockKey || evt.ctrlKey) --octave;
				note = note.note + octave;

//			console.log(note);

				if($("#pedal").is(":checked")){
					return;
				}

				release(note,loginInfo.myID);



			}
		} else if(code== 32){
			$(document).trigger("releaseSustain");
			evt.preventDefault();
		}


		evt.preventDefault();
		evt.stopPropagation();
		return false;


	};

	function handleKeyPress(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		return false;
	};

});



// スマホ用：音確認
$(function(){
	$('.modal-open').click(function(){
		openModalWindow($(this).attr('data-target'));
	});
});

function openModalWindow(targetId){
	$('body').append('<div class="modal-overlay"></div>');
	$('.modal-overlay').fadeIn('slow');
	var modal = '#' + targetId;
	modalResize();
	$(modal).fadeIn('fast');

	$('.modal-overlay, .modal-close').off().click(function(){
		playBuffer("z0");
		$(modal).fadeOut('fast');
		$('.modal-overlay').fadeOut('fast',function(){
		  $('.modal-overlay').remove();
		});
	});

	$(window).on('resize', function(){
		modalResize();
	});

	function modalResize(){
		var w = $(window).width();
		var h = $(window).height();

		var x = (w - $(modal).outerWidth(true)) / 2;
		var y = (h - $(modal).outerHeight(true)) / 2;

		$(modal).css({'left': x + 'px','top': y + 'px'});
	}
}

//Cookie関連
function setCookie(key, val){
	document.cookie = key + "=" + escape(val) + "; expires=Fri 31-Dec-2030 23:59:59 GMT; domain=.epiano.jp; path=/;";
}
function delCookie(key,val){
	document.cookie = key + "=" + escape(val) + "; expires=Fri 31-Dec-1999 23:59:59 GMT; domain=.epiano.jp; path=/;";
}
function getCookie(key) {
	var values = document.cookie.split("; ");
	var cookies = new Object();
	for(var i in values) {
		var tmp = values[i].split("=");
		cookies[tmp[0]] = tmp[1];
	}
	return cookies[key] ? unescape(cookies[key]) : "";
}
function loadStorage(){
	var ls = new Object();
	for ( var i = 0, len = localStorage.length; i < len; i++ ) {
		var key = localStorage.key(i);
		ls[key] = localStorage.getItem(key);
	}
	return ls;
}
function getStorage(key){
	return localStorage.getItem(key);
}
function setStorage(key,value){
	localStorage[key] = value;
}
function delStorage(key){
	localStorage.removeItem(key);
}


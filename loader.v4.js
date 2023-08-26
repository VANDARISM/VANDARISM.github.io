var context;
var bufferLoader;
var lkeys = {};
function startSoundLoad() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
  console.log("start")
  var lists = [];
  lists.push("z0");
  lists.push("crap");
  lists.push("chat");
  lists.push("a-1", "as-1", "b-1");
  for (var i = 0; i <= 6; i++) {
    lists.push("c" + i, "d" + i, "e" + i, "f" + i, "g" + i, "a" + i, "b" + i);
    lists.push("cs" + i, "ds" + i, "fs" + i, "gs" + i, "as" + i);
  }
  lists.push("c7");
  var sounds = [];
  for (var i in lists) {
    sounds.push("https://epiano.jp/sp/mp3/" + lists[i] + ".mp3");
    lkeys[lists[i]] = parseInt(i);
  }
  bufferLoader = new BufferLoader(context,sounds,finishedLoading);
  bufferLoader.load();
  lists = [];
  sounds = [];
}

$(function() {
    $("#bt1").click(function() {
        var source = context.createBufferSource();
        source.buffer = buffers[lkeys["c1"]];
        source.connect(context.destination);
        source.start(0);
    })
})
var buffers = {};
var loadFinish = 0;
function finishedLoading(bufferList) {
    console.log("complete!");
    loadFinish = 1;
}
function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}
var loadedObj = {};
BufferLoader.prototype.loadBuffer = function(url, index) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    var loader = this;
    request.onload = function() {
        loader.context.decodeAudioData(request.response, function(buffer) {
            if (!buffer) {
                alert('error decoding file data: ' + url);
                return;
            } else {
                var matched = url.match(/\/([^/]+)\.mp3/);
                var key = matched[1];
                buffers[key] = buffer;
                if (key == "z0") {
                    if (isSmartPhone == 1) {
                        openModalWindow("con1");
                    }
                } else {
                    if (pianoKeyObj[key]) {
                        pianoKeyObj[key].alpha = 1;
                        stage.update();
                    }
                }
            }
            loader.bufferList[index] = buffer;
            if (++loader.loadCount == loader.urlList.length)
                loader.onload(loader.bufferList);
        }, function(error) {
            console.error('decodeAudioData error', error);
        });
    }
    request.onerror = function() {
        console.log('BufferLoader: XHR error');
    }
    request.send();
}
BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}

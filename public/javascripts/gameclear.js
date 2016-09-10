//--------------------------------------------------------------------
// ゲームクリア画面
//--------------------------------------------------------------------

// 画像
var imgs = new Array();
imgs[0] = 'circle_ki0.png';
imgs[1] = 'circle_ki1.png';
imgs[2] = 'circle_ki2.png';
imgs[3] = 'circle_ki3.png';

// 画像パス
var path = 'images/';
// 画面上に表示する数
var num = 30
// 更新間隔
var msec = 100;
// 減速率
var decelerationRate = 0.98;

// 画像サイズ
var maxSize = 75;
var minSize = 20;

var hr = new Array();
var vr = new Array();
var flg = new Array();
var obj = new Array();
var posX = new Array();
var posY = new Array();
var imgSize = new Array();
var winX = 800;
var winY = 600;
var scrlX = 0;
var scrlY = 0;
var mouseX = 0;
var mouseY = 0;
var opacity = new Array();
var elem = document.documentElement;
var body = document.body;

start();

// 画像の配置
function start(){
    getWindowSize();
    var rangeSize = maxSize - minSize + 1;
    for( i = 0; i < num; i++ ){
        var j = i % imgs.length;
        imgSize[i] = Math.floor(Math.random() * rangeSize) + minSize;
        posX[i] = Math.floor(Math.random() * (winX - maxSize));
        posY[i] = Math.floor(Math.random() * (winY - maxSize));
        opacity[i] = Math.floor(Math.random() * 40 + 70);
        hr[i] = 0;
        vr[i] = 0;
        flg[i] = 0;

        document.write(
            "<div id='Lay" + i + "' " +
            "style='position : fixed; " +
            "left : " + posX[i] + "px; " +
            "top  : " + posY[i] + "px; " +
            "width  : " + imgSize[i] + "px; " +
            "height : " + imgSize[i] + "px; " +
            "z-index : 1;'>");

        document.write(
              "<img onmouseover='moveT(" + i + ")' " +
              "src='" + path + imgs[j] + "' "+
              "width='"  + imgSize[i] + "' " +
              "height='" + imgSize[i] + "' " +
              "style='cursor : pointer; " +
              "filter : Alpha(opacity=" + opacity[i] + "); " +
              "-moz-opacity :" + opacity[i] / 100 + "; " +
              "opacity :" + opacity[i] / 100 + ";'>" );
        document.write("</div>");
        obj[i] = document.getElementById('Lay' + i).style;
    }
}

// マウスオーバイベント
var xx = 0;
var yy = 0;
var ll = 0;
function moveT(no){
  getWindowSize();
  getScrollSize();
  xx = posX[no] + (imgSize[no] / 2) - (mouseX - scrlX);
  yy = posY[no] + (imgSize[no] / 2) - (mouseY - scrlY);
  ll = Math.pow(xx * xx + yy * yy, 0.5);
  dx = xx / ll;
  dy = yy / ll;

  if( ll < 5 ) {
    ll = 5;
  }
  hr[no] = hr[no] + dx * ll;
  vr[no] = vr[no] + dy * ll;
  if( flg[no] == 0 ){
     flg[no] = 1;
     move(no);
  }
}

// 画像の移動
function move(no){
    posX[no] = posX[no] + hr[no];
    posY[no] = posY[no] + vr[no];
    hr[no] = hr[no] * decelerationRate;
    vr[no] = vr[no] * decelerationRate;

    // Topの移動
    if( posY[no]<0 ){
        vr[no] = -vr[no];
        posY[no] = 0;
    }

    // Leftの移動
    if( posX[no] < 0 ){
        hr[no] = -hr[no];
        posX[no] = 0;
    }

    //Rightの移動
    if( posX[no] > winX - imgSize[no] ){
        hr[no] = -hr[no];
        posX[no] = winX - imgSize[no];
    }

    // Bottomの移動
    if( posY[no] > winY - imgSize[no] ){
        vr[no] = -vr[no];
        posY[no] = winY - imgSize[no];
    }
    obj[no].left = posX[no] + 'px';
    obj[no].top  = posY[no] + 'px';

    if( Math.abs(hr[no]) + Math.abs(vr[no]) > 1){
        if(document.all) {
            setTimeout( 'move(' + no + ')', msec);
        } else{
            setTimeout( move, msec, no );
        }
    }else{
        flg[no]=0;
    }
}

// ウィンドウサイズ取得
function getWindowSize(){
    if( window.innerWidth ){
        winX = window.innerWidth - 18;
        winY = window.innerHeight - 18;
    }else if( elem && elem.clientWidth != 0 ){
        winX = elem.clientWidth;
        winY = elem.clientHeight;
    }else if( body ){
        winX = body.clientWidth;
        winY = body.clientHeight;
    }
}

// スクロール移動サイズ取得
function getScrollSize(){
    if( window.pageXOffset || window.pageYOffset ){
        scrlX = window.pageXOffset;
        scrlY = window.pageYOffset;
    }else{
        scrlX = elem.scrollLeft || body.scrollLeft;
        scrlY = elem.scrollTop  || body.scrollTop;
    }
}

// マウス移動サイズ調整
var mouseX = 0;
var mouseY = 0;
document.onmousemove = getMouse;
function getMouse(evt){
    getScrollSize();
    if( evt ){
        mouseX = evt.pageX;
        mouseY = evt.pageY;
    }else{
        mouseX = window.event.clientX + scrlX;
        mouseY = window.event.clientY + scrlY;
    }
}

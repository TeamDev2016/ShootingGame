jQuery(function($) {
	"use strict";
	var _socket = io.connect('http://'+location.host+'/');
	var _userMap = {};
	var _bulletMap = {};
	var enemyId = 0;
	var enemyCount = 0;
	var elapsedTime = 0;
	// 敵表示時間　3秒～5秒
	var enemyDispTime = Math.floor(Math.random()*2 + 3)*1000;
	var width = $(window).width();
	var height = $(window).height();


	/***
	 *  プレイヤーの生成および更新
	 **/
	_socket.on('player-update',function(data){
		var user;

		// ユーザ未生成の場合
		if(_userMap[data.userId] === undefined){
			console.log('create user '+data.userId , data);
			// ユーザ生成
			user = {x:0,y:0,v:0,rotate:0,userId:data.userId};
			// TODO 画像を変更する
			user.element = $('<img src="/images/unit.png" class="player" />')
				.attr('data-user-id',user.userId);
			$('body').append(user.element);
			_userMap[data.userId] = user;

			// 弾生成
			var bullet = {x:-100,y:-100,v:0,rotate:0,userId:data.userId};
			bullet.element = $('<img src="/images/bullet.png" class="bullet" />')
				.attr('data-user-id',user.userId);
			$('body').append(bullet.element);

			_bulletMap[data.userId] = bullet;

		}else{
			// 生成済のユーザを取り出し
			user = _userMap[data.userId];
		}

		// ユーザの位置情報の更新
		user.x = data.data.x;
		user.y = data.data.y;
		user.rotate = data.data.rotate;
		user.v = data.data.v;
		updateCss(user);
	});

	/***
	 *  弾の位置情報の更新
	 **/
	_socket.on('bullet-create',function(data){
		var bullet = _bulletMap[data.userId];
		if(bullet !== undefined){
			bullet.x = data.data.x;
			bullet.y = data.data.y;
			bullet.rotate = data.data.rotate;
			bullet.v = data.data.v;
		}
	});

	/***
 	 *  ユーザのサーバへの接続の切断
 	 **/
	_socket.on('disconnect-user',function(data){
		var user = _userMap[data.userId];
		if(user !== undefined){
			user.element.remove();
			delete _userMap[data.userId];
			var bullet = _bulletMap[data.userId];
			bullet.element.remove();
			delete _bulletMap[data.userId];
		}

	});


	var _keyMap = [];
	var _player = {x:Math.random()*1000|0,y:Math.random()*500|0,v:0,rotate:0,element:$('#my-player')};
	var _bullet = {x:-100,y:-100,v:0,rotate:0,element:$('#my-bullet')};
	var _enemy = {x:Math.random()*1000|0,y:Math.random()*500|0,v:0,rotate:0,element:$('#enemy')};


  // 位置情報の更新
	var updatePosition = function(unit){
		unit.x += unit.v* Math.cos(unit.rotate * Math.PI /180);
		unit.y += unit.v* Math.sin(unit.rotate * Math.PI /180);
	};

	// CSSの更新
	var updateCss = function(unit){
		unit.element.css({
			left:unit.x|0+'px',
			top:unit.y|0 + 'px',
			transform:'rotate('+unit.rotate+'deg)'
		});
	};

	// プレイヤーの操作(各種キーボードを押下した際の処理)
	var f = function(){

		// LeftKey(←)押下された場合
		if(_keyMap[37] === true){
			_player.rotate -= 3;
		}
		// UpKey(↑)押下された場合
		if(_keyMap[38] === true){
			_player.v += 0.5;
		}
		// RightKey(→)押下された場合
		if(_keyMap[39] === true){
			_player.rotate += 3;
		}
		// DownKey(↓)押下された場合
		if(_keyMap[40] === true){
			_player.v -= 0.5;
		}

		// SpaceKeyが押下された場合
		if(_keyMap[32] === true && _isSpaceKeyUp){
			_isSpaceKeyUp = false;
			_bullet.x = _player.x +20;
			_bullet.y = _player.y +20;
			_bullet.rotate = _player.rotate;
			_bullet.v = Math.max(_player.v + 3,3);
			_socket.emit('bullet-create',{
				x:_bullet.x|0,
				y:_bullet.y|0,
				rotate:_bullet.rotate|0,
				v:_bullet.v
			});
		}

  // 位置情報の更新
		_player.v *= 0.95;
		updatePosition(_player);
		var w_width = $(window).width();
		var w_height =$(window).height();
		if(_player.x < -50){ _player.x = w_width;}
		if(_player.y < -50){ _player.y = w_height;}
		if(_player.x > w_width){_player.x = -50;}
		if(_player.y > w_height){_player.y = -50;}

		updatePosition(_bullet);

		// 弾の位置情報の更新
		for(var key in _bulletMap){
			var bullet = _bulletMap[key];
			updatePosition(bullet);
			updateCss(bullet);

			// 衝突判定
			if(_player.x < bullet.x && bullet.x <_player.x + 50 &&
			_player.y < bullet.y && bullet.y <_player.y + 50){
				location.href = '/gameover';
			}
		}
		updateCss(_bullet);
		updateCss(_player);

		// イベント呼び出し
		_socket.emit('player-update',{x:_player.x|0,y:_player.y|0,rotate:_player.rotate|0,v:_player.v});
		setTimeout(f,30);
	};

	var _isSpaceKeyUp = true;
	setTimeout(f, 30);

  // キーボード監視
	$(window).keydown(function(e){
		_keyMap[e.keyCode] = true;
	});

	$(window).keyup(function(e){
		// Spacekeyが押下された場合
		if(e.keyCode === 32){
			_isSpaceKeyUp = true;
		}
		_keyMap[e.keyCode] = false;
	});

	// 一秒ごとに経過時間を取得する。
	setInterval(function(){ getElapsedTime() },1000);
	// 敵位置の更新
	setTimeout(function(){updatePositionEnemy()});

	function createEnemy() {
		enemyId++;

		// 敵キャラクターの出現位置を生成する。
		var enemy = {x:Math.random()*width|0,y:Math.random()*500|0,v:0,rotate:0};

		// 敵の生成
		enemy.element = $('<img src="/images/mascot.jpg" class="enemy" />')
			.attr('id', "enemyId" + enemyId);
		$('#bg').append(enemy.element);

		updateCss(enemy);

		// 敵表示時間　3秒から5秒の間で表示させる。
		enemyDispTime = Math.floor(Math.random()*2 + 3)*1000;
		elapsedTime = 0;
		enemyCount++;
	}

	/***
	 * 経過時間取得
	 **/
	function getElapsedTime() {
		elapsedTime += 1000;
		// 経過時間と敵表示時間が同じになった場合、敵を表示させる。
		if (elapsedTime == enemyDispTime && enemyCount < 10) {
			createEnemy();
		}
	}

	// 実装途中
	function updatePositionEnemy() {
		$("#enemyId1").animate({
			left:  width	　//要素を動かす位置
	  }, 3000).animate({
			left: "-50px"　//要素を戻す位置
	  }, 0);

		setTimeout(function(){updatePositionEnemy()}, 3000);//アニメーションを繰り返す間隔
	}
});

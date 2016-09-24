function createEnemy() {
    // 敵キャラクターの出現位置を生成する。
    var enemy = { x:Math.random() * 1000 | 0, y:Math.random() * 500 | 0, v:0, rotate:0 };

    // 敵キャラクターの生成
    enemy.element = $('<img src="/images/enemy.png" class="enemy" />').attr('enemyId',enemyId);
    $('#bg').append(enemy.element);

    updateCss(enemy);
    enemyId++;
}

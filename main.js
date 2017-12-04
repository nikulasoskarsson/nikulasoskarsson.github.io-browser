var game = new Phaser.Game(800,600,Phaser.CANVAS,'gameDiv'); // game object

var spacefield; // backgrunnur
var speed; // hraði á bakgrunn scrolli
var player; // player sem er í þessu telfelli mynd af gemskipi
var movement; // hreyfing player
var bullets; //  player skýtur bullets
var enemyBullets; // enemy bullets
var bullettime = 0;
var firebutton; // takki sem skýtur bullets
var score = 0;
var scoreText;
var winText;
var looseText;

var enemies; // óvinir

var mainState = {
	// preload function keyrir áður en að leikurinn fer af stað. Sniðugt til að loada inn myndum og hlutum.
	preload:function(){
		game.load.image('starfield','img/starfield.jpg'); // loada mynd, tekur nafn(id) og síðan location á mynd
		game.load.image('player','img/spaceship.png'); // loada mynd, tekur nafn(id) og síðan location á 
		game.load.image('bullet', 'img/bullet.png'); // loada inn bullet
		game.load.image('enemy','img/enemy.png');
		game.load.image('bullet2','img/bullet2.png');
	},

	// create function, notað til að búa til nýjar breytur eða gefa breytum gildi
	create:function(){

		
		spacefield = game.add.tileSprite(0,0,800,600,'starfield');
		speed = 3;
		player = game.add.sprite(game.world.centerX,game.world.centerY + 200,'player'); // player bætt við, tekur x,y og image id sem parameters
		game.physics.enable(player,Phaser.Physics.ARCADE); // þarf að vera til að hægt sé að hreyfa myndina.
		movement = game.input.keyboard.createCursorKeys(); // movement var af objecti til að hægt sé að sá hvort ýtt hafi verið á takka.
		bullets = game.add.group(); // group fyrir bullet því það er ófyrirsjáanlegt hvað þær verða margar
		bullets.enableBody = true; // til að gera notað physics
		bullets.physicsBodyType = Phaser.Physics.ARCADE; // til að hægt sé að hreyfa mynd
		bullets.createMultiple(30,'bullet'); // size og id sem parameters
		bullets.setAll('anchor.x', 0.5);
		bullets.setAll('anchor.x', 1);
		bullets.setAll('outOfBoundsKill', true);
		bullets.setAll('checkWorldBounds', true); // Skoða hvort það séu fleiri bullets á skjánum

		//handeling fyrir enemy bullets
		enemyBullets = game.add.group(); // group fyrir bullet því það er ófyrirsjáanlegt hvað þær verða margar
		enemyBullets.enableBody = true; // til að gera notað physics
		enemyBullets.physicsBodyType = Phaser.Physics.ARCADE; // til að hægt sé að hreyfa mynd
		enemyBullets.createMultiple(30,'bullet2'); // size og id sem parameters
		enemyBullets.setAll('anchor.x', 0.5);
		enemyBullets.setAll('anchor.x', 1);
		enemyBullets.setAll('outOfBoundsKill', true);
		enemyBullets.setAll('checkWorldBounds', true); // Skoða hvort það séu fleiri bullets á skjánum

		firebutton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR); // spacebar takki til að skjóta

		enemies = game.add.group();
		enemies.enableBody = true;
		enemies.physicsBodyType = Phaser.Physics.ARCADE;

		scoreText = game.add.text(0,550,'Score: ',{font: '32px arial:', fill : '#fff'});
		winText = game.add.text(game.world.centerX,game.world.centerY, 'You win!', {font: '32px arial:', fill : '#fff'});
		winText.visible = false; // á ekki að sjást nema að spilari hafi unnið leikinn

		looseText = game.add.text(game.world.centerX - 200 ,game.world.centerY, 'You loose, press spacebar to play again', {font: '32px arial:', fill : '#fff'});
		looseText.visible = false;

		createEnemies();
	},

	// update function, notað til að birta hluti á skjánn eða sjá um inteeractivity s.s bregðast við notanda input
	update:function(){
		spacefield.tilePosition.y += speed; // fá myndina á hreyfingu með að incrementa position

		if(movement.left.isDown) // ef spilari heldur niðri left arrow key
		{
			player.body.velocity.x = -150; // færa til vinstri með að lækka gildi á x ásnum
		}

		if(movement.right.isDown) // ef spilari heldur niðri left arrow key
		{
			player.body.velocity.x = +150; // færa til vinstri með að lækka gildi á x ásnum
		}

		if (firebutton.isDown || game.input.pointer1.isDown) // ef spilari ýtir á space
		{
			 fireBullet(); // kall í fireBullet function
		}

		game.physics.arcade.overlap(bullets,enemies,collisionHandler,null,this); // leið til að höndla overlapping í phaser
		game.physics.arcade.overlap(enemyBullets,player,playerDie,null,this);
		scoreText.text = 'Score: ' + score;

		if(player.alive == false)
		{
			looseText.visible = true;
		}



		if(score == 4000){
			winText.visible = true;
			scoreText.visible = false;
			

		}
		 enemyFire();

		 
	}
}

// firebullet function,
function fireBullet(){
	if(game.time.now > bullettime)
	{
		bullet = bullets.getFirstExists(false);

		if(bullet)
		{
			bullet.reset(player.x + 30,player.y);
			bullet.body.velocity.y = - 400;
			bullettime = game.time.now + 200;
		}
	}
}

// createEnemeis function notar for loops sem incrementar á y á x ásnum til að búa til óvinaskip
function createEnemies(){
	for(var y = 0;y<4;y++){
		for(var x = 0;x<10;x++){
			var enemy = enemies.create(x * 48,y * 50,'enemy');
			enemy.anchor.setTo(0.5,0.5);
			

		}
	}
	//færa enemies um x og y ásinn með tölu sem incrementar
	enemies.x = 100;
	enemies.y = 50;

	var tween = game.add.tween(enemies).to({x:200},2000,Phaser.Easing.Linear.None,true,0,1000,true); // tween, skil ekki 100% hvernig þetta virkar en getur gert rosalega margt með þessu í phaser, tekur inn slatta af paramters :o

	tween.onLoop.add(descend,this);
}

	function descend(){
		enemies.y +=10;
	}

	function collisionHandler(bullet,enemy){
		bullet.kill(); //bullet fer ekki í gegnum óvin
		enemy.kill(); // óvinur hverfur
		score += 100; // skor hækkar um 100 fyrir hvern óvin sem spilari drepur

	}
	function playerDie(bullet,player){
		bullet.kill();
		player.kill();
		score = 0;
		firebutton.onDown.add(gameLoop,this);
		
	}
	function enemyFire(){
		if(game.time.now > bullettime)
		{
		enemyBullet = enemyBullets.getFirstExists(false);

		if(enemyBullet)
		{
			randomEnemy = enemies.getRandom();
			enemyBullet.reset(randomEnemy.x + 30,randomEnemy.y);
			enemyBullet.body.velocity.y = + 400;
			bullettime = game.time.now + 200;
			console.log(enemies.alive.length);
		}
	}


	}
	

function gameLoop(){
	game.state.add('mainState', mainState);
	game.state.start('mainState');
}
gameLoop();

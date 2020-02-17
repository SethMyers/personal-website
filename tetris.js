//builds rectangle
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
var start = document.getElementById('start');
var gametext = document.getElementById('game');
var pausetext = document.getElementById('pause');
var gameover = false;

context.scale(20, 20);


//clear line when a line is got
function line() {
	let rowCount = 1;
	outer: for (let y=arena.length-1;y>0;--y) {
		for(let x=0;x<arena[y].length;++x){
			if (arena[y][x]===0) {
				continue outer;
			}
		}

		const row = arena.splice(y, 1)[0];
		row.fill(0);
		arena.unshift(row);
		++y;

		player.score += rowCount * 10;
		rowCount *= 2;
	}
}

//set collision with anything marked [1] or edges of canvas
function collide(arena, player) {
	const [m, o] = [player.matrix, player.pos];
	for(let y=0;y<m.length;++y){
		for (let x=0;x<m[y].length;++x){
			if(m[y][x] !== 0 && (arena[y+o.y] && arena[y+o.y][x+o.x]) !== 0) {
				return true;
			}
		}
	}
	return false;
}

//create board state
function createMatrix(w, h) {
	const matrix = [];
	while(h--) {
		matrix.push(new Array(w).fill(0));
	}
	return matrix;
}

function createPiece(type) {
	if (type === 'T') {
		return [
			[0, 0, 0],
			[1, 1, 1],
			[0, 1, 0],
		];
	}
	else if (type === 'O') {
		return [
			[2, 2],
			[2, 2],
		];
	}
	else if (type === 'I') {
		return [
			[3, 0, 0, 0],
			[3, 0, 0, 0],
			[3, 0, 0, 0],
			[3, 0, 0, 0],
		];
	}
	else if (type === 'L') {
		return [
			[0, 4, 0],
			[0, 4, 0],
			[0, 4, 4],
		];
	}
	else if (type === 'J') {
		return [
			[0, 5, 0],
			[0, 5, 0],
			[5, 5, 0],
		];
	}
	else if (type === 'Z') {
		return [
			[6, 6, 0],
			[0, 6, 6],
			[0, 0, 0],
		];
	}
	else if (type === 'S') {
		return [
			[0, 7, 7],
			[7, 7, 0],
			[0, 0, 0],
		];
	}
}

//draw all graphics
function draw() {

	context.fillStyle = '#b4b4b4';
	context.fillRect(0, 0, canvas.width, canvas.height);
	drawMatrix(arena, {x: 0, y: 0});
}

//draw piece
function drawMatrix(matrix, offset) {
	matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if(value !== 0) {
				context.fillStyle = colors[value];
				context.fillRect(x + offset.x, y + offset.y, 1, 1);
			}
		});
	});
}

//update board state with values from current player position
function merge(arena, player) {
	player.matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			if (value !== 0) {
				arena[y+player.pos.y][x+player.pos.x] = value;
			}
		});
	});
}

//message game over
function messageGO() {
	context.font = '30px Arial';
	context.fillStyle = 'red';
	context.textAlign = 'center';
	context.fillText('GAME OVER (press p to play again)', canvas.width/2, canvas.height/2);
}

function playerDrop() {
	player.pos.y++;
	if(collide(arena, player)) {
		player.pos.y--;
		merge(arena, player);
		playerReset();
		line();
		updateSL();
	}
	dropCounter = 0;
}

function playerReset() {
	const pieces = 'ILJOSZT'
	player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);

	if(player.matrix[1][1]!==1){
		player.pos.y = 0;
	}
	else {
		player.pos.y = -1;
	}
	player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

	if (collide(arena, player)) {
		arena.forEach(row => row.fill(0));
		player.score=0;
		player.level=0;
		dropInterval=1000;
		gameover=true;
		updateSL();
		togglePause();
		start.style.display='inline';
		gametext.style.display='inline';
	}
}

function playerRotate(dir) {
	const pos = player.pos.x;
	let offset = 1;
	rotate(player.matrix, dir);
	while (collide(arena, player)) {
		player.pos.x += offset;
		offset = -(offset + (offset > 0 ? 1 : -1));
		if (offset > player.matrix[0].length) {
			rotate(player.matrix, -dir);
			player.pos.x = pos;
			return;
		}
	}
}

function rotate(matrix, dir) {
	for (let y=0;y<matrix.length;++y) {
		for(let x=0;x<y;++x) {
			[
				matrix[x][y], matrix[y][x],
			] = [
			matrix[y][x], matrix[x][y]
			];
		}
	}
	
	if(dir>0) {
		matrix.forEach(row => row.reverse());
	}
	else {
		matrix.reverse();
	}
}

var paused=false;

function togglePause() {
	if (!paused) {
		paused = true;
		if(!gameover){
			pausetext.style.display='inline'
		}
	}
	else if (paused) {
		paused = false;
		pausetext.style.display='none'
		update();
	}
}

let dropCounter = 0;
//drop piece one step every second
let dropInterval = 1000;

//change as time goes 
let lastTime = 0;
function update(time = 0) {
	const deltaTime = time - lastTime;
	lastTime = time;

	//drop piece one step every second
	dropCounter += deltaTime;
	if(dropCounter > dropInterval) {
		playerDrop();
	}
	draw();
	if(!gameover){
		drawMatrix(player.matrix, player.pos);
	}
	if(!paused){
		requestAnimationFrame(update);
	}
}  

function updateSL() {
	if(player.score >= player.level*100){
		player.level++;
		dropInterval = dropInterval-50;
	}

	document.getElementById('score').innerText = 'Score: ' + player.score + ' Level: ' + player.level;
}

const colors = [
	null,
	'purple',
	'yellow',
	'aquamarine',
	'orange',
	'blue',
	'red',
	'magenta',
]

//create board state
const arena = createMatrix(12, 20);


//contains current position of current piece
const player = {
	pos: {x: 0, y: 0},
	matrix: createPiece('O'),
	score: 0,
	level: 1,
}

//handling keystrokes
document.addEventListener('keydown', event => {
	if(!paused){
		//left
		if(event.keyCode === 37) {
			player.pos.x--;
			if(collide(arena, player)) {
				player.pos.x++;
			}
		}
		//right
		else if(event.keyCode === 39) {
			player.pos.x++;
			if(collide(arena, player)) {
				player.pos.x--;
			}
		}
		//down
		else if(event.keyCode === 40) {
			//prevent scrolling when down is pressed
			event.preventDefault();
			playerDrop();
		}
		//rotate (z)
		else if(event.keyCode === 90) {
			playerRotate(-1);
		}
		//rotate (x)
		else if(event.keyCode === 88) {
			playerRotate(1);
		}
		//jump piece to bottom (space bar)
		else if(event.keyCode === 32) {
			event.preventDefault();
			const [m, o] = [player.matrix, player.pos];
			let hit=0;
			while(hit!=1){
				for(let y=0;y<m.length;++y){
					for (let x=0;x<m[y].length;++x){
						if(m[y][x] !== 0 && (arena[y+o.y] && arena[y+o.y][x+o.x]) !== 0) {
							hit = 1;
						}
					}
				}
				o.y++;
			}
			player.pos.y=o.y-2;
			dropCounter=dropInterval;
		}
	}
	//pause (p)
	if(event.keyCode === 80) {
		togglePause();
	}

	else if(event.keyCode === 82) {
		arena.forEach(row => row.fill(0));
		player.score=0;
		player.level=0;
		dropInterval=1000;
		paused=false;
		pausetext.style.display='none'
		updateSL();
		playerReset();
		update();
	}
});

draw();
updateSL();
start.onclick = function() {
	start.style.display = 'none';
	gametext.style.display = 'none';
	playerReset();
	update();
	if(paused){
		togglePause();
	}
	gameover = false;
};
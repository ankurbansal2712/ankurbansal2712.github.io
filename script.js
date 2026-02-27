var board; 
var score = 0; 
var rows = 4; 
var columns =4;
var board_change = false;
let moveLock = false; 
var move_counter = 0;
let win_tag = false;
let timerInterval = null; 
let timeElapsed = 0;
let timerStarted = false; 
let isPaused = false;
let HighestTileValue = 0; 

window.onload = function(){
  setGame();
  document.getElementById("RestartButton").addEventListener("click",restartGame); 
  document.getElementById("pauseButton").addEventListener("click",togglePause);
}

function setGame(){
	move_counter = 0;
	win_tag = false;
	moveLock = false;
	isPaused = false;
	score = 0;
	HighestTileValue = 0;
	document.getElementById("pauseButton").innerText = "Pause"; 
	document.body.classList.remove("paused");
	
	resetTimer();
	timerStarted = false; 
	board = [
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0]
    ]
	spawnRandomTile();
	spawnRandomTile();
    
    for(let r=0; r<rows; r++){
      for(let c=0; c<columns; c++){
        let tile = document.createElement("div"); 
        tile.id = r.toString() + "-" + c.toString();
        let num = board[r][c];
        updateTile(tile,num);
        document.getElementById("board").append(tile);
      }
    }
 updateGameUI();	
}

function updateTile(tile, num){
  tile.innerText = "";
  tile.classList.value = "";
  tile.classList.add("tile"); 
  if(num>0){
    tile.innerText = num; 
    if(num<=4096){
      tile.classList.add("x"+num.toString());
    } else {
      tile.classList.add("x8192");
    }
  }
}

document.addEventListener("keydown", (e)=>{

  if (e.repeat || moveLock || isPaused) return;

  moveLock = true;

  let oldBoard = JSON.stringify(board);

  if(e.code=="ArrowLeft") slideLeft();
  else if(e.code=="ArrowRight") slideRight();
  else if(e.code=="ArrowUp") slideUp();
  else if(e.code=="ArrowDown") slideDown();

  renderBoard();

  if(oldBoard !== JSON.stringify(board)){
    setTimeout(() => {
		if(!timerStarted){
			startTimer(); 
			timerStarted = true; 
		}
      spawnRandomTile();  
	  move_counter += 1;
	  HighestTile();
	  updateGameUI();
	  if (isGameOver()) {
			stopTimer();
			alert("Game Over!");
		}
	if (!win_tag && isGameWon(board)) {
		win_tag = true;
		stopTimer();
		alert("You reached 2048!");
		}	  
      moveLock = false;
    }, 200);
  } else {
    moveLock = false;
  }
});

function filterZero(row){
  return row.filter(num => num!=0);
}

function slideRow(row){
 
  row = filterZero(row); 
  for (let i=0; i<row.length-1; i++){
    if(row[i]==row[i+1]){
      row[i] *=2; 
      row[i+1]=0; 
      score += row[i];
	   renderScore();
	  
	  console.log("Merging", row[i]);
    }
  }
  row = filterZero(row);
  while(row.length<columns){
    row.push(0);
  }
  return row; 
}

function slideLeftCore(){
  for(let r=0; r<rows; r++){
    let row = board[r]; 
    row = slideRow(row); 
    board [r] = row; 
    }
}

function slideLeft(){
  slideLeftCore();
}

function slideRight(){
  board = reverse(board);
  slideLeftCore(); 
  board = reverse(board);
}

function slideUp(){
  board = transpose(board);             
  slideLeftCore();       
  board = transpose(board);    
}

function slideDown(){  
  board = transpose(board);
  board = reverse(board);
  slideLeftCore();
  board = reverse(board);
  board = transpose(board);
}

function transpose(board) {
  let newBoard = [];
  for (let c = 0; c < columns; c++) {
    newBoard[c] = [];
    for (let r = 0; r < rows; r++) {
      newBoard[c][r] = board[r][c];
    }
  }
  return newBoard;
}

function reverse(board) {
  return board.map(row => [...row].reverse());
}

function renderBoard(){
  for(let r = 0; r < rows; r++){
    for(let c = 0; c < columns; c++){
      let tile = document.getElementById(r + "-" + c);
      updateTile(tile, board[r][c]);
    }
  }
}

function renderScore(){
  document.getElementById("score").innerText = score;
}

function renderMoveCounter(){
	document.getElementById("move_counter").innerText = move_counter;
}

function isGameWon(board){
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < columns; c++) {
			if (board[r][c] === 2048) {
				return true;
      }
    }
  }
  return false;
}

function isBoardFull(board){
	return board.flat().every(num=>num!==0); 
}

function generateTileValue() {
  return Math.random() < 0.9 ? 2 : 4;
}	

function spawnRandomTile() {

  // 1️⃣ Collect all empty cells
  let emptyCells = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (board[r][c] === 0) {
        emptyCells.push({ r: r, c: c });
      }
    }
  }

  // 2️⃣ If no empty cell → do nothing
  if (emptyCells.length === 0) return;

  // 3️⃣ Pick random empty cell
  let randomIndex = Math.floor(Math.random() * emptyCells.length);
  let randomCell = emptyCells[randomIndex];

  // 4️⃣ Place 2 or 4
  board[randomCell.r][randomCell.c] = generateTileValue();
  console.log("Spawning tile...");
}

function isBoardChanged(Oldboard, newBoard){
 for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      if (Oldboard[r][c] !== newBoard[r][c]) {
        return true; 
      }
    }
 }
 return false; 
}

function canMerge() {

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {

      // Check right neighbor
      if (c < columns - 1 && board[r][c] === board[r][c + 1]) {
        return true;
      }

      // Check bottom neighbor
      if (r < rows - 1 && board[r][c] === board[r + 1][c]) {
        return true;
      }

    }
  }

  return false;
}

function isGameOver() {
  return isBoardFull(board) && !canMerge();
}

function restartGame(){
	document.getElementById("board").innerHTML = ""; 
	win_tag = false; 
	setGame();
}

function startTimer(){
		timerInterval = setInterval(()=>{
		timeElapsed++;
		
		let minutes = Math.floor(timeElapsed / 60);
		let seconds = timeElapsed % 60; 
		
		let formatted =  String(minutes).padStart(2,'0')+":"+String(seconds).padStart(2,'0');
		
		document.getElementById("timer").innerText = formatted; 
	},1000);
}

function stopTimer(){
	clearInterval(timerInterval);
}

function resetTimer(){
	clearInterval(timerInterval); 
	timeElapsed = 0; 
	document.getElementById("timer").innerText = "00:00";
}

function togglePause(){
	if(!isPaused){
		isPaused = true; 
		stopTimer();
		document.body.classList.add("paused");
		document.getElementById("pauseButton").innerText = "Resume";
	}
	else {
		isPaused = false; 
		startTimer();
		document.body.classList.remove("paused");
		document.getElementById("pauseButton").innerText = "Pause";
	}
}	

function HighestTile(){
	let max = 0; 
	for(let r = 0; r < rows; r++){
    for(let c = 0; c < columns; c++){
      if(board[r][c]>max){
		  max = board[r][c];
	  }
    }
  }
	HighestTileValue = max;
}

function renderHighestTile(){
	document.getElementById("highest_tile").innerText = HighestTileValue;
}

function updateGameUI(){
	renderBoard(); 
	renderMoveCounter();
	renderScore();
	renderHighestTile();
}
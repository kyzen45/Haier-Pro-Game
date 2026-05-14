//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 80;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let gameStarted = false;
let score = 0;
let highScore = localStorage.getItem('flappyBirdHighScore') || 0;

// Bird animation for start screen
let birdBounce = 0;
let birdBounceSpeed = 0.15;
let birdBounceDirection = 1;

// Background music
let backgroundMusic;
let musicStarted = false;

// Sound effects
let jumpSound;
let pointSound;
let dieSound;

// Background image
let bgImg;

// Game over image
let gameOverImg;

// Used to prevent duplicate jumps from touch + pointer firing together
let lastTapTime = 0;

// Reward list variables
let showRewardList = false;
let rewardButton = {
    x: boardWidth - 120,
    y: boardHeight - 60,
    width: 100,
    height: 40
};

// Reward data structure
let rewards = [
    { score: 5, reward: "5 points = Tumbler" },
    { score: 15, reward: "15 points = Umbrella" },
    { score: 20, reward: "20 points = Pen and Notebook" },
    { score: 25, reward: "25 points = Pen, Notebook,Tumbler \n                   and Umbrella" }
];

// Stop mobile browser gestures/scrolling/zooming
document.addEventListener("touchmove", function(e) {
    e.preventDefault();
}, { passive: false });

document.addEventListener("gesturestart", function(e) {
    e.preventDefault();
}, { passive: false });

document.addEventListener("gesturechange", function(e) {
    e.preventDefault();
}, { passive: false });

document.addEventListener("gestureend", function(e) {
    e.preventDefault();
}, { passive: false });

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    // Extra mobile/in-app browser protection
    board.style.touchAction = "none";
    document.body.style.touchAction = "none";
    document.documentElement.style.touchAction = "none";

    //load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Load background image
    bgImg = new Image();
    bgImg.src = "./flappybirdbg.png";

    // Load game over image
    gameOverImg = new Image();
    gameOverImg.src = "./sound/1796f5c1-d9ae-43bc-8374-9ff4a7e5b420.jpg";

    // Initialize background music
    backgroundMusic = document.getElementById("backgroundMusic");
    backgroundMusic.volume = 0.3; // Set volume to 30%

    // Initialize jump sound
    jumpSound = document.getElementById("jumpSound");
    jumpSound.volume = 0.5; // Set volume to 50%

    // Initialize point sound
    pointSound = document.getElementById("pointSound");
    pointSound.volume = 0.6; // Set volume to 60%

    // Initialize die sound
    dieSound = document.getElementById("dieSound");
    dieSound.volume = 0.7; // Set volume to 70%

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds

    // Desktop keyboard controls
    document.addEventListener("keydown", moveBird);

    // Best controls for mobile + Facebook Messenger in-app browser
    window.addEventListener("pointerdown", handleTap, { passive: false });
    window.addEventListener("touchstart", handleTap, { passive: false });
    window.addEventListener("touchend", blockTouch, { passive: false });

    // Desktop mouse click
    window.addEventListener("mousedown", handleTap, { passive: false });

    // Extra backup directly on the canvas
    board.addEventListener("pointerdown", handleTap, { passive: false });
    board.addEventListener("touchstart", handleTap, { passive: false });
    board.addEventListener("mousedown", handleTap, { passive: false });
};

function update() {
    requestAnimationFrame(update);

    context.clearRect(0, 0, board.width, board.height);

    // Show "Get Ready" message if game hasn't started
    if (!gameStarted) {
        // Draw background image
        if (bgImg && bgImg.complete) {
            context.drawImage(bgImg, 0, 0, board.width, board.height);
        } else {
            // Fallback to solid color if image not loaded
            context.fillStyle = "#70c5ce";
            context.fillRect(0, 0, board.width, board.height);
        }
        
        // Update bird bounce animation
        birdBounce += birdBounceSpeed * birdBounceDirection;
        if (birdBounce > 10 || birdBounce < -10) {
            birdBounceDirection *= -1;
        }
        
        // Draw bird with bounce animation
        let birdYWithBounce = bird.y + birdBounce;
        context.drawImage(birdImg, bird.x, birdYWithBounce, bird.width, bird.height);
        
                
        // "GET READY" text - large and prominent like Flappy Bird
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 3;
        context.font = "bold 40px 'Arial Black', sans-serif";
        context.textAlign = "center";
        context.strokeText("GET READY", boardWidth/2, boardHeight/2 - 80);
        context.fillText("GET READY", boardWidth/2, boardHeight/2 - 80);
        
        // "Tap to Start" instruction
        context.font = "bold 24px Arial, sans-serif";
        context.strokeText("Tap to Start", boardWidth/2, boardHeight/2 - 20);
        context.fillText("Tap to Start", boardWidth/2, boardHeight/2 - 20);
        
        // Small instruction text
        context.font = "16px Arial, sans-serif";
        context.fillStyle = "white";
        context.fillText("or press Space", boardWidth/2, boardHeight/2 + 10);
        
        // Draw reward button
        context.fillStyle = "#FFD700";
        context.strokeStyle = "#000000";
        context.lineWidth = 2;
        context.fillRect(rewardButton.x, rewardButton.y, rewardButton.width, rewardButton.height);
        context.strokeRect(rewardButton.x, rewardButton.y, rewardButton.width, rewardButton.height);
        
        // Reward button text
        context.fillStyle = "#000000";
        context.font = "bold 14px Arial, sans-serif";
        context.textAlign = "center";
        context.fillText("Rewards", rewardButton.x + rewardButton.width/2, rewardButton.y + rewardButton.height/2 + 5);
        
        // Show reward list if active
        if (showRewardList) {
            // Draw semi-transparent overlay
            context.fillStyle = "rgba(0, 0, 0, 0.8)";
            context.fillRect(0, 0, board.width, board.height);
            
            // Draw reward list background
            context.fillStyle = "#FFFFFF";
            context.strokeStyle = "#FFD700";
            context.lineWidth = 3;
            let listWidth = 320;
            let listHeight = 320;
            let listX = (boardWidth - listWidth) / 2;
            let listY = (boardHeight - listHeight) / 2;
            context.fillRect(listX, listY, listWidth, listHeight);
            context.strokeRect(listX, listY, listWidth, listHeight);
            
            // Title
            context.fillStyle = "#000000";
            context.font = "bold 24px Arial, sans-serif";
            context.textAlign = "center";
            context.fillText("Reward List", boardWidth/2, listY + 35);
            
            // Draw rewards
            context.font = "16px Arial, sans-serif";
            context.textAlign = "left";
            let startY = listY + 60;
            for (let i = 0; i < rewards.length; i++) {
                let reward = rewards[i];
                let y = startY + (i * 35);
                
                // Reward name - handle multi-line text
                context.fillStyle = "#FF6B6B";
                let lines = reward.reward.split('\n');
                for (let j = 0; j < lines.length; j++) {
                    context.fillText(lines[j], listX + 20, y + (j * 20));
                }
            }
            
            // Close button
            context.fillStyle = "#FF4444";
            context.strokeStyle = "#FFFFFF";
            context.lineWidth = 2;
            let closeBtnSize = 30;
            let closeBtnX = listX + listWidth - closeBtnSize - 10;
            let closeBtnY = listY + 10;
            context.fillRect(closeBtnX, closeBtnY, closeBtnSize, closeBtnSize);
            context.strokeRect(closeBtnX, closeBtnY, closeBtnSize, closeBtnSize);
            
            // Close button X
            context.strokeStyle = "#FFFFFF";
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(closeBtnX + 5, closeBtnY + 5);
            context.lineTo(closeBtnX + closeBtnSize - 5, closeBtnY + closeBtnSize - 5);
            context.moveTo(closeBtnX + closeBtnSize - 5, closeBtnY + 5);
            context.lineTo(closeBtnX + 5, closeBtnY + closeBtnSize - 5);
            context.stroke();
        }
        
        // Reset text alignment
        context.textAlign = "left";
        return;
    }

    // Draw background image for main game
    if (bgImg && bgImg.complete) {
        context.drawImage(bgImg, 0, 0, board.width, board.height);
    } else {
        // Fallback to solid color if image not loaded
        context.fillStyle = "#70c5ce";
        context.fillRect(0, 0, board.width, board.height);
    }

    //bird - only apply physics and check boundaries if game is not over
    if (!gameOver) {
        velocityY += gravity;
        bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit bird.y to top of canvas

        if (bird.y > board.height) {
            gameOver = true;
            playDieSound();
        }
    }
    
    // Always draw the bird
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    //pipes - only move and draw if game is not over
    if (!gameOver) {
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5; //0.5 because there are 2 pipes, so 0.5 + 0.5 = 1
                pipe.passed = true;
                
                // Play point sound effect when a full point is scored (every 0.5 becomes 1)
                if (score % 1 === 0) {
                    if (pointSound) {
                        pointSound.currentTime = 0; // Reset to start
                        pointSound.play().catch(error => {
                            console.log("Point sound play failed:", error);
                        });
                    }
                }
            }

            if (detectCollision(bird, pipe)) {
                gameOver = true;
                playDieSound();
            }
        }

        //clear pipes - only clear if game is not over
        while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
            pipeArray.shift(); //removes first element from the array
        }
    } else {
        // Still draw existing pipes when game is over, but don't move them
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        }
    }

    //score and highscore - always draw these
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    //highscore
    context.font = "20px sans-serif";
    context.fillText("High: " + highScore, 5, 75);

    if (gameOver) {
        // Update highscore if current score is higher
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyBirdHighScore', highScore);
        }
        
        // Draw semi-transparent overlay for floating display
        context.fillStyle = "rgba(0, 0, 0, 0.7)";
        context.fillRect(0, boardHeight/2 - 120, boardWidth, 240);
        
        // Draw border for floating display
        context.strokeStyle = "#FFD700";
        context.lineWidth = 3;
        context.strokeRect(10, boardHeight/2 - 110, boardWidth - 20, 220);
        
        // GAME OVER text
        context.fillStyle = "#FF4444";
        context.font = "bold 36px sans-serif";
        context.textAlign = "center";
        context.fillText("GAME OVER", boardWidth/2, boardHeight/2 - 60);
        
        // Score display
        context.fillStyle = "white";
        context.font = "bold 28px sans-serif";
        context.fillText("Score: " + Math.floor(score), boardWidth/2, boardHeight/2 - 10);
        
        // Highscore display
        context.fillStyle = "#FFD700";
        context.font = "bold 24px sans-serif";
        context.fillText("High Score: " + Math.floor(highScore), boardWidth/2, boardHeight/2 + 30);
        
        // Show new highscore message
        if (score > 0 && score == highScore) {
            context.fillStyle = "#00FF00";
            context.font = "bold 20px sans-serif";
            context.fillText("NEW HIGHSCORE!", boardWidth/2, boardHeight/2 + 60);
        }
        
        // Draw game over image
        if (gameOverImg && gameOverImg.complete) {
            let imgWidth = 200;
            let imgHeight = 150;
            let imgX = (boardWidth - imgWidth) / 2;
            let imgY = boardHeight/2 - 180;
            context.drawImage(gameOverImg, imgX, imgY, imgWidth, imgHeight);
        }
        
        // Restart instruction - draw last so it's on top
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.font = "bold 20px sans-serif";
        context.textAlign = "center";
        context.strokeText("Tap to restart", boardWidth/2, boardHeight/2 + 90);
        context.fillText("Tap to restart", boardWidth/2, boardHeight/2 + 90);
        
        // Reset text alignment
        context.textAlign = "left";
    }
}

function placePipes() {
    if (gameOver || !gameStarted) {
        return;
    }

    //(0-1) * pipeHeight/2.
    //0 -> -128
    //1 -> -384
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        e.preventDefault();
        jumpBird();
    }
}

function handleTap(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Prevent double jump caused by multiple event types firing together
    let now = Date.now();
    if (now - lastTapTime < 80) {
        return;
    }
    lastTapTime = now;

    // Get tap coordinates
    let rect = board.getBoundingClientRect();
    let x = (e.clientX || e.touches[0].clientX) - rect.left;
    let y = (e.clientY || e.touches[0].clientY) - rect.top;

    // Scale coordinates to canvas size
    x = x * (board.width / rect.width);
    y = y * (board.height / rect.height);

    // Check if reward list is open
    if (showRewardList && !gameStarted) {
        // Check for close button click
        let listWidth = 320;
        let listHeight = 320;
        let listX = (boardWidth - listWidth) / 2;
        let listY = (boardHeight - listHeight) / 2;
        let closeBtnSize = 30;
        let closeBtnX = listX + listWidth - closeBtnSize - 10;
        let closeBtnY = listY + 10;

        if (x >= closeBtnX && x <= closeBtnX + closeBtnSize &&
            y >= closeBtnY && y <= closeBtnY + closeBtnSize) {
            showRewardList = false;
            return;
        }
        
        // Don't process other taps when reward list is open
        return;
    }

    // Check for reward button click (only on start screen)
    if (!gameStarted && !showRewardList) {
        if (x >= rewardButton.x && x <= rewardButton.x + rewardButton.width &&
            y >= rewardButton.y && y <= rewardButton.y + rewardButton.height) {
            showRewardList = true;
            return;
        }
    }

    jumpBird();
}

function blockTouch(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
}

function jumpBird() {
    // Start the game on first interaction
    if (!gameStarted) {
        gameStarted = true;
        bird.y = birdY;
        velocityY = 0;
        return;
    }

    // Start background music on first interaction
    if (!musicStarted && backgroundMusic) {
        backgroundMusic.play().then(() => {
            backgroundMusic.muted = false;
            musicStarted = true;
        }).catch(error => {
            console.log("Audio play failed:", error);
        });
    }

    //reload page when game is over
    if (gameOver) {
        location.reload();
        return;
    }

    // Play jump sound effect (only when actually jumping)
    if (jumpSound) {
        jumpSound.currentTime = 0; // Reset to start for overlapping sounds
        jumpSound.play().catch(error => {
            console.log("Jump sound play failed:", error);
        });
    }

    //jump (only if game is active)
    velocityY = -6;
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function playDieSound() {
    // Pause background music when player dies
    if (backgroundMusic && !backgroundMusic.paused) {
        backgroundMusic.pause();
    }
    
    if (dieSound) {
        dieSound.currentTime = 0; // Reset to start
        dieSound.play().catch(error => {
            console.log("Die sound play failed:", error);
        });
    }
}
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Canvas'ı tam ekran yap
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Resimleri yükle
const dinoImg = new Image();
dinoImg.src = 'fotolar/dino.png';

const groundImg = new Image();
groundImg.src = 'fotolar/altbackground.png';

const backgroundImg = new Image();
backgroundImg.src = 'fotolar/background.png';

const cactusImg = new Image();
cactusImg.src = 'fotolar/cactus.png';

// Müzik
const gameMusic = new Audio('muzikler/sacıpembe.mp3');
gameMusic.loop = true; // Müzik sürekli çalsın

// Oyun değişkenleri
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0; // High score'u localStorage'dan al
let gameSpeed = 6;
let gameOver = false;
let gameStarted = false;
let bgOffset = 0;

// Dino özellikleri
const dino = {
    x: canvas.width / 4,  // Dinoyu ekranın 1/4'üne konumlandır (önceden 100'dü)
    y: canvas.height - 150,
    width: 100,
    height: 100,
    jumping: false,
    jumpForce: 20,
    gravity: 0.8,
    velocityY: 0,
    draw() {
        ctx.drawImage(dinoImg, this.x, this.y, this.width, this.height);
    }
};

// Kaktüs sınıfı
class Cactus {
    constructor() {
        this.width = 60;  // Kaktüs boyutunu ayarladık
        this.height = 100;  // Kaktüs boyutunu ayarladık
        this.x = canvas.width;
        this.y = canvas.height - 130;  // Kaktüs pozisyonunu ayarladık
    }

    draw() {
        ctx.drawImage(cactusImg, this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= gameSpeed;
        this.draw();
    }
}

const obstacles = [];
let spawnTimer = 0;

// Arka planı çiz
function drawBackground() {
    // Arka plan resmini çiz
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height - 50);
    // Zemini çiz
    ctx.drawImage(groundImg, 0, canvas.height - 50, canvas.width, 50);
}

// Skor gösterimi
function drawScore() {
    ctx.font = '30px "Press Start 2P", monospace';
    
    // Normal skor
    const scoreText = `Score: ${Math.floor(score)}`;
    ctx.fillStyle = '#000000';
    ctx.fillText(scoreText, 60, 75);
    
    // High score
    const highScoreText = `High Score: ${Math.floor(highScore)}`;
    ctx.fillText(highScoreText, 60, 120);
}

// Başlangıç ekranı
function drawStartScreen() {
    drawBackground();
    dino.draw();
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Başlık
    ctx.fillStyle = '#000000';
    ctx.font = '50px "Press Start 2P", monospace';
    const titleText = 'PATLAK ZIPLATMA';
    const titleMetrics = ctx.measureText(titleText);
    const titleTextX = centerX - titleMetrics.width / 2;
    ctx.fillText(titleText, titleTextX, centerY - 40);
    
    // Alt metin
    ctx.font = '20px "Press Start 2P", monospace';
    const subtitleText = 'Press SPACE to Start';
    const subtitleMetrics = ctx.measureText(subtitleText);
    const subtitleTextX = centerX - subtitleMetrics.width / 2;
    ctx.fillText(subtitleText, subtitleTextX, centerY + 40);
}

// Çarpışma kontrolü
function checkCollision(obstacle) {
    const dinoBox = {
        x: dino.x + 20,
        y: dino.y + 20,
        width: dino.width - 40,
        height: dino.height - 20
    };
    
    const obstacleBox = {
        x: obstacle.x + 10,
        y: obstacle.y + 10,
        width: obstacle.width - 20,
        height: obstacle.height - 20
    };
    
    if (dinoBox.x < obstacleBox.x + obstacleBox.width &&
        dinoBox.x + dinoBox.width > obstacleBox.x &&
        dinoBox.y < obstacleBox.y + obstacleBox.height &&
        dinoBox.y + dinoBox.height > obstacleBox.y) {
        gameOver = true;
        gameMusic.pause(); // Çarpışma olunca müziği durdur
        return true;
    }
    return false;
}

// Ana oyun döngüsü
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        drawStartScreen();
        requestAnimationFrame(gameLoop);
        return;
    }

    drawBackground();

    // Dino zıplama fiziği
    if (dino.jumping) {
        dino.velocityY += dino.gravity;
        dino.y += dino.velocityY;

        if (dino.y > canvas.height - 150) {
            dino.y = canvas.height - 150;
            dino.jumping = false;
            dino.velocityY = 0;
        }
    }

    // Engel oluşturma ve güncelleme
    if (!gameOver) {
        spawnTimer++;
        if (spawnTimer > 60) {
            spawnTimer = 0;
            if (Math.random() < 0.3) {
                obstacles.push(new Cactus());
            }
        }
        
        score += 0.1;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore); // High score'u kaydet
        }
        gameSpeed = 6 + Math.floor(score / 100);
    }

    // Engelleri güncelle ve çarpışma kontrolü
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();

        if (checkCollision(obstacles[i])) {
            gameOver = true;
        }

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
            if (score % 100 === 0) {
                gameSpeed += 0.5;
            }
        }
    }

    dino.draw();
    drawScore();

    if (gameOver) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Game Over yazıları
        ctx.fillStyle = '#000000';
        ctx.font = '60px "Press Start 2P", monospace';
        const gameOverText = 'GAME OVER';
        const gameOverMetrics = ctx.measureText(gameOverText);
        const gameOverX = centerX - gameOverMetrics.width / 2;
        ctx.fillText(gameOverText, gameOverX, centerY);
        
        ctx.font = '30px "Press Start 2P", monospace';
        const restartText = 'Press SPACE to restart';
        const restartMetrics = ctx.measureText(restartText);
        const restartX = centerX - restartMetrics.width / 2;
        ctx.fillText(restartText, restartX, centerY + 60);
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Kontroller
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameOver) {
            gameOver = false;
            gameStarted = false;
            score = 0;
            gameSpeed = 6;
            obstacles.length = 0;
            dino.y = canvas.height - 150;
            dino.jumping = false;
            dino.velocityY = 0;
            gameLoop();
            document.getElementById('instructions').classList.remove('hidden');
            gameMusic.currentTime = 0; // Müziği başa sar
            gameMusic.play(); // Müziği çal
        } else if (!gameStarted) {
            gameStarted = true;
            document.getElementById('instructions').classList.add('hidden');
            gameMusic.play(); // Müziği çal
        } else if (!dino.jumping) {
            dino.jumping = true;
            dino.velocityY = -dino.jumpForce;
        }
    } else if (e.code === 'ArrowUp' && !dino.jumping && gameStarted && !gameOver) {
        dino.jumping = true;
        dino.velocityY = -dino.jumpForce;
    }
});

// Resimlerin yüklenmesini bekle
Promise.all([
    new Promise(resolve => dinoImg.onload = resolve),
    new Promise(resolve => groundImg.onload = resolve),
    new Promise(resolve => backgroundImg.onload = resolve),
    new Promise(resolve => cactusImg.onload = resolve)
]).then(() => {
    gameLoop();
});

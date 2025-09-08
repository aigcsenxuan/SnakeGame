class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValueElement = document.getElementById('speedValue');
        
        // 游戏配置
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // 游戏状态
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        
        // 蛇的初始状态
        this.snake = [
            {x: 10, y: 10}
        ];
        this.direction = {x: 0, y: 0};
        this.nextDirection = {x: 0, y: 0};
        
        // 食物
        this.food = this.generateFood();
        
        // 游戏速度
        this.gameSpeed = 150;
        this.gameLoop = null;
        
        this.init();
    }
    
    init() {
        this.updateHighScore();
        this.setupEventListeners();
        this.draw();
        this.updateGameStatus('按空格键开始游戏');
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // 按钮控制
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 速度滑块控制
        this.speedSlider.addEventListener('input', (e) => {
            this.updateGameSpeed(parseInt(e.target.value));
        });
    }
    
    handleKeyPress(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            if (!this.gameRunning) {
                this.startGame();
            } else {
                this.togglePause();
            }
            return;
        }
        
        // 如果游戏没有运行，按方向键自动开始游戏
        if (!this.gameRunning) {
            this.startGame();
        }
        
        if (this.gamePaused) return;
        
        // 方向控制
        switch(e.code) {
            case 'ArrowUp':
            case 'KeyW':
                if (this.direction.y !== 1) {
                    this.nextDirection = {x: 0, y: -1};
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                if (this.direction.y !== -1) {
                    this.nextDirection = {x: 0, y: 1};
                }
                break;
            case 'ArrowLeft':
            case 'KeyA':
                if (this.direction.x !== 1) {
                    this.nextDirection = {x: -1, y: 0};
                }
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (this.direction.x !== -1) {
                    this.nextDirection = {x: 1, y: 0};
                }
                break;
        }
    }
    
    startGame() {
        if (this.gameRunning && !this.gamePaused) return;
        
        if (!this.gameRunning) {
            this.resetGame();
            // 确保游戏开始时有初始方向
            this.direction = {x: 1, y: 0};
        }
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.updateGameStatus('游戏进行中');
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.gameSpeed);
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            clearInterval(this.gameLoop);
            this.updateGameStatus('游戏已暂停');
        } else {
            this.updateGameStatus('游戏进行中');
            this.gameLoop = setInterval(() => {
                this.update();
                this.draw();
            }, this.gameSpeed);
        }
    }
    
    restartGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.resetGame();
        this.draw();
        this.updateGameStatus('按空格键开始游戏');
    }
    
    resetGame() {
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = {x: 0, y: 0};
        this.nextDirection = {x: 1, y: 0}; // 给蛇一个初始方向（向右）
        this.score = 0;
        this.food = this.generateFood();
        this.gameSpeed = 150;
        this.updateScore();
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        // 更新方向
        this.direction = {...this.nextDirection};
        
        // 移动蛇头
        const head = {...this.snake[0]};
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // 检查碰撞
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
            // 移除自动加速，让玩家通过滑块控制速度
        } else {
            this.snake.pop();
        }
    }
    
    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        // 检查自身碰撞
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        
        return false;
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#1a202c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制蛇
        this.drawSnake();
        
        // 绘制食物
        this.drawFood();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头 - 使用鲜明的橙红色
                this.ctx.fillStyle = '#ff6b35';
            } else {
                // 蛇身 - 使用深绿色
                this.ctx.fillStyle = '#2d5a27';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // 添加渐变效果
            if (index === 0) {
                // 蛇头高光 - 亮橙色
                this.ctx.fillStyle = '#ff8c42';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 3,
                    segment.y * this.gridSize + 3,
                    this.gridSize - 6,
                    this.gridSize - 6
                );
            } else {
                // 蛇身高光 - 浅绿色
                this.ctx.fillStyle = '#4a7c59';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 3,
                    segment.y * this.gridSize + 3,
                    this.gridSize - 6,
                    this.gridSize - 6
                );
            }
        });
    }
    
    drawFood() {
        // 绘制食物（红色圆形）
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // 添加高光效果
        this.ctx.fillStyle = '#fc8181';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2 - 3,
            this.food.y * this.gridSize + this.gridSize / 2 - 3,
            3,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScore();
        }
    }
    
    updateHighScore() {
        this.highScoreElement.textContent = this.highScore;
    }
    
    updateGameStatus(status) {
        this.gameStatusElement.textContent = status;
    }
    
    updateGameSpeed(speedLevel) {
        // 速度等级1-10，转换为游戏速度（毫秒）
        // 等级越高，速度越快（间隔时间越短）
        const speedMap = {
            1: 300,  // 最慢
            2: 250,
            3: 200,
            4: 175,
            5: 150,  // 默认
            6: 125,
            7: 100,
            8: 80,
            9: 60,
            10: 40   // 最快
        };
        
        this.gameSpeed = speedMap[speedLevel] || 150;
        this.speedValueElement.textContent = speedLevel;
        
        // 如果游戏正在运行，重新设置定时器
        if (this.gameRunning && !this.gamePaused) {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => {
                this.update();
                this.draw();
            }, this.gameSpeed);
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        clearInterval(this.gameLoop);
        this.updateGameStatus(`游戏结束！最终得分: ${this.score}`);
        
        // 游戏结束动画效果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`得分: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.fillText('按空格键重新开始', this.canvas.width / 2, this.canvas.height / 2 + 35);
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});

// 防止方向键滚动页面
window.addEventListener('keydown', (e) => {
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);
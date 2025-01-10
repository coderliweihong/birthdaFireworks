const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
const birthdayText = document.querySelector('.birthday-text');
const birthdaySong = document.getElementById('birthdaySong');
const musicToggle = document.getElementById('musicToggle');
const launchSound = document.getElementById('launchSound');
const explosionSound = document.getElementById('explosionSound');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const cakeCanvas = document.getElementById('cakeCanvas');
const cakeCtx = cakeCanvas.getContext('2d');
let currentHue = 0;
let isMusicPlaying = false;
let isStarted = false;
let animationId = null;
let cakeImage = null;
let backgroundImage = new Image();
backgroundImage.src = './images/family.jpg';

// 在文件开头添加星星和月亮的类
class Star {
    constructor(index, total) {
        this.index = index;
        this.total = total;
        this.reset();
        this.alpha = Math.random() * 0.5 + 0.3;
        this.fadeDirection = Math.random() < 0.5 ? -1 : 1;
        this.type = '✨';
        // 增大字体大小范围
        this.fontSize = Math.random() * 18 + 14; // 改为 14-32px
        this.rotationSpeed = (Math.random() - 0.5) * 0.03;
        this.twinkleSpeed = Math.random() * 0.01 + 0.005;
        this.scale = 1;
        this.scaleDirection = 1;
    }

    reset() {
        // 将屏幕顶部区域划分为网格
        const gridX = 15; // 横向网格数
        const gridY = 5;  // 纵向网格数（减少以集中在顶部）
        const cellWidth = canvas.width / gridX;
        const cellHeight = (canvas.height * 0.4) / gridY; // 只使用屏幕顶部40%的区域

        const gridIndex = this.index % (gridX * gridY);
        const gridRow = Math.floor(gridIndex / gridX);
        const gridCol = gridIndex % gridX;

        // 在网格内随机位置
        const margin = cellWidth * 0.2;
        const randomOffsetX = (Math.random() - 0.5) * cellWidth * 0.8;
        this.x = gridCol * cellWidth + margin + randomOffsetX;
        
        // 计算 y 坐标，确保在顶部区域平铺
        const topMargin = canvas.height * 0.05; // 距离顶部5%的位置开始
        const randomOffsetY = Math.random() * cellHeight * 0.8;
        this.y = topMargin + gridRow * cellHeight + randomOffsetY;

        this.rotation = Math.random() * Math.PI * 2;
        this.phase = Math.random() * Math.PI * 2;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale); // 添加缩放效果
        
        // 设置文字样式
        ctx.font = `${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 添加发光效果
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 15;
        
        // 绘制星星
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fillText(this.type, 0, 0);
        
        ctx.restore();
    }

    update() {
        // 使用正弦函数创建平滑的闪烁效果
        this.phase += this.twinkleSpeed;
        this.alpha = 0.5 + Math.sin(this.phase) * 0.3;
        
        // 添加缩放动画
        this.scale += this.scaleDirection * 0.01;
        if (this.scale > 1.2) {
            this.scaleDirection = -1;
        } else if (this.scale < 0.8) {
            this.scaleDirection = 1;
        }

        // 旋转动画
        this.rotation += this.rotationSpeed;
    }
}

class Moon {
    constructor() {
        this.x = canvas.width * 0.85;
        this.y = canvas.height * 0.3;
        this.radius = 35;
        this.glow = 0;
        this.glowDirection = 1;
    }

    update() {
        // 添加光晕动画
        this.glow += this.glowDirection * 0.01;
        if (this.glow >= 1) this.glowDirection = -1;
        if (this.glow <= 0) this.glowDirection = 1;
    }

    draw() {
        ctx.save();
        
        // 绘制外部光晕
        const gradient = ctx.createRadialGradient(
            this.x, this.y, this.radius,
            this.x, this.y, this.radius * 2
        );
        gradient.addColorStop(0, `rgba(255, 255, 200, ${0.2 + this.glow * 0.1})`);
        gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 绘制月牙形状
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.radius); // 移动到顶部

        // 绘制右侧弧线
        ctx.arc(this.x, this.y, this.radius, -Math.PI/2, Math.PI/2);
        
        // 绘制左侧弧线
        ctx.arc(this.x - this.radius * 0.5, this.y, this.radius * 0.8, Math.PI/2, -Math.PI/2, true);
        
        // 使用渐变填充
        const moonGradient = ctx.createLinearGradient(
            this.x - this.radius, this.y,
            this.x + this.radius * 0.5, this.y
        );
        moonGradient.addColorStop(0, '#FFFDE7');
        moonGradient.addColorStop(0.5, '#FFF9C4');
        moonGradient.addColorStop(1, '#FFE082');
        
        ctx.fillStyle = moonGradient;
        
        // 添加发光效果
        ctx.shadowColor = 'rgba(255, 255, 200, 0.5)';
        ctx.shadowBlur = 20;
        ctx.fill();

        ctx.restore();
    }
}

// 减少星星数量
const stars = Array(60).fill().map((_, i) => new Star(i, 60)); // 减少到60颗星星
const moon = new Moon();

// 设置画布尺寸为窗口大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 添加背景图片绘制函数
function drawCakeBackground() {
    if (!cakeImage) {
        cakeImage = new Image();
        cakeImage.src = './images/birthday05.jpg';
        cakeImage.onload = function() {
            renderBackground();
        };
    } else {
        renderBackground();
    }
}

// 修改渲染逻辑
function renderBackground() {
    // 设置canvas尺寸为窗口大小
    cakeCanvas.width = window.innerWidth;
    cakeCanvas.height = window.innerHeight;
    
    // 计算图片缩放和位置
    const canvasRatio = cakeCanvas.width / cakeCanvas.height;
    const imgRatio = cakeImage.width / cakeImage.height;
    
    let drawWidth, drawHeight, x, y;
    
    // 优先保证图片完整显示
    if (canvasRatio > imgRatio) {
        // 画布更宽，以高度为基准进行缩放
        drawHeight = cakeCanvas.height;
        drawWidth = drawHeight * imgRatio;
        x = (cakeCanvas.width - drawWidth) / 2;
        y = 0;
    } else {
        // 画布更高，以宽度为基准进行缩放
        drawWidth = cakeCanvas.width;
        drawHeight = drawWidth / imgRatio;
        x = 0;
        y = (cakeCanvas.height - drawHeight) / 2;
    }
    
    // 如果缩放后的尺寸小于画布，进行额外缩放以填充
    const scaleX = cakeCanvas.width / drawWidth;
    const scaleY = cakeCanvas.height / drawHeight;
    const scale = Math.max(scaleX, scaleY);
    
    if (scale > 1) {
        drawWidth *= scale;
        drawHeight *= scale;
        x = (cakeCanvas.width - drawWidth) / 2;
        y = (cakeCanvas.height - drawHeight) / 2;
    }
    
    // 绘制前清除画布
    cakeCtx.clearRect(0, 0, cakeCanvas.width, cakeCanvas.height);
    
    // 绘制图片
    cakeCtx.drawImage(cakeImage, x, y, drawWidth, drawHeight);
}

// 添加绘制背景的函数
function drawBackground() {
    if (!backgroundImage.complete) return;
    
    // 计算图片缩放比例以覆盖整个画布
    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = backgroundImage.width / backgroundImage.height;
    
    let drawWidth, drawHeight, x, y;
    
    if (canvasRatio > imageRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imageRatio;
        x = 0;
        y = (canvas.height - drawHeight) / 2;
    } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imageRatio;
        x = (canvas.width - drawWidth) / 2;
        y = 0;
    }
    
    ctx.drawImage(backgroundImage, x, y, drawWidth, drawHeight);
    
    // 添加半透明黑色遮罩使背景变暗
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 修改窗口大小改变事件处理
window.addEventListener('resize', () => {
    resizeCanvas();
    drawBackground(); // 重新绘制背景
    // 重新定位月亮
    moon.x = canvas.width * 0.85;
    moon.y = canvas.height * 0.3; // 更新这里的位置
    // 重新分布星星
    stars.forEach(star => star.reset());
});

// 添加对象池
const particlePool = [];
const fireworkPool = [];

// 修改 Firework 类的创建方式
function getFirework(startX) {
    let firework = fireworkPool.pop();
    if (!firework) {
        firework = new Firework(startX);
    } else {
        firework.reset(startX);
    }
    return firework;
}

// 修改 Firework 类
class Firework {
    constructor(startX) {
        this.reset(startX);
    }

    reset(startX) {
        this.x = startX;
        this.y = canvas.height;
        // 进一步增加初始速度
        this.speed = Math.random() * 6 + 35; // 改为 35-41 的速度范围
        
        // 调整发射角度范围，使轨迹更垂直
        const minAngle = Math.PI / 2 + Math.PI / 18;
        const maxAngle = Math.PI / 2 - Math.PI / 18;
        const baseAngle = maxAngle + Math.random() * (minAngle - maxAngle);
        const angleVariance = (Math.random() - 0.5) * 0.01; // 进一步减小角度变化
        const finalAngle = baseAngle + angleVariance;
        
        this.velocity = {
            x: Math.cos(finalAngle) * this.speed,
            y: -Math.sin(finalAngle) * this.speed
        };
        
        // 调整物理参数
        this.gravity = 0.05;          // 进一步减小重力效果
        this.friction = 0.999;        // 减小空气阻力
        this.brightness = Math.random() * 30 + 70;
        this.trail = [];
        this.trailLength = 2;         // 减少尾迹长度以适应更快的速度
        this.exploded = false;
        
        // 调整爆炸高度范围
        this.minExplodeHeight = canvas.height * 0.25;  // 调整最小爆炸高度
        this.maxExplodeHeight = canvas.height * 0.75;  // 调整最大爆炸高度
        
        this.lifetime = 0;
        this.maxLifetime = 100;       // 减少最大生命周期
        this.hue = Math.random() * 360; // 添加颜色属性
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if(this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        // 应用重力和阻力
        this.velocity.y += this.gravity;
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        // 更新位置
        const nextX = this.x + this.velocity.x;
        const nextY = this.y + this.velocity.y;
        
        // 检查是否应该爆炸
        let shouldExplode = false;
        
        // 到达最大生命周期
        if (this.lifetime >= this.maxLifetime) shouldExplode = true;
        
        // 检查是否达到合适的爆炸高度
        if (nextY <= this.minExplodeHeight) shouldExplode = true;
        
        // 检查是否即将超出屏幕边界
        const margin = 50; // 边界安全距离
        if (nextX <= margin || nextX >= canvas.width - margin) shouldExplode = true;
        
        // 检查是否开始下落
        if (this.velocity.y > 0 && nextY >= this.maxExplodeHeight) shouldExplode = true;
        
        if (shouldExplode) {
            this.exploded = true;
            // 爆炸时更新文字颜色
            const hue = this.hue;
            birthdayText.style.color = `hsl(${hue}, 100%, 75%)`;
            birthdayText.style.textShadow = `0 0 10px hsla(${hue}, 100%, 75%, 0.7),
                                           0 0 20px hsla(${hue}, 100%, 75%, 0.5),
                                           0 0 30px hsla(${hue}, 100%, 75%, 0.3)`;
            explosionSounds.play();
            return createParticles(this.x, this.y, this.hue); // 传递颜色
        }
        
        // 如果不爆炸，则更新位置
        this.x = nextX;
        this.y = nextY;
        this.lifetime++;
        
        return [];
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${Math.random() * 360}, 100%, ${this.brightness}%, 1)`;
        ctx.fill();

        // 优化尾迹效果
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        for(let i = 0; i < this.trail.length; i++) {
            const pos = this.trail[i];
            ctx.lineTo(pos.x, pos.y);
        }
        ctx.strokeStyle = `hsla(${Math.random() * 360}, 100%, ${this.brightness}%, ${0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// 修改 Particle 类的创建方式
function getParticle(x, y, hue) {
    let particle = particlePool.pop();
    if (!particle) {
        particle = new Particle(x, y, hue);
    } else {
        particle.reset(x, y, hue);
    }
    return particle;
}

// 修改 Particle 类
class Particle {
    constructor(x, y, hue) {
        this.reset(x, y, hue);
    }

    reset(x, y, hue) {
        this.x = x;
        this.y = y;
        this.hue = hue;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 3; // 增加速度范围
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.alpha = 1;
        this.friction = 0.97; // 调整摩擦力
        this.gravity = 0.25;  // 调整重力
        this.brightness = Math.random() * 30 + 70;
        this.trail = [];
        this.trailLength = 3; // 增加尾迹长度
        this.size = Math.random() * 3 + 2; // 增加粒子大小范围（2-5px）
    }

    draw() {
        // 绘制主粒子
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.fill();

        // 添加发光效果
        ctx.shadowColor = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
        ctx.shadowBlur = 10;

        // 绘制尾迹
        if (this.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for(let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha * 0.5})`;
            ctx.lineWidth = this.size * 0.8; // 尾迹宽度与粒子大小相关
            ctx.stroke();
        }
    }

    update() {
        // 更新尾迹
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }
        this.trail.push({ x: this.x, y: this.y });

        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.015; // 降低消失速度
    }
}

let fireworks = [];
let particles = [];

// 增加爆炸粒子数量
function createParticles(x, y, hue) {
    const particleCount = 25; // 减少粒子数量
    const newParticles = [];
    
    for(let i = 0; i < particleCount; i++) {
        newParticles.push(getParticle(x, y, hue));
    }
    return newParticles;
}

// 优化动画循环
function animate() {
    if (!isStarted) return;
    animationId = requestAnimationFrame(animate);
    
    // 先绘制背景
    drawBackground();
    
    // 使用更透明的残影效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新星星
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // 更新月亮
    moon.update();
    moon.draw();

    // 更新烟花
    for(let i = fireworks.length - 1; i >= 0; i--) {
        const newParticles = fireworks[i].update();
        if(fireworks[i].exploded) {
            particles.push(...newParticles);
            fireworkPool.push(fireworks[i]);
            fireworks.splice(i, 1);
        } else {
            fireworks[i].draw();
        }
    }

    // 更新粒子
    for(let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if(particles[i].alpha <= 0) {
            particlePool.push(particles[i]);
            particles.splice(i, 1);
        } else {
            particles[i].draw();
        }
    }
}

// 创建多个音效实例以支持同时播放
function createAudioPool(audioId, size) {
    const pool = [];
    const original = document.getElementById(audioId);
    
    for(let i = 0; i < size; i++) {
        const sound = original.cloneNode(true);
        sound.volume = 0.4; // 设置音量为40%
        pool.push(sound);
    }
    
    let index = 0;
    return {
        play() {
            pool[index].currentTime = 0;
            pool[index].play().catch(e => console.log('音效播放失败:', e));
            index = (index + 1) % size;
        }
    };
}

// 创建音效池
const launchSounds = createAudioPool('launchSound', 5);
const explosionSounds = createAudioPool('explosionSound', 5);

// 添加音乐控制函数
function toggleMusic() {
    if (isMusicPlaying) {
        birthdaySong.pause();
        musicToggle.classList.remove('playing');
        document.querySelectorAll('audio').forEach(audio => audio.muted = true);
    } else {
        birthdaySong.play().then(() => {
            musicToggle.classList.add('playing');
            document.querySelectorAll('audio').forEach(audio => audio.muted = false);
        }).catch(error => {
            console.log("无法播放音乐:", error);
        });
    }
    isMusicPlaying = !isMusicPlaying;
}

// 添加音乐控制事件监听
musicToggle.addEventListener('click', (e) => {
    e.stopPropagation(); // 防止触发烟花
    toggleMusic();
});

// 修改点击和触摸事件处理函数，在第一次交互时尝试播放音乐
function addFirework(x) {
    if (!isStarted) return;
    if (fireworks.length < 5) {
        const count = 2; // 每次发射2个烟花
        for (let i = 0; i < count; i++) {
            const offset = (Math.random() - 0.5) * 50;
            fireworks.push(getFirework(x + offset));
        }
    }
}

// 移除原有的点击事件监听器，添加新的事件处理
canvas.removeEventListener('click', null);

// 处理鼠标点击
canvas.addEventListener('click', (e) => {
    e.preventDefault();
    addFirework(e.clientX);
});

// 处理触摸事件
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    addFirework(touch.clientX);
}, { passive: false });

// 修改自动发射函数
function autoFireworks() {
    if (!isStarted) return;
    if(fireworks.length < 3) {
        const margin = canvas.width * 0.2;
        const startX = margin + Math.random() * (canvas.width - margin * 2);
        fireworks.push(getFirework(startX));
    }
    setTimeout(autoFireworks, Math.random() * 800 + 400); // 400-1200ms 的间隔
}

// 添加开始函数
function startCelebration() {
    // 初始化音频
    birthdaySong.volume = 0.5;
    document.querySelectorAll('audio').forEach(audio => {
        audio.muted = false;
        if (audio.id === 'birthdaySong') {
            audio.play().then(() => {
                musicToggle.classList.add('playing');
                isMusicPlaying = true;
            }).catch(e => console.log('背景音乐播放失败:', e));
        }
    });

    // 使用 requestAnimationFrame 实现平滑淡出
    let opacity = 1;
    let lastTime = performance.now();
    
    function fadeOutAnimation(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // 根据时间计算透明度变化，使动画更平滑
        opacity -= deltaTime * 0.001; // 每秒减少1的透明度
        
        if (opacity <= 0) {
            startScreen.classList.add('hidden');
            return;
        }
        
        cakeCtx.clearRect(0, 0, cakeCanvas.width, cakeCanvas.height);
        cakeCtx.globalAlpha = opacity;
        renderBackground();
        requestAnimationFrame(fadeOutAnimation);
    }
    
    requestAnimationFrame(fadeOutAnimation);
    
    // 开始动画
    isStarted = true;
    animate();
    autoFireworks();
}

// 修改点击事件处理
startButton.addEventListener('click', (e) => {
    e.preventDefault();
    startCelebration();
});

// 修改 toggleMusic 函数
function toggleMusic() {
    if (isMusicPlaying) {
        birthdaySong.pause();
        musicToggle.classList.remove('playing');
        document.querySelectorAll('audio').forEach(audio => audio.muted = true);
    } else {
        birthdaySong.play().then(() => {
            musicToggle.classList.add('playing');
            document.querySelectorAll('audio').forEach(audio => audio.muted = false);
        }).catch(error => {
            console.log("无法播放音乐:", error);
        });
    }
    isMusicPlaying = !isMusicPlaying;
}

// 修改 addFirework 函数
function addFirework(x) {
    if (!isStarted) return;
    if (fireworks.length < 5) {
        const count = 2; // 每次发射2个烟花
        for (let i = 0; i < count; i++) {
            const offset = (Math.random() - 0.5) * 50;
            fireworks.push(getFirework(x + offset));
        }
    }
}

// 移除自动开始
// animate();
// autoFireworks(); 

// 初始化时绘制背景
drawCakeBackground(); 

// 添加时间控制变量
let lastUpdateTime = Date.now(); 
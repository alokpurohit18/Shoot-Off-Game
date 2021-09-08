const canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const scoreElement = document.querySelector('#score-element');
const startButton = document.querySelector('.start-button');
const startModal = document.querySelector('.start-modal');
const modalScore = document.querySelector('.modal-score');

const c = canvas.getContext('2d');

class Player {

    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw = () => {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Projectile {

    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw = () => {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update = () => {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {

    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw = () => {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update = () => {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;
class Particle {

    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw = () => {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update = () => {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha = this.alpha - 0.01;
    }
}

let player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white');
let projectiles = [];
let enemies = [];
let particles = [];
let score = 0;

const init = () => {
    player = new Player(canvas.width / 2, canvas.height / 2, 10, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreElement.innerHTML = score;
    modalScore.innerHTML = score;
}

const spawnEnemies = () => {
    setInterval(() => {
        const radius = Math.random() * (30 - 5) + 5;
        let x = 0;
        let y = 0;

        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = 'hsl(' + Math.random() * 360 + ', 50%, 50%)';

        const angle = Math.atan2(
            canvas.height / 2 - y, 
            canvas.width / 2 - x
        );
    
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity));

    }, 1000);
}

const animate = () => {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((particle, particleIndex) => {
        if(particle.alpha <= 0){
            particles.splice(particleIndex, 1);
        } else {
            particle.update();
        }
    });

    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update();

        if(
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ){
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1);
            }, 0);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        if(dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId);
            startModal.style.display = 'block';
            modalScore.innerHTML = score;
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            if(dist - enemy.radius - projectile.radius < 1){

                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, 
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 5),
                            y: (Math.random() - 0.5) * (Math.random() * 5)
                        }
                    )); 
                }

                if(enemy.radius - 10 > 5){
                    score = score + 10;
                    scoreElement.innerHTML = score;
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    });
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                } else {
                    score = score + 25;
                    scoreElement.innerHTML = score;
                    setTimeout(() => {
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }
            }
        });
    });
}

window.addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2, 
        event.clientX - canvas.width / 2
    );

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(new Projectile(
        canvas.width / 2, 
        canvas.height / 2, 
        5, 
        'white', 
        velocity
    ));
});

startButton.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies();
    startModal.style.display = 'none';
});
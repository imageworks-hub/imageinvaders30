import * as THREE from "https://unpkg.com/three@0.180.0/build/three.module.js";

const layer = document.getElementById("stage5Layer");
const canvas = document.getElementById("stage5Canvas");
const scoreValue = document.getElementById("stage5Score");
const bossValue = document.getElementById("stage5BossHp");
const livesValue = document.getElementById("stage5Lives");
const barrierValue = document.getElementById("stage5Barrier");
const endMessage = document.getElementById("stage5EndMessage");

let renderer;
let scene;
let camera;
let clock;
let stars;
let bossSprite;
let teamSprite;
let animationId = 0;
let running = false;
let restartReady = false;
let elapsed = 0;
let score = 0;
let bossHp = 100;
let lives = 3;
let defeatedEnemies = 0;
let shotCooldown = 0;
let damageCooldown = 0;
let enemyShotTimer = 0;
let bossShotTimer = 0;
let teamShotTimer = 0;

const enemies = [];
const playerBullets = [];
const enemyBullets = [];
const input = {
    left:false,
    right:false,
    forward:false,
    backward:false,
    touchX:0,
    touchZ:9,
    touchThrottle:0
};

const pointer = {
    active:false,
    id:null,
    startX:0,
    startY:0,
    baseX:0,
    baseZ:9,
    moved:false
};

const textureLoader = new THREE.TextureLoader();
const texturePromise = Promise.all([
    textureLoader.loadAsync("enemy5.png"),
    textureLoader.loadAsync("boss.png"),
    textureLoader.loadAsync("team5.png")
]).then(([enemyTexture,bossTexture,teamTexture])=>{
    [enemyTexture,bossTexture,teamTexture].forEach(texture=>{
        texture.colorSpace = THREE.SRGBColorSpace;
    });

    return {enemyTexture,bossTexture,teamTexture};
});

const projectileGeometry = new THREE.SphereGeometry(0.2,8,8);
const playerBulletMaterial = new THREE.MeshBasicMaterial({color:0x7ee8ff});
const enemyBulletMaterial = new THREE.MeshBasicMaterial({color:0xff9d20});
const fireballCoreMaterial = new THREE.MeshBasicMaterial({color:0xfff06a});
const fireballOuterMaterial = new THREE.MeshBasicMaterial({
    color:0xff5a00,
    transparent:true,
    opacity:0.72,
    blending:THREE.AdditiveBlending,
    depthWrite:false
});
const fireballTrailMaterial = new THREE.MeshBasicMaterial({
    color:0xff2400,
    transparent:true,
    opacity:0.48,
    blending:THREE.AdditiveBlending,
    depthWrite:false
});
const sharedProjectileMaterials = new Set([
    playerBulletMaterial,
    enemyBulletMaterial,
    fireballCoreMaterial,
    fireballOuterMaterial,
    fireballTrailMaterial
]);

function clamp(value,min,max){
    return Math.max(min,Math.min(max,value));
}

function setPageGestureLock(locked){
    document.documentElement.classList.toggle("stage5-active",locked);
    document.body.classList.toggle("stage5-active",locked);
}

function createSprite(texture,width,height,x,y,z){
    const material = new THREE.SpriteMaterial({
        map:texture,
        transparent:true,
        depthWrite:false
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x,y,z);
    sprite.scale.set(width,height,1);
    scene.add(sprite);
    return sprite;
}

function createStars(){
    const positions = new Float32Array(360 * 3);

    for(let i=0;i<360;i++){
        positions[i*3] = (Math.random()-0.5)*52;
        positions[i*3+1] = (Math.random()-0.5)*26;
        positions[i*3+2] = -Math.random()*170;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
    const material = new THREE.PointsMaterial({
        color:0xffffff,
        size:0.11,
        transparent:true,
        opacity:0.72
    });
    stars = new THREE.Points(geometry,material);
    scene.add(stars);
}

function buildEnemies(texture){
    enemies.length = 0;

    for(let i=0;i<42;i++){
        const column = i % 7;
        const row = Math.floor(i/7);
        const x = (column-3)*4.2 + (Math.random()-0.5)*1.6;
        const y = 0.4 + (5-row)*0.62 + (Math.random()-0.5)*0.7;
        const z = -27 - i*2.75 - Math.random()*12;
        const sprite = createSprite(texture,5.7,3.8,x,y,z);

        enemies.push({
            sprite,
            alive:true,
            phase:Math.random()*Math.PI*2,
            originX:x
        });
    }
}

function removeObjects(items){
    items.forEach(item=>scene.remove(item.mesh));
    items.length = 0;
}

function disposeScene(){
    if(!scene)return;

    scene.traverse(object=>{
        if(object.material && object.material.map){
            object.material.dispose();
        }
        if(object.material && !sharedProjectileMaterials.has(object.material)){
            object.material.dispose();
        }
        if(object.geometry && object.geometry !== projectileGeometry){
            object.geometry.dispose();
        }
    });
}

function resize(){
    if(!renderer || !camera)return;

    const width = Math.max(1,window.innerWidth);
    const height = Math.max(1,window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.5));
    renderer.setSize(width,height,false);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
}

function updateHud(){
    scoreValue.textContent = String(score);
    bossValue.textContent = String(Math.max(0,bossHp));
    livesValue.textContent = "\u2665".repeat(Math.max(0,lives));

    const barrier = window.stage5Bridge ? window.stage5Bridge.getBarrier() : 0;
    barrierValue.textContent = barrier > 0 ? "BARRIER " + barrier : "";
}

function createFireball(){
    const group = new THREE.Group();
    const core = new THREE.Mesh(projectileGeometry,fireballCoreMaterial);
    const outer = new THREE.Mesh(projectileGeometry,fireballOuterMaterial);

    core.scale.set(1.35,1.35,1.8);
    outer.scale.set(2.3,2.3,2.8);
    group.add(core,outer);

    for(let i=0;i<3;i++){
        const trail = new THREE.Mesh(projectileGeometry,fireballTrailMaterial);
        const scale = 1.45-i*0.3;
        trail.position.z = -0.45-i*0.38;
        trail.scale.set(scale,scale,1.8-i*0.3);
        group.add(trail);
    }

    return group;
}

function createProjectile(material,x,y,z,vx,vy,vz,style="normal"){
    const mesh = style === "fireball"
        ? createFireball()
        : new THREE.Mesh(projectileGeometry,material);
    mesh.position.set(x,y,z);

    if(style !== "fireball"){
        mesh.scale.set(1,1,2.8);
    }else{
        const direction = new THREE.Vector3(vx,vy,vz).normalize();
        mesh.quaternion.setFromUnitVectors(
            new THREE.Vector3(0,0,1),
            direction
        );
    }

    scene.add(mesh);
    return {mesh,vx,vy,vz,style,phase:Math.random()*Math.PI*2};
}

function fire(){
    if(!running || shotCooldown > 0)return;
    window.GameAudio?.sfx("shoot");

    shotCooldown = 0.12;
    playerBullets.push(createProjectile(
        playerBulletMaterial,
        camera.position.x,
        camera.position.y-0.15,
        camera.position.z-1.5,
        0,
        0,
        -48
    ));
}

function fireAtPlayer(source,speed=17,spread=0,style="normal"){
    const target = new THREE.Vector3(
        camera.position.x + (Math.random()-0.5)*spread,
        camera.position.y + (Math.random()-0.5)*spread*0.3,
        camera.position.z
    );
    const direction = target.sub(source).normalize().multiplyScalar(speed);

    enemyBullets.push(createProjectile(
        enemyBulletMaterial,
        source.x,
        source.y,
        source.z,
        direction.x,
        direction.y,
        direction.z,
        style
    ));
}

function takeDamage(){
    if(damageCooldown > 0 || !running)return;

    damageCooldown = 3;

    const barrierBlocked =
        window.stage5Bridge &&
        window.stage5Bridge.getBarrier() > 0;

    window.GameAudio?.sfx(barrierBlocked ? "barrier" : "damage");

    lives = window.stage5Bridge ? window.stage5Bridge.takeDamage() : lives-1;

    const damageClass = barrierBlocked
        ? "stage5-barrier-damaged"
        : "stage5-damaged";

    layer.classList.remove(
        "stage5-damaged",
        "stage5-barrier-damaged"
    );

    void layer.offsetWidth;
    layer.classList.add(damageClass);

    setTimeout(()=>{
        layer.classList.remove(
            "stage5-damaged",
            "stage5-barrier-damaged"
        );
    },260);

    updateHud();

    if(lives <= 0){
        finishGameOver();
    }
}

function finishGameOver(){
    running = false;
    endMessage.textContent = "GAME OVER";
    endMessage.style.display = "block";
    window.stage5Bridge?.gameOver(score);

    setTimeout(()=>{
        restartReady = true;
    },2000);
}

function finishClear(){
    if(!running)return;

    running = false;
    setPageGestureLock(false);
    layer.style.display = "none";
    window.stage5Bridge?.clear(score);
}

function hitTest(a,b,xRange,yRange,zRange){
    return (
        Math.abs(a.x-b.x) < xRange &&
        Math.abs(a.y-b.y) < yRange &&
        Math.abs(a.z-b.z) < zRange
    );
}

function updatePlayerBullets(dt){
    for(let i=playerBullets.length-1;i>=0;i--){
        const bullet = playerBullets[i];
        bullet.mesh.position.x += bullet.vx*dt;
        bullet.mesh.position.y += bullet.vy*dt;
        bullet.mesh.position.z += bullet.vz*dt;

        if(bullet.style === "fireball"){
            const pulse = 1+Math.sin(elapsed*18+bullet.phase)*0.12;
            bullet.mesh.scale.setScalar(pulse);
            bullet.mesh.children[1].rotation.z += dt*4;
        }
        let consumed = false;

        for(const enemy of enemies){
            if(!enemy.alive)continue;

            if(hitTest(bullet.mesh.position,enemy.sprite.position,2.2,1.8,2.1)){
                enemy.alive = false;
                enemy.sprite.visible = false;
                defeatedEnemies++;
                score += 10;
                consumed = true;
                break;
            }
        }

        if(!consumed && hitTest(bullet.mesh.position,bossSprite.position,4.2,3.6,2.8)){
            bossHp--;
            score += 50;
            consumed = true;
            bossSprite.material.color.setHex(0xff5555);
            setTimeout(()=>bossSprite?.material.color.setHex(0xffffff),80);

            if(bossHp <= 0){
                updateHud();
                scene.remove(bullet.mesh);
                playerBullets.splice(i,1);
                finishClear();
                return;
            }
        }

        if(consumed || bullet.mesh.position.z < -185){
            scene.remove(bullet.mesh);
            playerBullets.splice(i,1);
        }
    }
}

function updateEnemyBullets(dt){
    for(let i=enemyBullets.length-1;i>=0;i--){
        const bullet = enemyBullets[i];
        bullet.mesh.position.x += bullet.vx*dt;
        bullet.mesh.position.y += bullet.vy*dt;
        bullet.mesh.position.z += bullet.vz*dt;

        if(bullet.mesh.position.z >= camera.position.z-0.7){
            if(
                Math.abs(bullet.mesh.position.x-camera.position.x)<1.15 &&
                Math.abs(bullet.mesh.position.y-camera.position.y)<1.15
            ){
                takeDamage();
            }
            scene.remove(bullet.mesh);
            enemyBullets.splice(i,1);
        }
    }
}

function updateEnemies(dt,approachSpeed){
    for(const enemy of enemies){
        if(!enemy.alive)continue;

        enemy.sprite.position.z += approachSpeed*dt;
        enemy.sprite.position.x = enemy.originX + Math.sin(elapsed*0.85+enemy.phase)*0.75;

        if(enemy.sprite.position.z > camera.position.z-1.5){
            if(Math.abs(enemy.sprite.position.x-camera.position.x)<2.5){
                takeDamage();
            }
            enemy.sprite.position.z = -145-Math.random()*30;
        }
    }

    enemyShotTimer -= dt;
    if(enemyShotTimer <= 0){
        enemyShotTimer = 0.8+Math.random()*0.9;
        const candidates = enemies.filter(enemy=>
            enemy.alive &&
            enemy.sprite.position.z > -72 &&
            enemy.sprite.position.z < -12
        );
        const shooter = candidates[Math.floor(Math.random()*candidates.length)];
        if(shooter){
            fireAtPlayer(shooter.sprite.position.clone(),10,1.5);
        }
    }
}

function updateBossAndTeam(dt){
    bossSprite.position.x = Math.sin(elapsed*0.6)*6.5;
    bossSprite.position.y = 4.5 + Math.sin(elapsed*0.9)*0.6;
    bossSprite.position.z = -55 + Math.min(defeatedEnemies,42)*0.4;

    teamSprite.position.x = Math.sin(elapsed*1.15+1.2)*9;
    teamSprite.position.y = 0.8 + Math.cos(elapsed*0.75)*2;
    teamSprite.position.z = -34 + Math.sin(elapsed*0.55)*7;

    bossShotTimer -= dt;
    if(bossShotTimer <= 0){
        bossShotTimer = bossHp <= 50 ? 0.75 : 1.15;
        fireAtPlayer(
            bossSprite.position.clone(),
            17,
            bossHp <= 50 ? 2.4 : 1.2,
            "fireball"
        );
    }

    teamShotTimer -= dt;
    if(teamShotTimer <= 0){
        teamShotTimer = 3;
        fireAtPlayer(teamSprite.position.clone(),14,0.7);
    }
}

function updateStars(dt,approachSpeed){
    const positions = stars.geometry.attributes.position.array;

    for(let i=2;i<positions.length;i+=3){
        positions[i] += approachSpeed*dt*1.25;
        if(positions[i] > 4){
            positions[i] = -170;
        }
    }
    stars.geometry.attributes.position.needsUpdate = true;
}

function animate(){
    animationId = requestAnimationFrame(animate);
    if(!running)return;

    const dt = Math.min(clock.getDelta(),0.033);
    elapsed += dt;
    shotCooldown = Math.max(0,shotCooldown-dt);
    damageCooldown = Math.max(0,damageCooldown-dt);

    const horizontal = (input.right?1:0)-(input.left?1:0);
    const depth = (input.backward?1:0)-(input.forward?1:0);
    const targetX = input.touchX;
    const targetZ = input.touchZ;
    camera.position.x += horizontal*8.5*dt;
    camera.position.z += depth*10*dt;

    if(pointer.active){
        camera.position.x += (targetX-camera.position.x)*Math.min(1,dt*8);
        camera.position.z += (targetZ-camera.position.z)*Math.min(1,dt*8);
    }
    camera.position.x = clamp(camera.position.x,-10.5,10.5);
    camera.position.z = clamp(camera.position.z,-6,24);

    let throttle = 0;
    if(input.forward)throttle += 1;
    if(input.backward)throttle -= 1;
    throttle += input.touchThrottle;
    throttle = clamp(throttle,-1,1);
    const approachSpeed = 5.2 + throttle*5.8;

    camera.position.y = 1.7 + Math.sin(elapsed*1.8)*0.08;
    camera.rotation.z += ((-horizontal*0.018)-camera.rotation.z)*Math.min(1,dt*5);
    camera.rotation.x += ((-depth*0.014)-camera.rotation.x)*Math.min(1,dt*5);

    updateStars(dt,approachSpeed);
    updateEnemies(dt,approachSpeed);
    updateBossAndTeam(dt);
    updatePlayerBullets(dt);
    updateEnemyBullets(dt);
    updateHud();
    renderer.render(scene,camera);
}

async function start(){
    const textures = await texturePromise;

    cancelAnimationFrame(animationId);
    disposeScene();
    enemies.length = 0;
    playerBullets.length = 0;
    enemyBullets.length = 0;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55,1,0.1,220);
    camera.position.set(0,1.7,9);
    clock = new THREE.Clock();

    if(!renderer){
        renderer = new THREE.WebGLRenderer({
            canvas,
            alpha:true,
            antialias:true,
            powerPreference:"high-performance"
        });
        renderer.setClearColor(0x000000,0);
    }

    createStars();
    buildEnemies(textures.enemyTexture);
    bossSprite = createSprite(textures.bossTexture,14,14,0,4.5,-55);
    teamSprite = createSprite(textures.teamTexture,8,5.3,-7,1,-34);

    score = 0;
    bossHp = 100;
    lives = 3;
    defeatedEnemies = 0;
    elapsed = 0;
    shotCooldown = 0;
    damageCooldown = 8;
    enemyShotTimer = 2.2;
    bossShotTimer = 3.5;
    teamShotTimer = 5;
    restartReady = false;
    input.touchX = 0;
    input.touchZ = 9;
    input.touchThrottle = 0;
    endMessage.style.display = "none";
    layer.style.display = "block";
    setPageGestureLock(true);
    running = true;

    resize();
    updateHud();
    animate();
}

function stop(){
    running = false;
    cancelAnimationFrame(animationId);
    setPageGestureLock(false);
    layer.style.display = "none";
}

function handleKeyDown(event){
    if(!running && !(restartReady && event.code === "Space"))return;

    if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Space"].includes(event.code)){
        event.preventDefault();
    }

    if(restartReady && event.code === "Space"){
        location.reload();
        return;
    }

    if(event.code === "ArrowLeft")input.left = true;
    if(event.code === "ArrowRight")input.right = true;
    if(event.code === "ArrowUp")input.forward = true;
    if(event.code === "ArrowDown")input.backward = true;
    if(event.code === "Space")fire();
}

function handleKeyUp(event){
    if(event.code === "ArrowLeft")input.left = false;
    if(event.code === "ArrowRight")input.right = false;
    if(event.code === "ArrowUp")input.forward = false;
    if(event.code === "ArrowDown")input.backward = false;
}

canvas.addEventListener("pointerdown",event=>{
    event.preventDefault();

    if(restartReady){
        location.reload();
        return;
    }
    if(!running)return;

    pointer.active = true;
    pointer.id = event.pointerId;
    pointer.startX = event.clientX;
    pointer.startY = event.clientY;
    pointer.baseX = camera.position.x;
    pointer.baseZ = camera.position.z;
    pointer.moved = false;
    input.touchX = camera.position.x;
    input.touchZ = camera.position.z;
    canvas.setPointerCapture?.(event.pointerId);
});

canvas.addEventListener("pointermove",event=>{
    event.preventDefault();

    if(!pointer.active || event.pointerId !== pointer.id)return;

    const dx = event.clientX-pointer.startX;
    const dy = event.clientY-pointer.startY;
    pointer.moved = pointer.moved || Math.hypot(dx,dy)>12;
    input.touchX = clamp(pointer.baseX+(dx/window.innerWidth)*22,-10.5,10.5);
    input.touchZ = clamp(pointer.baseZ+(dy/window.innerHeight)*24,-6,24);
    input.touchThrottle = clamp((-dy/window.innerHeight)*3,-1,1);
});

function finishPointer(event){
    event.preventDefault();

    if(!pointer.active || event.pointerId !== pointer.id)return;

    if(!pointer.moved)fire();
    camera.position.x = input.touchX;
    camera.position.z = input.touchZ;
    pointer.active = false;
    input.touchThrottle = 0;
}

canvas.addEventListener("pointerup",finishPointer);
canvas.addEventListener("pointercancel",finishPointer);

function preventStage5BrowserGesture(event){
    if(layer.style.display === "block"){
        event.preventDefault();
    }
}

layer.addEventListener("touchstart",preventStage5BrowserGesture,{passive:false});
layer.addEventListener("touchmove",preventStage5BrowserGesture,{passive:false});
layer.addEventListener("gesturestart",preventStage5BrowserGesture,{passive:false});
layer.addEventListener("contextmenu",preventStage5BrowserGesture);
layer.addEventListener("selectstart",preventStage5BrowserGesture);
layer.addEventListener("dragstart",preventStage5BrowserGesture);
window.addEventListener("keydown",handleKeyDown,{passive:false});
window.addEventListener("keyup",handleKeyUp);
window.addEventListener("resize",resize);

window.stage5Game = {start,stop,fire};
window.dispatchEvent(new Event("stage5-ready"));

import * as THREE from './three.module.js';
import {sampleMission,DURATION,clamp,smooth} from './mission-animation.mjs';
const $=id=>document.getElementById(id);const state={enemies:[0,1,2,3]};const islands=[{x:-53,z:-10,r:11},{x:49,z:-49,r:14},{x:0,z:-65,r:12},{x:-48,z:45,r:8}];
const scene=new THREE.Scene();scene.background=new THREE.Color('#a8d9ed');scene.fog=new THREE.Fog('#9bc8d9',130,360);
const camera=new THREE.PerspectiveCamera(43,1,.1,700);let renderer;
renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setClearColor('#99cfe5');renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;$('scene').append(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xc6eaff,0x20485e,2.5));const sunlight=new THREE.DirectionalLight(0xfff1cf,3);sunlight.position.set(-45,100,30);sunlight.castShadow=true;sunlight.shadow.mapSize.set(2048,2048);Object.assign(sunlight.shadow.camera,{left:-100,right:100,top:100,bottom:-100,near:1,far:220});sunlight.shadow.bias=-.001;scene.add(sunlight);
const seaUniforms={time:{value:0}};const sea=new THREE.Mesh(new THREE.PlaneGeometry(1200,1200,170,170),new THREE.ShaderMaterial({uniforms:seaUniforms,vertexShader:`uniform float time; varying vec3 pos; varying float wave; void main(){vec3 p=position;p.z=sin(p.x*.22+time*.8)*.26+cos(p.y*.18+time*.7)*.24;wave=p.z;pos=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec3 pos;varying float wave;uniform float time;void main(){float a=sin(pos.x*.72+sin(pos.y*.6+time*.8)*1.6+time*.6);float b=sin(pos.y*.86+sin(pos.x*.34-time*.4));float foam=smoothstep(.93,1.,a*b)*.16;vec3 color=mix(vec3(.025,.26,.40),vec3(.08,.46,.60),wave*.7+.5);color+=foam;float sun=pow(max(0.,sin(pos.x*.14+pos.y*.09+time*.2)),22.)*.06;color+=sun;gl_FragColor=vec4(color,1.);}`}));sea.rotation.x=-Math.PI/2;scene.add(sea);
const mat=(color,roughness=.7)=>new THREE.MeshStandardMaterial({color,roughness,metalness:.15});const steel=mat('#849bad'),deck=mat('#cdbb90'),dark=mat('#344d60'),white=mat('#d8e5e9'),red=mat('#d86267'),blue=mat('#60c5e3');
function box(g,w,h,d,x,y,z,m){const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;g.add(a);return a;}
function makeShip(enemy=false){const g=new THREE.Group(),shape=new THREE.Shape();shape.moveTo(0,7);shape.lineTo(-1.8,3.8);shape.lineTo(-2,-4.8);shape.lineTo(-1.2,-6.1);shape.lineTo(1.2,-6.1);shape.lineTo(2,-4.8);shape.lineTo(1.8,3.8);shape.closePath();const hull=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:1.25,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.3,bevelThickness:.3}),dark);hull.rotation.x=-Math.PI/2;hull.position.y=.15;hull.castShadow=true;hull.receiveShadow=true;g.add(hull);const top=new THREE.Mesh(new THREE.ShapeGeometry(shape),deck);top.rotation.x=-Math.PI/2;top.position.y=1.73;top.receiveShadow=true;g.add(top);box(g,2.5,1.5,3,0,2.4,.1,steel);box(g,1.6,1.25,1.8,0,3.65,-.3,white);box(g,1.75,.35,1.95,0,4.25,-.3,dark);box(g,1.5,.27,.06,0,3.95,-1.23,blue);box(g,.65,1.9,.7,0,3.5,1.5,dark);box(g,.13,3,.13,0,5.1,.2,steel);box(g,1.65,.1,.1,0,5.8,.2,steel);box(g,.85,.65,.07,.46,6.1,.2,enemy?red:blue);const turret=new THREE.Group();turret.position.set(0,2.05,-3.1);g.add(turret);box(turret,1.65,.75,1.65,0,.15,0,steel);for(const x of [-.38,.38])box(turret,.17,.18,2.5,x,.35,-1.5,dark);const rear=new THREE.Group();rear.position.set(0,2,4);rear.rotation.y=Math.PI;g.add(rear);box(rear,1.5,.7,1.4,0,0,0,steel);box(rear,.22,.22,2.3,0,.25,-1.4,dark);const wake=new THREE.Mesh(new THREE.PlaneGeometry(3,13),new THREE.MeshBasicMaterial({color:0xd0f5f5,transparent:true,opacity:.17,depthWrite:false}));wake.rotation.x=-Math.PI/2;wake.position.set(0,.08,11);g.add(wake);g.userData={turret,wake};scene.add(g);return g;}
const player=makeShip();const enemyMeshes=state.enemies.map(()=>makeShip(true));
for(const i of islands){const g=new THREE.Group();g.position.set(i.x,0,i.z);scene.add(g);const sand=new THREE.Mesh(new THREE.CylinderGeometry(i.r*.86,i.r,1.2,9),mat('#c6c2a0'));sand.position.y=.1;g.add(sand);const hill=new THREE.Mesh(new THREE.ConeGeometry(i.r*.8,i.r*.85,7),mat('#5e9272'));hill.position.y=i.r*.38;hill.rotation.y=i.x;hill.castShadow=true;g.add(hill);for(let k=0;k<4;k++){const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(i.r*.24,0),mat('#7e9484'));rock.position.set(Math.sin(k*2)*i.r*.5,1.5,Math.cos(k*2)*i.r*.5);g.add(rock);}}
const boundary=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-72,.1,-72),new THREE.Vector3(72,.1,-72),new THREE.Vector3(72,.1,72),new THREE.Vector3(-72,.1,72)]),new THREE.LineBasicMaterial({color:0x93cee0,transparent:true,opacity:.2}));scene.add(boundary);
const aimLine=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineDashedMaterial({color:0x95f0aa,dashSize:2,gapSize:1.4,transparent:true,opacity:.7}));scene.add(aimLine);
const scanRing=new THREE.Mesh(new THREE.RingGeometry(.97,1,100),new THREE.MeshBasicMaterial({color:0x74ffcf,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));scanRing.rotation.x=-Math.PI/2;scene.add(scanRing);

aimLine.visible=false;scanRing.visible=false;
const transmissionRing=scanRing.clone();transmissionRing.material=scanRing.material.clone();scene.add(transmissionRing);transmissionRing.visible=false;
let transmissionTime=0;
export function signalTransmission(){transmissionTime=2.4;}
function transmissionFrame(dt){
 transmissionTime=Math.max(0,transmissionTime-dt);
 transmissionRing.visible=transmissionTime>0&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!transmissionRing.visible)return;
 const phase=(2.4-transmissionTime)%1.2;
 transmissionRing.position.set(player.position.x,.7,player.position.z);
 transmissionRing.scale.setScalar(3+phase*20);
 transmissionRing.material.opacity=.65*(1-phase/1.2);
}

const clock=new THREE.Clock();let chapter=0,passed=0,count=3,pulse=0,cinematic=null;
const escorts=[makeShip(),makeShip()];escorts.forEach(s=>s.scale.setScalar(.78));
const enemyPositions=[[-25,-10],[18,-27],[37,5],[-35,-30]];
const shells=Array.from({length:3},()=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.55,8,8),new THREE.MeshBasicMaterial({color:0xffe8ad}));m.visible=false;scene.add(m);return m;});
const sparks=Array.from({length:32},(_,i)=>{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(i<20?.55:1.3,0),new THREE.MeshBasicMaterial({color:i<20?(i%2?0xffb437:0xffe4a0):0x4f5a60,transparent:true,depthWrite:false}));m.visible=false;scene.add(m);return m;});
const foam=Array.from({length:30},()=>{const m=new THREE.Mesh(new THREE.RingGeometry(.8,1,16),new THREE.MeshBasicMaterial({color:0xd5fbff,side:THREE.DoubleSide,transparent:true,opacity:0,depthWrite:false}));m.rotation.x=-Math.PI/2;scene.add(m);return m;});
const flash=new THREE.PointLight(0xffb958,0,22);scene.add(flash);
let trailTick=0,trailIndex=0;const trails=[];
export function updateVoyage(ch,n,total){chapter=ch;passed=n;count=total;if(!cinematic){player.position.x=0;player.rotation.y=0;}}
export function setCamera(top){camera.userData.top=top;}
export function playMission({id,chapter:ch,before,after,total},onStage=()=>{}){
 sampleMission(id,0);if(cinematic)finishMovie();
 chapter=ch;count=total;passed=before;player.position.set(0,0,35-before*8);player.rotation.y=0;
 return new Promise(resolve=>{cinematic={id,startedAt:performance.now(),elapsed:0,before,after,target:Math.min(after-1,total-1),stage:-1,startZ:35-before*8,resolve,onStage};});
}
export function finishMovie(){if(!cinematic)return;const movie=cinematic;cinematic=null;passed=movie.after;player.position.set(0,0,35-passed*8);player.rotation.y=0;player.userData.wake.scale.set(1,1,1);shells.forEach(m=>m.visible=false);sparks.forEach(m=>m.visible=false);flash.intensity=0;scanRing.visible=false;movie.resolve({finished:true});}
function resize(){const r=$('scene').getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe($('scene'));
camera.position.set(50,65,110);resize();
function baseShips(t){
 player.position.y=Math.sin(t*1.6)*.12;player.rotation.z=Math.sin(t)*.01;
 enemyMeshes.forEach((m,i)=>{m.visible=i<count&&i>=passed;m.position.set(enemyPositions[i][0],Math.sin(t+i)*.1,enemyPositions[i][1]);m.rotation.set(0,[-.3,.5,-.4,.2][i],0);});
}
function tickEffects(dt,t){
 trailTick+=dt;if(cinematic&&trailTick>.13){trailTick=0;[player,...escorts].forEach(ship=>{const m=foam[trailIndex++%foam.length];m.position.set(ship.position.x,.5,ship.position.z+6);trails.push({m,age:0});if(trails.length>foam.length)trails.shift();});}
 for(let i=trails.length-1;i>=0;i--){const trail=trails[i];trail.age+=dt;trail.m.scale.setScalar(1+trail.age*2.4);trail.m.material.opacity=Math.max(0,.45*(1-trail.age/1.4));if(trail.age>=1.4)trails.splice(i,1);}
}
function movieFrame(dt,t){
 const m=cinematic;m.elapsed=(performance.now()-m.startedAt)/1000;const a=sampleMission(m.id,m.elapsed),target=enemyMeshes[m.target],end=new THREE.Vector3(target.position.x,1.5,target.position.z);
 player.position.z=m.startZ-a.travel*8;player.position.x=Math.sin(a.travel*Math.PI)*a.config.swerve*3;
 player.rotation.y=-Math.cos(a.travel*Math.PI)*a.config.swerve*.12;
 player.userData.wake.scale.y=1.6;player.userData.wake.material.opacity=.38;
 player.userData.turret.rotation.y=Math.atan2(-(end.x-player.position.x),-(end.z-player.position.z))-player.rotation.y;
 escorts.forEach((s,i)=>{const side=i===0?-1:1;const spread=m.id==='difference'?15:10;s.position.set(player.position.x+side*(spread+Math.sin(a.travel*Math.PI)*4),Math.sin(t+i)*.12,player.position.z+7+Math.sin(a.travel*Math.PI)*2);s.rotation.y=player.rotation.y+side*Math.sin(a.travel*Math.PI)*.18;s.userData.wake.material.opacity=.4;s.userData.wake.scale.y=1.5;});
 if(a.stage!==m.stage){m.stage=a.stage;m.onStage({title:a.config.title,stage:a.stage,caption:a.caption});}
 scanRing.visible=m.elapsed<1.5;scanRing.position.set(player.position.x,.6,player.position.z);scanRing.scale.setScalar(Math.max(.01,m.elapsed*22));scanRing.material.opacity=Math.max(0,.5-m.elapsed*.3);
 shells.forEach((shell,i)=>{const q=(m.elapsed-(2.1+i*.16))/.68;shell.visible=i<a.config.salvos&&q>=0&&q<=1;if(shell.visible){const ship=i===0?player:escorts[i-1];const start=new THREE.Vector3(ship.position.x,3.3,ship.position.z-4);shell.position.lerpVectors(start,end,q);shell.position.y+=Math.sin(q*Math.PI)*8;}});
 const impact=Math.max(0,m.elapsed-2.78);flash.position.copy(end);flash.intensity=impact>0&&impact<.35?38*(1-impact/.35):0;
 sparks.forEach((spark,i)=>{const smoke=i>=20;spark.visible=impact>0&&impact<(smoke?2.1:1.15);if(!spark.visible)return;const theta=i*2.39996,spread=smoke?impact*2.5:impact*11;spark.position.set(end.x+Math.cos(theta)*spread,end.y+(smoke?impact*5:impact*10-impact*impact*7),end.z+Math.sin(theta)*spread);spark.scale.setScalar(smoke?1+impact*2.3:Math.max(.1,1-impact*.65));spark.material.opacity=Math.max(0,1-impact/(smoke?2.1:1.15));});
 target.visible=true;target.position.y=-a.sink*7;target.rotation.z=a.sink*.65;if(a.sink>=1)target.visible=false;
 const focus=new THREE.Vector3().lerpVectors(player.position,end,.34);focus.y=0;
 const close=new THREE.Vector3(focus.x+34,42,focus.z+60);camera.position.lerp(close,1-Math.exp(-dt*2));camera.lookAt(focus);
 if(a.done)finishMovie();
}
function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;seaUniforms.time.value=t;baseShips(t);
 if(cinematic){movieFrame(dt,t);}else{player.position.z=THREE.MathUtils.lerp(player.position.z,35-passed*8,dt*2);player.userData.turret.rotation.y=-.35;player.userData.wake.material.opacity=.17;escorts.forEach((s,i)=>{s.position.set(player.position.x+(i===0?-10:10),Math.sin(t+i)*.12,player.position.z+7);s.rotation.y=0;s.userData.wake.material.opacity=.17;});const target=camera.userData.top?new THREE.Vector3(0,130,25):new THREE.Vector3(50,65,110);camera.position.lerp(target,dt*2);camera.lookAt(0,0,-8);}
 tickEffects(dt,t);transmissionFrame(dt);renderer.render(scene,camera);
}
player.position.z=35;frame();

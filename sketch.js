// =========================================
// LABORATORIO VIRTUAL - CHEMOSTATO
// CULTIVO CONTINUO (p5.js)
// =========================================

// ---------- VARIABLES ----------
let X, S;
let muMax = 0.4;
let Ks = 0.5;
let Yxs = 0.5;

let X0 = 0.1;
let S0 = 20;
let Sf = 30;
let D = 0.2;   // Dilución (1/h)

let dt = 0.03;
let running = false;
let angle = 0;

// ---------- SLIDERS ----------
let sliderX0, sliderS0, sliderMu, sliderD, sliderSf;

// ---------- BOTONES ----------
let btnStart, btnReset;

// ---------- GRAFICAS ----------
let Xv = [];
let Sv = [];

function setup() {
  createCanvas(1100, 600);
  resetSimulation();

  sliderX0 = new Slider(40, 140, 220, 0.05, 1.0, X0, "Biomasa inicial (X₀)", "g/L");
  sliderS0 = new Slider(40, 210, 220, 5, 40, S0, "Sustrato inicial (S₀)", "g/L");
  sliderMu = new Slider(40, 280, 220, 0.1, 0.8, muMax, "μ máx", "h⁻¹");
  sliderD  = new Slider(40, 350, 220, 0.05, 0.6, D, "Dilución (D)", "h⁻¹");
  sliderSf = new Slider(40, 420, 220, 10, 50, Sf, "Sustrato entrada (Sf)", "g/L");

  btnStart = new Button(40, 470, 100, 35, "START");
  btnReset = new Button(160, 470, 100, 35, "RESET");
}

function draw() {
  background(230);

  drawPanel();
  drawReactor();
  drawGraphs();

  sliderX0.display();
  sliderS0.display();
  sliderMu.display();
  sliderD.display();
  sliderSf.display();

  btnStart.display();
  btnReset.display();

  if (running) updateModel();
}

// ---------- MODELO CHEMOSTATO ----------
function updateModel() {
  let mu = muMax * S / (Ks + S);

  X += (mu - D) * X * dt;
  S += (D * (Sf - S) - (1 / Yxs) * mu * X) * dt;

  X = max(X, 0);
  S = max(S, 0);

  Xv.push(X);
  Sv.push(S);

  angle += 0.1;
}

// ---------- REACTOR ----------
function drawReactor() {
  push();
  translate(650, 50);

  fill(200);
  stroke(0);
  strokeWeight(2);
  rect(0, 0, 260, 370, 45);

  // Entrada
  stroke(0, 150, 0);
  strokeWeight(4);
  line(130, -40, 130, 0);
  triangle(125, -10, 135, -10, 130, 0);

  // Salida
  stroke(200, 0, 0);
  line(260, 250, 320, 250);

  // Líquido
  noStroke();
  fill(70, 160, 220);
  rect(15, 120, 230, 240, 35);

  // Eje
  stroke(70);
  strokeWeight(4);
  line(130, 10, 130, 350);

  // Agitador
  push();
  translate(130, 250);
  rotate(angle);
  stroke(40);
  strokeWeight(4);
  line(-55, 0, 55, 0);
  line(0, -45, 0, 45);
  pop();

  pop();

  fill(0);
  textAlign(CENTER);
  textSize(14);
  text("BIORREACTOR CONTINUO (CHEMOSTATO)", 780, 47);
}

// ---------- PANEL ----------
function drawPanel() {
  fill(40);
  textSize(15);
  text("PANEL DE CONTROL", 110, 100);

  fill(0);
  textSize(13);
  text("Biomasa (X): " + nf(X,1,2) + " g/L", 40, 520);
  text("Sustrato (S): " + nf(S,1,2) + " g/L", 40, 545);

  fill(60);
  textSize(10);
  text("Indicaciones:", 360, 80);
  text("1. El sistema opera a volumen constante.", 360, 100);
  text("2. D controla el lavado celular (washout).", 360, 120);
  text("3. En estado estacionario: μ ≈ D.", 360, 140);
}

// ---------- GRAFICAS ----------
function drawGraphs() {
  let gx = 310, gy = 430, gw = 740, gh = 150;

  fill(255);
  stroke(0);
  rect(gx, gy, gw, gh);

  fill(0);
  textAlign(CENTER);
  text("Tiempo (h)", gx + gw/2, gy + gh + 15);

  drawCurve(Xv, gx, gy, gh, color(0,160,0), 4);
  drawCurve(Sv, gx, gy, gh, color(200,40,40), 4);
}

function drawCurve(data, x, y, h, c, scale) {
  stroke(c);
  noFill();
  beginShape();
  for (let i = 0; i < data.length; i++) {
    vertex(x + i, y + h - data[i] * scale);
  }
  endShape();
}

// ---------- RESET ----------
function resetSimulation() {
  X = sliderX0 ? sliderX0.value : X0;
  S = sliderS0 ? sliderS0.value : S0;

  muMax = sliderMu ? sliderMu.value : muMax;
  D = sliderD ? sliderD.value : D;
  Sf = sliderSf ? sliderSf.value : Sf;

  Xv = [];
  Sv = [];

  running = false;
}

// ---------- MOUSE ----------
function mousePressed() {
  sliderX0.check();
  sliderS0.check();
  sliderMu.check();
  sliderD.check();
  sliderSf.check();

  if (btnStart.over()) {
    resetSimulation();
    running = true;
  }
  if (btnReset.over()) resetSimulation();
}

function mouseDragged() {
  sliderX0.update();
  sliderS0.update();
  sliderMu.update();
  sliderD.update();
  sliderSf.update();
}

function mouseReleased() {
  sliderX0.release();
  sliderS0.release();
  sliderMu.release();
  sliderD.release();
  sliderSf.release();
}

// ---------- CLASES ----------
class Slider {
  constructor(x,y,w,minV,maxV,v,label,unit){
    this.x=x; this.y=y; this.w=w;
    this.minV=minV; this.maxV=maxV;
    this.value=v; this.label=label;
    this.unit=unit; this.drag=false;
  }
  display(){
    fill(0); text(this.label, this.x, this.y-15);
    line(this.x, this.y, this.x+this.w, this.y);
    let px = map(this.value,this.minV,this.maxV,this.x,this.x+this.w);
    ellipse(px,this.y,14,14);
    text(nf(this.value,1,2)+" "+this.unit,this.x+this.w+15,this.y+5);
  }
  check(){
    let px = map(this.value,this.minV,this.maxV,this.x,this.x+this.w);
    if(dist(mouseX,mouseY,px,this.y)<10) this.drag=true;
  }
  update(){
    if(this.drag){
      let nx=constrain(mouseX,this.x,this.x+this.w);
      this.value=map(nx,this.x,this.x+this.w,this.minV,this.maxV);
    }
  }
  release(){ this.drag=false; }
}

class Button {
  constructor(x,y,w,h,label){
    this.x=x; this.y=y; this.w=w; this.h=h; this.label=label;
  }
  display(){
    fill(180);
    rect(this.x,this.y,this.w,this.h,8);
    fill(0);
    textAlign(CENTER,CENTER);
    text(this.label,this.x+this.w/2,this.y+this.h/2);
  }
  over(){
    return mouseX>this.x && mouseX<this.x+this.w &&
           mouseY>this.y && mouseY<this.y+this.h;
  }
}

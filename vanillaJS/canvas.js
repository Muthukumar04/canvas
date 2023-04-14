const sun = new Image();
const moon = new Image();
const earth = new Image();
function init() {
  sun.src = "canvas_sun.png";
  moon.src = "canvas_moon.png";
  earth.src = "canvas_earth.png";
  window.requestAnimationFrame(draw);
}

function draw() {
  const ctx = document.getElementById("canvas").getContext("2d");

  ctx.clearRect(0, 0, 300, 300); //clear canvas

  ctx.drawImage(sun, 0, 0);

  ctx.save(); //origin topleft

  ctx.translate(150, 150);

  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, 100, 100);

  ctx.arc(0, 0, 80, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(0, 153, 255, 0.4)";
  ctx.stroke();

  const time = new Date();
  // ctx.rotate(
  //   ((2 * Math.PI) / 6) * time.getSeconds() +
  //     ((2 * Math.PI) / 6000) * time.getMilliseconds()
  // );

  ctx.translate(80, 0);

  ctx.fillStyle = "yellow";
  ctx.fillRect(0, 0, 100, 100);

  ctx.translate(-10, -10);

  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, 100, 100);

  ctx.drawImage(earth, 0, 0);

  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(10, 0, 20, 23);

  ctx.translate(10, 15); //centre of the earth

  ctx.fillStyle = "blue";
  ctx.fillRect(0, 0, 100, 100);

  // ctx.rotate(
  //   ((2 * Math.PI) / 6) * time.getSeconds() +
  //     ((2 * Math.PI) / 6000) * time.getMilliseconds()
  // );

  ctx.fillStyle = "grey";
  ctx.fillRect(20, 0, 100, 100);
  ctx.drawImage(moon, 20, 0);

  ctx.restore();

  window.requestAnimationFrame(draw);
}
init();

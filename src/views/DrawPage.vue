<template>
    <ion-page>
      <ion-content :fullscreen="true">
        <div class="min-h-screen w-full relative bg-base-200 text-base-content">
          <div class="py-2 px-4 bg-base-100 w-full flex items-center justify-between">
            <div class="w-full">
              <h2>ECG Generator Simulation</h2>
            </div>
            <div class="flex items-center gap-3">
              <button class="btn btn-base-300" @click="$router.replace({name: 'Home'})">Home</button>
              <button class="btn btn-base-300" @click="$router.replace({name: 'Simulation'})">Sim</button>
              <button class="btn btn-base-300" @click="$router.replace({name: 'Draw'})">Draw</button>
            </div>
          </div>
          <div class="grid grid-cols-1 items-center justify-items-center p-6">
            <div class="w-full p-4 bg-base-100 rounded-xl grid md:grid-cols-2 grid-cols-1 gap-3">
              <div class="relative">
                <div class="relative">
                  <div class="absolute left-0 bottom-5 h-96 w-0.5 bg-base-content flex items-start justify-end">
                    <span class="relative -top-6 left-1">Y</span>
                  </div>
                  <div class="absolute left-0 bottom-5 h-0.5 w-full bg-base-content flex items-end justify-end">X</div>
                  <div class="mt-6 w-full h-[63vh]">
                    <canvas     
                      ref="canvasRef" 
                      class="w-full h-[60vh] rounded-xl border-r-2 border-t-2 border-base-300"
                      @mousedown="startDrawing" 
                      @mouseup="stopDrawing" 
                      @mouseleave="stopDrawing"
                      @mousemove="draw"
                      @touchstart="startDrawing"
                      @touchend="stopDrawing"
                      @touchmove="draw"
                    ></canvas>
                  </div>
                </div>
              </div>
              <div>
                <div v-if="chartDataAvailable" class="mt-6 w-full h-[80vh]">
                  <canvas ref="chartCanvasRef" class="w-full" style="height:300px;"></canvas>
                </div>
              </div>
              <div class="flex items-center gap-3 justify-between w-full mt-6 col-span-2">
                <div class="flex items-center gap-3">
                    <div class="dropdown dropdown-top">
                        <div tabindex="0" role="button" class="btn m-1">
                            <span v-if="lineCapSelected == 'round'" class="flex items-center gap-2"><Icon icon="ic:round-square" width="24" height="24" /></span>
                            <span v-if="lineCapSelected == 'butt'" class="flex items-center gap-2"><Icon icon="material-symbols:circle" width="24" height="24" /></span>
                            <span v-if="lineCapSelected == 'square'" class="flex items-center gap-2"><Icon icon="material-symbols-light:square" width="24" height="24" /></span>
                        </div>
                        <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                            <li v-if="lineCapSelected != 'round'"><a @click="lineCapSelected = 'round', adjustCanvasSize()"><Icon icon="ic:round-square" width="24" height="24" /> Rounded</a></li>
                            <li v-if="lineCapSelected != 'butt'"><a @click="lineCapSelected = 'butt', adjustCanvasSize()"><Icon icon="material-symbols:circle" width="24" height="24" /> Butt</a></li>
                            <li v-if="lineCapSelected != 'square'"><a @click="lineCapSelected = 'square', adjustCanvasSize()" ><Icon icon="material-symbols-light:square" width="24" height="24" /> Square</a></li>
                        </ul>
                    </div>
                    <div class="flex items-center gap-3 items-center">
                        <label class="input validator flex items-center gap-3 input input-bordered p-2">
                            <Icon icon="material-symbols:eraser-size-1" width="24" height="24" />
                            <input type="number" max="100" min="1" v-model="lineWidthSelected" @change="adjustCanvasSize()" @keyup="adjustCanvasSize()" class="w-10"/>
                        </label>
                    </div>
                    <div>
                        <input type="color" v-model="strokeStyleSelected" @change="adjustCanvasSize()" class="input input-bordered w-24"/>
                    </div>
                </div>
                <div class="flex gap-3 items-center">
                    <button @click="clearCanvas(true)" class="btn btn-ghost">Reset</button>
                    <button onclick="select_example_modal.showModal()" class="btn bg-green-600 text-white">Example Wave</button>
                    <button @click="convertToChart()" v-if="!chartDataAvailable" class="btn bg-blue-600 text-white">Convert to Chart</button>
                    <button onclick="setting_modal.showModal()" v-if="chartDataAvailable" class="btn bg-blue-600 text-white">Save to Hardware</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <dialog id="select_example_modal" class="modal">
          <div class="modal-box">
            <h3 class="text-lg font-bold">Example Wave Options</h3>
            <div class="flex items-center justify-center gap-3">
              <label class="form-control w-full">
                <div class="label"><span class="label-text">Category Heartbeat</span></div>
                <select class="select select-bordered w-full" v-model="ecgType">
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                  <option value="slow">Slow</option>
                  <option value="irregular">Irregular</option>
                </select>
              </label>
            </div>
            <div class="modal-action">
              <form method="dialog">
                <button class="btn mx-2">Cancel</button>
                <button @click="drawExampleWave()" class="btn bg-blue-600 text-white">Draw Example</button>
              </form>
            </div>
          </div>
        </dialog>
        <dialog id="setting_modal" class="modal">
          <div class="modal-box">
            <h3 class="text-lg font-bold">Hardware Setting</h3>
            <div class="flex items-center justify-center gap-3">
              <label class="form-control w-full">
                <div class="label"><span class="label-text">V Min</span></div>
                <input type="number" v-model="settings.vmin" class="input input-bordered w-full" />
              </label>
              <label class="form-control w-full">
                <div class="label"><span class="label-text">V Max</span></div>
                <input type="number" v-model="settings.vmax" class="input input-bordered w-full" />
              </label>
            </div>
            <div class="modal-action">
              <form method="dialog">
                <button class="btn mx-2">Cancel</button>
                <button @click="saveHardware()" class="btn bg-blue-600 text-white">Save</button>
              </form>
            </div>
          </div>
        </dialog>
      </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { ref, onMounted, onBeforeUnmount, nextTick, Ref } from 'vue';
import { Icon } from "@iconify/vue";
import { set, ref as dbRef } from 'firebase/database';
import { database } from '@/firebaseConfig';
import Chart from 'chart.js/auto';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const chartCanvasRef = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref(false);
const context = ref<CanvasRenderingContext2D | null>(null);
const lineCapSelected: Ref<CanvasLineCap> = ref('round')
const strokeStyleSelected: Ref<string> = ref('black')
const lineWidthSelected = ref(3)

const drawnPoints = ref<Array<{ x: number, y: number }>>([]);
let chartInstance: Chart | null = null;
const chartDataAvailable = ref(false);
const settings = ref({
  vmax: 5,
  vmin: 0
})
let lastX = 0;
let lastY = 0;
const ecgType = ref<'normal' | 'fast' | 'slow' | 'irregular'>('normal');

const adjustCanvasSize = () => {
    if (canvasRef.value) {
        canvasRef.value.width = canvasRef.value.clientWidth;
        canvasRef.value.height = canvasRef.value.clientHeight;
        console.log('Canvas width:', canvasRef.value.clientWidth, 'Canvas height:', canvasRef.value.clientHeight);
        if (canvasRef.value) {
            context.value = canvasRef.value.getContext('2d');
            if (context.value) {
                context.value.lineWidth = lineWidthSelected.value;
                context.value.lineCap = lineCapSelected.value;
                context.value.strokeStyle = strokeStyleSelected.value;
                context.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
                drawCanvasGrid();
            }
        }
    }
};


const saveHardware = () => {
  reduceDrawnPoints()

  const valueRef = dbRef(database, 'ads_value/')
  set(valueRef, {
    'points': drawnPoints.value,
    'vmax': settings.value.vmax,
    'vmin': settings.value.vmin,
  })
}

onMounted(async () => {
  await nextTick();
  adjustCanvasSize();
  setTimeout(() => {
    adjustCanvasSize();
  }, 1000);
  window.addEventListener('resize', adjustCanvasSize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', adjustCanvasSize);
  if (chartInstance) chartInstance.destroy();
});
  
const startDrawing = (event: MouseEvent | TouchEvent) => {
  isDrawing.value = true;
  // draw(event);
  if (!context.value || !canvasRef.value) return;

  const rect = canvasRef.value.getBoundingClientRect();
  if (event instanceof MouseEvent) {
    lastX = event.clientX - rect.left;
    lastY = event.clientY - rect.top;
  } else if (event instanceof TouchEvent) {
    lastX = event.touches[0].clientX - rect.left;
    lastY = event.touches[0].clientY - rect.top;
  }

  context.value.beginPath();
  context.value.moveTo(lastX, lastY);
  drawnPoints.value.push({ x: lastX, y: lastY });
};
  
const stopDrawing = () => {
  isDrawing.value = false;
  if (context.value) context.value.beginPath();
};
  
const draw = (event: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !context.value || !canvasRef.value) return;
  let x: number = 0, y: number = 0;
  const rect = canvasRef.value.getBoundingClientRect();

  if (event instanceof MouseEvent) {
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
  } else if (event instanceof TouchEvent) {
    x = event.touches[0].clientX - rect.left;
    y = event.touches[0].clientY - rect.top;
  } else {
    return;
  }

  drawnPoints.value.push({ x, y });

  context.value.lineTo(x, y);
  context.value.stroke();
  context.value.beginPath();
  context.value.moveTo(x, y);
  console.log('Drawing at:', x, y);

  lastX = x;
  lastY = y;
};


const drawExampleWave = () => {
  if (!context.value || !canvasRef.value) return;
  clearCanvas();

  const ctx = context.value;
  const width = canvasRef.value.width;
  const height = canvasRef.value.height;
  const baseline = height / 2;
  const amplitude = height / 5;

  let cycles = 6;
  let variability = false;

  if (ecgType.value === 'fast') {
    cycles = 10;
  } else if (ecgType.value === 'slow') {
    cycles = 4;
  } else if (ecgType.value === 'irregular') {
    cycles = 6;
    variability = true;
  }

  drawnPoints.value = [];
  ctx.beginPath();

  for (let i = 0; i < cycles; i++) {
    const basePoints = Math.floor(width / cycles);
    const pointsPerCycle = variability
      ? basePoints + (Math.random() * 50 - 25) // ±25 px
      : basePoints;
    const startX = i * basePoints;

    const points = [
      { x: startX + 0.1 * pointsPerCycle, y: baseline - amplitude * 0.1 },
      { x: startX + 0.2 * pointsPerCycle, y: baseline },
      { x: startX + 0.3 * pointsPerCycle, y: baseline + amplitude * 0.2 },
      { x: startX + 0.35 * pointsPerCycle, y: baseline - amplitude * 1 },
      { x: startX + 0.4 * pointsPerCycle, y: baseline + amplitude * 0.3 },
      { x: startX + 0.5 * pointsPerCycle, y: baseline },
      { x: startX + 0.65 * pointsPerCycle, y: baseline - amplitude * 0.2 },
      { x: startX + 0.8 * pointsPerCycle, y: baseline },
    ];

    for (let j = 0; j < points.length; j++) {
      const pt = points[j];
      if (i === 0 && j === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
      drawnPoints.value.push({ x: pt.x, y: pt.y });
    }
  }

  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 2;
  ctx.stroke();
};


const clearCanvas = (refresh = false) => {
  if(refresh) window.location.reload()
  if (context.value && canvasRef.value) {
    context.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    drawnPoints.value = [];
    context.value.beginPath();
  }
};


const reduceDrawnPoints = () => {
  const maxPoints = 100;
  if (drawnPoints.value.length > maxPoints) {
    const step = Math.floor(drawnPoints.value.length / maxPoints);
    drawnPoints.value = drawnPoints.value.filter((_, index) => index % step === 0);
  }
};


const drawCanvasGrid = () => {
  if (!context.value || !canvasRef.value) return;

  const ctx = context.value;
  const width = canvasRef.value.width;
  const height = canvasRef.value.height;

  const spacingX = 50;
  const spacingY = 50;

  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 1;

  for (let x = spacingX; x < width; x += spacingX) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = spacingY; y < height; y += spacingY) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();
};

const convertToChart = async () => {
  if (!drawnPoints.value.length || !canvasRef.value) return;

  reduceDrawnPoints();

  const canvasHeight = canvasRef.value.height;
  const labels = drawnPoints.value.map((point, index) => index.toString());
  const data = drawnPoints.value.map(point => canvasHeight - point.y);

  chartDataAvailable.value = true;
  await nextTick();

  if (chartInstance) {
    chartInstance.destroy();
  }

  if (chartCanvasRef.value) {
    chartInstance = new Chart(chartCanvasRef.value, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Drawn Data',
          data: data,
          fill: false,
          borderColor: 'blue',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Index'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Y Value'
            }
          }
        }
      }
    });
  }
};

</script>
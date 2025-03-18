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
            <div class="w-full p-4 bg-base-100 rounded-xl">
              <div v-if="!chartDataAvailable" class="relative">
                <div class="absolute -left-2 bottom-0 h-24 w-0.5 bg-base-content flex items-start justify-end">
                  <span class="relative -top-6 left-1">Y</span>
                </div>
                <div class="absolute -left-2 bottom-0 h-0.5 w-1/2 bg-base-content flex items-end justify-end">X</div>
                <div class="mt-6 w-full h-[63vh]">
                  <canvas     
                    ref="canvasRef" 
                    class="w-full h-[60vh] rounded-xl"
                    style="border:1px solid black; touch-action: none;"
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
              <div v-if="chartDataAvailable" class="mt-6 w-full h-[80vh]">
                <canvas ref="chartCanvasRef" class="w-full" style="height:300px;"></canvas>
              </div>
              <div class="flex items-center gap-3 justify-between w-full mt-6">
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
                    <button @click="clearCanvas()" class="btn btn-ghost">Reset</button>
                    <button @click="drawExampleWave()" class="btn bg-green-600 text-white">Example Wave</button>
                    <button @click="convertToChart()" v-if="!chartDataAvailable" class="btn bg-blue-600 text-white">Convert to Chart</button>
                    <button v-if="chartDataAvailable" class="btn bg-blue-600 text-white">Save to Hardware</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import { ref, onMounted, onBeforeUnmount, nextTick, Ref } from 'vue';
import { Icon } from "@iconify/vue";
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
            }
        }
    }
};
  
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
    draw(event);
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
};


const drawExampleWave = () => {
  if (!context.value || !canvasRef.value) return;
  clearCanvas();
  
  const ctx = context.value;
  const width = canvasRef.value.width;
  const height = canvasRef.value.height;
  const amplitude = height / 4;
  const frequency = 0.05;
  const offsetX = 0;

  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  for (let x = 0; x < width; x++) {
    const y = height / 2 + amplitude * Math.sin(frequency * (x + offsetX));
    ctx.lineTo(x, y);
    drawnPoints.value.push({ x, y });
  }
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 2;
  ctx.stroke();
};


const clearCanvas = () => {
    if (context.value && canvasRef.value) context.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
        chartDataAvailable.value = false;
    }
    adjustCanvasSize()
};

const convertToChart = async () => {
  if (!drawnPoints.value.length || !canvasRef.value) return;

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
  
<script setup>
import { onMounted, ref } from 'vue';
import { ElLoading } from 'element-plus'

let canvas
let ctx
var texts = '获取数据中0010010101'.split('');

var fontSize = 16;
var columns
// 用于计算输出文字时坐标，所以长度即为列数
var drops = [];


const download = async () => {
  try {

    const response = await fetch('/download-zip');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const blob = await response.blob();

    // 创建一个 a 标签，并设置其 download 属性
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'output.zip';

    // 将 a 标签添加到 DOM 中，模拟点击下载
    document.body.appendChild(link);
    link.click();

    // 移除创建的 a 标签
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

onMounted(() => {
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.height = 500;
  canvas.width = 800;

  columns = canvas.width / fontSize;
  // 下面的雷军就是代码雨的文字
  //初始值
  for (var x = 0; x < columns; x++) {
    drops[x] = 1;
  }

  // setInterval(draw, 33);
})


const show = ref(false)
const canDown = ref(false)
const start = async () => {
  show.value = true
  setInterval(draw, 33);

  const loadingInstance = ElLoading.service({ fullscreen: true })
  try {
    const response = await fetch('/start');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    await response.json()
    canDown.value = true

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    loadingInstance.close()
  }
}


function draw() {
  //让背景逐渐由透明到不透明
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //文字颜色
  ctx.fillStyle = '#0F0';
  ctx.font = fontSize + 'px arial';
  //逐行输出文字
  for (var i = 0; i < drops.length; i++) {
    var text = texts[Math.floor(Math.random() * texts.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height || Math.random() > 0.95) {
      drops[i] = 0;
    }

    drops[i]++;
  }
}
</script>

<template>
  <div style="width: 800px;margin: 120px auto;">

    <el-empty v-show="!show" description="no data, plase click button" />

    <canvas v-show="show" id="canvas"></canvas>

    <el-button style="margin-top: 12px;" :disabled="show" @click="start">Create pdf files</el-button>

    <el-button style="margin-top: 12px;" :disabled="!canDown" @click="download">download</el-button>
  </div>
</template>

<style>

.el-loading-mask {
  background-color: transparent;
}
</style>

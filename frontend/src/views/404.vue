<template>
  <div class="wscn-http404-container">
    <div class="wscn-http404">
      <div class="pic-404">
        <h1 class="text-jumbo">404</h1>
      </div>
      <div class="bullshit">
        <div class="bullshit__oops">OOPS!</div>
        <div class="bullshit__headline">{{ message }}</div>
        <div class="bullshit__info">请检查您输入的网址是否正确，点击下方按钮返回首页。</div>
        <router-link to="/" class="bullshit__return-home">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
const message = '页面不存在...'
</script>

<style scoped>
.wscn-http404-container{
  transform: translate(-50%,-50%);
  position: absolute;
  top: 40%;
  left: 50%;
}
.wscn-http404 {
  position: relative;
  width: 1200px;
  padding: 0 50px;
  overflow: hidden;
}
.pic-404 {
  position: relative;
  float: left;
  width: 600px;
  overflow: hidden;
}
.text-jumbo {
  font-size: 120px;
  font-weight: bold;
  color: #666;
}

.bullshit {
  position: relative;
  float: left;
  width: 500px;
  padding: 30px 0;
  overflow: hidden;
}
.bullshit__oops {
  font-size: 32px;
  font-weight: bold;
  line-height: 40px;
  color: #1482f0;
  margin-bottom: 20px;
}
.bullshit__headline {
  font-size: 20px;
  line-height: 24px;
  color: #222;
  font-weight: bold;
  margin-bottom: 10px;
}
.bullshit__info {
  font-size: 13px;
  line-height: 21px;
  color: grey;
  margin-bottom: 30px;
}
.bullshit__return-home {
  display: block;
  float: left;
  width: 110px;
  height: 36px;
  background: #1482f0;
  border-radius: 100px;
  text-align: center;
  color: #ffffff;
  font-size: 14px;
  line-height: 36px;
  cursor: pointer;
  text-decoration: none;
}
</style>
'use strict'

let app = (() => {

  let treeApp = null
  let data = null

  let zoom = 0.3
  let minWidth = 100
  let rightEl = null
  let yAxisWidth = 100

  let leftBgEl = null
  let rightBgEl = null
  let barEl = null
  let leftDragEl = null
  let rightDragEl = null
  let dragW = 6

  let barMaxWidth = 0
  let barWidthMin = 20
  let barW = 200
  let barX = 200
  let leftDragX = 0
  let rightDragX = 0

  let originEv = 0
  let list = []
  let isInit = false

  const fill = (n) => {
    return n >= 10 ? n : `0${n}`
  }
  
  const getDate = (d) => {
    return `${d.getFullYear()}-${fill(d.getMonth() + 1)}-${fill(d.getDate())} ${fill(d.getHours())}:${fill(d.getMinutes())}:${fill(d.getSeconds())}`
  }

  const createAppTree = (json) => {
    return new Vue({
      el: '#tree',
      data: {
        message: 'Hello Htm!',
        list: json
      }
    })
  }

  const initChart2 = () => {
    let chart1 = document.querySelector('#chart2')
    let width = 0
    if (!isInit) {
      let cs = getComputedStyle(rightEl)
      width = rightEl.clientWidth - (parseInt(cs.paddingLeft) + parseInt(cs.paddingRight)) 
      chart1.setAttribute('width', width)
    } else {
      width = chart1.clientWidth
    }

    let ctx = chart1.getContext('2d')

    let cH = chart1.clientHeight
    let cW = chart1.clientWidth

    ctx.clearRect(0, 0, cW, cH)

    ctx.strokeStyle = 'red'
    ctx.lineWidth = 1
    ctx.beginPath()

    let min = 99999999
    let max = 0
    for (let i = 0; i < list.length; i++) {
      min = Math.min(min, list[i].actual)
      max = Math.max(max, list[i].actual)

      if (typeof list[i].predict === 'number') {
        min = Math.min(min, list[i].predict)
        max = Math.max(max, list[i].predict)
      }
    }

    let offset = max - min
    let s = Math.pow(10, String(parseInt(offset)).length - 1)

    max += s / 2
    min = Math.max(0, min - s / 2)
    offset = max - min

    let itemW = cW / list.length
    let itemH = cH / (max - min)
    let x = 0
    let y = (offset - (list[0].actual - min)) * itemH
    let lastX = 0
    let lastY = 0
    ctx.moveTo(x, y)

    for (let i = 1; i < list.length; i++) {
      x = i * itemW
      y = (offset - (list[i].actual - min)) * itemH
      
      if (Math.abs(lastX - x) >= 1 || Math.abs(lastY - y) >= 1) {
        ctx.lineTo(x, y) 
        lastX = x
        lastY = y       
      }
    }
    ctx.stroke()

    ctx.strokeStyle = 'blue'
    ctx.beginPath()
    let isDraw = false
    lastX = 0
    lastY = 0

    for (let i = 0; i < list.length; i++) {
      if (typeof list[i].predict === 'number') {
        x = i * itemW 
        y = (offset - (list[i].predict - min)) * itemH

        if (isDraw) {
          if (Math.abs(lastX - x) >= 1 || Math.abs(lastY - y) >= 1) {
            ctx.lineTo(x, y) 
            lastX = x
            lastY = y       
          }
        } else {
          ctx.moveTo(x, y)
          isDraw = true
        }
      } else {
        isDraw = false
      }
    }

    ctx.stroke()

    barX = Math.floor((cW - barW) / 2)

    // Control
    barMaxWidth = chart1.clientWidth
    leftDragX = barX - dragW / 2
    rightDragX = barX + barW - dragW / 2

    leftBgEl.style.width = `${barX}px`
    rightBgEl.style.width = `${barMaxWidth - barX - barW}px`
    barEl.style.width = `${barW}px`
    barEl.style.left = `${barX}px`
    rightDragEl.style.width = `${dragW}px`
    leftDragEl.style.width = `${dragW}px`
    rightDragEl.style.left = `${barX + barW - dragW / 2}px`
    leftDragEl.style.left = `${barX - dragW / 2}px`

    initChart1()
  }

  const initChart1 = () => {
    let start = barX > 0 ? Math.floor(list.length * (barX / barMaxWidth)) : 0
    let end = Math.min(start + Math.ceil(list.length * (barW / barMaxWidth)), list.length)

    // let start = 10
    // let end = 35

    let fontSize = 10
    let paddingTop = 20
    
    let xAxisHeight = 100
    let tickWidth = 10
    let yTickItemWidth = 150

    let barWidth = 10
    let chart1 = document.querySelector('#chart1')
    let width = 0

    let lastX = 0
    let lastY = 0

    if (!isInit) {
      let cs = getComputedStyle(rightEl)      
      width = rightEl.clientWidth - (parseInt(cs.paddingLeft) + parseInt(cs.paddingRight))
      chart1.setAttribute('width', width)
      isInit = true
    } else {
      width = chart1.clientWidth
    }

    let ctx = chart1.getContext('2d')

    let cH = chart1.clientHeight - xAxisHeight - paddingTop
    let cW = chart1.clientWidth - yAxisWidth

    ctx.clearRect(0, 0, 9999999, 9999999)

    let min = 99999999
    let max = 0
    for (let i = start; i < end; i++) {
      min = Math.min(min, list[i].actual)
      max = Math.max(max, list[i].actual)

      if (typeof list[i].predict === 'number') {
        min = Math.min(min, list[i].predict)
        max = Math.max(max, list[i].predict)
      }
    }

    let offset = max - min
    let s = Math.pow(10, String(parseInt(offset)).length - 1)

    max = Math.ceil(max / s) * s
    min = Math.floor(min / s) * s
    offset = max - min

    let itemW = cW / (end - start)
    let itemH = cH / (max - min)
    let y = 0
    let x = 0

    // Y
    ctx.strokeStyle = '#999'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.font = `${fontSize}px Arial`
    let tick = (max - min) / 5
    let tickX = yAxisWidth - tickWidth * 4
    for (let i = min; i <= max; i += tick) {
      y = (max - i) * itemH + paddingTop
      ctx.moveTo(tickX, y)
      ctx.lineTo(tickX + tickWidth, y)
      ctx.fillText(i, 0, y + fontSize / 4)
    }

    ctx.moveTo(tickX + tickWidth, paddingTop)
    ctx.lineTo(tickX + tickWidth, cH + paddingTop)

    ctx.stroke()

    // X
    let pt = 70
    let xAxisY = cH + paddingTop + pt
    ctx.strokeStyle = '#999'
    ctx.lineWidth = 1
    ctx.beginPath()

    ctx.moveTo(yAxisWidth, xAxisY)
    ctx.lineTo(yAxisWidth + cW, xAxisY)

    ctx.stroke()

    let yTickCount = Math.floor(Math.max(yTickItemWidth / itemW, 1))
    let spl = Math.ceil((end - start) / yTickCount)
    
    ctx.strokeStyle = '#F5F5F5'
    ctx.beginPath()
    for (let i = 0; i < end - start; i++) {
      if (i % yTickCount === 0) {
        x = i * itemW + yAxisWidth
        ctx.moveTo(x, paddingTop)
        ctx.lineTo(x, paddingTop + cH + pt)
      }
    }
    ctx.stroke()

    ctx.beginPath()    
    ctx.strokeStyle = '#999'
    for (let i = 0; i < end - start; i++) {
      if (i % yTickCount === 0) {
        let index = i + start
        x = i * itemW + yAxisWidth
        ctx.moveTo(x, xAxisY)
        ctx.lineTo(x, xAxisY + tickWidth)
        let text = list[index].time.substr(0, list[index].time.length - 3)
        ctx.fillText(text, x - 40, xAxisY + tickWidth * 3)
      }
    }
    ctx.stroke()

    // BAR
    let barSpace = 2
    let bCount = Math.floor(cW / (barWidth + barSpace))
    let batch = Math.ceil((end - start) / bCount)

    let barH = 50
    let maxV = 0
    let count = 0
    pt = 10
    xAxisY = cH + paddingTop + pt
    
    for (let i = start; i <= end; i++) {
      if (list[i] && typeof list[i].abnormalScore === 'number') {
        maxV = Math.max(list[i].abnormalScore, maxV)
      }

      if ((i - start) > 0 && ((i - start) % batch === 0 || end === i)) {
        x = count * (barWidth + 2) + yAxisWidth + barSpace / 2

        ctx.fillStyle = 'green'
        let h = barH * Math.max(maxV, 0.4)

        if (maxV > 0.8) {
          ctx.fillStyle = 'red'
        } else if (maxV > 0.4) {
          ctx.fillStyle = '#ff8000'
        }

        ctx.fillRect(x, xAxisY + (barH - h), barWidth, h)
        maxV = 0
        count++        
      }
    }

    ctx.fillStyle = '#999'

    ctx.strokeStyle = 'red'
    ctx.lineWidth = 1
    ctx.beginPath()

    x = yAxisWidth
    y = (offset - (list[start].actual - min)) * itemH + paddingTop
    ctx.moveTo(x, y)

    for (let i = start + 1; i < end; i++) {
      x = (i - start) * itemW + yAxisWidth
      y = (offset - (list[i].actual - min)) * itemH + paddingTop

      if (Math.abs(lastX - x) >= 1 || Math.abs(lastY - y) >= 1) {
        ctx.lineTo(x, y)  
        lastX = x
        lastY = y
      }
    }
    ctx.stroke()

    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 1
    ctx.beginPath()
    let isDraw = false
    lastX = 0
    lastY = 0

    for (let i = start; i < end; i++) {
      if (typeof list[i].predict === 'number') {
        x = (i - start) * itemW + yAxisWidth
        y = (offset - (list[i].predict - min)) * itemH + paddingTop

        if (isDraw) {          
          if (Math.abs(lastX - x) >= 1 || Math.abs(lastY - y) >= 1) {
            ctx.lineTo(x, y)
            lastX = x
            lastY = y
          }
          // console.log(x, y)
        } else {
          ctx.moveTo(x, y)
          isDraw = true
        }
      } else {
        isDraw = false
      }
    }

    ctx.stroke()
    lastX = 0
    lastY = 0
  }

  const getChartData = async (arr) => {
    document.querySelector('#h1').innerHTML = 'Loading...'    
    let d = new Date()
    let endTime = getDate(d)
    // d.setMonth(d.getMonth() - 1)
    d.setDate(d.getDate() - 7)

    let startTime = getDate(d)
    let body = JSON.stringify({
      ci: arr[0],
      inst: arr[1],
      kpi: arr[2],
      endTime,
      startTime
    })

    console.log(arr)
    let r = await fetch('/api/htm/getPerfAndPredict', { method: 'POST', body })
    let json = await r.json()
    list = json
    document.querySelector('#h1').innerHTML = arr.join(' > ')
    initChart2()
  }

  const addDragEvent = (el) => {
    el.addEventListener('dragstart', (e) => {
      originEv = e
    })

    el.addEventListener('dragend', (e) => {
      if (e.target.className === 'drag rightDrag') {
        rightDragEl.style.left = `${rightDragX - 3}px`        
      }

      if (e.target.className === 'drag leftDrag') {
        leftDragEl.style.left = `${leftDragX - 3}px`
      }

      if (e.target.className === 'bar') {
        leftDragX = barX
        rightDragX = barX + barW
      }
    })

    el.addEventListener('drag', check)
  }

  const check = (e) => {
    if (e.target.className === 'drag leftDrag' && e.x && e.y) {
      let origin = parseInt(leftDragEl.style.left) + leftDragEl.clientWidth / 2
      let x = 0
      if ((barMaxWidth - rightBgEl.clientWidth) - (origin + e.offsetX) >= barWidthMin) {
        x = Math.max(origin + e.offsetX, 0)
      } else {
        x = barMaxWidth - rightBgEl.clientWidth - barWidthMin
      }

      leftDragX = x
      barW = barMaxWidth - rightBgEl.clientWidth - x
      barEl.style.width = `${barW}px`
      leftBgEl.style.width = `${x}px`

      initChart1()
    }

    if (e.target.className === 'drag rightDrag' && e.x && e.y) {
      let origin = parseInt(rightDragEl.style.left) + rightDragEl.clientWidth / 2
      let x = 0
      if (origin + e.offsetX - barX >= barWidthMin) {
        x = Math.min(origin + e.offsetX, barMaxWidth)
      } else {
        x = barX + barWidthMin
      }
    
      rightDragX = x
      barW = barMaxWidth - barX - (barMaxWidth - x)
      barEl.style.width = `${barW}px`
      rightBgEl.style.width = `${barMaxWidth - barX - barW}px`

      initChart1()
    }

    if (e.target.className === 'bar' && e.x && e.y) {
      // console.log(originEv.clientX - e.x)
      barX = Math.max(Math.min(leftDragX + (e.clientX - originEv.clientX), barMaxWidth - barW), 0)
      barEl.style.left = `${barX}px`
      leftBgEl.style.width = `${barX}px`
      rightBgEl.style.width = `${barMaxWidth - barX - barW}px`
      rightDragEl.style.left = `${barX + barW - dragW / 2}px`
      leftDragEl.style.left = `${barX - dragW / 2}px`

      initChart1()
    }
  }

  Vue.component('item', {
    template: '#item-template',
    props: {
      model: Object
    },
    data () {
      return {
        open: false
      }
    }, 
    methods: {
      async clickHandle ($e) {
        let arr = []
        let item = null
        for (let i = 0; i < $e.path.length; i++) {
          item = $e.path[i]
          if (typeof item.tagName === 'string' && item.tagName.toLowerCase() === 'li') {
            let el = item.querySelector('.tree-label')
            if (el) {
              arr.unshift(el.children[0].innerHTML)
            }
          }
        }

        getChartData(arr)
      },

      toggle (item) {
        this.open = !this.open
      }
    }
  })
  
  return async () => {
    rightEl = document.querySelector('#right')
    leftBgEl = document.querySelector('.leftBg')
    rightBgEl = document.querySelector('.rightBg')
    barEl = document.querySelector('.bar')

    leftDragEl = document.querySelector('.leftDrag')
    rightDragEl = document.querySelector('.rightDrag')
    rightDragEl = document.querySelector('.rightDrag')

    let r = await fetch('/api/htm/getCiInstKpis', { method: 'POST' })
    let treeJSON = await r.json()
    treeApp = createAppTree(treeJSON)


    // Add drag event
    addDragEvent(leftDragEl)
    addDragEvent(rightDragEl)
    addDragEvent(barEl)

    // Test    
    getChartData(["PEK-HQ-SW-06", "Interface 10112", "out"])
  }
})()

window.onload = app

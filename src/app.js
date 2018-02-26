'use strict'

let app = (() => {

  let treeApp = null
  let data = null
  // let chart1 = null
  let zoom = 0.3
  let minWidth = 100
  let rightEl = null
  // let offset = 100
  // let 

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

  const refreshChart = (json) => {
    data = json
    initChart1(json)
  }

  const initChart1 = (list) => {
    let width = rightEl.clientWidth
    let chart1 = document.querySelector('#chart1')
    chart1.setAttribute('width', rightEl.clientWidth)

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
    max += 10
    min = Math.min(0, min - 10)

    let itemW = cW / list.length
    let itemH = cH / (max - min)

    let x = 0
    let y = (list[0].actual - min) * itemH
    ctx.moveTo(x, y)

    for (let i = 1; i < list.length; i++) {
      x = i * itemW
      y = (list[i].actual - min) * itemH
      ctx.lineTo(x, y)
    }
    ctx.stroke()

    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 1
    ctx.beginPath()
    let isDraw = false

    for (let i = 0; i < list.length; i++) {
      if (typeof list[i].predict === 'number') {
        x = i * itemW
        y = (list[i].predict - min) * itemH

        if (isDraw) {
          ctx.lineTo(x, y)
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
  }

  const getChartData = async (arr) => {
    let d = new Date()
    let endTime = getDate(d)
    // d.setMonth(d.getMonth() - 1)
    d.setDate(d.getDate() - 1)

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
    refreshChart(json)
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
    let r = await fetch('/api/htm/getCiInstKpis', { method: 'POST' })
    let treeJSON = await r.json()
    treeApp = createAppTree(treeJSON)

    // Test
    getChartData(["PEK-HQ-SW-06", "Interface 10101", "in"])
  }
})()

window.onload = app

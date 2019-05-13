$(function () {
  var elementId = 0, echarData = []
  var option = null
  laydate.render({
    elem: '#startTime'
    , theme: '#393D49'
  })

  laydate.render({
    elem: '#endTime'
    , theme: '#393D49'
  })

  //加载页面时加载所有
  request({})

  // 点击搜索
  $(document).on('click', '.search', function () {
    var formData = $('#myform').serializeArray()
    request(formData)
  })

  // 点击列表
  $(document).on('click', '#dataList tr', function () {

    if ($(this).attr('data-visited') == undefined) {
      $(this).attr('data-visited', '1')
      $(this).addClass('visited')
    }

    if ($(this).hasClass('active')) {
      $(this).removeClass('active')
      var id = $.trim($(this).find('td').eq(0).text())
      for (var i = 0; i < echarData.length; i++) {
        if (echarData[i]['id'] == id) {
          echarData.splice(i, 1)
        }
      }
    } else {
      $(this).addClass('active')
      var arrList = {}
      arrList['id'] = $.trim($(this).find('td').eq(0).text())
      arrList['name'] = $.trim($(this).find('td').eq(1).text())
      arrList['xunjianA'] = $.trim($(this).find('td').eq(2).text())
      arrList['xunjianB'] = $.trim($(this).find('td').eq(3).text())
      arrList['wancheng'] = $.trim($(this).find('td').eq(4).text())
      arrList['detection'] = $.trim($(this).find('td').eq(5).text())
      arrList['detectionL'] = $.trim($(this).find('td').eq(6).text())
      arrList['unqualified'] = $.trim($(this).find('td').eq(7).text())
      arrList['unqualifiedL'] = $.trim($(this).find('td').eq(8).text())
      arrList['score'] = $.trim($(this).find('td').eq(9).text())
      echarData.push(arrList)
    }
    echarData.sort(function (a, b) {
      return a.id > b.id
    })
    createdEcharts(echarData)
  })

  function request (formData) {
    $.ajax({
      url: ajaxUrl,
      type: 'POST',
      dataType: 'json',
      data: formData,
      success: function (json) {
        if (json.status == 1) {
          //如果请求返回成功
          json.data = [
            {
              'id': '01',
              'name': '计划外',
              'xunjianA': '266',
              'xunjianB': '143',
              'wancheng': '742',
              'detection': '35',
              'detectionL': '56.01%',
              'unqualified': '353',
              'unqualifiedL': '0.00%',
              'score': '100'
            },
            {
              'id': '02',
              'name': '计划外A',
              'xunjianA': '658',
              'xunjianB': '264',
              'wancheng': '577',
              'detection': '784',
              'detectionL': '97%',
              'unqualified': '24',
              'unqualifiedL': '23%',
              'score': '100'
            },
            {
              'id': '03',
              'name': '计划外B',
              'xunjianA': '235',
              'xunjianB': '134',
              'wancheng': '231',
              'detection': '35',
              'detectionL': '0.01%',
              'unqualified': '0',
              'unqualifiedL': '0.00%',
              'score': '100'
            }, {
              'id': '04',
              'name': '计划外C',
              'xunjianA': '355',
              'xunjianB': '35',
              'wancheng': '24',
              'detection': '23',
              'detectionL': '35%',
              'unqualified': '57',
              'unqualifiedL': '67.00%',
              'score': '100'
            }, {
              'id': '05',
              'name': '计划外D',
              'xunjianA': '35',
              'xunjianB': '34',
              'wancheng': '456',
              'detection': '57',
              'detectionL': '24%',
              'unqualified': '242',
              'unqualifiedL': '57%',
              'score': '100'
            }, {
              'id': '06',
              'name': '计划外D',
              'xunjianA': '35',
              'xunjianB': '34',
              'wancheng': '456',
              'detection': '57',
              'detectionL': '24%',
              'unqualified': '242',
              'unqualifiedL': '57%',
              'score': '100'
            }, {
              'id': '07',
              'name': '计划外D',
              'xunjianA': '35',
              'xunjianB': '34',
              'wancheng': '456',
              'detection': '57',
              'detectionL': '24%',
              'unqualified': '242',
              'unqualifiedL': '57%',
              'score': '100'
            }, {
              'id': '08',
              'name': '合计',
              'xunjianA': '20',
              'xunjianB': '18',
              'wancheng': '45',
              'detection': '3',
              'detectionL': '1.51%',
              'unqualified': '6',
              'unqualifiedL': '3%',
              'score': '100'
            }
          ]
          //返回结果相关操作
          insertHtml(json.data)
          echarData.splice(0, echarData.length)
          echarData.push(json.data[json.data.length - 1])
          createdEcharts(echarData)
        } else {
          layer.alert(json.msg, {icon: 2})
          return false
        }
      }
    })

  }

  function insertHtml (data) {
    var html = '', className = ''
    if (data.length > 0) {
      for (var i in data) {
        if (i == (data.length - 1)) {
          className = 'class="cup active"'
        } else {
          className = 'class="cup"'
        }
        html += '<tr ' + className + '>' +
          '<td>' + data[i]['id'] + '</td>\n' +
          '<td>' + data[i]['name'] + '</td>\n' +
          '<td>' + data[i]['xunjianA'] + '</td>\n' +
          '<td>' + data[i]['xunjianB'] + '</td>\n' +
          '<td>' + data[i]['wancheng'] + '</td>\n' +
          '<td>' + data[i]['detection'] + '</td>\n' +
          '<td>' + data[i]['detectionL'] + '</td>\n' +
          '<td>' + data[i]['unqualified'] + '</td>\n' +
          '<td>' + data[i]['unqualifiedL'] + '</td>\n' +
          '<td>' + data[i]['score'] + '</td>' +
          '</tr>'
      }
    } else {
      html = '<tr><td colspan=\'11\' class=\'text-center\'>暂无相关信息</td></tr>'
    }
    $('#dataList').html(html)
  }

  function createdEcharts (arr) {

    $('#echartsId').html('<div id=\'container' + elementId + '\'></div>')
    var DOMElement = document.getElementById('container' + elementId)
    var myChart = echarts.init(DOMElement)
    var xAxisData = [], dataArr = ['实际巡检次数', '计划巡检次数', '计划完成次数', '漏检次数', '漏检率', '不合格数', '不合格率']
    var seriesArr = [], sDataArr0 = [], sDataArr1 = [], sDataArr2 = [], sDataArr3 = [], sDataArr4 = [], sDataArr5 = [],
      sDataArr6 = [], sDataArr = []
    var colorArr = ['#e5004f', '#007130', '#7e6b5a', '#ff00ff', '#ec6941', '#c9c9c9', '#959595']

    for (var i = 0; i < arr.length; i++) {
      xAxisData.push(arr[i]['name'])
      sDataArr0.push(arr[i]['xunjianA'])
      sDataArr1.push(arr[i]['xunjianB'])
      sDataArr2.push(arr[i]['wancheng'])
      sDataArr3.push(arr[i]['detection'])
      sDataArr4.push(arr[i]['detectionL'].replace('%', ''))
      sDataArr5.push(arr[i]['unqualified'])
      sDataArr6.push(arr[i]['unqualifiedL'].replace('%', ''))
    }
    sDataArr.push(sDataArr0, sDataArr1, sDataArr2, sDataArr3, sDataArr4, sDataArr5, sDataArr6)

    for (var k = 0; k < dataArr.length; k++) {
      var seriesList = {
        'name': dataArr[k],
        'type': 'bar',
        'data': sDataArr[k],
        'itemStyle': {
          normal: {
            color: colorArr[k]
          }
        }
      }
      seriesArr.push(seriesList)
    }

    option = {
      title: {
        text: '巡检统计',
        subtext: ''
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          var res = params[0].name + '<br/>', val
          for (var i = 0, length = params.length; i < length; i++) {
            val = (params[i].value)
            if (i == 4 || i == 6) {
              res += params[i].seriesName + '：' + val + '%<br/>'
            } else {
              res += params[i].seriesName + '：' + val + '<br/>'
            }
          }
          return res
        }
      },
      legend: {
        data: dataArr
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: seriesArr
    }

    if (option && typeof option === 'object') {
      myChart.setOption(option, true)
    }
    elementId++
  }

})
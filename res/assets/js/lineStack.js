$(function () {
  var elementId = 0
  laydate.render({
    elem: '#startTime'
    , theme: '#393D49'
  })

  laydate.render({
    elem: '#endTime'
    , theme: '#393D49'
  })

  $('#containerWrap > div:eq(1) .wrap').height($('#containerWrap > div:eq(0)').height() - 40)

  //页面刚加载时默认请求
  requestData({})

  $('.search').click(function () {
    var formData = $('#myform').serializeArray()
    requestData(formData)
  })

  $(document).on('click', '.echartsList a', function () {
    var id = $(this).attr('data-id')
    $.ajax({
      url: 'data.php?action=2',
      dataType: 'json',
      data: {id: id},
      success: function (json) {
        if (json.status == 1) {
          setEcharts(json.data.title, json.data.date, json.data.legend, json.data.explain)
        } else {
          layer.alert(json.msg, {icon: 2})
          return false
        }
      }
    })
  })

  function requestData (data) {
    $.ajax({
      url: 'data.php?action=1',
      type: 'POST',
      dataType: 'json',
      data: data,
      success: function (json) {
        if (json.status == 1) {
          var res = json.data, list = ''
          for (i in res) {
            list += '<tr><td><a href="javascript:void(0);" data-id="' + res[i].id + '">' + res[i].pid + '</a></td><td><a href="javascript:void(0);" data-id="1">' + res[i].title + '</a></td><td>' + res[i].maintain + '</td><td>' + res[i].repair + '</td></tr>'
          }
          $('.echartsList tbody').html(list)
          //获取第一个元素ID
          var id = $('.echartsList a:first').attr('data-id')
          $.ajax({
            url: 'data.php?action=2',
            dataType: 'json',
            data: {id: id},
            success: function (json) {
              if (json.status == 1) {
                setEcharts(json.data.title, json.data.date, json.data.legend, json.data.explain)
              } else {
                layer.alert(json.msg, {icon: 2})
                return false
              }
            }
          })
        } else {
          layer.alert(json.msg, {icon: 2})
          return false
        }
      }
    })
  }

  function setEcharts (title, date, legend, explain) {
    $('#echartsId').html('<div id=\'container' + elementId + '\'></div>')
    var DOMElement = document.getElementById('container' + elementId)
    var myChart = echarts.init(DOMElement)
    var legendT = [], legendArr = []

    for (i in legend) {
      var seriesObj = {
        type: 'line',
        stack: '总量',
        smooth: false,
        itemStyle: {
          normal: {
            lineStyle: {
              width: 1,
              type: 'solid'  //'dotted'虚线 'solid'实线
            }
          }
        }
      }
      legendT.push(legend[i][0])
      seriesObj['name'] = legend[i][0]
      seriesObj['data'] = legend[i].slice(2)
      seriesObj['itemStyle']['normal']['color'] = legend[i][1]
      legendArr.push(seriesObj)
    }

    var option = {
      title: {
        text: title
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          var res = params[0].name + '<br/>', val
          for (var i = 0, length = params.length; i < length; i++) {
            val = (params[i].value)
            res += params[i].seriesName + '：' + explain[val] + '<br/>'
          }
          return res
        }
      },
      legend: {
        data: legendT
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: date
      },
      yAxis: {
        type: 'value'
        /*min: 0,
        max: 12,
        axisLabel: {
          formatter: function (value) {
            var texts = []
            if (value == 0) {
              texts.push('0')
            }
            for (var i = 1; i <= signstr.length * 2; i++) {
              if (value == i) {
                var ii = i / 2 - 1
                texts.push(signstr[ii])
              }
            }
            return texts
          }
        }*/
      },
      series: legendArr
    }
    if (option && typeof option === 'object') {
      myChart.setOption(option, true)
    }
    elementId++
  }

})
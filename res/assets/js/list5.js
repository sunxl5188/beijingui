$(function () {

  var app = new Vue({
    el: "#app",
    data: {
      color: '',
      json: null
    },
    mounted () {
      var self = this
      self.deviceInfo()
    },
    methods: {
      search () {
        var self = this
        var days = $("#startTime").val()
        if (!days) {
          layer.alert('请选择日期后搜索', {icon: 2})
          return false
        }
        var d = days.split("-")
        var start = d[0] + "-" + d[1]
        var end = d[2] + "-" + d[3]
        self.deviceInfo(start, end)
      },
      deviceInfo (start, end) {
        var self = this
        var data = {}
        if (start && end) {
          data['statrTime'] = start
          data['endTime'] = end
        } else {
          data = {}
        }
        $.ajax({
          url: "/data.php?action=1",
          type: "POST",
          dataType: "json",
          contentType: "application/x-www-form-urlencoded;charset=UTF-8",
          data: data,
          success: function (json) {
            if (json.status === 1) {
              self.json = json.data
              self.charts(json.data)
            } else {
              layer.alert(json.msg, {
                icon: 2
              })
            }
          }
        })
      },
      charts (json) {
        var self = this
        var dom = document.getElementById("chartsContent")
        var myChart = echarts.init(dom)
        option = null
        option = {
          legend: {
            data: ['设备数量', '报警次数', '已处理数量']
          },
          toolbox: {
            show: true,
            feature: {
              dataZoom: {},
              dataView: {readOnly: false},
              magicType: {type: ['line', 'bar']},
              restore: {},
              saveAsImage: {}
            }
          },
          color: ['#4169E1', '#ff0000', '#008B00'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
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
              data: json.month,
              axisTick: {
                alignWithLabel: true
              }
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: '设备数量',
              type: 'bar',
              barGap: 0,
              data: json.datas1,
              itemStyle: {
                normal: {
                  color: function (params) {
                    var colorList = [
                      '#b7c6f1', '#4169e1'
                    ]
                    if (params.dataIndex === self.color) {
                      return colorList[0]
                    } else {
                      return colorList[1]
                    }
                  },
                  lineStyle: {
                    color: '#4169E1'
                  }
                }
              }
            },
            {
              name: '报警次数',
              type: 'bar',
              barGap: 0,
              data: json.datas2,
              itemStyle: {
                normal: {
                  color: function (params) {
                    var colorList = [
                      '#fd8080', '#ff0000'
                    ]
                    if (params.dataIndex === self.color) {
                      return colorList[0]
                    } else {
                      return colorList[1]
                    }
                  },
                  lineStyle: {
                    color: '#ff0000'
                  }
                }
              }
            },
            {
              name: '已处理数量',
              type: 'bar',
              barGap: 0,
              data: json.datas3,
              itemStyle: {
                normal: {
                  color: function (params) {
                    var colorList = [
                      '#90e290', '#008b00'
                    ]
                    if (params.dataIndex === self.color) {
                      return colorList[0]
                    } else {
                      return colorList[1]
                    }
                  },
                  lineStyle: {
                    color: '#008b00'
                  }
                }
              }
            }
          ]
        }

        if (option && typeof option === "object") {
          myChart.setOption(option, true)
        }
        myChart.on("click", function (params) {
          self.color = params.dataIndex
          $(".charts1").empty().append("<div class=\"container\" id=\"chartsContent\" style=\"height:400px;\"></div>")
          setTimeout(function () {
            self.charts(self.json)
            self.chartsChild()
          }, 200)
        })
      },
      chartsChild (day) {
        $(".charts2").empty().append("<div class=\"container\" id=\"chartsChildren\" style=\"height:400px;\"></div>")
        $.ajax({
          url: "/data.php?action=2",
          type: "GET",
          dataType: "json",
          contentType: "application/x-www-form-urlencoded;charset=UTF-8",
          data: {
            day: day
          },
          success: function (json) {
            if (json.status === 1) {
              var doms = document.getElementById("chartsChildren")
              var myCharts = echarts.init(doms)
              var opt = {
                color: ['#4169E1', '#ff0000', '#008B00'],
                tooltip: {
                  trigger: 'axis',
                  axisPointer: {
                    type: 'shadow'
                  }
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
                    data: json.data.day,
                    axisTick: {
                      alignWithLabel: true
                    }
                  }
                ],
                yAxis: [
                  {
                    type: 'value'
                  }
                ],
                series: [
                  {
                    name: '设备数量',
                    type: 'bar',
                    barGap: 0,
                    data: json.data.datas1
                  },
                  {
                    name: '已处理数量',
                    type: 'bar',
                    barGap: 0,
                    data: json.data.datas2
                  },
                  {
                    name: '报警次数',
                    type: 'bar',
                    barGap: 0,
                    data: json.data.datas3
                  }
                ]
              }
              if (opt && typeof opt === "object") {
                myCharts.setOption(opt, true)
              }
            } else {
              layer.alert(json.msg, {
                icon: 2
              })
            }
          }
        })
      }
    }
  })

  laydate.render({
    elem: '#startTime'
    , type: 'month'
    , range: true,
    theme: '#393D49'
  })

})
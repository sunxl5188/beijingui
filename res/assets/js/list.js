$(function () {
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

  $(document).on('click', '.search', function () {
    var formData = $('#myform').serializeArray()
    request(formData)
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
              'pid': 'A001',
              'name': '电表名',
              'moneyA': '￥500.02',
              'moneyB': '￥40.02',
              'moneyC': '￥30.02',
              'timeA': '2018/10/10',
              'operator': '操作员',
              'timeB': '2018/10/10',
              'source': '来源',
              'payer': '缴费人',
              'mobile': '13122236548'
            },
            {
              'pid': 'A002',
              'name': '电表名',
              'moneyA': '￥500.02',
              'moneyB': '￥40.02',
              'moneyC': '￥30.02',
              'timeA': '2018/10/10',
              'operator': '操作员',
              'timeB': '2018/10/10',
              'source': '来源',
              'payer': '缴费人',
              'mobile': '13122236548'
            },
            {
              'pid': 'A003',
              'name': '电表名',
              'moneyA': '￥500.02',
              'moneyB': '￥40.02',
              'moneyC': '￥30.02',
              'timeA': '2018/10/10',
              'operator': '操作员',
              'timeB': '2018/10/10',
              'source': '来源',
              'payer': '缴费人',
              'mobile': '13122236548'
            },
            {
              'pid': 'A004',
              'name': '电表名',
              'moneyA': '￥500.02',
              'moneyB': '￥40.02',
              'moneyC': '￥30.02',
              'timeA': '2018/10/10',
              'operator': '操作员',
              'timeB': '2018/10/10',
              'source': '来源',
              'payer': '缴费人',
              'mobile': '13122236548'
            },
            {
              'pid': 'A005',
              'name': '电表名',
              'moneyA': '￥500.02',
              'moneyB': '￥40.02',
              'moneyC': '￥30.02',
              'timeA': '2018/10/10',
              'operator': '操作员',
              'timeB': '2018/10/10',
              'source': '来源',
              'payer': '缴费人',
              'mobile': '13122236548'
            },
            {
              'pid': 'A006',
              'name': '电表名',
              'moneyA': '￥500.02',
              'moneyB': '￥40.02',
              'moneyC': '￥30.02',
              'timeA': '2018/10/10',
              'operator': '操作员',
              'timeB': '2018/10/10',
              'source': '来源',
              'payer': '缴费人',
              'mobile': '13122236548'
            },
            {
              'pid': 'A007',
              'name': '电表名',
              'moneyA': '￥500.02',
              'moneyB': '￥40.02',
              'moneyC': '￥30.02',
              'timeA': '2018/10/10',
              'operator': '操作员',
              'timeB': '2018/10/10',
              'source': '来源',
              'payer': '缴费人',
              'mobile': '13122236548'
            },
            {
              'pid': 'A008',
              'name': '电表名',
              'moneyA': '￥500.02',
              'moneyB': '￥40.02',
              'moneyC': '￥30.02',
              'timeA': '2018/10/10',
              'operator': '操作员',
              'timeB': '2018/10/10',
              'source': '来源',
              'payer': '缴费人',
              'mobile': '13122236548'
            },
            {
              'pid': 'A009',
              'name': '电表名',
              'moneyA': '￥500.02',
              'moneyB': '￥40.02',
              'moneyC': '￥30.02',
              'timeA': '2018/10/10',
              'operator': '操作员',
              'timeB': '2018/10/10',
              'source': '来源',
              'payer': '缴费人',
              'mobile': '13122236548'
            },
            {
              'pid': 'A010',
              'name': '电表名',
              'moneyA': '￥500.02',
              'moneyB': '￥40.02',
              'moneyC': '￥30.02',
              'timeA': '2018/10/10',
              'operator': '操作员',
              'timeB': '2018/10/10',
              'source': '来源',
              'payer': '缴费人',
              'mobile': '13122236548'
            },
            {
              'pid': 'A011',
              'name': '电表名',
              'moneyA': '￥500.02',
              'moneyB': '￥40.02',
              'moneyC': '￥30.02',
              'timeA': '2018/10/10',
              'operator': '操作员',
              'timeB': '2018/10/10',
              'source': '来源',
              'payer': '缴费人',
              'mobile': '13122236548'
            },
            {
              'pid': 'A012',
              'name': '电表名',
              'moneyA': '￥500.02',
              'moneyB': '￥40.02',
              'moneyC': '￥30.02',
              'timeA': '2018/10/10',
              'operator': '操作员',
              'timeB': '2018/10/10',
              'source': '来源',
              'payer': '缴费人',
              'mobile': '13122236548'
            }
          ]
          json.username = '缴费人姓名'
          json.jfname = '操作员'
          json.people = '电表名称'
          json.startTime = '2018-09-15'
          json.endTime = '2018-10-15'
          //返回结果相关操作
          $('#pagination').pagination({
            dataSource: json.data,
            className: 'paginationjs-theme-blue',
            //showNavigator:true,showGoInput:true,showGoButton:true,
            pageSize: 5,
            pageNumber: 1,
            callback: function (data, pagination) {
              insertHtml(data)
            }
          })
          if (json.startTime && json.endTime) {
            $('#dateTime').html(json.startTime + '—' + json.endTime).show()
          }
          $('#requestName').html(json.people)
        } else {
          layer.alert(json.msg, {icon: 2})
          return false
        }
      }
    })

  }

  function insertHtml (data) {
    var html = ''
    if (data.length > 0) {
      for (i in data) {
        html += '<tr>' +
          '<td>' + data[i]['name'] + '</td>' +
          '<td>' + data[i]['pid'] + '</td>' +
          '<td>' + data[i]['moneyA'] + '</td>' +
          '<td>' + data[i]['moneyB'] + '</td>' +
          '<td>' + data[i]['moneyC'] + '</td>' +
          '<td>' + data[i]['timeA'] + '</td>' +
          '<td>' + data[i]['operator'] + '</td>' +
          '<td>' + data[i]['timeB'] + '</td>' +
          '<td>' + data[i]['source'] + '</td>' +
          '<td>' + data[i]['payer'] + '</td>' +
          '<td>' + data[i]['mobile'] + '</td>' +
          '</tr>'
      }
    } else {
      html = '<tr><td colspan=\'11\' class=\'text-center\'>暂无相关信息</td></tr>'
    }
    $('#dataList').html(html)
  }

  //打印
  $(document).on('click', '.printBtn', function (event) {
    event.preventDefault()
    $('#printContent').jqprint()
  })

})
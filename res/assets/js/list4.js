$(function () {
  laydate.render({
    elem: '#startTime'
    , theme: '#393D49',
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
              'name': '建筑名',
              'power': '￥500.02',
              'money': '￥40.02',
              'name2': '建筑名',
              'power2': '￥500.02',
              'money2': '￥40.02',
            },
            {
              'name': '建筑名',
              'power': '￥500.02',
              'money': '￥40.02',
              'name2': '建筑名',
              'power2': '￥500.02',
              'money2': '￥40.02',
            },
            {
              'name': '建筑名',
              'power': '￥500.02',
              'money': '￥40.02',
              'name2': '建筑名',
              'power2': '￥500.02',
              'money2': '￥40.02',
            },
            {
              'name': '建筑名',
              'power': '￥500.02',
              'money': '￥40.02',
              'name2': '建筑名',
              'power2': '￥500.02',
              'money2': '￥40.02',
            },
            {
              'name': '建筑名',
              'power': '￥500.02',
              'money': '￥40.02',
              'name2': '建筑名',
              'power2': '￥500.02',
              'money2': '￥40.02',
            },
            {
              'name': '建筑名',
              'power': '￥500.02',
              'money': '￥40.02',
              'name2': '建筑名',
              'power2': '￥500.02',
              'money2': '￥40.02',
            },
            {
              'name': '建筑名',
              'power': '￥500.02',
              'money': '￥40.02',
              'name2': '建筑名',
              'power2': '￥500.02',
              'money2': '￥40.02',
            },
            {
              'name': '建筑名',
              'power': '￥500.02',
              'money': '￥40.02',
              'name2': '建筑名',
              'power2': '￥500.02',
              'money2': '￥40.02',
            },
            {
              'name': '建筑名',
              'power': '￥500.02',
              'money': '￥40.02',
              'name2': '建筑名',
              'power2': '￥500.02',
              'money2': '￥40.02',
            },
            {
              'name': '建筑名',
              'power': '￥500.02',
              'money': '￥40.02',
              'name2': '建筑名',
              'power2': '￥500.02',
              'money2': '￥40.02',
            },
            {
              'name': '建筑名',
              'power': '￥500.02',
              'money': '￥40.02',
              'name2': '建筑名',
              'power2': '￥500.02',
              'money2': '￥40.02',
            },
            {
              'name': '建筑名',
              'power': '￥500.02',
              'money': '￥40.02',
              'name2': '建筑名',
              'power2': '￥500.02',
              'money2': '￥40.02',
            }
          ]
          json.username = '缴费人姓名'
          json.jfname = '操作员'
          json.people = '建筑名'
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
          '<td>' + data[i]['power'] + '</td>' +
          '<td>' + data[i]['money'] + '</td>' +
          '<td>' + data[i]['name2'] + '</td>' +
          '<td>' + data[i]['power2'] + '</td>' +
          '<td>' + data[i]['money2'] + '</td>' +
          '</tr>'
      }
    } else {
      html = '<tr><td colspan=\'6\' class=\'text-center\'>暂无相关信息</td></tr>'
    }
    $('#dataList').html(html)
  }

  //打印
  $(document).on('click', '.printBtn', function (event) {
    event.preventDefault()
    $('#printContent').jqprint()
  })
})
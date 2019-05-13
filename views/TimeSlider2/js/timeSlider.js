﻿(function () {
  if (typeof jQuery === 'undefined') {
    throw new Error('Slider\'s JavaScript requires jQuery')
  }

  if (navigator.appName === 'Microsoft Internet Explorer') { //判断是否是IE浏览器
    if (navigator.userAgent.match(/Trident/i) && navigator.userAgent.match(/MSIE 8.0/i)) { //判断浏览器内核是否为Trident内核IE8.0
      //do something
    }
  }
  var _startTimeStamp //消除IE8下单击会触发mousmove，增加时间戳判断;
  var _stopTimeStamp
  var _gContextArray = new Array() //存放每个时间轴对象实例的上下文this的数组
  var _gLanguage = 1 //0代表英文，1代表中文
  function TimeSlider (initObj) {
    this.left_array = new Array() //存放每个时间段的左坐标
    this.right_array = new Array() //存放每个时间段的右坐标
    this.leftTime_array = new Array() //存放每个时间段的左坐标对应的时间
    this.rightTime_array = new Array() //存放每个时间段的右坐标对应的时间
    this.events_array = new Array() //存放每个时间轴的事件
    this.leftTime = 0 //存放当前操作时间段的时间
    this.rightTime = 0 //存放当前操作时间段的时间
    this.offsetX_left = 0 //存放最后一个被创建时间段的坐标
    this.timeSliderWidth = 0 //时间轴宽度
    this.slderLeftOffset = 0 //时间轴距离左页面的距离
    this.oneTimeBlockWidth = 0 //每天段的宽度
    this.oneHourWidth = 0 //每小时占的宽度
    this.oneMinWidth = 0 //每一个分钟占的宽度
    this.timeBlockNum = 0 //时间段个数-1
    this.hasMove = false //判断时间段是click事件还是move事件
    this.whichOne = 0 //目前操纵的时间段在坐标数组中的索引
    this.timeSliderNum = 0 //TimeSlider实例个数
    this.timeBlockId_present = null //当前操作的时间段的ID
    this.mountId = null //当前挂载的真实DOM的ID
    this.currentEvent = null //当前操作时间段的事件
    this.banMove = new Array()//是否禁止托动 0不可托动 1可托动
    this.currentMonth = ''//时间轴月份

    _gLanguage = initObj.language == 'en' ? 0 : 1
    this.init(initObj) //总初始化开始
  }

  TimeSlider.prototype = {
    sliderTotal: 0, //TimeSlider实例个数
    init: function (obj) {
      _gContextArray.push(this)
      TimeSlider.prototype.sliderTotal++
      this.timeSliderNum = TimeSlider.prototype.sliderTotal
      this.createLayout(obj)
    },

    /*创建整个时间轴的DOM结构*/
    createLayout: function (obj) {
      var self = this //保存当前上下文
      self.mountId = obj.id
      self.events_array = obj.defaultEvents || []
      self.currentMonth = obj.currentMonth
      var MYY = obj.currentMonth.split('/')[0]//当前年
      var MYM = obj.currentMonth.split('/')[1]//当前月
      var D = new Date(MYY, MYM, 0), CMNum = D.getDate()//当前月份天数
      var defaultOneTimeBlockTime = obj.defaultOneTimeBlockTime || 24 //手动点击创建时，每个时间段的默认时间

      /*********************创建布局start******************/
      var backgroundDiv = document.createElement('div')
      $(backgroundDiv).addClass('trCanvas').appendTo('#' + self.mountId)

      //绑定事件，使得单击时间轴创建时间段
      $(backgroundDiv).mousedown(function (e) {
        self.manualCreation(e)
      })
      var currentNum = self.left_array

      var oneHourWidth = parseFloat($(backgroundDiv).width() / (CMNum)).toFixed(4) //每一天占的宽度
      self.oneHourWidth = oneHourWidth
      var oneMinWidth = parseFloat((oneHourWidth / 24).toFixed(4)) //每一个小时占的宽度
      self.oneMinWidth = oneMinWidth

      var oneTimeBlockWidth = parseFloat((oneMinWidth * defaultOneTimeBlockTime).toFixed(4)) //每个时间段的宽度
      self.oneTimeBlockWidth = oneTimeBlockWidth

      self.timeSliderWidth = $(backgroundDiv).width() //时间轴宽度

      //创建当前月份的标注
      for (var i = 0; i <= CMNum; i++) {
        var coordinateDiv = document.createElement('div')
        $(coordinateDiv).addClass('coordinate').css({
          'left': oneHourWidth * i + 'px'
        }).appendTo('#' + self.mountId)

        var labelDiv = document.createElement('div')
        if (i < 10) {
          $(labelDiv).addClass('coordinateLabDiv').text(i).css({
            'left': oneHourWidth * i + 'px'
          }).appendTo('#' + self.mountId)
        } else {
          $(labelDiv).addClass('coordinateLabDiv').text(i).css({
            'left': oneHourWidth * i + 'px',
            'margin-left': '-6px'
          }).appendTo('#' + self.mountId)

        }
      }

      //弹出框(使用了单例模式)
      getInstance(createCoverDiv)
      getInstance(createPopUpBox)
      //编辑区域
      creatEditDiv(self)
      /*********************创建布局end******************/

      self.slderLeftOffset = $('#' + self.mountId).offset().left //时间轴距离左页面的距离

      /******************时间段初始化start*****************/
      if (Object.prototype.toString.call(obj.defaultDate) == '[object Array]') {
        self.timeInit(obj.defaultDate, obj.banMove)
      } else if (obj.defaultDate) {
        throw new Error('时间初始化需要数组格式')
      }

    },
    //手动创建时间段，即鼠标点击时间轴
    //因为在鼠标点击的时候只会产生整数px，所以这里先通过鼠标点击的坐标算出
    //对应的时间，然后通过这个时间再次获取精确的坐标值
    manualCreation: function (e) {
      var self = this
      var offsetX_left = parseFloat((e.pageX - self.slderLeftOffset).toFixed(4))
      var offsetX_right = parseFloat((offsetX_left + self.oneTimeBlockWidth).toFixed(4))

      var tmpStartHour = Math.floor(offsetX_left / self.oneHourWidth)
      var tmpStopHour = Math.floor(offsetX_right / self.oneHourWidth)

      //如果初始化为编辑，不可添加
      if (self.banMove.indexOf(1) >= 0) {
        return false
      }

      var hour1 = tmpStartHour.toString().length < 2 ? '0' + tmpStartHour : tmpStartHour
      var hour2 = tmpStopHour.toString().length < 2 ? '0' + tmpStopHour : tmpStopHour
      // hour1 = self.currentMonth + '/' + hour1
      // hour2 = self.currentMonth + '/' + hour2
      var timeArray = new Array() //存放初始化时间的数组
      var offsetXArray = new Array() //存放通过初始化时间换算出来的位移数组

      timeArray.push(hour1)
      timeArray.push(hour2)

      offsetXArray = self.getSliderOffsetX(timeArray)

      if (self.banMove.indexOf(0) > -1 && self.banMove.indexOf(2) > -1) {
        return false
      }
      self.createTimeBlock({
        backgroundDiv: self.mountId,
        offsetX_left: offsetXArray[0],
        offsetX_right: offsetXArray[1],
        event: 2//手动创建默认事件2
        //banMove:this.banMove
      })
      //添加时间段的时候默认添加事件0
      whichOne = _.sortedIndex(self.left_array, self.offsetX_left)
      self.events_array.splice(whichOne, 0, 2)
      self.banMove.splice(whichOne, 0, 2)

    },
    //时间段初始化函数
    timeInit: function (data, banMove) {
      var self = this
      self.banMove = banMove
      //隐藏编辑框
      $('.editContent').hide()
      $('.editUnit>input[type=checkbox],.editCheckAll').prop('checked', false)

      _.map(data, function (item, index) {
        var tempDate = parseInt(item) - 1
        var timeArray = new Array() //存放初始化时间的数组
        var offsetXArray = new Array() //存放通过初始化时间换算出来的位移数组
        var event = this.events_array[index]
        timeArray.push(tempDate)
        offsetXArray = this.getSliderOffsetX(timeArray)

        this.createTimeBlock({
          backgroundDiv: this.mountId,
          offsetX_left: offsetXArray[0],
          event: event,
          banMove: banMove
        })
      }
        .bind(this))
    },
    /*
    创建时间段函数，
    obj参数：
    backgroundDiv为时间轴的背景DOM，
    offsetX_left为时间段的左边坐标
    offsetX_right为时间段的右边坐标，若不存在，则默认oneTimeBlockWidth的宽度
     */
    createTimeBlock: function (obj) {
      var self = this
      var backgroundDiv = obj.backgroundDiv
      var offsetX_left = parseFloat(obj.offsetX_left.toFixed(4))
      var offsetX_right = obj.offsetX_right || Number(parseFloat(offsetX_left + self.oneTimeBlockWidth).toFixed(4) + 50)
      var event = obj.event || 0
      /**************对于时间段创建时错误校验start***************/
      //错误数据处理：后台数据错误，导致结束时间大于开始时间
      if (offsetX_right <= offsetX_left) {
        return
      }

      if (typeof(backgroundDiv) == 'string') {
        $backgroundDiv = $('#' + backgroundDiv + ' > .trCanvas')
      } else {
        $backgroundDiv = $(backgroundDiv)
      }

      //判断新建的时间段是否超过整个时间轴右边界
      if ((offsetX_left) > $backgroundDiv.width() - self.oneTimeBlockWidth) {
        return
      }

      //判断新创建的时间段是否能放下，防止时间段重叠
      var leftArrayLength = self.left_array.length
      if (leftArrayLength >= 1) {
        for (var j = 0; j < leftArrayLength; j++) {
          if (offsetX_right > self.left_array[j] && offsetX_left < self.right_array[j]) {
            return
          }
        }
      }
      /**************对于时间段创建时错误校验end****************/

      /**************时间段创建start****************/
      //刚加入一个时间段就把其左右坐标进行保存

      self.left_array.push(offsetX_left)
      self.right_array.push(offsetX_right)
      self.offsetX_left = offsetX_left
      //将时间段的坐标进行排序
      self.left_array.sort(function (a, b) {
        return a - b
      })
      self.right_array.sort(function (a, b) {
        return a - b
      })

      var sliderNum = self.timeSliderNum //当前时间轴索引

      if ($('#timeS' + sliderNum + '_' + self.timeBlockNum).length > 0) {
        self.timeBlockNum++
      }

      //动态创建时间段
      var timeBlockDataObj = {
        sliderNum: sliderNum,
        timeBlockNum: self.timeBlockNum,
        offsetX_left: offsetX_left,
        timeBlockWidth: parseFloat((offsetX_right - offsetX_left).toFixed(4)),
        defalutColor: defalutColor[event],
        eventId: event
      }

      var timeBlockSting = [
        '<div class="timeSliderDiv"',
        'id="timeS<%=sliderNum%>_<%=timeBlockNum%>"',
        'data-id="<%=eventId%>"',
        'style=left:<%=offsetX_left%>px;',
        'width:<%=timeBlockWidth%>px;',
        'background-color:#<%=defalutColor%>;',
        '></div>'
      ].join('')
      timeBlockSting = _.template(timeBlockSting)
      var timeBlockDom = timeBlockSting(timeBlockDataObj)
      $backgroundDiv.append(timeBlockDom)

      //为时间段绑定点击事件
      $('#timeS' + sliderNum + '_' + self.timeBlockNum).mousedown(function (e) {
        self.timeBlockMouseDown(e, this)
        if (document.all) { //兼容IE8
          e.originalEvent.cancelBubble = true
        } else {
          e.stopPropagation()
        }
      })

      /**************时间段拉伸按钮创建start****************/
      var bar_string = [
        '<div class="<%=barClass%>"',
        'id="<%=barId%>"',
        '></div>'
      ].join('')
      bar_string = _.template(bar_string)

      var bar_left_dataObj = {
        barClass: 'leftBar',
        barId: 'leftBar' + sliderNum + '_' + self.timeBlockNum
      }

      var bar_right_dataObj = {
        barClass: 'rightBar',
        barId: 'rightBar' + sliderNum + '_' + self.timeBlockNum
      }

      var bar_left_dom = bar_string(bar_left_dataObj)
      var bar_right_dom = bar_string(bar_right_dataObj)

      $('#timeS' + sliderNum + '_' + self.timeBlockNum).append(bar_left_dom)
      $('#timeS' + sliderNum + '_' + self.timeBlockNum).append(bar_right_dom)

      $('#leftBar' + sliderNum + '_' + self.timeBlockNum).mouseover(function (e) {
        $(this).css('cursor', 'e-resize')
        if (document.all) { //兼容IE8
          e.originalEvent.cancelBubble = true
        } else {
          e.stopPropagation()
        }
      }).mousedown(function (e) {
        self.leftBarDown(e, this)
        if (document.all) { //兼容IE8
          e.originalEvent.cancelBubble = true
        } else {
          e.stopPropagation()
        }
      })

      $('#rightBar' + sliderNum + '_' + self.timeBlockNum).mouseover(function (e) {
        $(this).css('cursor', 'e-resize')
        if (document.all) { //兼容IE8
          e.originalEvent.cancelBubble = true
        } else {
          e.stopPropagation()
        }
      }).mousedown(function (e) {
        self.rightBarDown(e, this)
        if (document.all) { //兼容IE8
          e.originalEvent.cancelBubble = true
        } else {
          e.stopPropagation()
        }
      })

      /**************时间段拉伸按钮创建end****************/

      /**************时间段时间显示区域创建start***************/
      var time_show_string = [
        '<div class="<%=timeShowClass%>"',
        'id="<%=timeShowId%>"',
        '></div>'
      ].join('')
      time_show_string = _.template(time_show_string)

      var time_show_left_dataObj = {
        timeShowClass: 'leftShow',
        timeShowId: 'leftShow' + sliderNum + '_' + self.timeBlockNum
      }

      var time_show_right_dataObj = {
        timeShowClass: 'rightShow',
        timeShowId: 'rightShow' + sliderNum + '_' + self.timeBlockNum
      }
      var time_show_left_dom = time_show_string(time_show_left_dataObj)
      var time_show_right_dom = time_show_string(time_show_right_dataObj)

      $('#timeS' + sliderNum + '_' + self.timeBlockNum).append(time_show_left_dom)
      $('#timeS' + sliderNum + '_' + self.timeBlockNum).append(time_show_right_dom)

      self.setSliderTime(offsetX_left, 'leftShow' + sliderNum + '_' + self.timeBlockNum)
      self.setSliderTime(offsetX_right, 'rightShow' + sliderNum + '_' + self.timeBlockNum)
      self.getSliderTime()
      /**************时间段时间显示区域创建end****************/

      //控制时间显示效果
      $('#timeS' + sliderNum + '_' + self.timeBlockNum).hover(function () {
        $(this).addClass('hover')
        $(this).css('z-index', 5)
        $('.hover .leftShow').show()
        $('.hover .rightShow').show()
        $('.hover .leftBar').show()
        $('.hover .rightBar').show()
      }, function () {
        $(this).css('z-index', 4)
        $('.hover .leftShow').hide()
        $('.hover .rightShow').hide()
        $('.hover .leftBar').hide()
        $('.hover .rightBar').hide()
        $(this).removeClass('hover')
      })

      self.timeBlockNum++
      /**************时间段创建end****************/
    },

    /*提供给用户的接口，删除某个时间轴上所有时间段，并重新设置*/
    set: function (obj) {
      var setTimeArray = obj.setTimeArray, banMove = []
      if (Object.prototype.toString.call(setTimeArray) == '[object Array]') {
        removeAll(this)
        if (0 === setTimeArray.length) {
          return
        }
        this.events_array = obj.setEventsArray || []
        for (var i = 0; i < setTimeArray.length; i++) {
          banMove.push(1)
        }
        this.timeInit(setTimeArray, banMove)
      } else if (setTimeArray) {
        throw new Error('时间初始化需要数组格式')
      }
    },
    /*提供给用户的接口,返回当前时间轴上所有时间段和事件*/
    get: function () {
      var resObj = {}
      var self = this
      resObj.times = new Array()
      resObj.events = self.events_array
      _.forEach(self.leftTime_array, function (item, index) {
        resObj.times.push(item + '-' + self.rightTime_array[index])
      })
      return resObj
    },
    /*时间段按下事件，主要是用来拖拽时间段和点击弹出编辑框*/
    timeBlockMouseDown: function (e, thisTimeBlock) {
      _startTimeStamp = new Date().getTime()
      _startTimeStamp = new Date().getTime()
      $(thisTimeBlock).css('z-index', '5')
      $(thisTimeBlock).css('cursor', 'move')
      var self = this
      var rightShowId = $(thisTimeBlock).children('.rightShow').attr('id')
      var leftShowId = $(thisTimeBlock).children('.leftShow').attr('id')
      var arrayLength = self.right_array.length
      var whichOne
      /*当我去移动时间段之前，先找到当前操作的时间段在数组中的位置*/
      whichOne = _.sortedIndex(self.leftTime_array, $('#' + leftShowId).text().replace(/\-/g, '/'))

      var parentOriginalLeft = self.left_array[whichOne] //时间段的原始偏移量
      var mouseRelativeOffsetX = parseFloat((e.pageX - parentOriginalLeft - self.slderLeftOffset).toFixed(4)) //鼠标在时间段上的偏移
      self.whichOne = whichOne
      var timeBlockId = $(thisTimeBlock).attr('id')
      var timeSliderWidth = self.timeSliderWidth //整个滑动条宽度
      self.timeBlockId_present = timeBlockId
      //寻找边界
      var leftBorder = 0 //左边界；
      var rightBorder = timeSliderWidth //右边界
      var leftOffset = 0 //移动后的时间段偏移量
      var rightOffset = 0
      //按住滚动条时，如果banMove为0 不可托动
      if (self.banMove[whichOne] == 0) {
        $(thisTimeBlock).css('cursor', 'auto')
        return false
      }

      if (arrayLength > 1) {
        if (self.whichOne == 0) {
          rightBorder = self.left_array[self.whichOne + 1]
        } else if (self.whichOne == arrayLength - 1) {
          leftBorder = self.right_array[self.whichOne - 1]
        } else {
          leftBorder = self.right_array[self.whichOne - 1]
          rightBorder = self.left_array[self.whichOne + 1]
        }
      }

      var timeBlockWidth = parseFloat((self.right_array[self.whichOne] - self.left_array[self.whichOne]).toFixed(4)) //时间段自身的宽度
      $(document).mousemove(function (ev) {
        _stopTimeStamp = new Date().getTime()
        if (_stopTimeStamp - _startTimeStamp > 80) {
          self.hasMove = true
          leftOffset = parseFloat((ev.pageX - mouseRelativeOffsetX - self.slderLeftOffset).toFixed(4))

          if (leftOffset <= leftBorder) {
            leftOffset = leftBorder
          } else if (leftOffset >= parseFloat((rightBorder - timeBlockWidth).toFixed(4))) {
            leftOffset = parseFloat((rightBorder - timeBlockWidth).toFixed(4))
          }

          rightOffset = parseFloat((leftOffset + timeBlockWidth).toFixed(4))

          if (leftOffset >= leftBorder && rightOffset <= rightBorder) {
            $('#' + timeBlockId).css({
              left: leftOffset + 'px'
            })
            self.setSliderTime(leftOffset, leftShowId)
            self.setSliderTime(rightOffset, rightShowId)
          }
        }
      })
      //移动时鼠标放开触摸发
      $(document).on('mouseup mouseleave', function (e) {
        if (!self.hasMove) {
          var rightShowId = $('#' + timeBlockId).children('.rightShow').attr('id')
          var leftShowId = $('#' + timeBlockId).children('.leftShow').attr('id')
          $('#startH').val($('#' + leftShowId).text().replace("00","01"))
          $('#stopH').val($('#' + rightShowId).text())

          var color = $('#' + timeBlockId).css('backgroundColor') //IE11获取的是rgb值，IE8是hex值，所以需要区分一下；
          if (_.indexOf(color, '#') == -1) {
            var colorHex = rgbToHex($('#' + timeBlockId).css('backgroundColor'))
          } else {
            var colorHex = color.replace('#', '')
          }
          var eventIndex = _.indexOf(defalutColor, colorHex) + 1
          $('#eventSelect').val(eventIndex)
          $('#fixedDiv').fadeIn(100)
          $('#modalDiv').fadeIn(150).attr('data-number', self.timeSliderNum)
        } else {
          //移动释放时
          self.hasMove = false
          self.getSliderTime('move')
          var tmpTimeArray = new Array()
          tmpTimeArray.push(self.leftTime_array[self.whichOne], self.rightTime_array[self.whichOne])

          tmpTimeArray = self.getSliderOffsetX(tmpTimeArray)
          self.left_array[self.whichOne] = parseFloat(tmpTimeArray[0].toFixed(4))
          self.right_array[self.whichOne] = parseFloat(tmpTimeArray[1].toFixed(4))

          $('#' + timeBlockId).css({
            left: parseFloat(tmpTimeArray[0].toFixed(4)) + 'px'
          })
        }
        $('#' + timeBlockId).css('cursor', 'auto')
        $(document).off('mousemove mouseup mouseleave')
      })
      if (document.all) { //兼容IE8
        e.originalEvent.cancelBubble = true
      } else {
        e.stopPropagation()
      }
    },

    /*
    左拉伸按钮鼠标按下事件 e为事件对象，thisBar为当前操作的左按钮
    左边伸缩会改变时间段的宽度
     */
    leftBarDown: function (e, thisBar) {
      _startTimeStamp = new Date().getTime()
      $(thisBar).css('cursor', 'w-resize')
      var self = this
      var timeBlockId = $(thisBar).parent().attr('id')
      var leftShowId = $('#' + timeBlockId).children('.leftShow').attr('id') //显示具体时间的div
      var whichOne
      var len = self.left_array.length
      var offsetX_left_present
      /*当我去移动时间段之前，先找到当前操作的时间段在数组中的位置*/
      whichOne = _.sortedIndex(self.leftTime_array, $('#' + leftShowId).text())
      var parentOriginalLeft = self.left_array[whichOne]//时间段的原始偏移量
      var mouseRelativeOffsetX = parseInt(parentOriginalLeft - (e.pageX - self.slderLeftOffset), 10)
      //var mouseRelativeOffsetX = 0;
      self.whichOne = whichOne
      /*寻找边界*/
      var leftBorder = 0 //左边界；

      if (self.banMove[whichOne] == 0) {
        return false
      }

      if (len > 1) {
        if (whichOne != 0) {
          leftBorder = self.right_array[whichOne - 1]
        }
      }
      /*绑定拉伸条的移动事件*/
      $(document).mousemove(function (ev) {
        _stopTimeStamp = new Date().getTime()
        if (_stopTimeStamp - _startTimeStamp > 100) { //消抖
          offsetX_left_present = parseFloat((ev.pageX - self.slderLeftOffset + mouseRelativeOffsetX).toFixed(4)) //偏移量
          if (offsetX_left_present <= leftBorder) {
            offsetX_left_present = leftBorder
          }
          var timeBlockWidth_present = parseFloat((self.right_array[whichOne] - offsetX_left_present).toFixed(4)) //时间段在移动过程中的宽度
          if (timeBlockWidth_present >= self.oneTimeBlockWidth) { //规定左伸缩的时候最小为30分钟
            if (offsetX_left_present >= leftBorder) {
              $('#' + timeBlockId).css({
                width: timeBlockWidth_present + 'px',
                left: offsetX_left_present + 'px'
              })
              self.setSliderTime(offsetX_left_present, leftShowId)
            }
          }
        }
      })

      $(document).on('mouseup mouseleave', function (e) {
        self.barUp(thisBar, 'left', timeBlockId)
      })
      if (document.all) { //兼容IE8
        e.originalEvent.cancelBubble = true
      } else {
        e.stopPropagation()
      }
    },
    /*右拉伸按钮鼠标按下事件 e为事件对象，thisBar为当前操作的按钮*/
    rightBarDown: function (e, thisBar) {
      var self = this
      _startTimeStamp = new Date().getTime()
      var timeBlockId = $(thisBar).parent().attr('id') //当前操作的时间段id
      var rightShowId = $('#' + timeBlockId).children('.rightShow').attr('id')
      var whichOne
      var timeSliderWidth = self.timeSliderWidth //整个滑动条宽度
      var len = self.left_array.length
      var offsetX_right_present

      whichOne = _.sortedIndex(self.rightTime_array, $('#' + rightShowId).text()) //寻找当前时间段索引
      self.whichOne = whichOne
      var parentOriginalLeft = self.left_array[whichOne] //时间段的原始偏移量
      var mouseRelativeOffsetX = parseFloat((e.pageX - self.slderLeftOffset - self.right_array[whichOne]).toFixed(4)) //鼠标的相对位移

      //寻找边界值
      var rightBorder = timeSliderWidth //右边界

      if (self.banMove[whichOne] == 0) {
        return false
      }

      if (len > 1) {
        if (whichOne != len - 1) {
          rightBorder = self.left_array[whichOne + 1]
        }
      }
      $(document).mousemove(function (ev) {
        _stopTimeStamp = new Date().getTime()
        if (_stopTimeStamp - _startTimeStamp > 50) { //消抖
          offsetX_right_present = parseFloat((ev.pageX - self.slderLeftOffset - mouseRelativeOffsetX).toFixed(4))
          if (offsetX_right_present >= timeSliderWidth) {
            offsetX_right_present = timeSliderWidth
          }

          var timeSliderWidth_present = parseFloat((offsetX_right_present - parentOriginalLeft).toFixed(4)) //现在时间段的宽度

          if (timeSliderWidth_present >= self.oneTimeBlockWidth) {
            if (offsetX_right_present >= rightBorder) {
              offsetX_right_present = rightBorder
            }
            var timeSliderWidth_present = parseFloat((offsetX_right_present - parentOriginalLeft).toFixed(4))
            $('#' + timeBlockId).css({
              width: timeSliderWidth_present + 'px'
            })
            self.setSliderTime(offsetX_right_present, rightShowId)
          }

        }
      })

      $(document).on('mouseup mouseleave', function (e) {
        self.barUp(thisBar, 'right', timeBlockId)
      })
      if (document.all) { //兼容IE8
        e.originalEvent.cancelBubble = true
      } else {
        e.stopPropagation()
      }
    },
    /*拉伸按钮鼠标松开事件thisBar为当前操作的按钮,direction为当前是操作的左边拉伸按钮还是右边拉伸按钮*/
    barUp: function (thisBar, direction, timeBlockId) {
      var self = this
      $(thisBar).css('cursor', 'default')
      $(document).off('mousemove mouseup mouseleave')
      self.getSliderTime('move', direction) //保存时间
      var tmpTimeArray = new Array()
      tmpTimeArray.push(self.leftTime_array[self.whichOne], self.rightTime_array[self.whichOne])

      tmpTimeArray = self.getSliderOffsetX(tmpTimeArray)
      self.left_array[self.whichOne] = parseFloat(tmpTimeArray[0].toFixed(4))
      self.right_array[self.whichOne] = parseFloat(tmpTimeArray[1].toFixed(4))
      $('#' + timeBlockId).css({
        width: parseFloat((tmpTimeArray[1] - tmpTimeArray[0]).toFixed(4)) + 'px',
        left: parseFloat(tmpTimeArray[0].toFixed(4)) + 'px'
      })
    },
    /*设置当前的显示时间
    参数offsetX为偏移量，id为显示时间的DOM id
     */
    setSliderTime: function (offsetX, id) {
      var direction = id.substring(0, 1)
      var self = this
      var tmpDate = Math.round(offsetX / self.oneHourWidth)
      var YM = self.currentMonth.split('/')
      var tmpDate = tmpDate.toString().length < 2 ? '0' + tmpDate : tmpDate
      // $('#' + id).text(tmpDate.replace(/\//g, '-'))
      $('#' + id).text(tmpDate)

      if (direction == 'l') {
        this.leftTime = tmpDate
      } else {
        this.rightTime = tmpDate
      }
    },
    /*获取当前的时间段的显示时间，并存入数组，按从小到大顺序排列/
    action为时间段是否在移动，移动分为两种，拖动时间段和拖动拉伸条
    拖动时间段时开始和结束时间都更新，拖动拉伸条时只更新一个时间，由direction决定
     */
    getSliderTime: function (action, direction) {
      if (action == 'move') {
        if ('right' === direction) {
          this.rightTime_array[this.whichOne] = this.rightTime
        } else if ('left' === direction) {
          this.leftTime_array[this.whichOne] = this.leftTime
        } else {
          this.rightTime_array[this.whichOne] = this.rightTime
          this.leftTime_array[this.whichOne] = this.leftTime
        }
      } else {
        this.leftTime_array.push(this.leftTime)
        this.rightTime_array.push(this.rightTime)
      }
      this.leftTime_array.sort(function (a, b) {
        return parseInt(a) - parseInt(b)
      })
      this.rightTime_array.sort(function (a, b) {
        return parseInt(a) - parseInt(b)
      })

      //IE8下使用parseInt对于数字08,07,06.....等数字进行转换时会变成0
      // IE8下面parseint默认会把“08”、“09”当成八进制，但是又发现不是合法的八进制，最后就抛出了0这个false。
      // 解决方法1，加个参数：parseInt(numString, 10)
      // 解决方法2，用new Number转成数字 var num = new Number(numString);
      // 解决方法3，换成parseFloat：parseFloat(numString)

    },
    /*获取当前对应时间的left偏移量，参数time为传进来的时间数组
    返回值：
    offsetX_Array[0]为开始时间对应的偏移量
    offsetX_Array[1]为结束时间对应的偏移量
     */
    getSliderOffsetX: function (time) {
      var offsetX_Array = new Array
      var self = this
      var startH_OffsetX = parseInt(time[0]) * self.oneHourWidth
      var stopH_OffsetX = parseInt(time[1]) * self.oneHourWidth

      offsetX_Array[0] = Number(startH_OffsetX.toFixed(4))
      offsetX_Array[1] = Number(stopH_OffsetX.toFixed(4))
      return offsetX_Array
    },
    /*
    获取当前元素真实的属性值
    element为当前元素
    attr为具体属性
     */
    getStyle: function (element, attr) {
      if (element.currentStyle) {
        return element.currentStyle[attr]
      } else {
        return getComputedStyle(element, false)[attr]
      }
      return style
    },
    /*获取鼠标位置，为了兼容ie8
    Firefox支持属性pageX,与pageY属性，这两个属性已经把页面滚动计算在内了,
    在Chrome可以通过document.body.scrollLeft，document.body.scrollTop计算出页面滚动位移，
    而在IE下可以通过document.documentElement.scrollLeft ，document.documentElement.scrollTop */
    getMousePos: function (event) {
      var e = event || window.event
      var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft
      var scrollY = document.documentElement.scrollTop || document.body.scrollTop
      var x = e.pageX || e.clientX + scrollX
      var y = e.pageY || e.clientY + scrollY
      return {
        'x': x,
        'y': y
      }
    }
  }

  /****************内部私有函数区start******************/
  //让bind函数支持IE8
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable')
      }
      var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {
        },
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
            aArgs.concat(Array.prototype.slice.call(arguments)))
        }
      fNOP.prototype = this.prototype
      fBound.prototype = new fNOP()
      return fBound
    }
  }

  //单例模式实现
  var getInstance = function () {
    var res = {}
    return function (fn) {
      if (res[fn]) {
        return res[fn]
      }
      res[fn] = fn.call(this, arguments)
      return res[fn]
    }
  }
  ()

  var defalutColor = ['d32311', 'eaaae4', '04d4d4', '2f66f3', 'a5df12'];
  /*为事件BOX添加颜色*/
  (function () {
    _.forEach($('.eventBox'), function (item, index) {
      $(item).css('backgroundColor', '#' + defalutColor[index])
    })
  })()

  //将颜色从rgb转换为16进制格式
  function rgbToHex (rgb) {
    var _rgb = rgb.match(/[^\(\)]+(?=\))/g)[0].split(',')
    if (_rgb) {
      var hex = ''
      _.forEach(_rgb, function (item) {
        hex += ('0' + parseInt(item, 10).toString(16)).slice(-2)
      })
      return (hex)
    }
  }

  //创建遮罩
  function createCoverDiv () {
    var fixedDiv = document.createElement('div')
    $(fixedDiv).addClass('fixBGDiv').attr('id', 'fixedDiv').css('opacity', 0.4)
    $('body').append(fixedDiv)
    return 'createCoverDivCall'
  }

  //创建弹出编辑框
  function createPopUpBox () {
    /* 利用_.template 模板引擎来渲染 */
    var popUpBoxString = '\
               <div class="modal" id="modalDiv" data-number="">\
                 <div class="modal-dialog">\
                     <div class="modal-content">\
                        <div class="modal-header">\
                            <h4 class="modal-title"><%=modalHeaderTitile%></h4>\
                        </div>\
                        <div class="modal-body">\
                          <div class="time-div">\
                            <div class="time-start-div">\
                               <label class="time-lab"><%=timeStartLab%></label>\
                               <input type="text" id="startH" class="time-input">\
                            </div>\
                            <div class="time-stop-div">\
                               <label class="time-lab"><%=timeStopLab%></label>\
                               <input type="text" id="stopH" class="time-input">\
                            </div>\
                          </div>\
                          <div class="event-div">\
                            <label class="event-lab"><%=eventLab%></label>\
                            <select class="event-select" id="eventSelect">\
                              <%_.forEach(eventArray,function(item,index){%>\
                                <%if(index==0){%>\
                                <option value=<%=index+1%> disabled><%=item%></option>\
                                <%}else{%>\
                                <%if(index<3){%>\
                                <option value=<%=index+1%>><%=item%></option>\
                                <%}%>\
								<%}%>\
                              <%})%>\
                            </select>\
                          </div>\
                        </div>\
                        <div class="modal-footer">\
                          <button class="btn" id="setBtn"><%=setBtnName%></button>\
                          <button class="btn" id="delBtn"><%=delBtnName%></button>\
                          <button class="btn" id="calBtn"><%=calBtnName%></button>\
                        </div>\
                     </div>\
                 </div>\
               </div>'

    var lan = _gLanguage
    var obj = {
      'modalHeaderTitile': ['Edit', '编辑'][lan],
      'timeStartLab': ['Start Time', '开始日期'][lan],
      'timeStopLab': ['Stop Time', '结束时间'][lan],
      'eventLab': ['Event Type', '事件类型'][lan],
      'eventArray': [['Event1', '历史记录事件'][lan], ['Event2', '事件2'][lan], ['Event3', '事件3'][lan], ['Event4', '事件4'][lan], ['Event5', '事件5'][lan]],
      'setBtnName': ['Set', '设置'][lan],
      'delBtnName': ['Delete', '删除'][lan],
      'calBtnName': ['Cancel', '取消'][lan]
    }
    popUpBoxString = _.template(popUpBoxString)
    var dom = popUpBoxString(obj)
    $('body').append(dom)

    $('#setBtn').click(function () {
      var contextIndex = $('#modalDiv').attr('data-number') - 1
      var self = _gContextArray[contextIndex]
      var D = new Date(self.currentMonth.split('/')[0], self.currentMonth.split('/')[1], 0), Dnum = D.getDate()//当前月份天数
      var sth = parseInt($('#startH').val()) - 1, STH = null
      var SPH = parseInt($('#stopH').val()) - 1
      STH = (sth <= 0) ? 0 : sth
      if (SPH > Dnum) {
        alert('设置时间超出范围')
        return false;
      }
      var rightShowId = $('#' + self.timeBlockId_present).children('.rightShow').attr('id')
      var leftShowId = $('#' + self.timeBlockId_present).children('.leftShow').attr('id')

      var newLeft = parseFloat((STH * self.oneHourWidth))
      var newRight = parseFloat((SPH * self.oneHourWidth + self.oneTimeBlockWidth))
      var arrayLen

      arrayLen = self.left_array.length
      var tmpLeft = self.left_array.splice(self.whichOne, 1)
      var tmpRight = self.right_array.splice(self.whichOne, 1)
      if (arrayLen >= 2) {
        for (var j = 0; j < arrayLen; j++) {
          if (newRight > self.left_array[j] && newLeft < self.right_array[j]) {
            alert(['Coincides with other time periods, please reset', '与其他时间段重合，请重新设置'][lan])
            self.left_array.push(tmpLeft[0])
            self.right_array.push(tmpRight[0])
            self.left_array.sort(function (a, b) {
              return a - b
            })
            self.right_array.sort(function (a, b) {
              return a - b
            })
            return
          }
        }
      }
      self.left_array.push(newLeft)
      self.right_array.push(newRight)
      self.left_array.sort(function (a, b) {
        return a - b
      })
      self.right_array.sort(function (a, b) {
        return a - b
      })
      $('#' + self.timeBlockId_present).css({
        'left': newLeft,
        'width': parseFloat((newRight - newLeft).toFixed(4))
      })

      self.setSliderTime(newLeft, leftShowId)
      self.setSliderTime(newRight, rightShowId)

      /*更新时间数组里面的时间*/
      self.leftTime_array.splice(self.whichOne, 1, self.leftTime)
      self.rightTime_array.splice(self.whichOne, 1, self.rightTime)

      /*更新事件*/
      $('#' + self.timeBlockId_present).css('backgroundColor', '#' + defalutColor[$('#eventSelect').val() - 1])
      self.events_array.splice(self.whichOne, 1, $('#eventSelect').val() - 1)
      $('#modalDiv').hide()
      $('#fixedDiv').hide()
    })

    $('#delBtn').click(function () {
      var contextIndex = $('#modalDiv').attr('data-number') - 1
      var self = _gContextArray[contextIndex]
      self.banMove.splice(self.whichOne, 1)
      self.right_array.splice(self.whichOne, 1)
      self.left_array.splice(self.whichOne, 1)
      self.leftTime_array.splice(self.whichOne, 1)
      self.rightTime_array.splice(self.whichOne, 1)
      self.events_array.splice(self.whichOne, 1)
      $('#' + self.timeBlockId_present).remove()
      $('#modalDiv').hide()
      $('#fixedDiv').hide()
    })

    $('#calBtn').click(function () {
      $('#modalDiv').hide()
      $('#fixedDiv').hide()
    })
    return 'createPopUpBoxCall'
  }

  //创建编辑框函数
  function creatEditDiv (context) {
    var editDivString = '\
            <div class="editWrap" id=<%="editDiv"+context.timeSliderNum%>>\
                <img src="images/edit.png" class="editImg"></img>\
                <img src="images/save.png" class="saveImg"></img>\
                <img src="images/del.png" class="delImg"></img>\
                <div class="editContent" id=<%="editContent"+context.timeSliderNum%>>\
                    <div class="editHeader">\
                        <label class="editHeaderTitle"><%=editHeaderTitle%></label>\
                    </div>\
                    <div class="editBody">\
                      <%_.forEach(editTextObj,function(item,index){%>\
                          <div class="editUnit">\
                             <input class=<%="editCBox"+context.timeSliderNum%> id=<%="editCBox"+context.timeSliderNum+"_"+index%> type="checkbox"></input>\
                             <label for=<%="editCBox"+context.timeSliderNum+"_"+index%>><%=item%></label>\
                          </div>\
                      <%})%>\
                           <div class="editUnit">\
                          <label>\
                              <input class="editCheckAll" type="checkbox"></input>\
                           <%=checkAllName%></label>\
                           </div>\
                    </div>\
                    <div class="editFotter">\
                        <button class="editBtn save"><%=saveName%></button>\
                        <button class="editBtn cancel"><%=cancelName%></button>\
                    </div>\
                </div>\
            </div>'

    var lan = _gLanguage
    var editTextObj = dateAxis
    /*[
      ['Mon.', '星期一'][lan],
      ['Tue.', '星期二'][lan],
      ['Wed.', '星期三'][lan],
      ['Thu.', '星期四'][lan],
      ['Fri.', '星期五'][lan],
      ['Sat.', '星期六'][lan],
      ['Sun.', '星期日'][lan]
    ]*/
    var obj = {
      'context': context,
      'editHeaderTitle': ['Copy To', '复制到'][lan],
      'editTextObj': editTextObj,
      'checkAllName': ['Check All', '全选'][lan],
      'saveName': ['Save', '保存'][lan],
      'cancelName': ['Cancel', '取消'][lan]
    }

    editDivString = _.template(editDivString)
    var dom = editDivString(obj)
    $('#' + context.mountId).after(dom)

    $('#editDiv' + context.timeSliderNum).click(function (e) {
      if ($(e.target).attr('class')) {
        if ($(e.target).attr('class') == 'saveImg') {

          var id = $(e.target).parents('.editWrap').siblings('.timeSlider').attr('id')
          saveDate(id.match(/\d/g)[0])

        } else if ($(e.target).attr('class') == 'editImg') {
          //隐藏编辑框
          $('.editContent').hide()
          $('.editUnit>input[type=checkbox],.editCheckAll').prop('checked', false)
          $('.editContent').hide()
          $('#editCBox' + context.timeSliderNum + '_' + (context.timeSliderNum - 1)).attr('disabled', true)
          $('#editContent' + context.timeSliderNum).show()
        } else if ($(e.target).attr('class') == 'delImg') {

          if (window.confirm(['Do you want to delete all time periods on this timeline?', '是否要删除此时间轴上编辑的时间段'][lan])) {
            removeAll(context)
          }
        } else if ($(e.target).attr('class').substring(0, 8) == 'editCBox') {
          $('#editDiv' + context.timeSliderNum + ' .editCheckAll').prop('checked', $('.editCBox' + context.timeSliderNum).length == $('.editCBox' + context.timeSliderNum).filter(':checked').length - 1)
        } else if ($(e.target).attr('class') == 'editBtn save') {
          copyTimeSlider(1, context)
          $('#editContent' + context.timeSliderNum).hide()
        } else if ($(e.target).attr('class') == 'editBtn cancel') {
          $('#editContent' + context.timeSliderNum).hide()
        } else if ($(e.target).attr('class') == 'editCheckAll') {
          var state = $('#editDiv' + context.timeSliderNum + ' .editCheckAll').prop('checked')
          $('.editCBox' + context.timeSliderNum).filter(function (index, item) {
            if (!$(item).prop('disabled')) {
              $(item).prop('checked', state)
            }
          })
        }
      }
    })
  }

  /*复制函数：
  flag为1是复制时全覆盖，0是选择性覆盖
  context为当前时间轴的this
   */
  function copyTimeSlider (flag, context) {
    var self = context
    var len = self.left_array.length

    for (var j = 0; j < dateAxis.length; j++) {
      //如果时间轴上有不可删除的事件时跳出复制
      if (_gContextArray[j].leftTime_array.length == 0) {
        if ($('#editCBox' + self.timeSliderNum + '_' + j).prop('checked') == true) {
          var targetId = $('.trCanvas').eq(j).parent().attr('id')
          if (flag) {
            removeAll(_gContextArray[j])
          }

          for (var i = 0; i < len; i++) {
            var offsetX_left = (parseInt(self.leftTime_array[i].split('/')[2]) - 1) * _gContextArray[j]['oneHourWidth']
            var offsetX_right = (parseInt(self.rightTime_array[i].split('/')[2]) - 1) * _gContextArray[j]['oneHourWidth']

            _gContextArray[j].createTimeBlock({
              backgroundDiv: targetId,
              offsetX_left: offsetX_left,
              offsetX_right: offsetX_right,
              event: 2,// self.events_array[i],
              banMove: 2// self.banMove[i]
            })
            /* _gContextArray[j].events_array[i] = self.events_array[i]
             _gContextArray[j].banMove[i] = self.banMove[i]*/
            _gContextArray[j].events_array[i] = 2
            _gContextArray[j].banMove[i] = 2
          }
        }
      }
    }
  }

  /*删除当前时间轴上所有时间段
  context为当前时间轴的this
   */
  function removeAll (context) {
    var self = context
    var len = self.right_array.length
    var newArr = []
    for (var i = 0; i < self.banMove.length; i++) {
      if (self.banMove[i] == 1 || self.banMove[i] == 2) {
        $('#timeslider' + self.timeSliderNum + ' #timeS' + self.timeSliderNum + '_' + i).remove()
        self.right_array.splice(i, 1)
        self.left_array.splice(i, 1)
        self.rightTime_array.splice(i, 1)
        self.leftTime_array.splice(i, 1)
        self.events_array.splice(i, 1)
        len--
      } else {
        newArr.push(self.banMove[i])
      }
    }
    $('#timeslider' + self.timeSliderNum).find('[data-id="1"]').remove()
    $('#timeslider' + self.timeSliderNum).find('[data-id="2"]').remove()
    self.banMove = newArr
    self.timeBlockNum = len
    self.leftTime = 0
    self.rightTime = 0
  }

  /****************内部私有函数区end******************/

  TimeSlider.prototype.constructor = TimeSlider
  window.TimeSlider = TimeSlider

})()

const util = require("../../utils/util.js")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    textareaValue: "",
    chatData: [],
    focus: false,
    hold: false,
    page: 1,
    animation: false,
    ableUpperLoad: true //是否可继续触顶加载数据
    // userId: app.globalData.userId,
    // toId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options.headImg:', options.headImg);
    console.log('options.toHeadImg:', options.toHeadImg);
    this.setData({
      userId: options.userId,
      toId: options.toId,
      headImg: options.headImg,
      toHeadImg: options.toHeadImg
      // userId: 49,
      // toId: 48
    })
    // let that = this
    // if (!app.globalData.socketOpen) {
    //   console.log('未连接webSocket,现在连接');
    //   wx.connectSocket({
    //     url: 'ws://' + app.globalData.host + '/webSocket/' + this.data.userId,
    //     // protocols: ['http:']
    //   })
    // }

    // wx.onSocketOpen((result) => {
    //   app.globalData.socketOpen = true
    //   console.log('webSocket连接成功:', result);
    // })

    // wx.onSocketMessage((result) => {
    //   let json = JSON.parse(result.data)
    //   console.log('webSocket接收到消息:', json);
    //   if (json.type == 'chat') {
    //     console.log('接收到聊天对方发送的消息:', json.content);
    //     let item = new Object()
    //     item.content = json.content
    //     item.fromId = json.fromId
    //     item.date = json.date
    //     item.headImg = json.headImg
    //     item.type = 0 //接收标志
    //     let list = this.data.chatData
    //     list.push(item)
    //     this.setData({
    //       chatData: list,
    //       toLast: `item${list.length}`
    //     })
    //     // console.log('当前数据条数：', list.length);
    //     // this.onLoad()
    //   }
    // })

    util.systemType((res) => {
      console.log('get windowHeight:', res);
      this.setData({
        windowHeight: res
      })
    })
    // this.pageScrollToBottom()
  },

  //获取聊天记录
  loadChatRecords(page, callBack) {
    wx.request({
      url: app.globalData.agree + app.globalData.host + '/chat/getRecordsVO',
      method: 'post',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        userId: this.data.userId,
        toId: this.data.toId,
        page: page,
        limit: 10
      },
      success: res => {
        //回调函数自己操作数据
        callBack(res)
      }
    })
  },


  clickSend() {
    // this.setData({
    //   hold:true
    // })
    let content = this.data.textareaValue
    if (!content) {
      wx.showToast({
        title: '消息不为空',
        icon: 'none'
      })
      return
    }
    console.log('当前用户id：', this.data.userId)
    console.log('当前对方用户id：', this.data.toId)
    let date = util.formatTime(new Date())
    let userId = this.data.userId
    let toId = this.data.toId
    let headImg = this.data.headImg
    let toHeadImg = this.data.toHeadImg
    let nickName = wx.getStorageSync('nickName')
    console.log('toHeadImg->', toHeadImg);
    let that = this

    //插入聊天记录
    wx.request({
      url: app.globalData.agree + app.globalData.host + '/chat/insertRecords',
      method: 'POST',
      data: JSON.stringify({
        type: 1,
        userId: userId,
        toId: toId,
        content: content,
        date: date
      }),
      success: res => {
        let that = this
        if (res.data.code == 0) {
          console.log('聊天记录插入成功!');

          let item = new Object()
          item.content = content
          item.fromId = userId
          item.date = date
          item.headImg = headImg
          let list = this.data.chatData
          list.push(item)
          this.setData({
            chatData: list,
            animation: true,
            toLast: `item${list.length}`
          })

          //还原为不可加载滚动动画
          if (this.data.animation)
            this.setData({
              animation: false
            })

            console.log('更新消息表...');
          //更新消息表
          wx.request({
            url: util.prefixUrl + '/message/saveOrUpdate',
            method:'POST',
            data: JSON.stringify({
              userId: userId,
              toId: toId,
              content: content,
              date: date
            }),
            success: res => {
              console.log('消息表更新成功');

              //webSocket发送
              if (app.globalData.socketOpen) {
                wx.sendSocketMessage({
                  data: JSON.stringify({
                    type: 'chat',
                    fromId: userId,
                    toId: toId,
                    content: content,
                    date: date,
                    headImg: headImg,
                    nickName: nickName
                  }),
                  success: res => {
                    console.log('webSocket发送消息成功!');
                    that.setData({
                      textareaValue: ''
                    })
                  },
                  error: res => {
                    console.log('webSocket发送失败！')
                  }
                })
              } else {
                console.log('socketOpen为false');
              }
            }
          })

        } else {
          console.log(res.data.message)
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  textareaBlur() {},

  textareaInput(e) {
    console.log(e.detail.value);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //得到第一页10条最新的数据,并且数据要颠倒
    this.loadChatRecords(1, (res) => {
      if (res.data.code == 0) {
        let list = res.data.data
        console.log(list);
        list.forEach(element => {
          element.date = util.formatDate(new Date(element.date))
        });
        this.setData({
          chatData: list.reverse(),
          toLast: `item${res.data.total}`
        })
        if (res.data.total < 10)
          this.setData({
            ableUpperLoad: false
          })
      }
    })

    //监听webSocket接收消息
    wx.onSocketMessage((result) => {
      let json = JSON.parse(result.data)
      console.log('webSocket接收到消息:', json);
      if (json.type == 'chat') {
        console.log('接收到聊天对方发送的消息:', json.content);
        let item = new Object()
        item.content = json.content
        item.fromId = json.fromId
        item.date = json.date
        item.headImg = json.headImg
        item.type = 0 //接收标志
        let list = this.data.chatData
        list.push(item)
        this.setData({
          chatData: list,
          toLast: `item${list.length}`
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  //触顶事件
  scrolltoupper() {
    if (this.data.ableUpperLoad) {
      let list = this.data.chatData //已加载数据(最新，要拼接到后面)
      let len = this.data.chatData.length
      this.loadChatRecords(++this.data.page, (res) => {
        if (res.data.code == 0) {
          let mylist = res.data.data
          mylist.forEach(element => {
            element.date = util.formatDate(new Date(element.date))
          });
          console.log(mylist);
          let list1 = mylist.reverse()
          list.push.apply(list1, list) //这个函数最后结果在第一个参数中，也就是拼接到第一个参数
          console.log('此时拼接第二页数据：', list1);
          this.setData({
            chatData: list1,
            toLast: `item${list1.length-len+1}`
          })
          if (res.data.total < 10)
            this.setData({
              ableUpperLoad: false
            })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
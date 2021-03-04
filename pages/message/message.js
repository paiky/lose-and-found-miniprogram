// pages/info/info.js
const util = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    messageList: {}, //obj,列表未读消息数
    tip: 0,
    chatList: [],
    // isReplyMe:'',
    // replyMeCount:''
  },

  //加载聊天列表
  loadChatList() {
    let that = this
    wx.request({
      url: util.prefixUrl + '/message/chatList',
      data: {
        userId: app.globalData.userId
      },
      success: res => {
        if (res.data.code == 0) {
          let list = res.data.data
          console.log('最新消息列表:', res);
          list.forEach(element => {
            element.message.date = util.formatDate(new Date(element.message.date))
          });
          that.setData({
            chatList: list
          })
        }
      }
    })
  },

  clickList(e) {
    let item = e.currentTarget.dataset.modal
    console.log('点击item:',item);
    // let messageList = wx.getStorageSync('messageList')
    // messageList[item.toId] = 0
    wx.request({
      url: util.prefixUrl + '/message/updateRead',
      data: {
        userId: item.message.userId,
        toId: item.message.toId
      },
      success: res => {
        if (res.data.code == 0) {
          console.log('已读状态更新成功!');
          let unChatCount = wx.getStorageSync('unChatCount')
          wx.setStorage({
            data: unChatCount - item.unread,
            key: 'unChatCount',
          })
        }
      }
    })
    // wx.setStorage({
    //   data: messageList,
    //   key: 'messageList',
    // })
    // this.setData({
    //   messageList: messageList
    // })
    wx.navigateTo({
      url: '/pages/letter/letter?userId=' + app.globalData.userId + '&toId=' + item.message.toId +
        '&toHeadImg=' + item.headImg + '&headImg=' + wx.getStorageSync('headImg'),
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let unreply = wx.getStorageSync('unreply')
    this.setData({
      replyMeCount: unreply
    })

    // this.loadChatList()


    // wx.onSocketMessage((result) => {
    //   let json = JSON.parse(result.data)

    //   //如果收到评论消息
    //   if (json.reply) {
    //     let reply = wx.getStorageSync('reply')
    //     if (json.reply > reply) {
    //       let count = json.reply - reply
    //       console.log('收到总共', count, '条新的评论!');
    //       app.globalData.newReply = count
    //       this.setData({
    //         isReplyMe: true,
    //         replyMeCount: count
    //       })
    //     }
    //   }

    //   //收到聊天消息
    //   if (json.type == 'chat') {
    //     console.log('收到聊天消息');
    //     this.loadChatList()
    //     this.setData({
    //       hasChatTip: true,
    //       tip: this.data.tip + 1
    //     })
    //   }
    // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  //navigate to reply
  clickReply() {
    // let reply = wx.getStorageSync('reply')
    // let newReply = app.globalData.newReply
    wx.request({
      url: util.prefixUrl + '/comment/updateRead',
      data: {
        userId: app.globalData.userId
      },
      success: res => {
        if (res.data.code == 0)
          console.log('已读状态更新成功!');
        else
          console.log('已读状态更新失败！');
      }
    })
    wx.setStorage({
      data: 0,
      key: 'unreply',
    })
    console.log('所有评论已读...');
    // app.globalData.newReply -= newReply
    this.setData({
      isReplyMe: false,
      replyMeCount: 0
    })
    wx.navigateTo({
      url: '/pages/reply/reply?userId=' + getApp().globalData.userId,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    //设置最新回复评论数量
    let count = wx.getStorageSync('unreply')
    if (count > 0)
      this.setData({
        isReplyMe: true,
        replyMeCount: count
      })
    else
      this.setData({
        isReplyMe: false,
        replyMeCount: 0
      })

    //查询本地未读消息数量
    // var messageList = wx.getStorageSync('messageList')

    // if (!messageList){
    //   messageList = new Object()
    //   wx.setStorage({
    //     data: messageList,
    //     key: 'messageList',
    //   })
    // }

    // this.setData({
    //   messageList: messageList
    // })

    //接收webSocket
    wx.onSocketMessage((result) => {
      let json = JSON.parse(result.data)

      //如果收到评论消息
      if (json.type == 'reply') {
        console.log('message获取评论数量：', json.reply)
        let reply = 0
        if (json.reply) {
          reply = json.reply
        } else {
          let unreply = wx.getStorageSync('unreply')
          reply = unreply + 1
        }
        this.setData({
          isReplyMe: true,
          replyMeCount: reply
        })
        wx.setStorage({
          data: reply,
          key: 'unreply',
        })

        // if (json.reply > reply) {
        //   let count = json.reply - reply
        //   console.log('收到总共', count, '条新的评论!');
        //   app.globalData.newReply = count
        //   this.setData({
        //     isReplyMe: true,
        //     replyMeCount: count
        //   })
        // }
      }

      //收到聊天消息
      if (json.type == 'chat') {
        console.log('收到聊天消息');
        // this.loadChatList()
        // let messageList = wx.getStorageSync('messageList')
        // if (!messageList[json.fromId]) {
        //   // messageList = new Object()
        //   messageList[json.fromId] = 0
        // }
        // messageList[json.fromId]++
        // this.setData({
        //   messageList: messageList
        // })
        let unChatCount = wx.getStorageSync('unChatCount')
        wx.setStorage({
          data: unChatCount + 1,
          key: 'unChatCount',
        })
        this.loadChatList()
      }
    })

    this.loadChatList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('消息页面已关闭...');
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
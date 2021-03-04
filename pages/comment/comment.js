// pages/comment/comment.js
const util = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // userId: 0, //物品信息发布者
    goodId: 0,
    comments: [],
    textareaValue: '',
  },

  //加载
  load(goodId) {
    let that = this
    wx.request({
      url: util.prefixUrl + '/comment/queryCommentById?id=' + goodId,
      success: function (res) {
        if (res.data.code === 0) {
          console.log('加载评论:', res.data.data);
          let list = res.data.data
          list.forEach(element => {
            element.comment.date = util.formatDate(new Date(element.comment.date))
          });
          that.setData({
            comments: list
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('goodId:', options.goodId);
    console.log('userId:', options.userId);
    this.setData({
      goodId: options.goodId,
      userId: options.userId
    })
    this.load(options.goodId);
  },

  //发布评论
  clickComment(event) {
    console.log('comment:', event);
    if (!this.data.textareaValue) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return;
    }

    let that = this
    let userId = this.data.userId //物品发布者
    let replierId = app.globalData.userId

    //添加评论同时服务器会发送socket通知发布信息的用户
    wx.request({
      method: 'post',
      url: util.prefixUrl + '/comment/addComment',
      data: {
        goodId: this.data.goodId,
        replierId: app.globalData.userId,
        userId: userId,
        content: this.data.textareaValue,
        date: util.formatTime(new Date()),
        isRead: 0
      },
      success: function (res) {
        console.log('comment->res:', res);
        if (res.data.code === 0) {
          let unreply = wx.getStorageSync('unreply')
          wx.setStorage({
            data: unreply+1,
            key: 'unreply',
          })
          wx.showToast({
            title: '评论成功'
          })

          //发送webSocket
          // wx.sendSocketMessage({
          //   data: JSON.stringify({
          //     type: 'reply',
          //     userId: replierId,
          //     toId: userId
          //   }),
          //   success: res => {
          //     console.log('评论webSocket通知成功！');
          //   },
          //   error: res => {
          //     console.log('评论webSocket发送失败！')
          //   }
          // })

          //清空输入框
          that.setData({
            textareaValue: ''
          })

          //重新加载该物品信息下的评论
          that.load(that.data.goodId)
        }
      },
      error: function () {
        wx.showToast({
          title: '未知错误,请重试!',
          icon: 'none'
        })
      }
    })
  },

  //监听输入框变化
  textareaInput(event) {
    // console.log('textareaInput', event.detail);
    this.setData({
      textareaValue: event.detail.value,
      textareaBuff: event.detail.value,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  },

  //失焦事件
  textareaFocus(event) {
    // console.log('textareaFocus', event.detail);
    // this.setData({
    //   isNotFocus: false,
    //   textareaValue: this.data.textareaBuff
    // })
  },

  //输入框失焦事件
  textareaBlur(event) {
    // console.log('textareaBlur', event.detail);
    // this.setData({
    //   isNotFocus: true,
    //   textareaValue: ''
    // })
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
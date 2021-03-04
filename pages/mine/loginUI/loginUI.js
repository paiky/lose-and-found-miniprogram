const util = require("../../../utils/util.js")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.systemType((res) => {
      this.setData({
        windowHeight: res
      })
    })
  },

  clickWXLogin(e) {
    console.log('回调信息:', e);
    if (e.detail.errMsg == "getUserInfo:ok") {
      wx.getUserInfo({
        lang: 'zh_CN',
        success: res => {
          // console.log('用户信息:', res.userInfo);
          app.globalData.userInfo = res.userInfo
          console.log('此时全局用户信息:', app.globalData.userInfo);
          wx.showToast({
            title: '登录成功!',
          })
          wx.request({
            method: 'POST',
            url: app.globalData.agree + app.globalData.host + '/user/update',
            data: {
              id: app.globalData.userId,
              name: res.userInfo.nickName,
              headImg: res.userInfo.avatarUrl
            },
            success: res => {
              if (res.data.code)
                console.log('更新信息成功!');
            },
            error: res => {
              console.log('更新失败:', res);
            }
          })
          wx.setStorage({
            data: true,
            key: 'hasLogin',
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1000);
        }
      })
    }
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
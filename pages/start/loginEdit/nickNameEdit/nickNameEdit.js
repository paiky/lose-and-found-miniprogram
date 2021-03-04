// pages/start/loginEdit/nickNameEdit/nickNameEdit.js
const app = getApp()
const prefixUrl = app.globalData.agree + app.globalData.host
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: 'ojXbF5OI1d64ub2Pq0m6you11SGE',
    // length:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      inputValue:options.inputValue,
      length:options.inputValue.length
      // length: this.data.inputValue.length
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  bindInput(e) {
    let value = e.detail.value
    this.setData({
      length: value.trim().length,
      inputValue: value
    })
  },

  //提交
  confirm() {
    if (this.data.length <= 0 || this.data.inputValue.trim().length == 0) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      })
      return
    }
    wx.request({
      url: prefixUrl + '/user/update',
      method: 'POST',
      data: {
        name: this.data.inputValue,
        id: app.globalData.userId
      },
      success: res => {
        if (res.data.code == 0) {
          console.log('昵称更新成功!');
          wx.setStorageSync('nickName', this.data.inputValue)
          wx.showToast({
            title: '昵称更新成功',
          })
          wx.setStorageSync('hasEdit', true)
          setTimeout(() => {
            wx.navigateBack()
          }, 1000);
        }
      }
    })
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
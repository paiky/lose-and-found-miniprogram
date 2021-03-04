const util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: 808,
    triggered: false
  },

  load(userId) {
    console.log('loading...');
    let that = this
    let url = '/comment/reply?userId=' + userId
    util.loadData(url, [], (res) => {
      if (res.data.code == 0) {
        let list = res.data.data
        list.forEach(element => {
          element.date = util.formatDate(new Date(element.date))
        });
        that.setData({
          replyData: list
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //get windowHeight
    util.systemType((res) => {
      console.log('这时候屏幕高度：', res);
      this.setData({
        windowHeight: res
      })
    })

    this.setData({
      userId: options.userId
    })

    this.load(options.userId)
  },

  onRefresh() {
    if (this._freshing) return
    this._freshing = true
    setTimeout(() => {
      this.load(this.data.userId)
      this.setData({
        triggered: false,
      })
      this._freshing = false
    }, 1000)
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
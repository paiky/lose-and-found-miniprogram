// pages/goodInfo/goodInfo.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodId: 0,
    goods: [],
    more_show: true,
    comments: [],
    total: 0,
    // headImg:''
  },

  //加载数据
  load(goodId) {
    let that = this
    wx.request({
      method: 'get',
      url: getApp().globalData.agree + getApp().globalData.host + '/goods/findGoods?id=' + goodId,
      success(res) {
        console.log('/goods/findGoods->res:', res);
        if (res.data.code === 0)
          that.setData({
            goods: res.data.data,
            chatBtn: res.data.data.goods.userId == app.globalData.userId
          })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    this.setData({
      goodId: options.id,
      headImg:wx.getStorageSync('headImg')
    })
    this.load(options.id);
  },
  //navigate to comment page
  click_comment() {
    if (!wx.getStorageSync('hasLogin')) {
      wx.navigateTo({
        url: '/pages/mine/loginUI/loginUI',
      })
    } else {
      wx.navigateTo({
        url: '/pages/comment/comment?goodId=' + this.data.goodId + "&userId=" + this.data.goods.goods.userId,
      })
    }
  },

  //私信
  chat() {
    wx.navigateTo({
      url: '/pages/letter/letter?userId=' + app.globalData.userId + '&toId=' + this.data.goods.goods.userId +
        '&toHeadImg=' + this.data.goods.headImg + '&headImg=' + wx.getStorageSync('headImg'),
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
    //加载评论
    wx.request({
      method: 'get',
      url: getApp().globalData.agree + getApp().globalData.host + '/comment/queryCommentById?id=' + this.data.goodId,
      success:res=> {
        console.log(res);
        let result = res.data;
        if (result.code == 0) {
          this.setData({
            total: result.total
          })
          if (result.data.length > 2) {
            let list = []
            list.push(result.data[0], result.data[1])
            this.setData({
              comments: list,
              more_show: false
            })
          } else {
            this.setData({
              comments: result.data,
              more_show: true
            })
          }
        }
      }
    })
    // console.log("detail.js->onShow()");
    // let that = this
    // wx.request({
    //   url: getApp().globalData.agree + getApp().globalData.host + '/comment/amount?goodId=' + this.data.goodId,
    //   success: function (res) {
    //     console.log('onShow->res:', res);
    //     if (res.data.code === 0) {
    //       that.setData({
    //         total: res.data.data
    //       })
    //     }
    //   }
    // })
  },

  clickHeadImg(e){
    let image = e.currentTarget.dataset.modal
    console.log(image);
    wx.previewImage({
      urls: [image],
    })
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
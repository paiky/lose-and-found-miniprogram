const util = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    button: '编辑'
  },

  load() {
    wx.request({
      url: app.globalData.agree + app.globalData.host + '/goods/findGoodsByUserId',
      data: {
        id: app.globalData.userId,
        page: 1,
        limit: 3
      },
      success: res => {
        if (res.data.code == 0) {
          let list = res.data.data
          // let reg = /<p><img[^>]+><\/p>|<p><br><\/p>|<p><\/p>/gi
          // list.forEach(element => {
          //   element.content = element.content.replace(util.reg, "")
          // });
          let goods = []
          for (let i = 0; i < list.length; i++) {
            if (i == 3)
              break
            goods.push(list[i])
          }
          this.setData({
            goods: goods
          })
          console.log('goods:', goods);
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var hasLogin = wx.getStorageSync('hasLogin')
    console.log('当前登录状态：', hasLogin);
    this.setData({
      hasLogin: hasLogin
    })
    if (hasLogin) {
      this.setData({
        nickName: wx.getStorageSync('nickName'),
        avatarUrl: wx.getStorageSync('headImg')
      })
      this.load()
      // if (app.globalData.userInfo) {
      //   console.log('网络较块...');
      //   this.setData({
      //     userInfo: app.globalData.userInfo
      //   })
      //   this.load()
      // } else {
      //   console.log('还没获取授权信息先进入onload...');
      //   app.userInfoReadyCallback = res => {
      //     this.setData({
      //       userInfo: res.userInfo,
      //     })
      //     console.log('回调处理userInfo授权信息:', this.data.userInfo);
      //     this.load()
      //   }
      // }
    }

  },

  clickGood(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id,
    })
  },

  clickLogin(e) {
    console.log('回调信息:', e);
    if (e.detail.errMsg == "getUserInfo:ok") {
      wx.setStorage({
        key: 'hasLogin',
        data: true
      })
      wx.getUserInfo({
        lang: 'zh_CN',
        success: res => {
          // console.log('用户信息:', res.userInfo);
          app.globalData.userInfo = res.userInfo
          console.log('此时全局信息globalData:', app.globalData);

          //update userInfo to database
          // wx.request({
          //   method: 'POST',
          //   url: getApp().globalData.agree + getApp().globalData.host + '/user/update',
          //   data: {
          //     id: app.globalData.userId,
          //     name: app.globalData.userInfo.nickName,
          //     headImg: app.globalData.userInfo.avatarUrl
          //   },
          //   success: res => {
          //     if (res.data.code == 0)
          //       console.log('更新信息成功!');
          //   },
          //   error: res => {
          //     console.log('更新失败:', res);
          //   }
          // })

          wx.showToast({
            title: '登录成功!',
            duration: 1000
          })
          this.onLoad()
        }
      })
    }
    // wx.navigateTo({
    //   url: '/pages/mine/loginUI/loginUI',
    // })
  },

  seekMore() {
    console.log(util.prefixUrl);
    wx.navigateTo({
      url: '/pages/record/record',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  clickEdit() {
    wx.navigateTo({
      url: '/pages/edit/edit',
    })
  },

  clickQuit() {
    wx.setStorage({
      key: "hasLogin",
      data: false
    })
    console.log('点击退出');
    this.onLoad()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var hasLogin = wx.getStorageSync('hasLogin')
    //it can load public data when onshow here
    if (hasLogin)
      this.onLoad()
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
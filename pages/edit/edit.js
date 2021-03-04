const util = require("../../utils/util.js")
const app = getApp()
const prefixUrl = util.prefixUrl
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sex: ['保密', '男', '女'],
    // status: '',
    // upload_cover: '',
    // nickName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      upload_cover: wx.getStorageSync('headImg'),
      nickName: wx.getStorageSync('nickName'),
      status: wx.getStorageSync('sex'),
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  bindPickerChange(e) {
    console.log('picker回调：', e);
    if (e.detail.value != this.data.status) {
      wx.request({
        url: prefixUrl + '/user/update',
        method: 'POST',
        data: {
          sex: e.detail.value,
          id: app.globalData.userId
        },
        success: res => {
          console.log('性别更新成功!');
        }
      })
      this.setData({
        status: e.detail.value
      })
      wx.setStorageSync('sex', e.detail.value)
    }
  },

  //上传本地头像
  uploadHeadImg() {
    let that = this
    wx.chooseImage({
      count: 1,
      success: res => {
        console.log('chooseImage.res', res)
        var tempFilePaths = res.tempFilePaths;
        console.log('tempFilePaths', tempFilePaths);
        //这是是上传图片的代码
        wx.uploadFile({
          url: app.globalData.agree + app.globalData.host + '/goods/upload', //上传接口
          name: "file",
          header: {
            "Content-Type": "multipart/form-data"
          },
          formData: {
            userId: app.globalData.userId,
            type: 'cover'
          },
          filePath: tempFilePaths[0],
          complete: function (str) {
            console.log('uploadFile->complete:', str)
            if (str.statusCode == 200) {
              var info = JSON.parse(str.data);
              console.log(info.data);
              that.setData({
                upload_cover: info.data.replace(/\\/g, "/")
              })
              wx.setStorageSync('headImg', that.data.upload_cover)
              wx.setStorageSync('hasEdit', true)
              wx.request({
                url: prefixUrl + '/user/update',
                method: 'POST',
                data: {
                  headImg: that.data.upload_cover,
                  id: app.globalData.userId
                },
                success: res => {
                  console.log('头像更新成功!');
                }
              })
            }
          }
        });
      }
    });
  },

  clickNickName() {
    wx.navigateTo({
      url: '/pages/start/loginEdit/nickNameEdit/nickNameEdit?inputValue=' + this.data.nickName,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      nickName: wx.getStorageSync('nickName')
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
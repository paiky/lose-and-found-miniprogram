const util = require("../../utils/util.js")
const app = getApp()
const prefixUrl = app.globalData.agree + app.globalData.host
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: [],
    page: 1
},

  load(){
    wx.request({
      url: prefixUrl + '/goods/findGoodsByUserId',
      data: {
        id: app.globalData.userId,
        page: 0,
        limit: 0
      },
      success: res => {
        let list = res.data.data
        list.forEach(element => {
          element.pubTime = util.formatDate(new Date(element.pubTime))
        });
        console.log(list);
        this.setData({
          goods: list
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.load()
  },

  clickDetail(e) {
    let goodId = e.currentTarget.dataset.modal
    console.log('点击了goodId', goodId)
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + goodId,
    })
  },

  handleLongPress(e){
    console.log('长按...');
    let goodId = e.currentTarget.dataset.modal
    wx.showModal({
      title:'是否删除？',
      cancelColor: 'cancelColor',
      success:res=>{
        //删除
        if(res.confirm){
          wx.request({
            url: util.prefixUrl + '/goods/deleteGoodsById',
            data:{
              goodId
            },
            success:res=>{
              if(res.data.code == 0){
                wx.showToast({
                  title: '删除成功!',
                })
                //加载列表
                this.load()
                //设置所有评论已读，因为上面可能会加载新的未读评论
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
              }
            }
          })
        }
      }
    })
  },

  reactBottom() {
    console.log('触底....');

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
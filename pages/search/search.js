const util = require("../../utils/util")
const app = getApp()
// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['寻物', '招领'],
    status: 0,
    goods: [],
    tip: true,
    tipContent: '',
    page: 1,
    searchContent: '',
    reqStatus: true, //请求更多状态
    scrollHeight: wx.getSystemInfoSync().windowHeight
  },
  /** 
   * 选择框事件
   */
  bindPickerChange: function (e) {
    console.log('所选状态:', e.detail.value);
    console.log('当前状态:', this.data.status);
    console.log('当前搜索框内容:', this.data.searchContent);
    if (e.detail.value != this.data.status && this.data.searchContent) {
      this.setData({
        status: e.detail.value
      })
      this.load(res => {
        console.log('改变select->搜索结果:', res);
        if (res.data.code == 2001)
          this.setData({
            tip: false,
            tipContent: res.data.data.length !== 0 ? '未能搜索到关键字，已为你显示其他相关信息' : '未能搜索到相关信息'
          })
        if (res.data.data.length < 10) //如果查到的数据不超过10，那么滚动到底部不会触发再次请求
          this.setData({
            reqStatus: false
          })
        // let reg = /<p><img[^>]+><\/p>|<p><br><\/p>|<p><\/p>/gi
        //消除content中的img标签和其他占位标签
        let list = res.data.data
        list.forEach(element => {
          element.goods.content = element.goods.content.replace(util.reg, "")
        });
        this.setData({
          goods: list
        })
      })
    }
  },

  inputChange(e) {
    console.log('当前输入框内容：', e.detail.value);
    this.setData({
      searchContent: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  cancelSearch: function () {
    wx.navigateBack()
  },
  /** 
   * 搜索前初始化
   */
  initBeforeSearch: function (currentValue) {
    this.setData({
      page: 1,
      // tip: true, //是否隐藏搜不到提示
      searchContent: currentValue, //保存回车时输入框内容
      reqStatus: true //触底刷新
    })
  },

  //加载
  load(callBack) {
    this.setData({
      tip: true
    })
    wx.request({
      url: app.globalData.agree + app.globalData.host + '/goods/search',
      data: {
        title: this.data.searchContent,
        status: this.data.status,
        page: this.data.page,
        limit: 10
      },
      success: function (res) {
        console.log('搜索结果:', res)
        callBack(res)
      }
    })
  },

  /** 
   * 输入框回车事件
   */
  confirmTap: function (event) {
    let currentValue = event.detail.value;
    this.initBeforeSearch(currentValue)
    console.log('currentValue', currentValue);
    console.log('this.data', this.data)
    if (!currentValue) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      })
      return;
    }
    this.load(res => {
      if (res.data.code == 2001)
        this.setData({
          tip: false,
          tipContent: res.data.data.length !== 0 ? '未能搜索到关键字，已为你显示其他相关信息' : '未能搜索到相关信息'
        })
      if (res.data.data.length < 10) //如果查到的数据不超过10，那么滚动到底部不会触发再次请求
        this.setData({
          reqStatus: false
        })
      // let reg = /<p><img[^>]+><\/p>|<p><br><\/p>|<p><\/p>/gi
      //消除content中的img标签和其他占位标签
      let list = res.data.data
      list.forEach(element => {
        element.goods.content = element.goods.content.replace(util.reg, "")
      });
      this.setData({
        goods: list
      })
    })
  },
  /** 
   * 点击跳转详细页面
   */
  goodClick: function (e) {
    console.log('e.currentTarget.dataset.modal', e.currentTarget.dataset.modal)
    let id = e.currentTarget.dataset.modal
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id,
    })
  },
  /** 
   * 加载更多
   */
  loadMore: function () {
    console.log('滑到底部触发刷新', this.data.reqStatus);
    if (!this.data.reqStatus)
      return;
    let that = this;
    wx.request({
      url: getApp().globalData.agree + getApp().globalData.host + '/goods/search',
      data: {
        title: this.data.searchContent,
        status: this.data.status,
        page: ++this.data.page,
        limit: 10
      },
      success: function (res) {
        console.log('res.data', res.data)
        if (res.data.data.length < 10)
          that.setData({
            reqStatus: false
          })
        let list = that.data.goods
        //消除content中的img标签和其他占位标签
        let list1 = res.data.data
        list1.forEach(element => {
          element.goods.content = element.goods.content.replace(util.reg, "")
        });
        list.push.apply(list, list1)
        console.log('goods', list)
        that.setData({
          goods: list
        })
      }
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
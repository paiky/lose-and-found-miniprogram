const util = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',
    password: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let hasLogin = wx.getStorageSync('hasLogin')
    if (hasLogin && wx.getStorageSync('headImg')) {
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  },

  bindPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  bindPwdInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  //授权信息
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

          //如果数据库头像昵称不存在，说明第一次登录，更新数据库头像昵称
          // console.log('此时全局openId', app.globalData.openId);
          wx.request({
            url: util.prefixUrl + '/user/queryUserByOpenId',
            method: 'POST',
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
              openId: app.globalData.openId
            },
            success: res => {
              if (res.data.code == 0) {
                console.log('根据openId获取user:', res);
                //如果数据库不存在昵称头像,用获取的用户信息更新数据库
                if (!res.data.data.headImg || !res.data.data.nickName) {
                  wx.request({
                    method: 'POST',
                    url: util.prefixUrl + '/user/update',
                    data: {
                      id: app.globalData.userId,
                      name: e.detail.userInfo.nickName,
                      headImg: e.detail.userInfo.avatarUrl,
                      sex: e.detail.userInfo.gender
                    },
                    success: res => {
                      if (res.data.code == 0) {
                        console.log('更新信息成功!');
                        //保存信息到本地
                        wx.setStorage({
                          data: e.detail.userInfo.avatarUrl,
                          key: 'headImg',
                        })
                        wx.setStorage({
                          data: e.detail.userInfo.nickName,
                          key: 'nickName',
                        })
                        wx.setStorage({
                          data: e.detail.userInfo.gender,
                          key: 'sex',
                        })
                      }
                    },
                    error: res => {
                      console.log('更新失败:', res);
                    }
                  })
                } else {
                  wx.setStorage({
                    data: res.data.data.headImg,
                    key: 'headImg',
                  })
                  wx.setStorage({
                    data: res.data.data.nickName,
                    key: 'nickName',
                  })
                  wx.setStorage({
                    data: res.data.data.sex,
                    key: 'sex',
                  })
                }
              }
            }
          })

          //设置登录标志
          wx.setStorage({
            data: true,
            key: 'hasLogin',
          })

          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index',
            })
          }, 1500);
        }
      })
    }
  },

  update(url, data, callBack) {
    wx.request({
      url: url,
      method: 'POST',
      data: data,
      success: res => {
        callBack(res)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  //手动登录
  clickLogin() {
    if (!this.data.phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return
    }
    if (!this.data.password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return
    }

    //校验登录状态
    let openId = wx.getStorageSync('openId')
    wx.request({
      url: util.prefixUrl + '/user/checkLogin',
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        openId: openId,
        phone: this.data.phone,
        password: this.data.password
      },
      success: res => {
        if (res.data.data) {
          var nickName = res.data.data.name
          var headImg = res.data.data.headImg
          var sex = res.data.data.sex
        }

        //登录成功
        if (res.data.code == 0) {
          wx.showToast({
            title: '登录成功',
          })
          //登录成功必已存在用户信息
          wx.setStorageSync('hasLogin', true)
          wx.setStorageSync('headImg', headImg)
          wx.setStorageSync('nickName', nickName)
          wx.setStorageSync('sex', sex)
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index',
            })
          }, 1500);

          //账号密码注册成功,数据库不一定不存在用户信息
        } else if (res.data.code == 2003) {
          //未授权过，不存在昵称头像等信息
          if (!nickName || !headImg || !sex) {
            let data = new Object()
            data.name = app.globalData.openId
            data.id = app.globalData.userId
            this.update(util.prefixUrl + '/user/update', data, (res) => {
              if (res.data.code == 0)
                console.log('昵称已写入数据库!');
              else
                console.log('出错！昵称未写入数据库!');
            })
            //初始化昵称为openId
            wx.setStorage({
              data: app.globalData.openId,
              key: 'nickName',
            })

            let data2 = new Object()
            data2.headImg = '/icon/head1.png'
            data2.id = app.globalData.userId
            this.update(util.prefixUrl + '/user/update', data2, (res) => {
              if (res.data.code == 0)
                console.log('头像已写入数据库!');
            })
            wx.setStorage({
              data: '/icon/head1.png',
              key: 'headImg',
            })

            let data3 = new Object()
            data3.sex = 0
            data3.id = app.globalData.userId
            this.update(util.prefixUrl + '/user/update', data3, (res) => {
              if (res.data.code == 0)
                console.log('性别已写入数据库!');
            })
            wx.setStorage({
              data: '0',
              key: 'sex',
            })
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/start/loginEdit/loginEdit',
              })
            }, 1000);
          } else {
            wx.setStorageSync('hasLogin', true)
            wx.setStorageSync('headImg', headImg)
            wx.setStorageSync('nickName', nickName)
            wx.setStorageSync('sex', sex)
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/index/index',
              })
            }, 1500);
          }
          wx.showToast({
            title: res.data.message,
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
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
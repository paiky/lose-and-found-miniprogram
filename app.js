// app.js
App({
  onLaunch() {

    let that = this

    let openId = wx.getStorageSync('openId')
    let userId = wx.getStorageSync('userId')

    //本地不存在数据时,重新获取openId
    if (!openId || !userId) {
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          wx.request({
            url: this.globalData.agree + this.globalData.host + '/user/login',
            data: {
              code: res.code
            },
            success: res => {
              if (res.data.code == 0) {
                console.log('登录成功，获取openId和userId：', res);
                let openid = res.data.data.openId
                let userid = res.data.data.userId
                wx.setStorage({
                  data: openid,
                  key: 'openId',
                })
                wx.setStorage({
                  data: userid,
                  key: 'userId',
                })

                wx.connectSocket({
                  url: 'ws://' + this.globalData.host + '/webSocket/' + userid,
                  // protocols: ['http:']
                })

                that.globalData.openId = openid
                that.globalData.userId = userid

                // 网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                //这里判断回调函数是否被定义了，回调函数将在onload等其他地方真正定义
                //如果这里先执行完，那么回调函数也没有被定义，也就不用执行
                //否则，onload那边要不到app的数据，定义回调函数，等app执行完返回res
                if (this.userLoginReadyCallback) {
                  this.userLoginReadyCallback(res)
                }
              }else{
                console.log('获取openId出错...');
                wx.showToast({
                  title: '获取openId出错，请重试!',
                  icon:'none'
                })
              }
            }
          })
        }
      })
    } else {
      console.log('本地已存在openId和userId...');
      this.globalData.openId = openId
      this.globalData.userId = userId
      wx.connectSocket({
        url: 'ws://' + this.globalData.host + '/webSocket/' + userId,
        // protocols: ['http:']
      })
    }

    wx.onSocketOpen((result) => {
      this.globalData.socketOpen = true
      console.log('WebSocket连接打开事件...')
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log('getSetting->res', res);
        if (res.authSetting['scope.userInfo']) {
          console.log('已经授权userInfo');
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            lang: 'zh_CN',
            success: res => {
              console.log('userInfo:', res);
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else { //未授权
          console.log('未授权用户信息...');
          if (this.hasLoginCallback)
            this.hasLoginCallback()
        }
      }
    })
  },
  onHide() {
    console.log('页面隐藏...');
  },
  globalData: {
    // userInfo:'',
    openId: '',
    userId: '',
    socketOpen: false,
    isPub: false,
    // newReply:'',
    agree: 'http://',
    host: 'localhost:8084',
    // host:'192.168.0.193:8084',
    // host: '39.105.44.56:8084'
  }
})
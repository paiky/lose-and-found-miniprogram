const util = require('../../utils/util.js')
const app = getApp()
Page({
  data: {
    goods: [
      [],
      [],
      []
    ],
    tab_index: 0,
    // loadmore: true,
    // hasLogin: false,
    triggered: false,
    page: [1, 1, 1],
    // avatarUrl:''
    //unread:'', //消息未读标志
    unreadCount: 0, //总的未读消息数量
    animation: false, //列表位置滚动动画
    unreply: 0, //未读评论数
    unChatCount: 0, //未读聊天记录数
  },

  //下拉刷新事件
  onRefresh() {
    if (this._freshing) return
    this._freshing = true
    setTimeout(() => {
      //重置页数
      let tab = this.data.tab_index
      let page = this.data.page
      page[tab] = 1
      this.setData({
        page: page
      })
      this.load()
      this.setData({
        triggered: false,
      })
      this._freshing = false
    }, 1000)
  },

  //校验数据是否需要加载
  isLoadingFlag(idx) {
    //页面有内容滑动不加载
    if (idx == 0 && this.data.goods[0].length != 0 ||
      idx == 1 && this.data.goods[1].length != 0 ||
      idx == 2 && this.data.goods[2].length != 0) {
      return false
    }
    //页面为空但到达数据限制
    if (this.data.page[idx] == -1)
      return false

    return true
  },

  //左右滑动页面事件
  tabChange(event) {
    let idx = event.detail.current
    console.log('滑动页面:', idx);
    this.setData({
      tab_index: idx
    })
    if (this.isLoadingFlag(idx))
      this.load();
  },

  //滚动事件
  scroll(e) {
    console.log('scroll:', e.detail);
  },

  //触底事件
  reactBottom() {
    console.log('触底-加载更多')
    let goods = this.data.goods
    let tab = this.data.tab_index
    let list = goods[tab]
    if (this.data.page[tab] != -1) {
      this.load(res => {
        console.log(res);
        // list.push(res)
        list.push.apply(list, res) //这个函数最后结果在第一个参数中，也就是拼接到第一个参数
        goods[tab] = list
        console.log('设置goods...');
        this.setData({
          goods: goods
        })
        console.log('当前页数:', this.data.page[tab]);
      })
    }
  },

  //加载
  load(callback) {
    let tab = this.data.tab_index
    wx.request({
      method: 'get',
      url: util.prefixUrl + '/goods/all',
      data: {
        status: tab > 0 ? tab - 1 : "",
        page: this.data.page[tab],
        limit: 10
      },
      success: res => {
        console.log('loading...', res);
        if (res.data.code == 0) {
          let list = res.data.data
          list.forEach(element => {
            let date = element.goods.pubTime
            element.goods.pubTime = util.formatDefine(new Date(date))
          });

          //如果存在回调函数
          // typeof callback === "function" ? callback(list) : false;
          if (typeof callback === "function")
            callback(list)
          else {
            let goods = this.data.goods
            goods[tab] = list
            this.setData({
              goods: goods
            })
          }

          let page = this.data.page
          if (list.length < 10) {
            console.log('数据到达限制...');
            page[tab] = -1
            this.setData({
              page: page
            })
          } else {
            page[tab]++
            this.setData({
              page: page
            })
          }
        } else {
          wx.showToast({
            title: '未知错误',
            icon: 'none'
          })
        }
      }
    })
  },

  clickMessage() {
    //点击后不管有没有看评论通知，消息未读红点都会消失
    console.log('查看未读消息');
    this.setData({
      unread: false
    })
    wx.navigateTo({
      url: '/pages/message/message',
    })
    // }
  },

  onLoad() {
    //初始化本地未读消息
    // if (!wx.getStorageSync('messageList'))
    //   wx.setStorage({
    //     data: new Object(),
    //     key: 'messageList',
    //   })

    //如果未登录，跳转登录页面
    let hasLogin = wx.getStorageSync('hasLogin')
    if (!hasLogin) {
      wx.redirectTo({
        url: '/pages/start/start',
      })
    } else {
      console.log('设置...'+wx.getStorageSync('headImg'));
      this.setData({
        hasLogin: hasLogin,
        avatarUrl: wx.getStorageSync('headImg')
      })
      // if (app.globalData.userInfo) {
      //   console.log('onload->getUserInfo success...');
      //   this.setData({
      //     avatarUrl: wx.getStorageSync('headImg')
      //   })
      // } else {
      //   console.log('onload->waiting getUserInfo...');
      //   app.userInfoReadyCallback = res => {
      //     this.setData({
      //       userInfo: res.userInfo,
      //     })
      //     console.log('here callBack deal userInfo:', this.data.userInfo);
      //   }
      // }
      // }
      util.systemType((res) => {
        console.log('get windowHeight:', res);
        this.setData({
          windowHeight: res
        })
      })
      this.load();
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    //获取未读评论数
    wx.request({
      url: util.prefixUrl + '/comment/unread',
      data: {
        userId: app.globalData.userId
      },
      success: res => {
        if (res.data.code == 0) {
          this.setData({
            unreply: res.data.data
          })
          wx.setStorage({
            data: res.data.data,
            key: 'unreply',
          })
          if (res.data.data > 0) {
            this.setData({
              unread: true
            })
          }
        }
      }
    })

    //获取未读聊天数
    wx.request({
      url: util.prefixUrl + '/message/unreadCount',
      data: {
        userId: app.globalData.userId
      },
      success: res => {
        if (res.data.code == 0) {
          var count = res.data.data == null ? 0 : res.data.data
          this.setData({
            unChatCount: count
          })
        }
        wx.setStorage({
          data: count,
          key: 'unChatCount',
        })
        if (count > 0) {
          this.setData({
            unread: true
          })
        }
      }
    })

    console.log('index->onshow...');

    //从消息页面而来,要刷新unreadCount
    // this.setData({
    //   unreadCount: wx.getStorageSync('reply')
    // })

    //监听webSocekt
    wx.onSocketMessage((result) => {
      let json = JSON.parse(result.data)

      //收到服务端连接成功消息
      if (json.success)
        console.log('连接成功：', json.success)

      //评论数提醒+1
      if (json.type == 'reply') {
        console.log('index获取评论数量：', json.reply)
        let reply = 0
        if (json.reply) {
          reply = json.reply
        } else {
          let unreply = wx.getStorageSync('unreply')
          reply = unreply + 1
        }
        this.setData({
          unread: true,
          unreply: reply
        })
        wx.setStorage({
          data: reply,
          key: 'unreply',
        })

        //本地存一个评论变量
        // if (!reply) {
        //   wx.setStorage({
        //     data: json.reply,
        //     key: 'reply',
        //   })
        // } else {
        //总评论数大于已读数
        // if (json.reply > reply) {
        //   let count = json.reply - reply
        //   console.log('收到总共', count, '条新的评论!');
        //   app.globalData.newReply = count
        //   this.setData({
        //     unread: true,
        //     unreadCount: this.data.unreadCount + count
        //   })
        // }
        // }
      }

      //接收到聊天消息
      if (json.type == 'chat') {
        console.log('收到聊天消息', json);

        //存储未读消息数量到本地
        // let messageList = wx.getStorageSync('messageList')
        // if (!messageList[json.fromId]) {
        //   // messageList = new Object()
        //   messageList[json.fromId] = 0
        // }
        // messageList[json.fromId]++
        // wx.setStorage({
        //   data: messageList,
        //   key: 'messageList',
        // })

        let unChatCount = wx.getStorageSync('unChatCount')

        //遍历未读消息数量并设置
        // let count = 0
        // for (const fromId in messageList) {
        //   count += messageList[fromId]
        // }
        // console.log('未读消息总数量', count);
        this.setData({
          unread: true,
          unChatCount: unChatCount + 1
        })
        wx.setStorage({
          data: unChatCount + 1,
          key: 'unChatCount',
        })
      }
    })

    console.log('是否刚发布信息', app.globalData.isPub);
    //如果刚发布了信息，刷新主页
    if (app.globalData.isPub) {
      app.globalData.isPub = false
      return this.onRefresh()
    }

    //如果信息更改过，刷新页面
    if (wx.getStorageSync('hasEdit')) {
      wx.setStorageSync('hasEdit', false)
      console.log('信息刚刚编辑过..');
      return this.onLoad()
    }

    //从'我的'页面跳转来
    var hasLogin = wx.getStorageSync('hasLogin')
    console.log('此时登录状态：', hasLogin);

    //登录状态改变，刷新主页
    if (hasLogin == !this.data.hasLogin) {
      console.log('登录状态发生改变...');
      this.setData({
        hasLogin: hasLogin,
      })
      this.onLoad()
    }
  },

  clickHeadImg(e){
    let image = e.currentTarget.dataset.modal
    console.log(image);
    wx.previewImage({
      urls: [image],
    })
  },

  clickCover(e){
    let image = e.currentTarget.dataset.modal
    console.log(image);
    wx.previewImage({
      urls: [image],
    })
  },

  //发布
  clickPublic() {
    util.verifyAuthorization((res) => {
      console.log('获得用户权限：', res);
      var hasLogin = wx.getStorageSync('hasLogin')
      if (!hasLogin) {
        wx.navigateTo({
          url: '/pages/mine/loginUI/loginUI',
        })
      } else {
        wx.navigateTo({
          url: '/pages/pub/pub',
        })
      }
    })
  },
  //点击tab
  clickTab: function (event) {
    let idx = event.currentTarget.dataset.index
    // console.log('select tab:', idx)
    this.setData({
      tab_index: idx,
    })

    //滑动tab事件也会被调用到，这里无需判断加载
    // if (this.isLoadingFlag(idx))
    //   this.load();
  },
  //点击列表信息
  clickDetail: function (e) {
    console.log('e.currentTarget.dataset.modal', e.currentTarget.dataset.modal)
    let id = e.currentTarget.dataset.modal
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id,
    })
  },
  //搜索
  clickSearch: function () {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },

  onUnload: function () {
    wx.closeSocket()
    app.globalData.socketOpen = false
  }
})
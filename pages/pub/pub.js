var formatDate = require('../../utils/util.js')
const app = getApp();
Page({
  data: {
    formats: {},
    bottom: 0,
    readOnly: false,
    placeholder: '这里发布信息',
    _focus: false,
    status: undefined,
    title: '',
    upload_cover: '/icon/oa-t-oa-t-upload.svg',
    content:''
  },
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
  onLoad(option) {
    let pub = wx.getStorageSync('public')
    if (pub) {
      wx.showToast({
        title:'已显示上次保存的内容',
        icon:'none'
      })
      this.setData({
        title: pub.title,
        status: pub.status,
        content:pub.content
      })

    }
  },
  // 编辑器初始化完成时触发
  onEditorReady() {
    const that = this;
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context;
      that.editorCtx.setContents({
        html: that.data.content,
        success: result => {
          console.log('初始化内容成功 ', result)
        },
        fail: err => {
          console.log('初始化内容失败 ', err)
        }
      })
    }).exec();
  },
  undo() {
    this.editorCtx.undo();
  },
  redo() {
    this.editorCtx.redo();
  },
  format(e) {
    let {
      name,
      value
    } = e.target.dataset;
    if (!name) return;
    // console.log('format', name, value)
    this.editorCtx.format(name, value);
  },
  // 通过 Context 方法改变编辑器内样式时触发，返回选区已设置的样式
  onStatusChange(e) {
    const formats = e.detail;
    this.setData({
      formats
    });
  },
  // 插入分割线
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        console.log('insert divider success')
      }
    });
  },
  // 清除
  clear() {
    this.editorCtx.clear({
      success: function (res) {
        console.log("clear success")
      }
    });
  },
  // 移除样式
  removeFormat() {
    this.editorCtx.removeFormat();
  },
  // 插入当前日期
  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate
    });
  },

  editChange(e){
    // console.log(e);
    this.setData({
      content:e.detail.html
    })
  },

  // 插入图片
  insertImage() {
    let that = this
    wx.chooseImage({
      count: 1,
      success: res => {
        console.log('chooseImage.res', res)
        var tempFilePaths = res.tempFilePaths;
        console.log('tempFilePaths', tempFilePaths);
        //这是是上传图片的代码
        wx.uploadFile({
          url: getApp().globalData.agree + getApp().globalData.host + '/goods/upload', //上传接口
          name: "file",
          header: {
            "Content-Type": "multipart/form-data"
          },
          formData: {
            userId: getApp().globalData.userId
          },
          filePath: tempFilePaths[0],
          complete: function (str) {
            console.log('uploadFile->complete:', str)
            if (str.statusCode == 200) {
              var info = JSON.parse(str.data);
              console.log('图片路径:', info.data);
            }
            that.editorCtx.insertImage({
              src: info.data,
              width: '100%',
              data: {
                id: 'abcd',
                role: 'god'
              },
              success: () => {
                console.log('insert image success')
              }
            })
          }
        });
      }
    });
  },
  //检验标题状态内容和封面是否存在
  checkInfo() {
    if (!this.data.status) {
      wx.showToast({
        title: '请选择状态!',
        icon: 'none'
      })
      return false
    }
    if (!this.data.title) {
      wx.showToast({
        title: '标题未填写!',
        icon: 'none'
      })
      return false
    }
    // if (this.data.upload_cover === '/icon/oa-t-oa-t-upload.svg') {
    //   wx.showToast({
    //     title: '请选择封面!',
    //     icon: 'none'
    //   })
    //   return false
    // }
    return true
  },

  //发布
  toDeatil() {
    console.log('press the public button...');
    if (!this.checkInfo())
      return
    this.editorCtx.getContents({
      success: res => { //由于有图片纯文本text，不格式会存在回车符
        let that = this
        console.log('内容:', res);
        console.log('标题', this.data.title);
        console.log('时间', formatDate.formatTime(new Date()));
        let img = res.html.match(/<img [^>]*src=['"]([^'"]+)[^>]*>/)
        if (img) {
          var cover = img[0].match(/https:\/\/paiky.oss-cn-guangzhou.aliyuncs.com.*.jpg/)[0]
          console.log('封面:', cover)
        }
        let text = res.text.replace(/\s/g, '')
        if (text.length <= 0) {
          wx.showToast({
            title: '请输入内容再发布!',
            icon: 'none'
          })
          return
        }

        //数据库插入数据
        wx.request({
          url: getApp().globalData.agree + getApp().globalData.host + '/goods/insertGoods',
          method: 'POST',
          data: {
            title: that.data.title,
            status: that.data.status,
            content: res.html,
            pubTime: formatDate.formatTime(new Date()),
            userId: app.globalData.userId,
            contentImage: cover,
            text: text
          },
          success: function (response) {
            console.log(response);
            if (response.data.code == 0) {
              app.globalData.isPub = true
              wx.showToast({
                title: '发布成功!'
              })
              console.log('public success');
              wx.setStorage({
                data: null,
                key: 'public',
              })
              wx.navigateBack()
            } else {
              wx.showToast({
                title: '发布失败',
                icon: 'none'
              })
            }
          }
        })
      }
    })
  },
  //upload content cover
  uploadCover() {
    let that = this
    wx.chooseImage({
      count: 1,
      success: res => {
        console.log('chooseImage.res', res)
        var tempFilePaths = res.tempFilePaths;
        console.log('tempFilePaths', tempFilePaths);
        //这是是上传图片的代码
        wx.uploadFile({
          url: getApp().globalData.agree + getApp().globalData.host + '/goods/upload', //上传接口
          name: "file",
          header: {
            "Content-Type": "multipart/form-data"
          },
          formData: {
            userId: getApp().globalData.userId,
            type: 'cover'
          },
          filePath: tempFilePaths[0],
          complete: function (str) {
            console.log('uploadFile->complete:', str)
            if (str.statusCode == 200) {
              var info = JSON.parse(str.data);
              console.log(info.data);
            }
            that.setData({
              upload_cover: info.data.replace(/\\/g, "/")
            })
          }
        });
      }
    });
  },
  //when input lose focus
  bindInput(event) {
    let title = event.detail.value
    this.setData({
      title: title
    })
  },
  //选择图片
  chooseImage(e) {
    wx.chooseImage({
      sizeType: ['original', 'compressed'], //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        const images = this.data.images.concat(res.tempFilePaths);
        this.data.images = images.length <= 3 ? images : images.slice(0, 3);
      }
    })
  },
  //click to select the public type
  pubType(event) {
    let status = event.currentTarget.dataset.type
    console.log('status:', status);
    this.setData({
      status: status
    })
  },

  onShow() {

  },

  isEmpty(){
    return this.data.title || this.data.status || this.data.content
  },

  onUnload() {
    console.log('发布页面离开...');
    if (!app.globalData.isPub && this.isEmpty()) {
      wx.showModal({
        title: '是否保存刚才编辑的信息',
        cancelColor: 'red',
        success: res => {
          if (res.confirm) {
            console.log('点击了确定');
            let obj = new Object()
            obj.status = this.data.status
            obj.title = this.data.title
            obj.content = this.data.content
            wx.setStorage({
              data: obj,
              key: 'public',
            })
          } else{
            console.log('点击了取消');
            wx.setStorage({
              data: null,
              key: 'public',
            })
          }
        }
      })
    }
  }
})
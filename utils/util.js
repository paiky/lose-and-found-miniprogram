const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

//格式化日期显示
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  let d = new Date()
  //如果日期是今天，则只显示时间
  if (year == d.getFullYear() && month == d.getMonth() + 1 && day == d.getDate())
    return `${[hour, minute].map(formatNumber).join(':')}`
  else if (year == d.getFullYear()) //如果同一年只显示月日
    return `${[month, day].map(formatNumber).join('-')}`
  else
    return `${[year,month, day].map(formatNumber).join('-')}`
}

//格式化为'xx小时前发布' 'xx天前发布'
const formatDefine = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  let d = new Date()
  //如果日期是今天，则只显示时间
  if (year == d.getFullYear() && month == d.getMonth() + 1 && day == d.getDate()) {
    if (d.getHours() != hour)
      return `${[d.getHours()-hour]}小时前`
    if (d.getMinutes() != minute)
      return `${[d.getMinutes()-minute]}分钟前`
    if (d.getSeconds() != second)
      return `${[d.getSeconds()-second]}秒前`
  }
  //如果同一年里
  if (year == d.getFullYear()) {
    if (month == d.getMonth() + 1)
      return `${[d.getDate()-day]}天前`
    else
      return `${[month, day].map(formatNumber).join('-')}`
  }
  return `${[year,month, day].map(formatNumber).join('-')}`
}

const systemType = function (callBack) {
  wx.getSystemInfo({
    success: (res) => {
      callBack(res.windowHeight)
    }
  })
}

const loadData = function (url, data, callBack) {
  wx.request({
    url: getApp().globalData.agree + getApp().globalData.host + url,
    data: data,
    success: function (res) {
      console.log(res);
      callBack(res)
    }
  })
}

//校验是否授权用户信息
const verifyAuthorization = function (callBack) {
  wx.getSetting({
    success: res => {
      callBack(res)
    }
  })
}


// 网络请求
function request(url, method, data, message, _success, _fail) {
  wx.showNavigationBarLoading()
  if (message != "") {
    wx.showLoading({
      title: message
    })
  }
  wx.request({
    url: url,
    data: data,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: method,
    success: function (res) {
      _success(res)
      wx.hideNavigationBarLoading()
      if (message != "") {
        wx.hideLoading()
      }
    },
    fail: function (err) {
      if (err) {
        _fail(err)
      }
      wx.hideNavigationBarLoading()
      if (message != "") {
        wx.hideLoading()
      }
    },
  })
}

const reg = /<p><img[^>]+><\/p>|<img[^>]+>|<p><br><\/p>|<p><\/p>/gi

const prefixUrl = getApp().globalData.agree + getApp().globalData.host

module.exports = {
  formatTime,
  formatDate,
  systemType,
  loadData,
  verifyAuthorization,
  reg,
  prefixUrl,
  formatDefine
}
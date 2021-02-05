import { get, post } from '../request.js';
import { get7DaysBefore } from '../utils/common.js'

Page({
  data:{
    isGDLeader: false,
    userInfo: {},
    thisBirthday: '',
    today: '',
    year: '',
    orderList: [],
    orderOthersList: [],
    isZBirthday: false,
    orderStatus: ['待管理员确认', '', '待确认领取', '已领取'],
    inputValue: '',
    inputShow: false,
    selected: [],
    canSuggest: false
  },
  onLoad(query) {
    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 页面显示
    let today = new Date()
    let year = today.getFullYear()
    this.setData({
      today: today,
      year: year
    })
    this.getSuggest()
    this.getUserInfo()
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
    this.getOrder()
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },

  getOrder () {
    const url = '/getOrderList'
    const data = {
      year: this.data.year,
      staffNo: this.data.userInfo.staffNo,
      staffName: '',
      page: 1,
      orderStatus: '',
      pageSize: 10,
      creator: '',
      creatorName: ''
    }

    get(url, data).then(res => {
      this.setData({
        orderList: res.data.list
      })
    })
  },

  // 判断是否是整生日
  isZBirthday () {
    const oriYear = /^[0-9]{4}/g.exec(this.data.userInfo.birthday)[0]
    const isZBirthday = (Number(this.data.year) - Number(oriYear) + 1) % 10 === 0 ? true : false
    this.setData({
      isZBirthday: isZBirthday
    })
  },
  // 确认领取
  finishOrder (e) {
    const orderId = e.target.dataset.id
    const status = e.target.dataset.status
    console.log(orderId)
    console.log(status)

    if (status != 3) {
      return
    } else {
      dd.confirm({
          title: '温馨提示',
          content: '确定已领取生日礼包？',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          success: (result) => {
            const confirm = result.confirm
            if (confirm) {
              console.log('调接口')
              const data = {
                orderId: orderId,
                status: 4,
                staffNo: this.data.userInfo.staffNo,
                staffName: this.data.userInfo.name
              }
              this.finishOrderRes(data)
            }
          },
        });
    }
  },
  // finishOrderResquest
  finishOrderRes (data) {
    const url = '/editOrderStatus'
    post(url, data).then(res => {
      console.log(res)
      if (res.code == 0) {
        dd.showToast({
          type: 'success',
          content: '您的生日礼包已领取成功',
          duration: 3000
        })
        this.getOrder()
      }
    })
  },
  // 获取当前登录人信息
  getUserInfo () {
    dd.getAuthCode({
      success: res => {
        console.log(res.authCode)
        const code = res.authCode
        const data = {
          code: res.authCode
        }
        const url = '/getUserInfo'
        get(url, data).then((r) => {
          console.log(r)
          const userInfo = {
            name: r.name,
            staffNo: r.jobnumber,
            userId: r.userid,
            roles: r.roles,
            postion: r.extattr.position
          }
          dd.setStorageSync({
            key: 'userInfo',
            data: userInfo
          })

          let user = this.data.userInfo
          user.name = r.name
          user.staffNo = r.jobnumber
          user.position = r.extattr.position

          this.setData({
            userInfo: user
          })

          this.getUserInfoNC(r.jobnumber)
          // this.getUserInfoNC(110445)
          this.getOrder()
          this.getSupplyList()
        })
      },
      fail: re => {
        console.log(re)
      }
    })
  },
  // 从NC中获取员工信息
  getUserInfoNC (code) {
    const url = '/getUserInfoNC'
    const data = {
      code: code
    }
    get(url, data).then(res => {
      const result = res.data.list[0]
      

      let user = this.data.userInfo

      user.birthday = result.BIRTHDATE
      user.hiredate = result.HIREDATE
      user.staffStatus = result.HIREDATE ? 1:2

      const userInfoNC = {
        birthday: result.BIRTHDATE,
        hiredate: result.HIREDATE,
        staffStatus: result.HIREDATE ? 1:2,
        jobrankcode: result.JOBRANKCODE
      }
      dd.setStorageSync({
        key: 'userInfoNC',
        data: userInfoNC
      })

      let year = this.data.year

      let thisBirthday = result.BIRTHDATE.replace(/^[0-9]{4}/g,year)
      console.log(typeof(thisBirthday))

      // 可提前一个礼拜领取

      var sdtime3=get7DaysBefore(thisBirthday)
      console.log(sdtime3)
      console.log(typeof(sdtime3))


      this.setData({
        thisBirthday: sdtime3,
        userInfo: user
      })
      this.isZBirthday()
      this.hasSuggested()
    })
  },

  // 获取当前登录人的代领列表
  getSupplyList () {
    const data = {
      page: '',
      pageSize: '',
      staffNo: '',
      year: this.data.year,
      supplyStaffNo: this.data.userInfo.staffNo
    }
    const url = '/supply'
    get(url, data).then(res => {
      console.log(res)
      const supplyList = res.data.list
      this.setData({
        supplyList: supplyList
      })
    })
  },

  // 获取建议选项
  getSuggest () {
    const data = {}
    const url = '/suggestDict'
    get(url, data).then(res => {
      console.log(res)
      this.setData({
        suggestItems: res.data.list
      })
    })
  },

  bindKeyInput(e) {
    this.setData({
      inputValue: e.detail.value,
    });
  },

  // 意见变化
  onChange (e) {
    console.log(e.detail.value)
    let selected = e.detail.value
    let suggestItems = this.data.suggestItems

    let inputShow = false
    selected.map( i => {
      if (i == 9) {
        inputShow = true
      }
    })

    this.setData({
      selected: selected,
      inputShow: inputShow
    })

    if (selected.length>=3){
      suggestItems.forEach( (item, index) => {
        item.disabled = false
        let flag = true
        selected.forEach( (s, i) => {
          if (item.id == s) {
            flag = false
          }
        })
        item.disabled = flag
      })
    } else {
      suggestItems.forEach((item, index) => {
        item.disabled = false
      })
    }

    this.setData({
      suggestItems: suggestItems
    })
    
  },

  // 提交意见
  submitSuggest () {
    const selected = this.data.selected
    const inputValue = this.data.inputValue

    console.log(selected)
    console.log(inputValue)

    if (selected.length == 0) {
        dd.alert({
          title: '提示',
          content: '请至少选择一个意见',
          buttonText: '我知道了'
        });
        return
      }

     if (this.data.inputShow && !inputValue) {
        dd.alert({
        title: '提示',
          content: '请输入其他意见',
          buttonText: '我知道了'
        });
        return
      }

      const data = {
        staffNo: this.data.userInfo.staffNo,
        staffName: this.data.userInfo.name,
        suggestIds: selected.join(','),
        text: inputValue
      }

      const url = '/suggest'

      post(url, data).then(res => {

        if (res.code == 0) {
          dd.showToast({
            type: 'success',
            content: '提交成功',
            duration: 3000
          })
          this.setData({
            suggestItems: []
          })
          this.getSuggest()
          this.setData({
            inputShow: false,
            selected: [],
            inputValue: ''
          })
        } else {
          dd.showToast({
            type: 'fail',
            content: res.errorMsg,
            duration: 3000
          })
        }
        
      })
  },

  hasSuggested () {
    const data = {
      staffNo: this.data.userInfo.staffNo
    }

    const url = '/suggestRecords'
    // this.$api.GET_SUGGEST_RECORDS(data).then((res) => {
    //   console.log(res)
    //   this.canSuggest = !(res.list && res.list.length > 0)
    // })

    get(url, data).then(res => {

        console.log(res)
        const canSuggest = !(res.data.list && res.data.list.length > 0)
        this.setData({
          canSuggest: canSuggest
        })
      })
  }
});

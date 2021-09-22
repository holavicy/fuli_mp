import { get, post, DOMAIN_FILE } from '../request.js';
import { get7DaysBefore } from '../utils/common.js'

Page({
  data: {
    creator: '',
    creatorName: '',
    name: '',
    staffNo: '',
    today: '',
    year: '',
    currentPage: 1,
    pageSize: 10,
    giftBagName: '',
    goodsName: '',
    giftsList: [],
    total: -1,
    selectedGift: {},
    showBottom: false,
    limitGoodsNum: 0,
    oriSelectedList: [],
    selectedGoods: [],
    canSupply: false,
    preSelectedIndex: -1,
    selectedIndex: -1,
    actionSheet: [],
    supplyStaffList: [],
    currentImg: '',
    showImg: false,
    selectedGoodsList: [],
    preSelectedGiftId: '',
    thisBirthday: '',
    userInfo: null,
    isZBirthday: false
  },
  onLoad() {
    this.setData({
      currentPage: 1,
      giftsList: [],
      total: -1,
      DOMAIN_FILE: DOMAIN_FILE
    })

    let today = new Date()
    let year = today.getFullYear()
    this.setData({
      today: today,
      year: year
    })

    dd.getStorage({
      key: 'userInfo',
      success: (res) => {
        this.setData({
          name: res.data.name,
          staffNo: res.data.staffNo,
          creator: res.data.staffNo,
          creatorName: res.data.name
        })

        this.getSupplyList()
        this.getGifts()
      }
    })

    dd.getStorage({
      key: 'userInfoNC',
      success: (res) => {
        console.log(res)
        

        let year = today.getFullYear()
        let thisBirthday = res.data.birthday.replace(/^[0-9]{4}/g,year)
         var sdtime3=get7DaysBefore(thisBirthday)

        this.setData({
          thisBirthday: sdtime3,
          userInfo: res.data
        })
        this.isZBirthday()
      }
    })
  },
  onShow () {
    
  },
  onScrollToLower() {
      // 页面被拉到底部
    // 获取当前的page
    let currentPage = this.data.currentPage
    let total = this.data.total
    let gotTotal = this.data.giftsList.length
    // 判断是否已经获取到全部数据

    if (gotTotal >= total) {
      // 若获取到全部数据，不再请求更多数据
      console.log('已经获取到全部数据')
    } else {
      // 若没有获取到全部数据，page+1, 调用getGifts()
      currentPage ++
      this.setData({
        currentPage: currentPage
      })
      this.getGifts()
    }
  },

  onReachBottom1() {
    // 页面被拉到底部
    // 获取当前的page
    let currentPage = this.data.currentPage
    let total = this.data.total
    let gotTotal = this.data.giftsList.length
    // 判断是否已经获取到全部数据

    if (gotTotal >= total) {
      // 若获取到全部数据，不再请求更多数据
      console.log('已经获取到全部数据')
    } else {
      // 若没有获取到全部数据，page+1, 调用getGifts()
      currentPage ++
      this.setData({
        currentPage: currentPage
      })
      this.getGifts()
    }
  },

  // 搜索
  search () {
    this.setData({
      currentPage: 1,
      giftsList: [],
      total: -1
    })
    this.getGifts()
  },
  //获取礼包数
  getGifts () {
    const data = {
      page: this.data.currentPage,
      pageSize: this.data.pageSize,
      giftName: this.data.giftBagName,
      goodsName: this.data.goodsName,
      giftStatus: 1,
      staffNo: this.data.creator
    }

    let giftsList = this.data.giftsList

    const url = '/giftBag'
    get(url, data).then((res) => {
      giftsList = giftsList.concat(res.data.list)
      this.setData({
        total: res.data.count,
        giftsList: giftsList
      })
    })

  },

  // setGiftName
  setGiftName (e) {
    this.setData({
      giftBagName: e.detail.value
    })
  },

  // setGoodsName
  setGoodsName (e) {
    this.setData({
      goodsName: e.detail.value
    })
  },

  // setGifts
  setGifts (e) {
    const id = e.target.dataset.giftid
    const index = e.target.dataset.index
    const selectedGift = this.data.giftsList[index]

    this.setData({
      showBottom: true,
      oriSelectedList: selectedGift.goods,
      limitGoodsNum: selectedGift.limitGoodsNum,
      preSelectedGift: selectedGift,
      preSelectedIndex: index,
      preSelectedGiftId: id
    })

    // if (selectedGift.limitGoodsNum == 0) {
    //   this.setData({
    //     selectedGift: selectedGift
    //   })
    // } else {
    //   this.setData({
    //     showBottom: true,
    //     oriSelectedList: selectedGift.goods,
    //     limitGoodsNum: selectedGift.limitGoodsNum,
    //     preSelectedGift: selectedGift
    //   })
    // }
    
  },

  onChange (e) {
    this.setData({
      selectedGoodsList: e.detail.value
    })

    const oriGoodsList = this.data.oriSelectedList
    const limitGoodsNum = this.data.limitGoodsNum

    // 判断是否必选商品
    let hasMustGoods = 0
    oriGoodsList.forEach(goods => {
      if (goods.is_must == 1) {
        hasMustGoods++
        return
      }
    })


    let chooseLength = e.detail.value.length
    if (hasMustGoods>0) {
      chooseLength = chooseLength - hasMustGoods
    }

    if (chooseLength > limitGoodsNum) {
      dd.alert({
        title: '提示',
        content: '请选择' + limitGoodsNum + '件商品',
        buttonText: '我知道了'
      });
    } else {
      console.log('没满')
    }
  },

  // 选择员工
  chooseStaff1 () {
    dd.complexChoose({
      title: "选择申请人",            //标题
      multiple: false,            //是否多选
      limitTips:"超出了",          //超过限定人数返回提示
      maxUsers:1,            //最大可选人数
      pickedUsers:[],            //已选用户
      pickedDepartments:[],          //已选部门
      disabledUsers:[],            //不可选用户
      disabledDepartments:[],        //不可选部门
      requiredUsers:[],            //必选用户（不可取消选中状态）
      requiredDepartments:[],        //必选部门（不可取消选中状态）
      permissionType:"GLOBAL",          //可添加权限校验，选人权限，目前只有GLOBAL这个参数
      responseUserOnly:true,        //返回人，或者返回人和部门
      success:(res) => {
        console.log('选人')
        console.log(res)
        const userId = res.users[0].userId
        const url = '/getUserInfoByUserId'
        get(url, {userId: userId}).then( result => {
          const name = result.name
          const staffNo = result.jobnumber
          this.setData({
            name: name,
            staffNo: staffNo
          })
        })
      },
      fail:function(err){
        console.log(err)
      }
    })
  },

  chooseStaff () {
    dd.showActionSheet({
      title: '选择人员',
      items: this.data.actionSheet,
      cancelButtonText: '取消代他人申请',
      success: (res) => {
        console.log(res)
        const index = res.index
        if (index == -1) {
          console.log(this.data.creator)
          this.getUserInfoNC(this.data.creator)
          this.setData({
            name: this.data.creatorName,
            staffNo: this.data.creator
          })
          return
        }
        console.log('1212121212121')
        let supplyStaffList = this.data.supplyStaffList 
        // const btn = res.index === -1 ? '取消' : '第' + res.index + '个';
        console.log(supplyStaffList[res.index])

        const supplyStaff = supplyStaffList[res.index]

        const name = supplyStaff.staff_name
        const staffNo = supplyStaff.staff_no
        this.getUserInfoNC(staffNo)
          this.setData({
            name: name,
            staffNo: staffNo
          })
      },
    });
  },

  hiddenBottom () {
    this.setData({
      showBottom: false
    })
  },

  confirmBottom () {
    
    const oriGoodsList = this.data.oriSelectedList
    const limitGoodsNum = this.data.limitGoodsNum
    const goodsIdList = this.data.selectedGoodsList
    const preSelectedGift = this.data.preSelectedGift
    const preSelectedIndex = this.data.preSelectedIndex
    const preSelectedGiftId = this.data.preSelectedGiftId

    // 判断是否必选商品
    let hasMustGoods = 0
    oriGoodsList.forEach(goods => {
      if (goods.is_must == 1) {
        hasMustGoods++;
        return
      }
    })

    console.log(hasMustGoods)
  
    let length = goodsIdList.length

    if (hasMustGoods>0) {
      length = length - hasMustGoods
    }

    if (limitGoodsNum > 0) {
      if (length != limitGoodsNum) {
        dd.alert({
          title: '提示',
          content: '请选择' + limitGoodsNum + '件商品',
          buttonText: '我知道了'
        })
        return
      } else {
        let list = []
        // 获取选择的商品
        goodsIdList.forEach(id => {
          preSelectedGift.goods.forEach( goods => {
            if (goods.id == id) {
              list.push(goods)
            }
          })
        })
        this.setData({
          showBottom: false,
          selectedGift: preSelectedGift,
          selectedGoods: list
        })
      }
    } else {
      this.setData({
          showBottom: false,
          selectedGift: preSelectedGift,
          selectedGoods: preSelectedGift.goods
        })
    }

    this.setData({
      selectedIndex: preSelectedIndex,
      selectedGiftId: preSelectedGiftId
    })
  },

  // 创建订单
    createOrder () {
      const selectedGift = this.data.selectedGift
      const oriGoodsList = this.data.oriSelectedList
      if (this.data.isZBirthday) {
        dd.alert({
          title: '提示',
          content: '整生日请到OA系统中申请',
          buttonText: '我知道了'
        })
        return
      }
      console.log(this.data.userInfo)
      console.log(!(this.data.userInfo.staffStatus != 2 && ((this.data.thisBirthday >= this.data.userInfo.hiredate && this.data.today >= new Date(this.data.thisBirthday)) || this.data.userInfo.jobrankcode <= 4)))
      if (!(this.data.userInfo.staffStatus != 2 && ((this.data.thisBirthday >= this.data.userInfo.hiredate && this.data.today >= new Date(this.data.thisBirthday)) || this.data.userInfo.jobrankcode <= 4))) {
        dd.alert({
          title: '提示',
          content: '暂不满足申请礼包的条件',
          buttonText: '我知道了'
        })
        return
      }
      // 判断是否选择了礼包
      if (!selectedGift.id) {
        dd.showToast({
          type: 'fail',
          content: '请先选择礼包',
          duration: 3000
        });
        return
      }

       // 判断是否必选商品
    let hasMustGoods = false
    oriGoodsList.forEach(goods => {
      if (goods.is_must == 1) {
        hasMustGoods = true
        return
      }
    })

    let length = this.data.selectedGoods.length

    if (hasMustGoods) {
      length = length - 1
    }
      // 判断几选几的礼包是否选满
      if (selectedGift.limitGoodsNum > 0) {
        if (length < selectedGift.limitGoodsNum) {
          dd.showToast({
            type: 'fail',
            content: '礼包需选满' + selectedGift.limitGoodsNum + '个商品，您还差' + (selectedGift.limitGoodsNum - this.data.selectedGoods.length) + '个商品，请选择',
            duration: 3000
          });
          return
        }
      } else {
        // 判断选择的礼包是否包含库存为0的商品
        let flag = true
        selectedGift.goods.forEach(g => {
          if (g.num <= 0) {
            dd.showToast({
              type: 'fail',
              content: '您选择的礼包中“' + g.name + '”暂时缺货，请选择其他礼包',
              duration: 3000
            });
            flag = false
            return
          }
        })
        if (!flag) {
          return
        }
      }
      dd.confirm({
        title: '提示',
        content: '提交后将不得修改生日礼包，您确定申请此生日礼包？',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        success: (result) => {
          if (result.confirm) {
            this.createOrderRes()
          }
        },
        fail: (e) => {
          console.log(e)
        }
      });
    },
    // 创建订单接口
    createOrderRes () {
      let data = this.data.selectedGift

      if (data.limitGoodsNum > 0) {
        data.goods = this.data.selectedGoods
      }

      // 领取礼包的人
      data.staffNo = this.data.staffNo
      data.staffName = this.data.name
      // 创建礼包的人
      data.creator = this.data.creator
      data.creatorName = this.data.creatorName
      data.year = this.data.year
      const url = "/createOrder"
      post(url, data).then(res => {

        if (res.code == 0) {
          dd.showToast({
            type: 'success',
            content: '申请成功',
            duration: 3000,
            success: () => {
              if (this.data.staffNo == this.data.creator) {
                dd.redirectTo({
                  url: '/pages/order/order'
                })
              } else {
                dd.navigateTo({
                  url: '/pages/othersOrder/othersOrder'
                })
              }
            },
          });
        } else {
          dd.showToast({
            type: 'fail',
            content: res.errorMsg,
            duration: 3000
          });
        }
      })
    },

    getSupplyList () {
      const data = {
        page: '',
        pageSize: '',
        year: this.data.year,
        supplyStaffNo: this.data.creator,
        staffNo: ''
      }

      const url = '/supply'
      get(url, data).then(res => {
        console.log(res)

        let supplyStaffList = []
        let actionSheet = []
        res.data.list.forEach((record, index) => {
          if (record.supply_order_list.length == 0) {
            supplyStaffList.push(record)
            actionSheet.push(record.staff_name)
          }
        })
        const canSupply = supplyStaffList && supplyStaffList.length > 0
         this.setData({
          canSupply: canSupply,
          actionSheet: actionSheet,
          supplyStaffList: supplyStaffList
        })
      })
    },

  want (e) {
    const id = e.target.dataset.id
    const index = e.target.dataset.index
    console.log(index)

    let oriSelectedList = this.data.oriSelectedList
    oriSelectedList[index].totalLikeNum = 1


    const url = '/like'
    const data = {
      goodsId: id,
      staffNo: this.data.staffNo,
      creatorName: this.data.creatorName
    }

    post(url, data).then(res => {
      if (res.code == 0) {
        dd.showToast({
          type: 'success',
          content: '操作成功',
          duration: 3000
        });
        this.setData({
          currentPage: 1,
          giftsList: [],
          total: -1
        })
        this.getGifts()
        this.setData({
          oriSelectedList: oriSelectedList
        })
      }
    })
  },

  cancelWant (e) {
    const id = e.target.dataset.id
    const index = e.target.dataset.index
    console.log(index)

    let oriSelectedList = this.data.oriSelectedList
    oriSelectedList[index].totalLikeNum = 0

    const url = '/cancelLike'
    const data = {
      goodsId: id,
      staffNo: this.data.staffNo,
    }

    post(url, data).then(res => {
      if (res.code == 0) {
        dd.showToast({
          type: 'success',
          content: '取消成功',
          duration: 3000
        });
        this.setData({
          currentPage: 1,
          giftsList: [],
          total: -1
        })
        this.getGifts()
        this.setData({
          oriSelectedList: oriSelectedList
        })
      }
    })
  },

  cancelSetGifts () {
    this.setData({
      preSelectedIndex: -1,
      selectedIndex: -1,
      selectedGift: {},
      selectedGoods: [],
      preSelectedGift: {},
      limitGoodsNum: 0,
      oriSelectedList: [],
      selectedGoodsList: [],
      preSelectedGiftId: '',
      selectedGiftId: ''
    })
  },

  onViewImg(e){
    console.log(e.target.dataset.url);
    const url = this.data.DOMAIN_FILE + e.target.dataset.url
    this.setData({
      currentImg:url,
      showImg: true
    })
  },
  hideImg(){
    this.setData({
      currentImg:'',
      showImg: false
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
      user.jobrankcode = result.JOBRANKCODE

      const userInfoNC = {
        birthday: result.BIRTHDATE,
        hiredate: result.HIREDATE,
        staffStatus: result.HIREDATE ? 1:2,
        jobrankcode: result.JOBRANKCODE
      }

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
    })
  },

  // 判断是否是整生日
  isZBirthday () {
    const oriYear = /^[0-9]{4}/g.exec(this.data.userInfo.birthday)[0]
    const isZBirthday = (Number(this.data.year) - Number(oriYear) + 1) % 10 === 0 ? true : false
    console.log(oriYear)
    console.log(this.data.year)
    console.log(isZBirthday)
    this.setData({
      isZBirthday: isZBirthday
    })
  }
});

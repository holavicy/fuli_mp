import { get, post } from '../request.js';

Page({
  data: {
    list:[],
    totalLength: -1,
    page: 1,
    pageSize: 5,
    orderStatus:'',
    orderStatusDic: {
    "1": "待管理员确认",
    "2": "已取消",
    "3": "待领取",
    "4": "已领取"
  },
  statusList: [{
    key:'',
    text:'全部'
  }, {
    key:1,
    text:'待管理员确认'
  },{
    key:2,
    text:'已取消'
  },{
    key:3,
    text:'待领取'
  },{
    key:4,
    text:'已领取'
  }]
  },
  onShow() {
    this.setData({
      page: 1,
      list:[],
      totalLength:-1
    })
   

     dd.getStorage({
      key: 'userInfo',
      success: (res) => {
        console.log(res.data)
        this.setData({
          name: res.data.name,
          staffNo: res.data.staffNo,
          creator: res.data.staffNo,
          creatorName: res.data.name
        })
         this.getList();
      }
    })
    
  },

  onReachBottom() {
    console.log(123);
    //获取总条数
    let totalLength = this.data.totalLength;
    //获取当前页数
    let page = this.data.page;
    let pageSize = this.data.pageSize
    //获取最大页数

    let maxPage = Math.ceil(totalLength/pageSize)
    //如果当前页数小于最大页数，当前页数加一，并获取list

    if(page<maxPage) {
      console.log('加载');
      this.setData({
        page: page+1
      })

      this.getList()
    } else{
      console.log('结束')
    }
    //如果大于等于则不作处理
  },
  getList() {
    let page = this.data.page;
    let pageSize = this.data.pageSize;
    let listOri = this.data.list;
    let staffNo = this.data.staffNo;
    let status = String(this.data.orderStatus)

    let data = {
        page: page,
        pageSize: pageSize,
        staffNo: '',
        staffName: '',
        orderStatus: status,
        year: '',
        creator: staffNo,
        creatorName: ''
      }
    const u = '/getOthersOrder'
    get(u, data).then(res => {
      console.log(res.data.list);
      let list = listOri.concat(res.data.list);

      this.setData({
        list: list,
        totalLength: res.data.count
      })
      }, rej => { console.log(rej)})
  },

  setStatus(e){
    let key = e.target.dataset.key;
    console.log(key);
    this.setData({
      orderStatus: key,
         list:[],
         totalLength: -1,
         page: 1
    })

    this.getList();
  },

  finishOrder(e){
    let id = e.target.dataset.id;

    let data = {
      status: 4,
      staffNo: this.data.staffNo,
      staffName: this.data.name,
      orderId: id,
    }
    dd.confirm({
      title:'温馨提示',
      content: '确定已领取生日礼包？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (result) => {
        if(result.confirm){
          this.finishOrderFc(data).then((res) => {
              if(res.code == 0){
                dd.showToast({
                  content: '领取成功',
                  type: 'success',
                  duration: 1500
                });
                  this.setData({
                    list:[],
                    totalLength: -1,
                    page: 1
                })
                this.getList()
              }
          })
        }
      },
    });
  },

  finishOrderFc(data){
    return new Promise((resolve, rejects) => {
      const u = '/editOrderStatus'
      post(u, data).then(res => {
        console.log(res)
        resolve(res)
        }, rej => { console.log(rej)})
    })
    
  },
  toGiftBagInfo (e) {
    const index = e.target.dataset.index
    console.log(e)
    console.log(index)
    const list = this.data.list
    const gift = list[index]
    const giftStr = JSON.stringify(gift)
    dd.navigateTo({
      url: '/pages/giftBagInfo/giftBagInfo?gift=' + giftStr
    })
  }
});

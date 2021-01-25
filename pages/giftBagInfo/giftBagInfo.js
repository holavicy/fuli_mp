import { get, post, DOMAIN_FILE } from '../request.js';

Page({
  data: {
    giftId: '',
    gift: {},
    DOMAIN_FILE: '',
    showImg: false
  },
  onLoad(options) {
    console.log(options)
    const gift = JSON.parse(options.gift)
    console.log(gift)
    this.setData({
      gift: gift
    })
    this.setData({
      DOMAIN_FILE: DOMAIN_FILE
    })
  },
  onShow(){
    dd.getStorage({
      key: 'userInfo',
      success: (res) => {
        console.log(res.data)
        this.setData({
          name: res.data.name,
          staffNo: res.data.staffNo
        })

        this.getGiftsList(this.data.giftId)
      }
    })
  },
  getGiftsList (giftId) {
     const data = {
      page: '',
      pageSize: '',
      giftName: '',
      goodsName: '',
      giftStatus: 1,
      staffNo: this.data.staffNo
    }

    let giftsList = this.data.giftsList

    const url = '/giftBag'
    get(url, data).then((res) => {
      const list = res.data.list
      list.forEach((gift, index) => {
        if (gift.id == giftId){
          console.log(gift)
          this.setData({
            gift: gift
          })
        }
      })
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
});

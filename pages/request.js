const ENV_DOMAIN = {
    'test': 'http://127.0.0.1:8082/api',
    // 'online': 'http://192.168.40.161:8082/api',
    'online': 'http://222.186.81.37:5000/giftApi/api'
}

const ENV = 'online'
const DOMAIN = ENV_DOMAIN[ENV]

export const DOMAIN_FILE = 'http://222.186.81.37:5000/gift/'

export function post (u, d) {
    const url = DOMAIN + u
    const data = JSON.stringify(d)
    return new Promise((resolve, reject) => {
        dd.httpRequest({
            url: url,
            method: 'POST',
            headers: {
                // Authorization: res.data,
                "Content-Type": "application/json"
            },
            data: data,
            dataType: 'json',
            success: (res) => {
                if(res.data.code == 0){
                    resolve(res.data)
                } else {
                    resolve(res.data)
                }
            },
            fail: (res) => {
                console.log(res);
                reject(res)
            }
        })
    })
}

export function get (u, d) {
    const url = DOMAIN + u
    return new Promise((resolve, reject) => {
        dd.httpRequest({
            url: url,
            method: 'GET',
            data: d,
            success: (res) => {
                if(res.data.code == 0){
                    resolve(res.data)
                } else {
                    resolve(res.data)
                }
            },
            fail: (res) => {
                console.log(res.error)
                console.log(res.errorMessage)
        
                dd.alert({
                    title: '提示',
                    content: res.errorMessage
                });
        
                reject(res)
            }
        })
    })
}
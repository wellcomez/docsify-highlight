/* eslint-disable no-unused-vars */
// const fs = require('fs');
// let data = fs.readFileSync("/Users/jialaizhu/Downloads/映山红笔记.json","utf-8")
// let a =JSON.parse(data)
// let {charpter} = a;
// for(let key in charpter){
//     let data = charpter[key]
//     let {notes} = data
//     for(var i=0; i<notes.length; i++){
//         let {hs} = notes[i]
//         let {imgsrc} = hs?hs:{}
//         if(imgsrc){
//             let host = "https://coding-pages-bucket-3523382-8334037-13375-505905-1254369281.cos.ap-shanghai.myqcloud.com/"
//             console.log(imgsrc)
//             hs.imgsrc = host+imgsrc
//         }
//     }
// }
// a.charpter = charpter
// let str = JSON.stringify(a)
// fs.writeFileSync("/Users/jialaizhu/Downloads/映山红笔记-ouput.json",str)


// var changed = {}
// for (let i = 0; i < localStorage.length; i++) {
//     var key = localStorage.key(i);
//     //获取本地存储的Key
//     console.log(key);
//     let a = localStorage.getItem(key)
//     console.log(a);
//     try {
//        let yes = false;
//        a = JSON.parse(a)
//        a.forEach((c)=>{
//           let {hs} = c
//           if(hs&&hs.imgsrc&&hs.imgsrc.indexOf('http')==-1){
//             let host = "https://coding-pages-bucket-3523382-8334037-13375-505905-1254369281.cos.ap-shanghai.myqcloud.com/"
//             hs.imgsrc = host+hs.imgsrc
//             console.log(hs.imgsrc)
//             yes = true;
//           }
//        }) ;
//        if(yes) {
//         changed[key] = JSON.stringify(a)
//        }
//     } catch (error) {
//        console.error(error) 
//     }
// }
// for(let a in changed) {
//     localStorage[a] = changed[a]
// }

// let text = "a1a2a3aaaa"
let text = "aaab123456aaa"
let texts = []
let range = [0, 1, 4]
for (let i = 0; i < range.length; i++) {
    let a = (i < range.length - 1 ? range[i + 1] : text.length - 1) - range[i];
    texts.push(text.substr(range[i], a))
}
texts = Array.from(new Set(texts))


text = "xysysyadfa" + text
const search = (text, ptns) => {
    let findstr = (str, ptn) => {
        let re = new RegExp(ptn, "g")
        return [...str.matchAll(re)]
    }
    let keyResult
    let allResult = []
    ptns.forEach((a) => {
        let r = findstr(text, a)
        if (r.length == 1) {
            if (keyResult == undefined) {
                keyResult = r[0];
            } else if (keyResult.index < r[0].index) {
                keyResult = r[0];
            }
        }
        r.forEach((a) => {
            allResult.push(a)
        })
    })
    allResult = allResult.sort((a, b) => {
        return a.index - b.index;
    });
    if (keyResult) {
        let idx = allResult.indexOf(keyResult)
        let a = allResult[idx];
        let ssss = a[0]
        let leftCount = ptns.length - 1;
        for (let i = idx - 1; i >= 0, leftCount > 0; i--) {
            let b = allResult[i];
            let len = a.index - b.index + 1;
            if (len < b[0].length)
                continue;
            leftCount--;
            ssss = b[0] + ssss
            if (leftCount == 0) {
                print(b)
                return b.index
            }
        }
    }
}
// eslint-disable-next-line no-unused-vars

// console.log(allResult)

// eslint-disable-next-line no-unused-vars
function newFunction(allResult) {

    allResult = allResult.filter((a, idx) => {
        if (idx < allResult.length - 1) {
            let b = allResult[idx + 1];
            if (b[0].indexOf(a[0]) == 0)
                return false;
        }
        if (idx > 0) {
            for (let i = idx - 1; i >= 0; i--) {
                let b = allResult[i];
                if (a.index <= b.index + b[0].length - 1) {
                    b = allResult[idx - 1];
                    if (b[0].indexOf(a[0]) == 0)
                        return true;
                    return false;
                }
            }
        }
        return true;
    });
    return allResult
}
let ptns = []

ptns.forEach((a) => {
    try {
        let css = `#main :contains("${a}")`
        console.log(css)
        let node = document.querySelectorAll(css)
        console.log(node)
    } catch (e) {
        console.log(e)
    }
})
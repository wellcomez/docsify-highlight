import { hlIngoreElement, trimElement } from "./hlPlacement";

export function createHtml(json) {
    if (json == undefined || json == null) return
    let { nodes, styleList } = json
    // eslint-disable-next-line no-unused-vars
    // function convertNodes(nodes) {
    //   return nodes.map((el) => {
    //     let html = ''
    //     let { tagName, text, style, children } = el
    //     if (children) {
    //       let a = convertNodes(children)
    //       if (tagName) {
    //         let b = document.createElement(tagName)
    //         b.innerHTML = a;
    //         a = b.outerHTML;
    //       }
    //       html = html + a;
    //     }
    //     else {
    //       let el = document.createElement(tagName)
    //       el.setAttribute('style', styleList[style])
    //       el.innerText = text
    //       html = html + el.outerHTML
    //     }
    //     return html
    //   }).join('')
    // }
    let p = document.createElement('p')
    function convertNodes2(nodes) {
        nodes.forEach((el) => {
            let { tagName, text, style, children } = el
            if (tagName == "article".toUpperCase()) {
                return
            }
            if (tagName == "I") {
                let el = document.createElement(tagName)
                el.setAttribute('style', styleList[style])
                el.innerText = text
                p.appendChild(el)
            }
            convertNodes2(children ? children : [])
        })
        return p.innerHTML
    }
    return convertNodes2(nodes)
    // return convertNodes(nodes)
}
// eslint-disable-next-line no-unused-vars
export const convertHight2Html = (dom) => {
    const convertNote2TreeNode = (el, styleList) => {
        let { tagName } = el;
        let style = el.getAttribute("style")
        if (styleList.indexOf(style) == -1) {
            styleList.push(style)
        }
        style = styleList.indexOf(style)
        let text = el.innerText;
        let child = { tagName, text, style }
        return child
    }
    const buildTree = (node, styleList) => {
        let ii = node.children
        let { tagName } = node;
        let children = []
        for (let i = 0; i < ii.length; i++) {
            let el = ii[i];
            let a = buildTree(el, styleList)
            if (a.children.length) {
                children.push(a)
            }
            if (el.classList.contains('docsify-highlighter')) {
                let child = convertNote2TreeNode(el, styleList)
                children.push(child)
                // console.log(child);
            }
        }
        return { tagName, children }
    }
    // let dom = this.getHighlightDom(noteid).sort(cmpNodePosition)
    // let objset = new Set(dom);
    // let el = dom[0]
    let parentNode = document.createElement("p");
    let ret = []
    // while (el && objset.size) {
    //     let ignore = hlIngoreElement(el) || hlIngoreElement(el.parentNode)
    //     if (!ignore && el.classList && el.classList.contains('docsify-highlighter')) {
    //         let id = this.highlighter.getIdByDom(el)
    //         if (id == noteid) {
    //             ret.push(el)
    //             objset.delete(el)
    //         } else {
    //             let a = this.highlighter.getExtraIdByDom(el)
    //             if (new Set(a).has(noteid)) {
    //                 ret.push(el)
    //             }
    //         }
    //     }
    //     const getNext = (el) => {
    //         let { parentNode } = el
    //         if (!parentNode) return null
    //         let { nextSibling } = el
    //         if (nextSibling) {
    //             el = nextSibling.firstChild
    //             if (el)
    //                 return el
    //         }
    //         return getNext(parentNode)
    //     }
    //     if (el.nextSibling) {
    //         el = el.nextSibling
    //     } else {
    //         el = getNext(el)
    //     }
    // }
    dom = dom.filter((el) => {
        let ignore = hlIngoreElement(el) || hlIngoreElement(el.parentNode)
        if (!ignore) {
            if (trimElement(el)) return true
        }
        return false
    })
    dom.forEach((a) => {
        let b = a.cloneNode(true);
        ['data-highlight-split-type', 'data-highlight-id-extra', 'data-highlight-id'].forEach((a) => b.removeAttribute(a))
        b.innerText = a.innerText
        parentNode.appendChild(b)
    })
    let styleList = []
    ret = [parentNode].map((a) => {
        return buildTree(a, styleList)
    })
    let tree = { nodes: ret, styleList }
    let html = createHtml(tree)
    return { html, tree }
}


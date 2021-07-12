import Vue from 'vue';
export function insertComponentAfter(cmp, props, nodeExisted, after = true) {
  if (cmp.default) {
    cmp = cmp.default;
  }
  cmp = Vue.extend(cmp);
  let node = document.createElement('div');
  if (after == false) {
    nodeExisted.insertAdjacentElement("beforebegin", node);
  } else {
    nodeExisted.insertAdjacentElement("afterend", node);
  }
  let vm = new cmp({
    el: node,
    propsData: props,
    parent: this
  });
  return vm
}
export function mountCmp(cmp, props, parent, replace = false) {
  if (cmp.default) {
    cmp = cmp.default;
  }
  cmp = Vue.extend(cmp);
  let node = document.createElement('div');
  if (replace) {
    let ele = parent;
    let wrap = node;
    ele.parentElement.replaceChild(wrap, ele)
  } else {
    parent.appendChild(node);
  }
  let vm = new cmp({
    el: node,
    propsData: props,
    parent: this
  });
  return vm
}

export function registComponet(component) {
  for (let k in component) {
    let Panel = component[k];
    if (typeof window !== 'undefined' && window.Vue) {
      window.Vue.component(Panel.name, Panel);
    }
    Panel.install = function (Vue) {
      Vue.component(Panel.name, Panel);
    };
  }
}
export function scollTopID(hash) {
  window.hl.scollTopID(hash)
}
export function getQueryObject(url) {
  url = url == null ? window.location.href : url;
  var search = url.substring(url.lastIndexOf("?") + 1);
  var obj = {};
  var reg = /([^?&=]+)=([^?&=]*)/g;
  search.replace(reg, function (rs, $1, $2) {
    var name = decodeURIComponent($1);
    var val = decodeURIComponent($2);
    val = String(val);
    obj[name] = val;
    return rs;
  });
  return obj;
}
export function parseurl(url) {
  let obj = getQueryObject(url);
  url = new URL(url ? url : window.location.href);
  let hash = url.hash
  let index = hash.indexOf("?")
  let path = hash;
  if (index >= 0) {
    path = path.substring(0, index)
  }
  let { noteid } = obj;
  return { path, noteid }
}


import { Modal } from "iview";
import { tBackgroundColor, tUl } from './colorSelector';
export function queryBox({ title, content, onCancel, onOk }) {
  Modal.confirm({
    onCancel,
    content,
    title,
    onOk
  });
}
export var mobile = require('is-mobile');
export function gotoNote({ path, id, key }) {
  if (path == undefined) {
    path = JSON.parse(key).path;
  }
  let hash = path.substring(path.indexOf("#"));
  hash = `${hash}?noteid=${id}`;
  let current = parseurl();
  if (current.path == path) {
    // document.location.hash = hash;
    scollTopID(id);
  } else {
    document.location.hash = hash;
  }
}

export function getImgSrcUrl(imgsrc, rootpath) {
  if (imgsrc == undefined) return undefined;
  let url = undefined;
  try {
    url = new URL(imgsrc);
    // eslint-disable-next-line no-empty
  } catch (error) {
  }
  if (url) {
    return imgsrc
  }
  let path = imgsrc
  if (rootpath == undefined) {
    rootpath = rootPath()
  }
  return `${rootpath}${path}`
}
export function getNoteUrl(id, charpter) {
  let rootpath = rootPath()
  let url = charpter.url(id, rootpath)
  return decodeURI(url)
}
export function rootPath() {
  let u = document.location
  let pathname = u.pathname;
  let http = u.protocol
  let host = u.host
  return `${http}//${host}${pathname}`
}
export function wrapNest(node) {
  let { text, nest } = node
  let neststyle, t1, t2
  if (nest) {
    neststyle = convertStyle(nest.style)
    let sameparts = findSameParts(text, nest.text);
    let split = sameparts.length ? sameparts[0] : nest.text;
    sameparts.forEach((a) => {
      if (split.length < a.length) {
        split = a;
      }
    })

    let sss = text.split(split);
    t1 = t2 = ''
    t1 = sss[0];
    for (let j = 1; j < sss.length; j++) {
      t2 = t2 + sss[j]
    }
    text = nest.text
  }
  return { t1, t2, text, neststyle }
}
export function convertStyle(styleDefine) {
  let style = {}
  for (let color in styleDefine) {
    color = parseInt(color);
    let a = styleDefine[color];
    let { colorhex } = a;
    if (color == tUl) {
      style["border-bottom"] = "1px solid " + colorhex;
    } else if (color == tBackgroundColor) {
      style.backgroundColor = colorhex;
    } else {
      style.color = colorhex;
    }
  }
  return style;
}
function findSameParts(str1, str2, options = {}) {
  if (typeof str1 !== "string" || typeof str2 !== "string") {
    return [];
  }
  let trimStr1 = str1.trim();
  let trimStr2 = str2.trim();
  if (trimStr1.length === 0 || trimStr2.length === 0) {
    return [];
  }

  let { minStrLength, ignoreCase } = options;

  if (ignoreCase === undefined || (ignoreCase !== 0 && ignoreCase !== false)) {
    ignoreCase = true; //default
  }

  if (ignoreCase === true) {
    trimStr1 = trimStr1.toLowerCase();
    trimStr2 = trimStr2.toLowerCase();
  }

  const strArray = [trimStr1, trimStr2];
  const index = trimStr1.length <= trimStr2.length ? 0 : 1;
  const shortStr = strArray[index];
  const longStr = strArray[1 - index];

  if (!minStrLength || minStrLength < 1) {
    minStrLength = 3; //default value
  }

  if (minStrLength > shortStr.length) {
    minStrLength = shortStr.length;
  }

  let allFoundStr = [];
  for (let i = 0; i < shortStr.length - minStrLength + 1;) {
    let foundStr;
    for (let j = minStrLength; j <= shortStr.length - i; j++) {
      let tempStr = shortStr.substr(i, j);
      if (longStr.indexOf(tempStr) > -1) {
        foundStr = tempStr;
      } else {
        break;
      }
    }
    if (foundStr) {
      allFoundStr.push(foundStr.trim());
      i += foundStr.length;
    } else {
      i++;
    }
  }
  return allFoundStr;
}

export function createHtml(json) {
  if (json == undefined || json == null) return
  let { nodes, styleList } = json
  // eslint-disable-next-line no-unused-vars
  function convertNodes(nodes) {
    return nodes.map((el) => {
      let html = ''
      let { tagName, text, style, children } = el
      if (children) {
        let a = convertNodes(children)
        if (tagName) {
          let b = document.createElement(tagName)
          b.innerHTML = a;
          a = b.outerHTML;
        }
        html = html + a;
      }
      else {
        let el = document.createElement(tagName)
        el.setAttribute('style', styleList[style])
        el.innerText = text
        html = html + el.outerHTML
      }
      return html
    }).join('')
  }
  let p = document.createElement('p')
  function convertNodes2(nodes) {
    nodes.forEach((el) => {
      let { tagName, text, style, children } = el
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
export function pluginScript() {
  let { DocHighlighter } = window.$docsify ? window.$docsify : undefined;
  if (DocHighlighter) {
    let { script } = DocHighlighter
    if (script)
      return script
  }
  return {}
}
// import α from 'color-alpha'
export function getColorList(first3Colors) {
  return first3Colors.filter((a) => {
    return a != undefined;
  }).map((colorhex) => {
    let style = `background-color: ${colorhex}`
    return { style };
  })
}
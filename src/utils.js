import Vue from 'vue';

export function mountCmp(cmp, props, parent) {
  if (cmp.default) {
    cmp = cmp.default;
  }
  cmp = Vue.extend(cmp);
  let node = document.createElement('div');
  parent.appendChild(node);
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
export function checkClickOut(d, cb) {
  if (d == undefined) {
    document.removeEventListener("click", cb);
    return;
  }
  d.addEventListener("mouseout", () => {
    document.addEventListener("click", cb);
  })
  d.addEventListener("mouseover", () => {
    document.removeEventListener("click", cb);
  })
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

export function getImgSrcUrl(imgsrc,rootpath) {
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
  if(rootpath==undefined) {
    rootpath = rootPath()
  }
  return `${rootpath}${path}`
}
export function rootPath() {
  let u = document.location
  let pathname = u.pathname;
  let http = u.protocol
  let host = u.host
  return `${http}//${host}${pathname}`
}
export function wrapNest(node)
{
  let {text,nest} = node
  let neststyle,t1,t2
  if(nest){
    neststyle = convertStyle(nest.style)
    let sss = text.split(nest.text);
    t1 = t2 = ''
    t1 = sss[0];
    for(let j=1;j<sss.length;j++){
      t2 = t2+sss[j]
    }
    text = nest.text
  }
  return {t1,t2,text,neststyle}
}
export function convertStyle(styleDefine) {
  let style={}
  for(let color in styleDefine) {
    color=parseInt(color);
    let a=styleDefine[color];
    let { colorhex }=a;
    if(color==tUl) {
      style["border-bottom"]="1px solid "+colorhex;
    } else if(color==tBackgroundColor) {
      style.backgroundColor=colorhex;
    } else {
      style.color=colorhex;
    }
  }
  return style;
}
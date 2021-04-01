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

export function getImgSrcUrl(imgsrc) {
  if (imgsrc == undefined) return undefined;
  if (imgsrc.indexOf("http://") == 0) {
    return imgsrc
  }
  let u = document.location
  let pathname = u.pathname;
  let path = imgsrc
  let http = u.protocol
  let host = u.host
  return `${http}//${host}${pathname}${path}`
}
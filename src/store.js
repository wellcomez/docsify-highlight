import { colorClassList } from "./colorSelector";
import { createHtml, getImgSrcUrl, parseurl, pluginScript, rootPath } from "./utils";
import { User, UserLogin } from "./UserLogin";
const md5 = require('md5');
export class BookToc {
  constructor(useridArg) {
    if (window.$docsify)
      this.bookname = window.$docsify.name;
    if (this.bookname == null || this.bookname == undefined) {
      this.bookname = window.location.hostname;
    }
    let bookname = this.bookname
    let userid = User.getUsername();
    if (useridArg) {
      userid = useridArg;
    }
    this.userid = userid;
    this.name = JSON.stringify({ userid, bookname })
    this.data = {};
    this.load();
  }
  json() {
    let { name, bookname, userid, st, data } = this;
    let hostname = window.location.hostname
    return { name, bookname, userid, st, data, hostname };
  }
  findChapter(path) {
    let aa = this.charpterTitles();
    for (let i in aa) {
      let c = aa[i];
      if (path == c.path) return c;
    }
  }
  bookMarkList() {
    let aa = this.charpterTitles();
    let ret = []
    for (let i in aa) {
      let c = aa[i];
      let { bookmark } = c;
      if (bookmark) {
        ret.push(c)
      }
    }
    this.ChapterOjbList().forEach((charpter) => {
      charpter.children.forEach((hs) => {
        if (hs.bookmark) {
          ret.push(hs)
        }
      })
    })
    return ret;
  }
  _setbookmark({ path }, bookmark) {
    let ret = this.findChapter(path);
    ret.bookmark = bookmark
    this.save()
  }
  _isbookMarked({ path }) {
    let ret = this.findChapter(path)
    return ret.bookmark
  }
  addChapterIndex(a) {
    let aa = this.charpterTitles();
    let { path } = a;
    if (this.findChapter(path) == undefined) {
      let bookmark = false;
      if (a.bookmark) {
        bookmark = a.bookmark
      }
      a = { ...a, ...{ bookmark } }
      aa.push(a);
      this.save();
    }
    let { userid, bookname } = this;
    return JSON.stringify({ path, userid, bookname })
  }
  ChapterOjbList() {
    let titlelist = this.charpterTitles();
    return titlelist.map((data) => {
      let { path, title } = data;
      let store = this.CharpterStorage({ path, title });
      let c = new Chapter(store);
      return c;
    })
  }
  fixWrongTitles() {
    let charpterTitles = this.ChapterOjbList()
    let m = {}
    charpterTitles.forEach((charpter) => {
      let { store } = charpter;
      m[store.title] = charpter
    })
    charpterTitles.forEach((charpter) => {
      let { store } = charpter;
      let all = store.getAll()
      all.filter(({ hs }) => {
        if (hs.title != store.title) return true
      }).forEach(({ hs }) => {
        let { store } = charpter;
        let target = m[hs.title]
        if (target == undefined && hs.imgsrc) {
          let path = decodeURIComponent(new URL(hs.imgsrc).pathname)
          let ret = Object.keys(m).filter((a) => {
            return path.indexOf(a) != -1
          })
          if (ret.length == 1) {
            // console.log(ret, hs.tilte)
            target = m[ret[0]]
          }
        }
        if (target && target.store != store) {
          target.store.save({ hs })
          store.remove(hs.id)
          console.log(hs.id, "move to " + target.store.title + " from " + store.title)
        }
      })
    })
    charpterTitles.forEach((charpter) => {
      let { store } = charpter;
      store.forceSave()
    })
  }
  CharpterStorage({ path, title } = {}) {
    let { userid } = this
    if (path && title) {
      return new LocalStore({ path, title, userid });
    } else {
      return new LocalStore({ userid });
    }
  }

  charpterTitles() {
    if (this.data.Charpters) {
      return this.data.Charpters;
    } else {
      this.data.Charpters = [];
      return this.data.Charpters;
    }
  }
  syn2Local(name, bookname, userid, st, data) {
    let j = { name, bookname, userid, st, data }
    localStorage.setItem(this.name, JSON.stringify(j));
  }
  load() {
    let s = localStorage.getItem(this.name);
    if (s) {
      let { name, bookname, userid, st, data } = JSON.parse(s);
      if (name && bookname && userid && data) {
        this.data = data;
        this.st = st;
      }
    }
  }
  save() {
    this.st = new Date() * 1
    let j = this.json()
    localStorage.setItem(this.name, JSON.stringify(j));
  }
}

class LocalStore {
  key() {
    let { path } = parseurl()
    return path;
  }
  Chapter() {
    let c = new Chapter(this);
    return c;
  }
  constructor({ path, userid, title } = {}) {
    this.userid = userid
    if (path == undefined && title == undefined) {
      path = this.key()
      title = document.title
    }
    this.userid = userid
    let bbb = this.getBookToc();
    this.key = bbb.addChapterIndex({ path, title });
    this.toc = bbb
    this.isBookMarked = () => {
      let bbb = this.getBookToc();
      return bbb._isbookMarked({ path })
    }
    this.setBookMark = (yes) => {
      let bbb = this.getBookToc();
      return bbb._setbookmark({ path }, yes)
    }
    this.path = path;
    this.title = title;
  }

  storeToJson() {
    const store = localStorage.getItem(this.key);
    let sources;
    try {
      sources = JSON.parse(store) || [];
    } catch (e) {
      sources = [];
    }
    return sources;
  }

  jsonToStore(stores) {
    localStorage.setItem(this.key, JSON.stringify(stores));
    let bbb = this.getBookToc();
    bbb.save();
  }

  getBookToc() {
    return new BookToc(this.userid);
  }

  save(data) {
    const stores = this.storeToJson();
    const map = {};
    stores.forEach((store, idx) => (map[store.hs.id] = idx));

    if (!Array.isArray(data)) {
      data = [data];
    }

    data.forEach((store) => {
      // update
      if (map[store.hs.id] !== undefined) {
        stores[map[store.hs.id]] = store;
      }
      // append
      else {
        stores.push(store);
      }
    });
    this.jsonToStore(stores);
  }

  forceSave(store) {
    const stores = this.storeToJson();
    if (store)
      stores.push(store);
    this.jsonToStore(stores);
  }
  update(a) {
    let { id } = a;
    const stores = this.storeToJson();
    for (let i = 0; i < stores.length; i++) {
      if (stores[i].hs.id === id) {
        var { hs } = stores[i];
        hs = { ...hs, ...a }
        stores[i].hs = hs;
        this.jsonToStore(stores);
        break;
      }
    }
  }
  remove(id) {
    const stores = this.storeToJson();
    for (let i = 0; i < stores.length; i++) {
      if (stores[i].hs.id === id) {
        stores.splice(i, 1);
        this.jsonToStore(stores);
        break;
      }
    }
  }
  geths(id) {
    const stores = this.storeToJson();
    for (let i = 0; i < stores.length; i++) {
      if (stores[i].hs.id === id) {
        return stores[i].hs;
      }
    }
    return undefined;
  }
  getAll() {
    return this.storeToJson();
  }

  removeAll() {
    this.jsonToStore([]);
  }
}
class Chapter {
  constructor(store) {
    this.tags = new Set();
    if (store) {
      this.label = store.title;
      this.path = store.path;
      let { key } = store;
      this.children = store.getAll().map(({ hs }, idx) => {
        // let { id, text: label, top, style, note, tags } = hs;
        let { text: label, tags } = hs;
        let textOffset = hs.startMeta.textOffset;
        if (tags) {
          tags.forEach((a) => {
            this.tags.add(a)
          })
        }
        return { ...hs, ...{ idx, textOffset, label, key } }
      });
      let aa = this.children.sort((a, b) => {
        if (a.domidx != undefined && b.domidx != undefined) {
          return a.domidx - b.domidx;
        }
        if (a.textIndex != undefined && b.textIndex != undefined) {
          return a.textIndex - b.textIndex;
        }
        if (a.top != undefined && b.top != undefined)
          return a.top.top - b.top.top ? 1 : -1;
        return -1
      });
      this.children = aa;
      this.store = store;
    }
  }
  syn2Local(json, toc) {
    let { title, notes, path } = json;
    toc = toc ? toc : new BookToc()
    let l = toc.CharpterStorage({ path, title })
    l.save(notes);
  }
  count() {
    return this.store.getAll().length
  }
  static createByJson({ title, userid, notes, path }) {
    let store = new LocalStore({ path, userid, title })
    // store.forceSave(notes)
    let ret = new Chapter(store)
    ret.children = notes.map(({ hs }) => {
      let { tree, version } = hs
      if (version && tree) {
        hs.html = createHtml(tree)
      }
      return hs
    }).filter((hs) => {
      let { html, text, imgsrc } = hs
      if (html) return true;
      if (text) return true;
      if (imgsrc) return true;
      return false;
    })
    return ret
  }
  json() {
    let { key, path, title, userid } = this.store;
    let notes = this.store.storeToJson();
    return { key, title, notes, path, userid };
  }
  url(id, rootpath) {
    let { path, } = this
    let hash = path.substring(path.indexOf("#"));
    hash = `${hash}?noteid=${id}`
    if (rootpath == undefined) {
      rootpath = rootPath()
    }
    return `${rootpath}${hash}`
  }
  tilte() {
    return this.label
  }
  md(css, chapterIndex) {
    if (chapterIndex == undefined) {
      chapterIndex = ''
    }
    let title = ["## " + this.label];
    if (this.children.length == 0) return "\n"
    let index = 0;
    let items = this.children.map((a, idx) => {
      let { label, style, note, imgsrc, tags, id, notshowSeq, tabn } = a;
      label = label.split('\n').map((a) => {
        a = a.replaceAll('-', '\\-')
        return a
      }).join('')
      if (!tabn) {
        tabn = notshowSeq ? 1 : 0
      }
      if (tags) {
        tags = new Set(tags)
        tags = Array.from(tags);
      } else {
        tags = []
      }
      tags = tags.map((tag) => {
        return "`" + `${tag}` + "`"
      }).join('  ')
      label = label ? label : ""
      let hlyellow
      if (css) {
        hlyellow = ''
        for (let color in style) {
          let { enable, colorhex } = style[color];
          if (enable) {
            let classname = colorClassList.getClass(color, colorhex);
            hlyellow = `${hlyellow} ${classname}`
          }
        }
      }
      let space = notshowSeq ? '   ' : ''
      if (tabn) space = space.repeat(tabn)
      if (note) {
        note = `${space}>${note}`
      } else {
        note = ""
      }
      let img
      let ref = this.url(id);
      ref = ref ? `<sup>[[${chapterIndex}-${idx}]](${ref})</sup>` : "";
      if (imgsrc) {
        imgsrc = getImgSrcUrl(imgsrc)
        let { path } = parseurl(imgsrc)
        img = `![${path}](${imgsrc})`
      }
      let content = label ? (hlyellow ? `<span class="${hlyellow}"> ${label}</span>` : label) : "";
      if (note.length) {
        content = `<b>${content}</b>`
      }
      if (content.length)
        content = content + ref
      let title = ''
      if (notshowSeq != true) {
        index++;
        let pre = index + '. '
        pre = '- '
        if (img) {
          title = `${pre} ${ref}${tags}`
          img = `${space}>${img}`
        } else {
          title = `${pre} ${content}${tags}`
        }
      } else {
        if (img) {
          img = `${space}>${img}`
        } else {
          title = `${space}- ${content}${tags}`
        }
      }
      // let divider =""
      // if (notshowSeq) {
      //   let a = this.children[idx + 1]
      //   if (a && a.notshowSeq != true) {
      //     // divider = '---'
      //   }
      // }
      return [title, img, note].filter((a) => a && a.length > 0).join('\n')
    });
    return title.concat(items).join("\n\n");
  }
  mergeChild() {
    let { children } = this
    let findid = (id) => {
      for (let i = 0; i < children.length; i++) {
        let hs = children[i]
        if (hs.id == id) return true
      }
      return false
    }
    this.store.geths()
    children = children.filter((a) => {
      let { parent } = a
      if (parent) {
        let bb = parent.filter((id) => {
          return findid(id)
        })
        return bb.length == 0;
      }
      return true;
    })
    return children
    // let bbb = children.filter((a) => {
    //   let { tree, version, imgsrc, text, html } = a
    //   if (version) {
    //     return tree != undefined || html != undefined
    //   }
    //   return imgsrc || text;

    // })
    // children = bbb
    // return children
  }
}
// import CharptHtml from './components/CharptHtml.vue'
import ExportHtml from './components/ExportHtml.vue'
import Vue from 'vue';
import { getConfig } from "./ANoteConfig";
export function getRawHtml(cmp, props) {
  if (cmp.default) {
    cmp = cmp.default;
  }
  cmp = Vue.extend(cmp);
  let node = document.createElement("div");
  node.id = "CharptHtml";
  let a = new cmp({
    propsData: props,
  });
  a.$mount(node);
  return a.$el.outerHTML;
}
import { Base64 } from 'js-base64';

export class Book {
  static updated = false;
  constructor(useridArg) {
    this.toc = new BookToc(useridArg);
    this.name = this.toc.bookname;
    let aa = this.toc.name
    this.bookid = md5(aa)
  }
  sortedChapter() {
    let sorttoc = pluginScript().sorttoc
    let aaa = this.Charpter().sort((a, b) => {
      // if (a.label == document.title) {
      //   return -1;
      // }
      if (sorttoc) return sorttoc(a.label, b.label)
      return a.label.localeCompare(b.label, "zh");
    })
    return aaa
  }
  exportHtml() {
    let aaa = this.sortedChapter();
    let data = aaa.map((charpter) => {
      return charpter.json()
    });
    data = Base64.encode(JSON.stringify(data));
    let rootpath = rootPath()
    let tilte = this.name
    let dev = false;
    let umdjs = dev ? "docsify-highlight.umd.js" :
      "https://cdn.jsdelivr.net/npm/docsify-highlight@latest/dist/docsify-highlight.umd.min.js"
    let css = dev ? 'docsify-highlight.css' :
      "https://cdn.jsdelivr.net/npm/docsify-highlight@latest/dist/docsify-highlight.min.css"
    let ret = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <script src="https://unpkg.com/vue/dist/vue.js"></script>
  <link rel="stylesheet" href="${css}" />
  <script type="text/javascript" src="${umdjs}"></script>
  <title>${tilte}</title>
  <script type="text/javascript">
  var bookdata = '${data}';
  var rootpath = "${rootpath}";
  window.bookdata = {bookdata,rootpath};
  </script>
</head>
<body style="font-family: SimSun,sans-serif;" onload="window.exporthtml()">
  <div id="docsify-highlighter-exporthtml"></div>
</body>
`;
    return ret
  }
  async loadBookData() {

  }
  async importFromUnNamed() {
    if (this.count()) return
    let src = new Book(UserLogin.defaultUser)
    let json = src.json()
    let { charpter, toc } = json;
    let tt = new BookToc();
    let { name, bookname, userid, st, data } = toc
    userid = this.userid = User.getUsername()
    charpter.forEach(element => {
      new Chapter().syn2Local(element, tt)
    });
    tt.syn2Local(name, bookname, userid, st, data);
  }
  Charpter() {
    return this.toc.ChapterOjbList();
  }
  tags() {
    let ret = new Set();
    this.Charpter().forEach((a) => {
      let { tags } = a;
      tags.forEach((tag) => {
        ret.add(tag);
      })
    })
    return ret
  }
  importFromJson(data) {
    this.syn2Local(data)
  }
  syn2Local(json) {
    let { charpter, toc } = json;
    let tt = new BookToc();
    let { name, bookname, userid, st, data } = toc
    tt.data = data;
    charpter.forEach(element => {
      new Chapter().syn2Local(element, tt)
      let { bookmark, path, title } = element
      tt.addChapterIndex({ bookmark, path, title });
    });
    tt.syn2Local(name, bookname, userid, st, tt.data)
  }
  count() {
    let c = 0;
    this.Charpter().forEach((a) => {
      c = c + a.count();
    })
    return c;
  }
  json() {
    let charpter = this.Charpter().map((data) => {
      return data.json();
    });
    let toc = this.toc.json();
    return { toc, charpter };
  }
  jsonstr() {
    return JSON.stringify(this.json());
  }
  md(css = false) {
    let bookname = window.$docsify.name
    let tilte = `# ${bookname}`
    let toc1 = `- [${bookname}](#${bookname})`
    let toc = this.sortedChapter().map((a) => {
      a = a.label
      return `  - [${a}](#${a})`
    }).join("\n")

    toc = toc1 + "\n" + toc;
    let content = this.sortedChapter().map((a, idx) => {
      return a.md(css, idx);
    });
    let styles = css ? ("<style>" + colorClassList.str() + "</style>") : "";
    return [toc, tilte]
      .concat([styles])
      .concat(content)
      .join("\n\n");
  }
}
export function createExportHtmlEntry() {
  let ele = document.querySelector("#docsify-highlighter-exporthtml")
  if (ele == undefined) {
    return
  }
  let { bookdata, rootpath } = window.bookdata ? window.bookdata : {};
  if (bookdata == undefined) return;
  let data = Base64.decode(bookdata)
  data = JSON.parse(data)
  let charpter = data.map((a) => {
    if (a) {
      return Chapter.createByJson(a)
    }
  })
  // let charpter = book.Charpter()
  let props = { charpter, rootpath }
  let cmp = ExportHtml
  cmp = Vue.extend(cmp);
  let a = new cmp({
    propsData: props,
  });
  a.$mount("#docsify-highlighter-exporthtml");
}
window.exporthtml = createExportHtmlEntry
export function getChanged() {
  let { changeNumber, localNumber } = getConfig().load()
  if (localNumber == undefined) {
    localNumber = new Book().count();
    getConfig().save({ localNumber })
  }
  if (changeNumber == undefined) {
    changeNumber = 0;
    getConfig().save({ changeNumber })
  }
  return { changeNumber, localNumber }
}

import { colorClassList } from "./colorSelector";
import { parseurl } from "./utils";
import { User ,UserLogin} from "./UserLogin";
const md5 = require('md5');
class BookToc {
  constructor(useridArg) {
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
    return { name, bookname, userid, st, data };
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
      let store = this.CharpterStorage({path, title});
      let c = new Chapter(store);
      return c;
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
    stores.push(store);
    this.jsonToStore(stores);
  }
  update(a) {
    let { id } = a;
    const stores = this.storeToJson();
    for (let i = 0; i < stores.length; i++) {
      if (stores[i].hs.id === id) {
        var { hs } = stores[i];
        for (var aa in a) {
          hs[aa] = a[aa];
        }
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
    if (store) {
      this.label = store.title;
      let { key } = store;
      this.children = store.getAll().map(({ hs }, idx) => {
        // let { id, text: label, top, style, note, tags } = hs;
        let { text: label, top } = hs;
        top = top.top;
        let textOffset = hs.startMeta.textOffset;
        // return { idx, id, label, key, textOffset, top, style, note, tags };
        return {...hs,...{idx,textOffset,label,key,top}}
      });
      let aa = this.children.sort((a, b) => {
        if (a.top == b.top) return 0;
        return a.top > b.top ? 1 : -1;
      });
      this.children = aa;
      this.store = store;
    }
  }
  syn2Local(json) {
    let { title, notes, path } = json;
    let toc = new BookToc()
    let l = toc.CharpterStorage({ path, title })
    l.save(notes);
  }
  count() {
    return this.store.getAll().length
  }
  json() {
    let { key, path, title } = this.store;
    let notes = this.store.storeToJson();
    return { key, title, notes, path };
  }

  md() {
    let title = ["## " + this.label];
    if (this.children.length == 0) return "\n"
    let items = this.children.map((a, idx) => {
      let { label, style, note } = a;
      let hlyellow = ''
      for (let color in style) {
        let { enable, colorhex } = style[color];
        if (enable) {
          let classname = colorClassList.getClass(color, colorhex);
          hlyellow = `${hlyellow} ${classname}`
        }
      }
      if (note) {
        note = "\n\n\t>" + note
      } else {
        note = ""
      }
      let tile = `"${label.substring(0, Math.min(20, label.length))}..."`
      let span = `    <span class="${hlyellow}">    ${label}    </span>`;
      return (
        `${idx + 1}. ${tile}\n
  ${span}\n
  ${note}
  `);
    });
    return title.concat(items).join("\n\n");
  }
}
export class Book {
  constructor(useridArg) {
    this.toc = new BookToc(useridArg);
    this.name = this.toc.bookname;
    let aa = this.toc.name
    this.bookid = md5(aa)
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
      new Chapter().syn2Local(element)
    });
    tt.syn2Local(name, bookname, userid, st, data);
  }
  Charpter() {
    return this.toc.ChapterOjbList();
  }
  syn2Local(json) {
    let { charpter, toc } = json;
    let tt = new BookToc();
    let { name, bookname, userid, st, data } = toc
    // if (tt.st > st) {
    //   return
    // }
    charpter.forEach(element => {
      new Chapter().syn2Local(element)
    });
    tt.syn2Local(name, bookname, userid, st, data)
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
  md() {
    let tilte = "# " + window.$docsify.name;

    let content = this.Charpter().map((a) => {
      return a.md();
    });
    let styles = "<style>" + colorClassList.str() + "</style>";
    return [tilte]
      .concat([styles])
      .concat(content)
      .join("\n\n");
  }
}

import { classNameFromColor } from "./hl_mengshou";
// eslint-disable-next-line no-unused-vars
class BookToc {
  constructor() {
    this.bookname = window.$docsify.name;
    if (this.bookname == null || this.bookname == undefined) {
      this.bookname = window.location.hostname;
    }
    let bookname = this.bookname
    let userid = "userid"
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
    let aa = this.Charpters();
    for (let i in aa) {
      let c = aa[i];
      if (path == c.path) return c;
    }
  }
  addChapter(a) {
    let aa = this.Charpters();
    let { path } = a;
    if (this.findChapter(path) == undefined) {
      aa.push(a);
      this.save();
    }
    let { userid, bookname } = this;
    return JSON.stringify({ path, userid, bookname })
  }
  Charpters() {
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
export class LocalStore {
  constructor(path, title) {
    let bbb = new BookToc();
    this.key = bbb.addChapter({ path, title });
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
    let bbb = new BookToc();
    bbb.save();
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
        let { id, text: label, top, color } = hs;
        top = top.top;
        let textOffset = hs.startMeta.textOffset;
        return { idx, id, label, key, textOffset, top, color };
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
    let l = new LocalStore(path, title)
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
    let title = ["## 章节 " + this.label];
    let items = this.children.map((a, idx) => {
      let { label, color } = a;
      let hlyellow = classNameFromColor(color);
      let span =
        '    <span class="' + hlyellow + '">' + "    " + label + "    </span>";
      return (
        idx +
        1 +
        ". " +
        label.substring(0, Math.min(20, label.length)) +
        "\n\n" +
        span
      );
    });
    return title.concat(items).join("\n\n");
  }
}
String.prototype.hashCode = function () {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
export class book {
  constructor() {
    this.toc = new BookToc();
    this.name = this.toc.bookname;
    let aa = this.toc.name
    this.bookid = aa.hashCode()
  }
  Charpter() {
    let titlelist = this.toc.Charpters();
    return titlelist.map((data) => {
      let { path, title } = data;
      let store = new LocalStore(path, title);
      let c = new Chapter(store);
      return c;
    });
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
    let styles =
      "<style>" +
      ".hl_ul {" +
      "  border-bottom:2px solid red" +
      "}" +
      ".hlgreen {" +
      "  background-color: rgb(202, 233, 202);" +
      "}" +
      ".hlyellow {" +
      "  background-color: #ff9" +
      "}" +
      ".hlred {" +
      "  background-color: rgba(243, 49, 91, 0.219)" +
      "}" +
      "</style>";
    let tilte = "# " + window.$docsify.name;

    let content = this.Charpter().map((a) => {
      return a.md();
    });
    return [tilte]
      .concat([styles])
      .concat(content)
      .join("\n\n");
  }
}

import { Book } from "./store";

/* eslint-disable no-unused-vars */
export const AV = require("leancloud-storage");

class ObjectIdStore {
    constructor() {

        this.on = false;
        // eslint-disable-next-line no-debugger
        // debugger
        try {
            let { appId, appKey, serverURL } = window.$docsify.DocHighlighter.leancloud
            AV.init({
                appId,
                appKey,
                serverURL,
            });
            this.on = true
            // eslint-disable-next-line no-empty
        } catch (error) {
        }
        let bookname2objID = {};
        const objectid_store_key = "leancloud-bookname2objID";
        let data = localStorage.getItem(objectid_store_key);
        if (data) {
            bookname2objID = JSON.parse(data);
        }
        this.saveID = (name, id) => {
            bookname2objID[name] = id;
            localStorage.setItem(objectid_store_key, JSON.stringify(bookname2objID))
        }
        this.getId = (name) => { return bookname2objID[name]; }
    }
}
export const localidstore = new ObjectIdStore()
export async function downloadFromCloud() {
    return await loadeBookLeanCloud(new Book())
}


function bookClassName(bookOjbect) {
    let name = "Book" + bookOjbect.bookid;
    return name
}
export async function updateBookOnLean(book) {
    if (localidstore.on == false) return undefined;
    let bookName = bookClassName(book);
    let objectId = localidstore.getId(bookName)
    if (objectId == undefined) {
        return saveBook(book)
    } else {
        return updateBook(book, objectId)
    }
}
export async function loadeBookLeanCloud(book) {
    let data = await loadeBook(book)
    book.syn2Local(data)
    return true
}
export async function loadeBook(book) {
    if (localidstore.on == false) return undefined;
    let { name } = CreateBookClass(book);
    let objectId = localidstore.getId(name)
    if (objectId) {
        let a = await getBookRemoteID(book)
        return a[0].attributes;
    }
    const query = new AV.Query(name);
    let {toc} = book;
    let {userid} = toc
    query.equalTo("toc.userid", userid)
    query.descending('updatedAt');
    let a = await query.find();
    // console.log(a)
    return a[0].attributes;
}
async function updateBook(book, objectId) {
    let { bookOjbect, name, BookClass } = CreateBookClass(book);
    let { charpter } = bookOjbect.json()
    let updateObject = AV.Object.createWithoutData(name, objectId);
    updateObject.set("charpter", charpter)
    let ret = await updateObject.save();
    return ret;
}
async function saveBook(book) {
    let { bookOjbect, name, BookClass } = CreateBookClass(book);
    let json = bookOjbect.json()
    let bbb = new BookClass(json);
    let ret = await bbb.save();
    localidstore.saveID(name, ret.id)
    return ret;
}
function CreateBookClass(bookOjbect) {
    let name = bookClassName(bookOjbect)
    const BookClass = AV.Object.extend(name);
    return { BookClass, name: name, bookOjbect }
}

async function getBookRemoteID(book) {
    let { name } = CreateBookClass(book);
    const query = new AV.Query(name);
    query.limit(1)
    // query.equalTo("toc.userid", "userid")
    query.descending('createdAt');
    return query.find();
}
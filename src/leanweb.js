import { book } from "./store";

/* eslint-disable no-unused-vars */
const AV = require("leancloud-storage");

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
// import {book} from "store"
export function testPost() {
    testAsync().then((a) => {
        console.log(a)
    }).catch((b) => {
        console.log(b)
    })
}

async function newFunction() {
    const number = 2018;
    const string = `${number} 流行音乐榜单`;
    const date = new Date();
    const array = [string, number];
    const object = {
        number: number,
        string: string,
    };

    // 构建对象
    const TestObject = AV.Object.extend("TestObject");
    const testObject = new TestObject({ a: { b: 1 } });
    let a = await testObject.save();
    let objectId = a.id;
    let updateObject = AV.Object.createWithoutData('TestObject', objectId);
    updateObject.set("a.b", 2)
    a = await updateObject.save();
    return a
}
// const TestObject = AV.Object.extend("TestObjectxx");
// let aaaa = new TestObject([1]);
// aaaa.save().then(
//     (a) => {
//         console.log(a);
//     },
//     (b) => {
//         console.log(b);
//     }
// );
export async function testAsync() {
    var b = new book()
    var ret = await loadeBookLeanCloud(new book())
    console.log('test', ret)
    var content = await loadeBook(b)
    console.log('test', content)
    window.location.reload()
    return content
    // try {
    //     let a = await saveBook();
    //     let b = await getBookRemoteID();
    //     return b;
    // } catch (error) {
    //     console.log(error)
    // }
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
    query.equalTo("toc.userid", "userid")
    query.descending('createdAt');
    let a = await query.find();
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
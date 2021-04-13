import Panel from './components/Panel.vue'
import { log } from "./log";
import Vue from 'vue';
import { DocHighlighter } from './DocHighlighter';
import { mountCmp, pluginScript } from './utils';
import { getConfig } from './ANoteConfig';
import { Book, getChanged } from './store';
export function findtipid(id) {
    var tips = document.getElementsByClassName('note-menu');
    for (var i in tips) {
        var tip = tips[i];
        try {
            if (tip.id == id) return tip;
            // eslint-disable-next-line no-empty
        } catch (error) {
        }
    }
    return;
}

export function getIntersection(arrA, arrB) {
    const record = {};
    const intersection = [];
    arrA.forEach(i => record[i] = true);
    arrB.forEach(i => record[i] && intersection.push(i) && (record[i] = false));
    return intersection;
}

function runScrip() {
    let { enableScript } = getConfig().load();
    if (enableScript != true) return;
    let script = pluginScript()
    if (script.pre) {
        run(script.pre);
    } else {
        run(script)
    }
    function run(script) {
        if (script) {
            try {
                script();
                // eslint-disable-next-line no-empty
            } catch (error) {
            }
        }
    }
}
function hlinit() {
    runScrip()
    log("hlinit-" + document.location.href)
    if (window.hl) {
        window.hl.turnHighLight(false)
    }
    let hl = new DocHighlighter();
    window.hl = hl;
    var main = document.getElementsByClassName('content')[0]
    // eslint-disable-next-line no-unused-vars
    let { vm } = window;
    let { changeNumber } = getChanged()
    let count = hl.count()
    let checked = hl.on()
    let updated = Book.updated
    let seq = 0
    if (vm) {
        Vue.set(vm, "count", count);
        Vue.set(vm, "changeNumber", changeNumber);
        Vue.set(vm, "checked", checked);
        Vue.set(vm, "hl", hl);
        Vue.set(vm, "updated", updated);
        seq++;
        Vue.set(vm, "seq", seq);
    } else {
        vm = window.vm = mountCmp(Panel, { checked, count, hl, changeNumber, updated, seq }, main)
    }
    hl.updatePanelCb = () => {
        let { changeNumber, localNumber } = getChanged()
        Vue.set(vm, "count", hl.count());
        Vue.set(vm, "updated", Book.updated);
        changeNumber = new Book().count() - localNumber
        Vue.set(vm, "changeNumber", changeNumber);
        seq++;
        Vue.set(vm, "seq", seq);
        getConfig().save({ changeNumber })
    }
}
export default hlinit



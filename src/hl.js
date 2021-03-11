import Panel from './components/Panel.vue'
import { log } from "./log";
import Vue from 'vue';
import { DocHighlighter } from './DocHighlighter';
import { mountCmp } from './mountCmp';
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
function hlinit() {
    log("hlinit-"+document.location.href)
    if(window.hl){
        window.hl.turnHighLight(false)
    }
    let hl = new DocHighlighter();
    window.hl = hl;
    var main = document.getElementsByClassName('content')[0]
    // eslint-disable-next-line no-unused-vars
    let {vm} = window;
    if(vm){
        Vue.set(vm, "count",hl.count());
        Vue.set(vm, "checked",hl.on());
        Vue.set(vm, "hl",hl);
    }else{
        vm = window.vm = mountCmp(Panel, { checked: hl.on(),count:hl.count(),hl}, main)
    }
    hl.updatePanelCb=()=>{
        console.log("aaa",vm);
        Vue.set(vm, "count",hl.count());
    } 
}
export default hlinit



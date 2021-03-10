const hl_mengshou = "highlight-mengshou-wrap";
const hlyellow = "hlyellow";
const hlgreen = "hlgreen";
const hlred = "hlred";
const hl_ul = 'hl_ul'
export const hl_note = 'hl_note'
const hlList = [hlyellow, hlgreen, hlred, hl_ul]
let a = localStorage.getItem("colormap");


export let markColorList = [hl_mengshou].concat(hlList)
export class ColorClassCreate {
    constructor() {
        this.customcolorClassList = {}
        this.css = []
    }
    getClass(color, hex) {
        let colorvlaue = hex
        let { customcolorClassList } = this
        let idx = customcolorClassList[colorvlaue];
        if (idx ==undefined) {
            let classname = 'hl_custom_' + Object.keys(this.customcolorClassList).length;
            let css = `.${classname}{background-color:${hex}}`
            if (ul == color) {
                css = `.${classname}{border-bottom:2px solid ${hex}}`
            }
            customcolorClassList[colorvlaue] = classname
            this.css.push(css);
            return classname
        }
        return idx
    }
    str()
    {
        return this.css.join("\n")
    }
}
export const colorClassList = new ColorClassCreate()


const backgroundTemplate = (hlgreen, color) => {
    return `.${hlgreen} { background-color: ${color} ;}`
}


const ulTemplate = (hlgreen, color) => {
    return `.${hlgreen} { border-bottom:2px solid ${color} ;}`
}
export function colorString() {

}

let default_green = "#33FF33"
let default_red = "#ff336659"
let default_yellow = "#FFFF3355"
let default_ul = "red"
const hl_default_color = { hlred: default_red, hlgreen: default_green, hlyellow: default_yellow, hl_ul: default_ul }
let colorMap = {}
if (a) {
    colorMap = JSON.parse(a)
    for (let c in colorMap) {
        let a = colorMap[c]
        if (a && a.length) { continue }
        colorMap[c] = hl_default_color[c]
    }
    localStorage.setItem("colormap", JSON.stringify(colorMap))
} else {
    colorMap = JSON.parse(JSON.stringify(hl_default_color))
    localStorage.setItem("colormap", JSON.stringify(colorMap))
}
let str = hlList.map((a) => {
    if (a == hl_ul) {
        return ulTemplate(a, colorMap[a])
    }
    return backgroundTemplate(a, colorMap[a])
}).join("\n\n")
createStyleNode(str)

function createStyleNode(str) {
    var nod = document.createElement("style");
    nod.type = "text/css";
    if (nod.styleSheet) { //ie下  
        nod.styleSheet.cssText = str;
    } else {
        nod.innerHTML = str; //或者写成 nod.appendChild(document.createTextNode(str))  
    }
    document.getElementsByTagName("head")[0].appendChild(nod);
}

function getcsscolor(colorclassname) {
    let css = getCssRule('.' + colorclassname);
    if (css) {
        let a = css.style.borderBottomColor;
        if (a == undefined || a.length == 0)
            a = css.style.backgroundColor;
        return a
    }
    return ''
}
export function getcsscolorbyid(i) {
    return getcsscolor(hlList[i])
}
export function updateCssRule(color, color1) {
    let css = getCssRule(classNameFromColor(color))
    if (css) {
        if (css.style.borderBottomColor) {
            css.style.borderBottomColor = color1;
        } else if (css.style.backgroundColor) {
            css.style.backgroundColor = color1;
        }
        updateColorMap(color, color1);
    }
}
function updateColorMap(colornum, value) {
    let colorclass = hlList[colornum]
    colorMap[colorclass] = value
    localStorage.setItem("colormap", JSON.stringify(colorMap))
}

function getCssRule(className) {
    if (className == undefined) return
    if (className[0] != '.') {
        className = '.' + className
    }
    function find(i) {
        var classes = document.styleSheets[i].rules || document.styleSheets[i].cssRules;
        for (var x = 0; x < classes.length; x++) {
            if (classes[x].selectorText == className) {
                return classes[x];
                // cssText += classes[x].cssText || classes[x].style.cssText;
            }
        }
        return;
    }
    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            let a = find(i);
            if (a) return a;
            // eslint-disable-next-line no-empty
        } catch (error) {
        }
    }
}
window.getCssRule = getCssRule;

export const classNameFromColor = (color) => {
    return hlList[color]
}
export const hasHighlightColor = ($ele) => {
    let found = false;
    [hlyellow, hlgreen, hlred].forEach((a) => {
        if (found) return
        found = $ele.className.indexOf(a) >= 0;
    });
    return found;
}
export const markColorListForSelection = hlList


export const yellow = hlList.indexOf(hlyellow)
export const red = hlList.indexOf(hlred)
export const green = hlList.indexOf(hlgreen)
export const ul = hlList.indexOf(hl_ul)
export const customColor = ul + 1


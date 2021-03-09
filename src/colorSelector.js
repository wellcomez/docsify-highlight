const hl_mengshou = "highlight-mengshou-wrap";
const hl_yellow = "hlyellow";
const hl_green = "hlgreen";
const hl_red = "hlred";
const hl_ul = 'hl_ul'
const hlList = [hl_yellow, hl_green, hl_red, hl_ul]
let a = localStorage.getItem("colormap");
let str = ".hl_ul {border-bottom:2px solid red}.hlgreen {background-color:#33FF33}.hlyellow {background-color:#FFFF3355}.hlred {background-color:#ff336659}"

var nod = document.createElement("style");
nod.type="text/css";  
if(nod.styleSheet){         //ie下  
    nod.styleSheet.cssText = str;  
} else {  
    nod.innerHTML = str;       //或者写成 nod.appendChild(document.createTextNode(str))  
}  
document.getElementsByTagName("head")[0].appendChild(nod); 
let colorMap = {}
if (a) {
    colorMap = JSON.parse(a)
    for (let c in colorMap) {
        let css = getCssRule('.' + c)
        if(css==undefined)continue
        let color = colorMap[c]
        if (color == undefined||color.length==0) {
            colorMap[c] = getcsscolor(c)
        }
        if (c == hl_ul) {
            css.style.borderBottomColor = colorMap[c]
        } else {
            css.style.backgroundColor = colorMap[c]
        }
    }
} else {
    for (let i in hlList) {
        let c = hlList[i];
        colorMap[c] = getcsscolor(c);
        updateColorMap(i, colorMap[c])
    }
}
function getcsscolor(colorclassname) {
    let css = getCssRule('.' + colorclassname);
    if (css) {
        let a = css.style.borderBottomColor;
        if (a == undefined||a.length==0)
            a = css.style.backgroundColor;
        return a
    }
}

export function updateColorMap(colornum, value) {
    let colorclass = hlList[colornum]
    colorMap[colorclass] = value
    localStorage.setItem("colormap", JSON.stringify(colorMap))
}
// a.style.borderBottom="2px solid red"
// a.style.backgroundColor="yellow"
export const colorFromClassName = (classname) => {
    if (classname.indexOf(hl_mengshou) >= 0) return undefined;
    for (let i = 0; i < hlList.length; i++) {
        let a = hlList[i];
        if (classname.indexOf(a) >= 0) return i;
    }
    return;
}
export function getCssRule(className = ".hlred") {
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
    [hl_yellow, hl_green, hl_red].forEach((a) => {
        if (found) return
        found = $ele.className.indexOf(a) >= 0;
    });
    return found;
}
export const markColorList = [hl_mengshou].concat(hlList)
export const markColorListForSelection = hlList


export const yellow = hlList.indexOf(hl_yellow)
export const red = hlList.indexOf(hl_red)
export const green = hlList.indexOf(hl_green)
export const ul = hlList.indexOf(hl_ul)



const backgroundTemplate = (hlgreen, color) => {
    return `.${hlgreen} { background-color: ${color} ;}`
}


const ulTemplate = (hlgreen, color) => {
    return `.${hlgreen} { border-bottom:2px solid ${color} ;}`
}
export const colorString = () => {
    let a = hlList.map((a) => {
        if (a == hl_ul) {
            return ulTemplate(a, colorMap[a])
        }
        return backgroundTemplate(a, colorMap[a])
    })
    return a.join("\n\n")
}

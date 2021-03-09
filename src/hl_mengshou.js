const hl_mengshou = "highlight-mengshou-wrap";
const hl_yellow = "hlyellow";
const hl_green = "hlgreen";
const hl_red = "hlred";
const hl_ul = 'hl_ul'
const hlList = [hl_yellow,hl_green,hl_red,hl_ul]
export const colorFromClassName = (classname) => {
    if(classname.indexOf(hl_mengshou)>=0)return undefined;
    for(let i=0;i<hlList.length;i++){
        let a = hlList[i];
        if(classname.indexOf(a)>=0)return i;
    }
    return ;
}
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
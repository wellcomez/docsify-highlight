export const hl_note = 'hl_note'


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
            if (tUl == color) {
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









export const tUl = 1
export const tfontColor =0
export const tBackgroundColor = 2


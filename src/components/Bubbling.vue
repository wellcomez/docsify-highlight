<template>
  <div class="bubbing">
    <SvgButton v-bind:onClick="onClickBtn" name="ios-download" tips="Export" />
    <div class="wrapper" v-if="expanded">
      <ul>
        <!-- 一级列表 -->
        <li v-for="(item, index) of list" :key="index">
          <a href="#" @click="onOption($event, item.name)">{{ item.name }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { checkClickOut } from "../mountCmp";
export default {
  name: "Bubbling",
  data() {
    return {
      list: [
        {
          name: "json",
        },
        {
          name: "md",
        },
      ],
      expanded: false,
    };
  },
  computed: {
    // expanded() {
    //   try {
    //     return document.getElementsByClassName("selected").length > 0;
    //   } catch (error) {
    //     return false;
    //   }
    // },
  },
  mounted() {
    let d = document.getElementsByClassName("bubbing")[0];
    checkClickOut(d, () => {
      // this.closeButtons();
    });
  },
  props: {
    content: {
      type: String,
      default: "btn",
    },
    onSelect: {
      type: Function,
      default: undefined,
    },
    //  expanded: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  methods: {
    closeButtons() {
      document.getElementsByClassName("selected").forEach((a) => {
        a.classList.remove("selected");
      });
      this.expanded = false;
    },
    onClickBtn(e) {
      if (e == undefined) return;
      let self;
      let el = e.target;
      // eslint-disable-next-line no-constant-condition
      while(true){
        if(el&&el.parentElement){
          if(el.parentElement.classList.contains("bubbing")){
            self =el;
            break;
          }
        }else{
          break;
        }
        el = el.parentElement;
      }
      if (self == undefined) return;
      if (self.classList.contains("selected")) {
        self.classList.remove("selected");
      } else {
        self.classList.add("selected");
      }
      this.expanded = self.classList.contains("selected");
    },
    onOption(e, name) {
      // console.log(e);
      if (this.onSelect) {
        this.onSelect(name);
      }
      this.closeButtons();
    },
  },
};
</script>

<style scoped>
ul {
  list-style: none;
}
a {
  width: 30px;
  height: 30px;
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
  text-decoration: none;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  display: none; /*默认所有的a都不显示*/
  text-decoration: none;
  color: #333;
  transition: all 1s ease;
  box-shadow: 0 0 15px #222;
  font-family: "segoe ui";
  font-weight: 200;
  font-size: 8px;
}
.wrapper {
  width: 100%;
  height: 100%;
  /* display: flex; */
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 9999;
}
a.show {
  display: flex !important; /*因为开始设置了a标签为none，这里重置display可以让他显示*/
}
/*对所有的li标签加动画效果*/
.wrapper li {
  -webkit-transform: translate3d(0, 0, 0); /*调用GPU提升动画性能*/
  transform: translate3d(0, 0, 0);
  transition: all 1s ease;
  /*下面的方法好像也可以提升性能，具体并没有比较*/
  /* backface-visibility: hidden;
    perspective: 1000; */
}
/*设置选中样式*/
.selected {
  background: var(--theme-color, #42b983);
  display: flex;
  /*调整中心圆形的位置*/
  top: calc(50% - 12px);
  left: calc(50% - 15px);
  color: #f1f1f1;
  animation: light 1s infinite;
}
/*让当前选中的子集列表显示*/
.selected + div > ul > li > a {
  /*让当前选中的子选项显示，因为默认是 display:none*/
  display: flex;
}
/*设置 li 的位置，rotate是顺/逆时针旋转，translateX是沿x轴平移*/
.selected + div > ul > li:nth-child(1) {
  -webkit-transform: translateX(0px);
  transform: translateX(0px);
}
/*设置a标签内字体的位置，应为容器旋转后，字体倾斜了，需要调整回来*/
/*这里有一个小技巧：字体的旋转角度正好和外部容器的旋转角度相反，但是最后一个的位置需要调整*/
.selected + div > ul > li:nth-child(1) > a {
  -webkit-transform: rotate(0deg);
  transform: rotate(0deg);
}

.selected + div > ul > li:nth-child(2) {
  -webkit-transform: translateX(40px);
  transform: translateX(40px);
}
/* .selected + div > ul > li:nth-child(2) > a {
  -webkit-transform: rotate(0deg);
  transform: rotate(0deg);
} */

.selected + div > ul > li:nth-child(3) {
  -webkit-transform: rotate(40deg) translateX(40px);
  transform: rotate(40deg) translateX(40px);
}
.selected + div > ul > li:nth-child(3) > a {
  -webkit-transform: rotate(-40deg);
  transform: rotate(-40deg);
}

.selected + div > ul > li:nth-child(4) {
  -webkit-transform: rotate(120deg) translateX(30px);
  transform: rotate(120deg) translateX(30px);
}
.selected + div > ul > li:nth-child(4) > a {
  -webkit-transform: rotate(-120deg);
  transform: rotate(-120deg);
}
.selected + div > ul > li:nth-child(5) {
  -webkit-transform: rotate(180deg) translateX(30px);
  transform: rotate(180deg) translateX(30px);
}
.selected + div > ul > li:nth-child(5) > a {
  -webkit-transform: rotate(180deg);
  transform: rotate(180deg);
}
</style>
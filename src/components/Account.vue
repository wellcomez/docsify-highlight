/* eslint-disable no-unused-vars */
<template>
  <Card v-if="open==false">
    <Avatar size="large" shape="circle" :class="avatarStyle"></Avatar>
    <br /><span>{{ name }}</span>
    <Button type="text" @click="onYes">{{ btnTitle }}</Button>
    <!-- <Button type="text" @click="onSign"> 注册</Button> -->
  </Card>
  <Login v-else :open.sync="open" />
</template>
<script>
/* eslint-disable vue/no-unused-components */
// function save(a)
import { Modal, Avatar } from "iview";
import { User } from "../UserLogin";
import Login from "./Login";
export default {
  components: { Modal, Avatar, Login },
  data() {
    return {
      name: "默认用户",
      shortname: "默",
      inputValue: "",
      btnTitle: "",
      title: "",
      open: false,
      dialogid: false,
      avatarStyle: this.getAvatarStyle(),
    };
  },
  mounted() {
    // eslint-disable-next-line no-unused-vars
    let checkUserLogin = ({ old, next, error }, change) => {
      if (change) {
        let yes = User.isLogin();
        this.avatarStyle = this.getAvatarStyle();
        let userid = User.getUsername();
        if (yes) {
          this.name = userid;
        } else {
          this.name = "未登录";
        }
        this.shortname = this.name[0];
        this.title = this.btnTitle = yes ? "注销" : "登入";
      }
    };
    User.addCallback(checkUserLogin);
    checkUserLogin({}, true);
  },
  methods: {
    onYes() {
      if (User.isLogin() == false) {
        // this.dialogid = new Date() * 1;
        this.open = true;
      } else {
        User.Login({});
      }
    },
    getAvatarStyle() {
      let color = User.isLogin() ? "login" : "logout";
      return color;
    },
  },
};
</script>
<style scoped>
.login {
  color: white;
  background-color: var(--theme-color, #42b983);
}
.logout {
  color: black;
  background-color: gainsboro;
}
</style>
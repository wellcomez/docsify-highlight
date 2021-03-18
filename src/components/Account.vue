/* eslint-disable no-unused-vars */
<template>
  <Card>
    <Avatar size="large" shape="circle" :class="avatarStyle"></Avatar>
    <br /><span>{{ name }}</span>
    <Button type="text" @click="onYes">{{ btnTitle }}</Button>
    <Login :open.sync="open" />
    <!-- <Button type="text" @click="onSign"> 注册</Button> -->
  </Card>
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
    let checkUserLogin = (old, next, change) => {
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
    User.register(checkUserLogin);
    checkUserLogin(undefined, undefined, true);
  },
  methods: {
    onYes() {
      if (User.isLogin() == false) {
        // this.dialogid = new Date() * 1;
        this.open = true;
      } else {
        User.Login(undefined);
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
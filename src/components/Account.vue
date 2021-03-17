<template>
  <Poptip confirm :title="title" @on-ok="onYes" ok-text="yes" cancel-text="no">
    <Avatar shape="square" :class="avatarStyle" icon="ios-person" />
  </Poptip>
</template>
<script>
import { Avatar } from "iview";
import { User } from "../store";
export default {
  components: {
    Avatar,
  },
  data() {
    return {
      disabled: true,
      title: "",
      login: false,
      avatarStyle: this.getAvatarStyle(),
    };
  },
  mounted() {
    let checkUserLogin = (old, next, change) => {
      if (change) {
        this.login = User.isLogin();
        this.avatarStyle = this.getAvatarStyle();
        if (User.isLogin()) {
          this.disabled = false;
        }
        this.disabled = User.isLogin() ? false : true;
        this.title = this.login ? "登出" : "登入";
      }
    };
    User.register(checkUserLogin);
    checkUserLogin();
  },
  methods: {
    onYes() {
      if (User.isLogin() == false) User.Login("xxxx");
      else {
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
  background-color: white;
  color: var(--theme-color, #42b983);
}
.logout {
  background-color: gainsboro;
}
</style>
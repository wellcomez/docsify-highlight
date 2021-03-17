<template>
  <Poptip
    confirm
    :title="title"
    @on-ok="onYes"
    ok-text="yes"
    cancel-text="no"
    :disabled="disabled"
  >
    <Button
      shape="circle"
      :class="avatarStyle"
      icon="ios-person"
      @click="onClick"
    />
  </Poptip>
</template>
<script>
// import { Avatar } from "iview";
import { User } from "../store";
export default {
  components: {
    // Avatar,
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
    let stateChange = () => {
      this.login = User.isLogin();
      this.avatarStyle = this.getAvatarStyle();
      if(User.isLogin()){
          this.disabled = false;
      }
      this.disabled = User.isLogin() ? false : true;
      this.title = this.login?"登出":"登入";
    };
    User.stateChange = stateChange;
    stateChange();
  },
  methods: {
    onYes() {},
    onClick() {
      if (User.isLogin() != true) User.Login("xxxx");
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
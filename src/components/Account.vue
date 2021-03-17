<template>
  <Poptip confirm :title="title" @on-ok="onYes" ok-text="yes" cancel-text="no">
    <Tooltip :content="name" placement="top-start">
      <Avatar shape="square" :class="avatarStyle" icon="ios-person" />
    </Tooltip>
  </Poptip>
</template>
<script>
import { Avatar, Modal } from "iview";
import { User } from "../store";
export default {
  components: {
    Avatar,
  },
  data() {
    return {
      name: "默认用户",
      inputValue: "",
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
        this.name = next;
        this.disabled = User.isLogin() ? false : true;
        this.title = this.login ? "登出" : "登入";
      }
    };
    User.register(checkUserLogin);
    checkUserLogin();
  },
  methods: {
    handleRender() {
      let vvv;
      Modal.confirm({
        // eslint-disable-next-line no-unused-vars
        onOk: (a, b) => {
          User.Login(vvv);
        },
        render: (h) => {
          return h("Input", {
            props: {
              value: this.value,
              autofocus: true,
              placeholder: "Please enter your name...",
            },
            on: {
              input: (val) => {
                vvv = val;
              },
            },
          });
        },
      });
    },
    onYes() {
      if (User.isLogin() == false) {
        this.handleRender();
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
  background-color: white;
  color: var(--theme-color, #42b983);
}
.logout {
  background-color: gainsboro;
}
</style>
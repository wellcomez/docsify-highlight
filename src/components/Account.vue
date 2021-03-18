<template>
  <Row align="bottom" type="flex">
    <Col>
      <Tooltip :content="name" placement="top-start">
        <Avatar shape="circle" :class="avatarStyle"></Avatar>
      </Tooltip>
    </Col>
    <Col>
      <span>{{ name }}</span>
    </Col>
    <Col>
      <Button type="text" @click="onYes">{{ btnTitle }}</Button>
    </Col>
  </Row>
</template>
<script>
function load() {
  let { avatarcomplete } = getConfig().load();
  if (avatarcomplete) {
    return avatarcomplete;
  }
  return [];
}
function save(a) {
  if (a && a.length) {
    let avatarcomplete = load();
    if (avatarcomplete.indexOf(a) >= 0) return;
    avatarcomplete.push(a);
    getConfig().save({ avatarcomplete });
  }
}
import { Avatar, Modal, AutoComplete } from "iview";
import { User } from "../store";
import { getConfig } from "../ANoteConfig";
export default {
  components: {
    Avatar,
  },
  data() {
    return {
      name: "默认用户",
      shortname: "默",
      inputValue: "",
      disabled: true,
      btnTitle: "",
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
        if (next) {
          this.name = next;
        } else {
          this.name = "默认用户";
        }
        this.shortname = this.name[0];
        this.disabled = User.isLogin() ? false : true;
        this.title = this.login ? this.name + "登出" : "登入";
        this.btnTitle = this.login ? "注销" : "登入";
      }
    };
    User.register(checkUserLogin);
    checkUserLogin(undefined, undefined, true);
  },
  methods: {
    handleRender() {
      let vvv;
      let data = load();
      Modal.confirm({
        // eslint-disable-next-line no-unused-vars
        onOk: (a, b) => {
          User.Login(vvv);
          save(vvv);
        },
        render: (h) => {
          return h(AutoComplete, {
            props: {
              value: this.value,
              autofocus: true,
              data: data,
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
  color: white;
  background-color: var(--theme-color, #42b983);
}
.logout {
  color: black;
  background-color: gainsboro;
}
</style>
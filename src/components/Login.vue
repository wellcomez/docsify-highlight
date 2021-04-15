<template>
  <div v-if="showme" style="padding: 4px" class="login-panel">
    <Tabs v-model="tabname">
      <TabPane
        v-for="({ label, name }, index) in tabusername"
        :label="label"
        :key="index"
        :name="name"
      >
        <Form label-position="left">
          <FormItem prop="user">
            <Input type="text" v-model="user" placeholder="Username">
              <Icon type="ios-person-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem prop="password">
            <Input type="password" v-model="password" placeholder="Password">
              <Icon type="ios-lock-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem>
            <Button type="primary" v-if="index == 0" @click="onOk"
              >Submit</Button
            >
            <Button type="primary" v-else @click="onOk">Login</Button>
            <Button style="margin-left: 8px" @click="cancel">Cancel</Button>
          </FormItem>
        </Form>
      </TabPane>
    </Tabs>
  </div>
</template>
<style>
.login-panel input {
  font-size: 16px;
}
.radio-login-type {
  /* position: relative; */
  /* top:5px; */
  float: right;
}
</style>

<script>
/* eslint-disable vue/no-unused-components */
import { Modal, Message } from "iview";
import { User } from "../UserLogin";
export default {
  components: { Modal },
  data() {
    return {
      user: "",
      password: "",
      tabname: "1",
      disableReqCode: false,
      bywhat: "byphone",
      tm: undefined,
      btn_code_title: "获取验证码",
      tabusername: [
        { label: "注册", name: "0" },
        { label: "登录", name: "1" },
      ],
    };
  },
  model: {
    prop: "open",
  },
  props: {
    open: { type: Boolean, default: undefined },
  },
  computed: {
    loginbyphone() {
      return this.bywhat == "byphone";
    },
    showme() {
      return User.isLogin() == false && this.open;
    },
  },
  methods: {
    cancel() {
      this.$emit("update:open", false);
    },
    onOk() {
      let { user, password } = this;
      let a = ({ error }) => {
        if (error) {
          let { rawMessage } = error;
          Message.error(rawMessage);
        }
        User.addCallback(a, true);
      };
      User.addCallback(a);
      if (this.tabname == "0") {
        User.newUser(user, password);
      } else {
        let username = user;
        User.Login({ username, password });
      }
      this.open = false;
      this.$emit("update:open", false);
    },
  },
  prop: { open: { type: Boolean, default: false } },
};
</script>


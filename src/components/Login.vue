<template>
  <div v-if="showme" style="padding: 4px" class="login-panel">
    <Form label-position="left" inline v-if="loginbyphone">
      <FormItem prop="phonenumber">
        <Input type="tel" v-model="phonenumber" placeholder="手机号">
          <Icon type="ios-person-outline" slot="prepend"></Icon>
        </Input>
      </FormItem>
      <FormItem prop="verifycode">
        <Row>
          <Col span="16">
            <Input type="text" v-model="verifycode" placeholder="验证码">
              <Icon type="ios-lock-outline" slot="prepend"></Icon>
            </Input>
          </Col>
          <Col span="4" offset="1">
            <Button @click="onRequestCode" :disabled="disableReqCode">{{
              btn_code_title
            }}</Button>
          </Col>
        </Row>
      </FormItem>
      <FormItem>
        <Button type="primary" @click="onOk">Login</Button>
        <Button style="margin-left: 8px" @click="cancel">Cancel</Button>
      </FormItem>
    </Form>
    <Tabs v-model="tabname" v-else>
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
    <RadioGroup v-model="bywhat" class="radio-login-type">
      <Radio label="byphone">手机</Radio>
      <Radio label="byname">用户名</Radio>
    </RadioGroup>
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
  mounted() {},
  computed: {
    loginbyphone() {
      return this.bywhat == "byphone";
    },
    showme() {
      return User.isLogin() == false && this.open;
    },
  },
  watch: {
    disableReqCode(val) {
      if (val == false) {
        this.btn_code_title = "获取验证码";
      }
    },
  },
  methods: {
    waifforCode() {
      this.disableReqCode = true;
      let cout = 0;
      let reEanble = () => {
        cout++;
        if (cout < 60) {
          let left = 60 - cout;
          this.btn_code_title = `剩余(${left})`;
          return;
        }
        if (this.tm) {
          clearInterval(this.tm);
          this.tm = undefined;
        }
        this.disableReqCode = false;
      };
      reEanble = reEanble.bind(this);
      this.tm = setInterval(reEanble, 1000);
      reEanble();
    },
    onRequestCode() {
      if (this.phonenumber) {
        if (this.phonenumber[0] != "+") {
        //   this.phonenumber = "+" + this.phonenumber;
        }
        User.requestcode(this.phonenumber)
          // eslint-disable-next-line no-unused-vars
          .then((a) => {
            this.waifforCode();
          })
          .catch((e) => {
            Message.error(e.rawMessage);
          });
      }
    },
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
        User.register(a, true);
      };
      User.register(a);
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


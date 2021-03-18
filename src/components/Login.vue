<template>
  <Modal v-model="open" @on-ok="onOk" @on-cancel="cancel">
    <Tabs v-model="tabname">
      <TabPane label="注册" name="0">
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
        </Form>
      </TabPane>
      <TabPane label="登录" name="1">
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
        </Form>
      </TabPane>
    </Tabs>
  </Modal>
</template>
<script>
import { Modal } from "iview";
import { User } from "../UserLogin";
export default {
  components: { Modal },
  data() {
    return {
      user: "",
      password: "",
      tabname: "1",
    };
  },
  watch: {},
  model: {
    prop: "open",
  },
  props: {
    open: { type: Boolean, default: undefined },
  },
  mounted() {},
  methods: {
    cancel() {
      this.$emit("update:open", false);
    },
    onOk() {
      let { user, password } = this;
      if (this.tabname == "0") {
        User.newUser(user, password);
      } else {
        User.Login(user, password);
      }
      this.open = false;
      this.$emit("update:open", false);
    },
  },
  prop: { open: { type: Boolean, default: false } },
};
</script>

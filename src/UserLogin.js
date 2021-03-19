/* eslint-disable no-unused-vars */
/* eslint-disable no-debugger */
/* eslint-disable no-empty */
import { getConfig } from "./ANoteConfig";
import { AV } from "./leanweb"
export class UserLogin {
  getUsername() {
    try {
      const currentUser = AV.User.current();
      return currentUser.getUsername()
    } catch (error) {
      return 'userid'
    }
  }
  newUser(username, password) {
    let { userid, stateChange } = this;
    let old = userid
    let next = username
    this._signUp(username, password).then(() => {
      userLoginCallbackPost(stateChange, { old, next })
    }).catch((error) => {
      userLoginCallbackPost(stateChange, { old, next, error })
      console.error(error);
    })
  }
  constructor() {
    this._signUp = async (username, password) => {
      const user = new AV.User();
      user.setUsername(username);
      user.setPassword(password);
      await user.signUp();
      return AV.User.current().getUsername()
    }
    this._login = async (username, password) => {
      await AV.User.logIn(username, password);
      return AV.User.current().getUsername()
    }

    this.stateChange = [];
    this.userid = this.getUsername()
  }
  requestcode = async (phone) => {
    AV.User.requestLoginSmsCode(phone);
  }
  register(fn, removce) {
    if (removce) {
      let a = [];
      this.stateChange.forEach((b) => {
        if (fn == b)
          return;
        a.push(b);
      });
      this.stateChange = a;
      return;
    }
    this.stateChange.push(fn);
  }
  save(username) {
    let userid = username;
    getConfig().save({ userid });
  }

  Login({ username, password, phone }) {
    if (phone) {
      return
    }
    let { userid, stateChange } = this;
    let old = userid
    let next = username
    stateChange.forEach((a) => {
      try {
        a({ old, next }, false);
        // eslint-disable-next-line no-empty
      } catch (error) {
      }
    });
    if (username == undefined) {
      AV.User.logOut();
      userLoginCallbackPost(stateChange, { old, next });
      return;
    }
    this._login(username, password).then(() => {
      userLoginCallbackPost(stateChange, { old, next });
    }).catch((error) => {
      userLoginCallbackPost(stateChange, { old, next, error });
    })
  }
  isLogin() {
    // debugger
    const currentUser = AV.User.current();
    return currentUser ? true : false;
  }
}
export let User = new UserLogin();
function userLoginCallbackPost(stateChange, data) {

  stateChange.forEach((a) => {
    try {
      a(data, true);
    } catch (error) {
    }
  });
}


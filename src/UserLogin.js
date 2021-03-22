import { getConfig } from "./ANoteConfig";
import { AV } from "./leanweb"
export class UserLogin {
  static defaultUser = 'userid'
  getUsername() {
    try {
      const currentUser = AV.User.current();
      let us = currentUser.getUsername()
      if (us) return us
      return UserLogin.defaultUser
    } catch (error) {
      return UserLogin.defaultUser
    }
  }
  newUser(username, password) {
    let { stateChange } = this;
    let old = this.getUsername()
    let next = username
    this._signUp(username, password).then(() => {
      userLoginCallbackPost(stateChange, { old, next })
    }).catch((error) => {
      userLoginCallbackPost(stateChange, { old, next, error })
      console.error(error);
    })
  }
  constructor() {
    this.stateChange = [];


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
  }
  requestcode = async (phone) => {
    AV.User.requestLoginSmsCode(phone);
  }
  addCallback(fn, removce) {
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
    getConfig().save({ userid: username });
  }
  Login({ username: next, password, phone }) {
    if (phone) {
      return
    }
    let { stateChange } = this;
    let old = this.getUsername()
    stateChange.forEach((a) => {
      try {
        a({ old, next }, false);
        // eslint-disable-next-line no-empty
      } catch (error) {
      }
    });
    AV.User.logOut();
    if (next == undefined) {
      userLoginCallbackPost(stateChange, { old, next });
      return;
    }
    this._login(next, password).then(() => {
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
      // eslint-disable-next-line no-empty
    } catch (error) {
    }
  });
}

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
    this._signUp(username, password).then(() => {
      userLoginCallbackPost(stateChange, userid,)
    }).catch((e) => {
      console.error(e);
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
  // eslint-disable-next-line no-unused-vars

  Login(username, password) {
    let { userid, stateChange } = this;
    stateChange.forEach((a) => {
      try {
        a(userid, username, false);
        // eslint-disable-next-line no-empty
      } catch (error) {
      }
    });
    if (username == undefined) {
      AV.User.logOut();
      userLoginCallbackPost(stateChange, userid, undefined);
      return;
    }
    this._login(username, password).then(() => {
      userLoginCallbackPost(stateChange, userid, username);
    }).catch((error) => {
      console.error(error);
    })
  }
  isLogin() {
    // debugger
    const currentUser = AV.User.current();
    return currentUser ? true : false;
  }
}
export let User = new UserLogin();
function userLoginCallbackPost(stateChange, userid, username) {
  stateChange.forEach((a) => {
    try {
      a(userid, username, true);
      // eslint-disable-next-line no-empty
    } catch (error) {
    }
  });
}


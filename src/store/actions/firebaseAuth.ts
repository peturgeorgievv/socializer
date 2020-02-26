import { auth } from '../../config/authService';
import firebase from '../../config/firebaseService';
import { LOGIN_SUCCESS, REGISTER_SUCCESS, FETCH_USER, LOGOUT } from './types';

export const loginSuccess = (): any => {
  return {
    type: LOGIN_SUCCESS,
    currentUser: auth?.currentUser?.toJSON(),
  }
}

export const registerSuccess = (): any => {
  return {
    type: REGISTER_SUCCESS,
    currentUser: auth?.currentUser?.toJSON(),
  }
}

export const register = (email: any, password: any) => async (dispatch: (arg0: { type: string; currentUser: any; }) => any) => {
  try {
    await auth.createUserWithEmailAndPassword(email, password)
    return dispatch(registerSuccess())
  } catch (error) {
    throw error
  }
}

export const login = (email: any, password: any) => async (dispatch: (arg0: { type: string; currentUser: any; }) => void) => {
  try {
    await auth.signInWithEmailAndPassword(email, password)
    dispatch(loginSuccess())
  } catch (error) {
    throw error
  }
}


export const logout = () => async (dispatch: (arg0: { type: string; currentUser: any; }) => void) => {
  try {
    await auth.signOut()
    dispatch({ type: LOGOUT, currentUser: auth.currentUser })
  } catch (error) {
    throw error
  }
}

export const fetchUser = () => async (dispatch: (arg0: { type: string; currentUser: {} | null; }) => void) => {
  try {
    await auth.onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        let currentUserData: any = {};
        // @ts-ignore
        localStorage.setItem("isAuthenticated", true);
        firebase
          .firestore()
          .collection('users')
          .where('uid', '==', currentUser.uid)
          .onSnapshot((querySnapshot: any) => {
            querySnapshot.forEach((element: { data: () => {}; }) => {
              currentUserData = element.data();
            })
            dispatch({
              type: FETCH_USER,
              currentUser: currentUserData,
            })
          });
      } else {
        localStorage.removeItem("isAuthenticated")
        dispatch({
          type: FETCH_USER,
          currentUser: null,
        })
      }
    })
  } catch (error) {
    throw error
  }
}
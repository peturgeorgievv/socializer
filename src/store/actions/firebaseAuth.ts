import { auth } from '../../config/authService';
import firebase from '../../config/firebaseService';
import { LOGIN_SUCCESS, REGISTER_SUCCESS, FETCH_USER, LOGOUT, FETCH_USER_START } from './types';
import { COLLECTION } from '../../constants/firebase-collections.constants';

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

export const register = (email: string, password: string) => async (dispatch: (arg0: { type: string; currentUser: any; }) => any) => {
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


export const logout = () => async (dispatch: any) => {
  try {
    await auth.signOut()
    dispatch({ type: LOGOUT, currentUser: auth.currentUser })
  } catch (error) {
    throw error
  }
}

export const fetchUser = () => async (dispatch: any) => {
  try {
    dispatch({
      type: FETCH_USER_START,
      isLoading: true,
    })
    await auth.onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        let currentUserData: any = {};
        // @ts-ignore
        localStorage.setItem("isAuthenticated", true);
        firebase
          .firestore()
          .collection(COLLECTION.users)
          .where('uid', '==', currentUser.uid)
          .onSnapshot((querySnapshot: any) => {
            querySnapshot.forEach((element: { data: () => {}; }) => {
              currentUserData = element.data();
            })
            dispatch({
              type: FETCH_USER,
              currentUser: currentUserData,
              isLoading: false,
            })
          });
      } else {
        localStorage.removeItem("isAuthenticated")
        dispatch({
          type: FETCH_USER,
          currentUser: null,
          isLoading: false
        })
      }
    })
  } catch (error) {
    throw error
  }
}
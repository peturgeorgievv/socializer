import firebase from 'firebase/app';
import 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';

!firebase.apps.length && firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()

const getAuthenticationStatus = () => {
  return localStorage.getItem("isAuthenticated")
}

export { auth, getAuthenticationStatus }
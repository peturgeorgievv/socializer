import currentUser from './authReducer'
import imgData from './firebaseImagesReducer';
import { combineReducers } from 'redux'

const combinedReducers = combineReducers({
  currentUser,
  imgData,
});

export default combinedReducers;
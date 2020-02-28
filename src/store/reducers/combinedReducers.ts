import currentUser from './authReducer'
import imgData from './firebaseImagesReducer';
import { combineReducers } from 'redux'
import { reducer as toastrReducer } from 'react-redux-toastr';

const combinedReducers = combineReducers({
  currentUser,
  imgData,
  toastr: toastrReducer
});

export default combinedReducers;
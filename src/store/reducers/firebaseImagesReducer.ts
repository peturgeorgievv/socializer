import { GET_USER_POSTS } from '../actions/types';

const firebaseImagesReducer = (state = null, action: any) => {
  switch (action.type) {
    case GET_USER_POSTS:
      return action.imgData;
    default:
      return state;
  }
}

export default firebaseImagesReducer;
import { auth } from '../../config/authService';
import firebase from '../../config/firebaseService';
import { GET_USER_POSTS } from './types';

export const getUserPosts = () => async (dispatch: any) => {
  try {
    await auth.onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        let imgData: { key: any; imgUrl: any; status: any; uploadedBy: any; }[] = [];
        firebase.firestore()
          .collection('posts')
          .where('uploadedBy', '==', currentUser.uid)
          .onSnapshot((querySnapshot: any) => {
            imgData = [];
            querySnapshot.forEach((image: { data: () => { imgUrl: any; status: any; uploadedBy: any; }; id: any; }) => {
              const { imgUrl, status, uploadedBy } = image.data();
              imgData.push({
                key: image.id,
                imgUrl,
                status,
                uploadedBy,
              })
            })
            dispatch({
              type: GET_USER_POSTS,
              imgData,
            })
          });
     } else {
        dispatch({
          type: GET_USER_POSTS,
          imgData: null,
        })
     }
    });
  } catch (error) {
    throw error;
  }
}

import { LOGIN_SUCCESS, REGISTER_SUCCESS, LOGOUT, FETCH_USER, FETCH_USER_START } from '../actions/types'

const authReducer = (state = {}, action: any) => {
  console.log(action);
  switch (action.type) {
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
    case LOGOUT:
    case FETCH_USER:
      return action.currentUser
    case FETCH_USER_START:
      return action.currentUser
    default:
      return state
  }
}

export default authReducer;
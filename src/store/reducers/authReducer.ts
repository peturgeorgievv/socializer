import { LOGIN_SUCCESS, REGISTER_SUCCESS, LOGOUT, FETCH_USER, FETCH_USER_START } from '../actions/types'

const authReducer = (state = {}, action: any) => {
  switch (action.type) {
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
    case LOGOUT:
    case FETCH_USER:
      return { ...state, ...action.currentUser, isLoading: action.isLoading }
    case FETCH_USER_START:
      return { ...state, ...action.currentUser, isLoading: action.isLoading }
    default:
      return state
  }
}

export default authReducer;
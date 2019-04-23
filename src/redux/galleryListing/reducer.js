import types from './action'

const initialState = {
  loading: false,
  mainGallery: [],
  totalmainGallery: '',
  isCreated: false,
  isDeleted: false,
  error: '',
}

export default function mainGalleryReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_STATE:
      return { ...state, ...action.payload }
    default:
      return state
  }
}

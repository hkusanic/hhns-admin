import types from './action'

const initialState = {
  loading: false,
  mainGallery: [],
  totalmainGallery: '',
  subGallery: [],
  totalSubGallery: '',
  isGalleryCreated: false,
  isDeleted: false,
  isUpdated: false,
  editGallery: {},
  error: '',
}

export default function galleryReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_STATE:
      return { ...state, ...action.payload }
    default:
      return state
  }
}

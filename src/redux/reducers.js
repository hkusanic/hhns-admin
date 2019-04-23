import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import user from './user/reducers'
import menu from './menu/reducers'
import settings from './settings/reducers'
import blog from './blog/reducer'
import lecture from './lecture/reducer'
import gallery from './gallery/reducer'
import quote from './quote/reducer'
import galleryList from './galleryListing/reducer'
import kirtan from './kirtan/reducer'

export default history =>
  combineReducers({
    router: connectRouter(history),
    user,
    menu,
    settings,
    blog,
    lecture,
    gallery,
    quote,
    galleryList,
    kirtan,
  })

/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unused-state */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Icon } from 'antd'
import Sidebar from './Sidebar'
import BasicProfile from './BasicProfile'
import DiscipleProfile from './DiscipleProfile'
import SadhanaSheets from './SadhanaSheets'
import Reports from './Reports'

@connect(({ userProfile }) => ({ userProfile }))
class UsersProfile extends Component {
  state = {
    userDetails: {},
    userId: '',
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.userProfile.userDetails !== prevState.userDetails) {
      sessionStorage.setItem('userDetails', JSON.stringify(nextProps.userProfile.userDetails))
      return {
        userDetails: nextProps.userProfile.userDetails,
      }
    }
    return null
  }

  componentDidMount() {
    const { location, dispatch } = this.props
    const { state } = location
    if (state !== undefined) {
      const { uuid, currentPage } = state
      if (uuid !== undefined) {
        const body = {
          user_id: uuid,
        }

        dispatch({
          type: 'userProfile/GET_USER_BY_ID',
          payload: body,
        })

        sessionStorage.setItem('currentPage', JSON.stringify(currentPage))
      }
    }
  }

  render() {
    const { location } = this.props

    let content
    if (location.pathname === '/users/profile/basic') {
      content = <BasicProfile userDetails={JSON.parse(sessionStorage.getItem('userDetails'))} />
    }

    if (location.pathname === '/users/profile/disciple') {
      content = <DiscipleProfile userDetails={JSON.parse(sessionStorage.getItem('userDetails'))} />
    }

    if (location.pathname === '/users/profile/sadhana') {
      content = <SadhanaSheets userDetails={JSON.parse(sessionStorage.getItem('userDetails'))} />
    }

    if (location.pathname === '/users/profile/reports') {
      content = <Reports userDetails={JSON.parse(sessionStorage.getItem('userDetails'))} />
    }

    return (
      <div>
        <Link
          to={{
            pathname: '/users/list',
            state: {
              paginationCurrentPage: JSON.parse(sessionStorage.getItem('currentPage')),
            },
          }}
        >
          <span>
            <Icon type="arrow-left" style={{ fontSize: '15px' }} />
            <span style={{ fontSize: '15px', fontWeight: '400', paddingLeft: '10px' }}>
              Users List
            </span>
          </span>
        </Link>
        <br />
        <br />
        <Sidebar>{content}</Sidebar>
      </div>
    )
  }
}

export default UsersProfile

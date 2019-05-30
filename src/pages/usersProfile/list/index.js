/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Table, Icon, DatePicker, Input } from 'antd'
import renderHTML from 'react-render-html'
import { Helmet } from 'react-helmet'

@connect(({ userProfile }) => ({ userProfile }))
class UsersList extends Component {
  state = {
    users: [],
    firstName: '',
    lastName: '',
    userEmail: '',
    discipleName: '',
    currentPage: 1,
    perPage: 10,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.users !== nextProps.userProfile.users) {
      return {
        users: nextProps.userProfile.users,
      }
    }
    return null
  }

  componentDidMount() {
    const { dispatch, location } = this.props
    const { state } = location

    dispatch({
      type: 'userProfile/GET_USERS',
    })

    if (state !== undefined) {
      if (state.paginationCurrentPage) {
        this.setState({
          currentPage: state.paginationCurrentPage,
        })
      }
    }
  }

  handleInputChange = event => {
    // console.log(event.target.name)
    const { dispatch } = this.props
    this.setState({ [event.target.name]: event.target.value }, () => {
      dispatch({
        type: '',
      })
    })
  }

  handlePageChange = page => {
    this.setState({
      currentPage: page,
    })
  }

  render() {
    const { users, firstName, lastName, discipleName, userEmail, currentPage, perPage } = this.state

    const columns = [
      {
        title: 'User Name',
        dataIndex: 'userName',
        render: (text, record) => (text ? renderHTML(text) : ''),
      },
      {
        title: 'Disciple',
        dataIndex: 'disciple',
        render: text => (text ? renderHTML(text) : ''),
      },
      // {
      //   title: 'Mobile',
      //   dataIndex: 'mobileNumber',
      //   render: text => (text ? renderHTML(text) : ''),
      // },
      {
        title: 'Email',
        dataIndex: 'email',
        render: text => (text ? renderHTML(text) : ''),
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <span>
            <Link
              to={{
                pathname: '/users/profile/basic',
                state: { uuid: record.user_id, currentPage },
              }}
            >
              <i className="fa fa-edit mr-2 editIcon" />
            </Link>
          </span>
        ),
      },
    ]

    const paginationConfig = {
      current: currentPage,
      pageSize: perPage,
      total: users.length,
      onChange: this.handlePageChange,
    }

    return (
      <div>
        <Helmet title="Users List" />

        <div className="card">
          <div className="container card-header">
            <div className="row utils__title">
              <div className="col-lg-8">
                <strong>Users List</strong>
                {/* <Switch
                  defaultChecked
                  checkedChildren={language ? 'en' : 'ru'}
                  unCheckedChildren={language ? 'en' : 'ru'}
                  onChange={this.handleLanguage}
                  className="toggle"
                  style={{ width: '100px', marginLeft: '10px' }}
                /> */}
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3">
                {/* <DatePicker style={{ paddingTop: '10px' }} onChange={this.onChangeDate} /> */}

                <Input
                  name="firstName"
                  placeholder="First Name"
                  onChange={this.handleInputChange}
                  id="firstName"
                  value={firstName}
                />
              </div>

              <div className="col-lg-3">
                {/* <DatePicker style={{ paddingTop: '10px' }} onChange={this.onChangeDate} /> */}

                <Input
                  name="lastName"
                  placeholder="Last Name"
                  onChange={this.handleInputChange}
                  id="lastName"
                  value={lastName}
                />
              </div>

              <div className="col-lg-3">
                <Input
                  name="discipleName"
                  placeholder="Disciple Name"
                  onChange={this.handleInputChange}
                  id="discipleName"
                  value={discipleName}
                />
              </div>

              <div className="col-lg-3">
                <Input
                  name="userEmail"
                  placeholder="User Email"
                  onChange={this.handleInputChange}
                  id="userEmail"
                  value={userEmail}
                />
              </div>
            </div>
          </div>
          <div className="card-body">
            <Table
              rowKey={record => record.user_id}
              rowClassName={record =>
                record.translation_required === true ? 'NotTranslated' : 'translated'
              }
              className="utils__scrollTable"
              scroll={{ x: '100%' }}
              columns={columns}
              dataSource={users}
              pagination={paginationConfig}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default UsersList

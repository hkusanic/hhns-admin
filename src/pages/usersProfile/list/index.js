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
    const { dispatch } = this.props
    dispatch({
      type: 'userProfile/GET_USERS',
    })
  }

  handleInputChange = event => {
    console.log(event.target.name)
  }

  render() {
    const { users } = this.state

    const columns = [
      {
        title: 'Full Name',
        dataIndex: 'name.first',
        render: (text, record) => `${record.name.first} ${record.name.last}`,
      },
      {
        title: 'Disciple Name',
        dataIndex: 'discipleName',
        render: text => (text ? renderHTML(text) : ''),
      },
      {
        title: 'Mobile',
        dataIndex: 'mobileNumber',
        render: text => (text ? renderHTML(text) : ''),
      },
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
                state: { uuid: record.user_id },
              }}
            >
              <i className="fa fa-edit mr-2 editIcon" />
            </Link>
          </span>
        ),
      },
    ]

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
                  name="userName"
                  placeholder="Name"
                  onChange={this.handleInputChange}
                  id="userName"
                />
              </div>

              <div className="col-lg-3">
                <Input
                  name="discipleName"
                  placeholder="Disciple Name"
                  onChange={this.handleInputChange}
                  id="discipleName"
                />
              </div>

              <div className="col-lg-3">
                <Input
                  name="userEmail"
                  placeholder="User Email"
                  onChange={this.handleInputChange}
                  id="userEmail"
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
              // pagination={paginationConfig}
            />
          </div>
        </div>

        {/* <Table
          rowKey={record => record.user_id}
          rowClassName={record =>
            record.translation_required === true ? 'NotTranslated' : 'translated'
          }
          className="utils__scrollTable"
          scroll={{ x: '100%' }}
          columns={columns}
          dataSource={users}
          // pagination={paginationConfig}
        /> */}
      </div>
    )
  }
}

export default UsersList

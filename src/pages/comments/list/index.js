/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Table, Icon, DatePicker, Input } from 'antd'
import renderHTML from 'react-render-html'
import { Helmet } from 'react-helmet'
import moment from 'moment'

function formatDate(date) {
  const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0]

  return dateString
}

@connect(({ comment }) => ({ comment }))
class CommentsList extends Component {
  state = {
    comments: [],
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'comment/GET_COMMENTS',
    })
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.comments !== nextProps.comment.comments) {
      return {
        comments: nextProps.comment.comments,
      }
    }
    return null
  }

  render() {
    const { comments } = this.state

    const columns = [
      {
        title: 'Message',
        dataIndex: 'message',
        render: (text, record, index) => renderHTML(text),
      },
      {
        title: 'Author Name',
        dataIndex: 'author_name',
        render: (text, record, index) => renderHTML(text),
      },
      {
        title: 'Author Email',
        dataIndex: 'author_email',
        render: (text, record, index) => renderHTML(text),
      },
      {
        title: 'Date Created',
        dataIndex: 'dateCreated',
        render: (text, record, index) => formatDate(new Date(text)),
      },
      {
        title: 'Approved',
        dataIndex: 'approved',
        render: (text, record, index) => (text === true ? 'Yes' : 'No'),
      },
      // {
      //   title: 'Action',
      //   key: 'action',
      //   render: record => (
      //     <span>
      //       <Link
      //         to={{
      //           pathname: '/users/profile/basic',
      //           state: { uuid: record.user_id },
      //         }}
      //       >
      //         <i className="fa fa-edit mr-2 editIcon" />
      //       </Link>
      //     </span>
      //   ),
      // },
    ]

    return (
      <div>
        <Helmet title="Comments List" />

        <div className="card">
          <div className="container card-header">
            <div className="row utils__title">
              <div className="col-lg-8">
                <strong>Comments List</strong>
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
          </div>
          <div className="card-body">
            <Table
              rowKey={record => record._id}
              className="utils__scrollTable"
              scroll={{ x: '100%' }}
              columns={columns}
              dataSource={comments}
              // pagination={paginationConfig}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default CommentsList

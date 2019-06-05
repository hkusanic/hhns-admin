/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Table, Icon, DatePicker, Input, Collapse, Button } from 'antd'
import renderHTML from 'react-render-html'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import './index.css'

const { Panel } = Collapse

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

  handleButtonClick = (uuid, buttonName) => {
    console.log('uuid===>', uuid)
    console.log('buttonName===>', buttonName)
    const { dispatch } = this.props
    if (buttonName === 'yesButton') {
      dispatch({
        type: 'comment/UPDATE_COMMENT',
        approved: true,
        uuid,
      })
    }

    if (buttonName === 'noButton') {
      dispatch({
        type: 'comment/UPDATE_COMMENT',
        approved: false,
        uuid,
      })
    }
  }

  render() {
    const { comments } = this.state

    const columns = [
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
    ]

    return (
      <div>
        <Helmet title="Comments List" />

        <div className="card">
          <div className="container card-header">
            <div className="row utils__title">
              <div className="col-lg-8">
                <strong>Comments List</strong>
              </div>
            </div>
          </div>
          <div className="card-body">
            <Table
              rowKey={record => record._id}
              expandedRowRender={record => (
                <div>
                  <div className="textRender">{renderHTML(record.message)}</div>
                  <Button
                    type="primary"
                    disabled={record.approved}
                    name="yesButton"
                    onClick={event => this.handleButtonClick(record.uuid, 'yesButton')}
                  >
                    Yes
                  </Button>
                  &nbsp;&nbsp;&nbsp;
                  <Button
                    type="danger"
                    disabled={!record.approved}
                    name="noButton"
                    onClick={event => this.handleButtonClick(record.uuid, 'noButton')}
                  >
                    No
                  </Button>
                </div>
              )}
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

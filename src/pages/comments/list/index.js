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
    const { dispatch } = this.props
    if (buttonName === 'yesButton') {
      dispatch({
        type: 'comment/UPDATE_COMMENT',
        approved: 0,
        uuid,
      })
    }

    if (buttonName === 'noButton') {
      dispatch({
        type: 'comment/UPDATE_COMMENT',
        approved: 1,
        uuid,
      })
    }

    if (buttonName === 'needButton') {
      dispatch({
        type: 'comment/UPDATE_COMMENT',
        approved: 2,
        uuid,
      })
    }
  }

  // eslint-disable-next-line consistent-return
  checkApproval = data => {
    if (data === 0 || data === '0') {
      return 'Approved'
    }
    if (data === 1 || data === '1') {
      return 'Disapproved'
    }
    if (data === 2 || data === '2') {
      return 'Needs Approval'
    }
    // return 2
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
        render: (text, record, index) => this.checkApproval(record.approved),
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
                  <div className="row">
                    <div className="col-lg-1" />
                    <div className="col-lg-10 textRender">{renderHTML(record.message)}</div>
                  </div>
                  <div className="row">
                    <div className="col-lg-2" />
                    <div className="col-lg-6 buttonDiv">
                      <Button
                        type="primary"
                        // eslint-disable-next-line no-unneeded-ternary
                        disabled={record.approved === 0 || record.approved === '0' ? true : false}
                        name="yesButton"
                        onClick={event => this.handleButtonClick(record.uuid, 'yesButton')}
                      >
                        Approve
                      </Button>
                      &nbsp;&nbsp;&nbsp;
                      <Button
                        type="danger"
                        // eslint-disable-next-line no-unneeded-ternary
                        disabled={record.approved === 1 || record.approved === '1' ? true : false}
                        name="noButton"
                        onClick={event => this.handleButtonClick(record.uuid, 'noButton')}
                      >
                        Disapprove
                      </Button>
                      &nbsp;&nbsp;&nbsp;
                      <Button
                        type="default"
                        // eslint-disable-next-line no-unneeded-ternary
                        disabled={record.approved === 2 || record.approved === '2' ? true : false}
                        name="needButton"
                        onClick={event => this.handleButtonClick(record.uuid, 'needButton')}
                      >
                        Needs Approval
                      </Button>
                    </div>
                  </div>
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

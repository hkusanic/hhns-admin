/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Table, Icon, DatePicker, Input, Collapse, Button, Select } from 'antd'
import renderHTML from 'react-render-html'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import './index.css'

const { Panel } = Collapse
const { Option } = Select

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
    approvalStatus: '',
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'comment/GET_COMMENTS',
    })

    dispatch({
      type: 'kirtan/RESET_STORE',
    })

    dispatch({
      type: 'video/RESET_STORE',
    })

    dispatch({
      type: 'blog/RESET_STORE',
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
  }

  // eslint-disable-next-line consistent-return
  checkRowColor = data => {
    if (data === '0' || data === 0) {
      return 'commentApproved'
    }
    if (data === '1' || data === 1) {
      return 'commentDisapproved'
    }
    if (data === '2' || data === 2) {
      return 'commentNeedsApproval'
    }
  }

  handleSelctChange = value => {
    const { dispatch } = this.props
    this.setState({ approvalStatus: value }, () => {
      dispatch({
        type: 'comment/GET_COMMENTS',
        approved: this.state.approvalStatus,
      })
    })
  }

  handleResetButtonClick = () => {
    const { dispatch } = this.props
    this.setState(
      {
        approvalStatus: '',
      },
      () => {
        dispatch({
          type: 'comment/GET_COMMENTS',
        })
      },
    )
  }

  render() {
    const { comments, approvalStatus } = this.state

    const columns = [
      {
        title: 'Author Name',
        dataIndex: 'author_name',
        render: (text, record, index) => (text ? renderHTML(text.substring(0, 20)) : ''),
      },
      {
        title: 'Author Email',
        dataIndex: 'author_email',
        render: (text, record, index) => (text ? renderHTML(text.substring(0, 30)) : ''),
      },
      {
        title: 'Comment Subject',
        dataIndex: 'subject',
        render: (text, record, index) => (text ? renderHTML(text.substring(0, 30)) : ''),
      },
      {
        title: 'Date Created',
        dataIndex: 'dateCreated',
        render: (text, record, index) => formatDate(new Date(text)),
      },
      {
        title: 'Status',
        dataIndex: 'approved',
        render: (text, record, index) => this.checkApproval(record.approved),
      },
    ]

    return (
      <div>
        <Helmet title="Comments List" />

        <div className="card">
          <div className="card-header">
            <div className="utils__title">
              <strong>Comments List</strong>
            </div>
            <div className="headerDiv">
              <div className="mb-2 mr-3" style={{ width: '16rem' }}>
                <Select
                  style={{ width: '100%' }}
                  id="disciple"
                  placeholder="Approved"
                  onChange={this.handleSelctChange}
                  // eslint-disable-next-line no-unneeded-ternary
                  value={approvalStatus ? approvalStatus : undefined}
                >
                  <Option value="0">Approved</Option>
                  <Option value="1">Disapproved</Option>
                  <Option value="2">Needs Approval</Option>
                </Select>
              </div>
              <div className="mb-2">
                <Button type="primary" onClick={this.handleResetButtonClick}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <Table
              rowKey={record => record._id}
              rowClassName={record =>
                // record.translation_required === true ? 'NotTranslated' : 'translated'
                `${this.checkRowColor(record.approved)} customTable`
              }
              expandedRowRender={record => (
                <div>
                  <div className="row">
                    <div className="col-lg-1" />
                    <div className="col-lg-10 textRender">{renderHTML(record.message)}</div>
                  </div>
                  <div className="row">
                    <div className="col-lg-2" />
                    <div className="col-lg-6 buttonDiv">
                      <div className="row">
                        <div className="col-lg-2 mt-2">
                          <Button
                            type="primary"
                            disabled={
                              // eslint-disable-next-line no-unneeded-ternary
                              record.approved === 0 || record.approved === '0' ? true : false
                            }
                            name="yesButton"
                            onClick={event => this.handleButtonClick(record.uuid, 'yesButton')}
                          >
                            Approve
                          </Button>
                        </div>

                        <div className="col-lg-2 mt-2">
                          <Button
                            type="danger"
                            disabled={
                              // eslint-disable-next-line no-unneeded-ternary
                              record.approved === 1 || record.approved === '1' ? true : false
                            }
                            name="noButton"
                            onClick={event => this.handleButtonClick(record.uuid, 'noButton')}
                          >
                            Disapprove
                          </Button>
                        </div>

                        <div className="col-lg-2 mt-2 ml-4">
                          <Button
                            type="default"
                            disabled={
                              // eslint-disable-next-line no-unneeded-ternary
                              record.approved === 2 || record.approved === '2' ? true : false
                            }
                            name="needButton"
                            onClick={event => this.handleButtonClick(record.uuid, 'needButton')}
                          >
                            Needs Approval
                          </Button>
                        </div>
                      </div>
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

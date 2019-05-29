/* eslint-disable react/no-unused-state */
import React, { Component } from 'react'
import { Form, Input, Button, DatePicker } from 'antd'
import moment from 'moment'
import { withRouter } from 'react-router-dom'

const FormItem = Form.Item

// function formatDate(date) {
//   const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
//     .toISOString()
//     .split('T')[0]

//   return dateString
// }

@Form.create()
class DiscipleProfile extends Component {
  state = {
    firstDate: null,
    secondDate: null,
  }

  componentDidMount() {
    const { data, form } = this.props

    form.setFieldsValue({
      templeName: data.disciple_profile.temple,
      spiritualName: data.disciple_profile.spiritual_name,
      maritalStatus: data.disciple_profile.marital_status,
      verifier: data.disciple_profile.verifier,
    })
  }

  handleDateChange = (date, dateString, name) => {
    if (name === 'firstDate') {
      this.setState({
        firstDate: dateString,
      })
    }

    if (name === 'secondDate') {
      this.setState({
        secondDate: dateString,
      })
    }
  }

  render() {
    const {
      form: { getFieldDecorator },
      data,
    } = this.props

    return (
      <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark>
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Disciple Name">
                {getFieldDecorator('discipleName', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your disciple name!',
                    },
                  ],
                })(<Input placeholder="Disciple Name" />)}
              </FormItem>
            </div>
            <div className="col-lg-2" />

            <div className="col-lg-4">
              <FormItem label="Temple Name">
                {getFieldDecorator('templeName', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your temple name!',
                    },
                  ],
                })(<Input placeholder="Temple Name" />)}
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="First Initiation Date">
                <DatePicker
                  value={moment(data.disciple_profile.first_initiation_date)}
                  onChange={(date, dateString) =>
                    this.handleDateChange(date, dateString, 'firstDate')
                  }
                />
                {/* {getFieldDecorator('firstDate', {
              rules: [
                {
                  required: true,
                  message: 'First Initiation Date is required',
                },
              ],
            })(<DatePicker name="firstDate" onChange={this.handleDateChange} />)} */}
              </FormItem>
            </div>

            <div className="col-lg-2" />

            <div className="col-lg-4">
              <FormItem label="Second Initiation Date">
                <DatePicker
                  value={moment(data.disciple_profile.second_initiation_date)}
                  onChange={(date, dateString) =>
                    this.handleDateChange(date, dateString, 'secondDate')
                  }
                />
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Spiritual Name">
                {getFieldDecorator('spiritualName', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your spiritual name!',
                    },
                  ],
                })(<Input placeholder="Spiritual Name" />)}
              </FormItem>
            </div>
            <div className="col-lg-2" />

            <div className="col-lg-4">
              <FormItem label="Marital Status">
                {getFieldDecorator('maritalStatus', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your marital status!',
                    },
                  ],
                })(<Input placeholder="Marital Status" />)}
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Verifier">
                {getFieldDecorator('verifier', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your verifier!',
                    },
                  ],
                })(<Input placeholder="Verifier" />)}
              </FormItem>
            </div>
          </div>

          <Button type="primary">Update Details</Button>
        </div>
      </Form>
    )
  }
}

export default withRouter(DiscipleProfile)

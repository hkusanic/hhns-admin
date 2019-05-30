/* eslint-disable react/no-unused-state */
import React, { Component, Fragment } from 'react'
import { Form, Input, Select, Button, Upload } from 'antd'
import { withRouter } from 'react-router-dom'
import PhoneView from './PhoneView'
import './BasicProfile.css'

const FormItem = Form.Item
const { Option } = Select

// const validatorPhone = (rule, value, callback) => {
//   const values = value.split('-')
//   if (!values[1]) {
//     callback('Please input your area code!')
//   }
//   if (!values[0]) {
//     callback('Please input your phone number!')
//   }
//   callback()
// }

const AvatarView = ({ avatar }) => (
  <Fragment>
    <div className="avatar">
      <img src={avatar} alt="avatar" className="avatar_img" />
    </div>
    <Upload fileList={[]}>
      <div className="button_view">
        <Button disabled icon="upload">
          Change avatar
        </Button>
      </div>
    </Upload>
  </Fragment>
)

@Form.create()
class BasicProfile extends Component {
  state = {
    user: {},
  }

  componentDidMount() {
    const { data, form } = this.props

    form.setFieldsValue({
      firstName: data.name.first,
      lastName: data.name.last,
      email: data.email,
      nickName: data.nick_name,
      timezone: data.timezone,
      address: data.address,
    })
  }

  getAvatarURL = () => {
    // const { currentUser } = this.props
    // if (currentUser.avatar) {
    //   return currentUser.avatar
    // }
    const url = 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
    return url
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
            <div className="col-lg-8 nameDiv">
              <div className="row">
                <div className="col-lg-6">
                  <FormItem label="First Name">
                    {getFieldDecorator('firstName', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your first name!',
                        },
                      ],
                    })(<Input placeholder="First Name" />)}
                  </FormItem>
                </div>
                <div className="col-lg-6">
                  <FormItem label="Last Name">
                    {getFieldDecorator('lastName', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your last name!',
                        },
                      ],
                    })(<Input placeholder="Last Name" />)}
                  </FormItem>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6">
                  <FormItem label="Email">
                    {getFieldDecorator('email', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your email!',
                        },
                      ],
                    })(<Input placeholder="Email" />)}
                  </FormItem>
                </div>
                <div className="col-lg-6">
                  <FormItem label="Nickname">
                    {getFieldDecorator('nickName', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your Nickname!',
                        },
                      ],
                    })(<Input placeholder="Nickname" />)}
                  </FormItem>
                </div>
              </div>
            </div>

            <div className="col-lg-4 imageDiv">
              <AvatarView avatar={this.getAvatarURL()} />
              {/* <br />
                  <br />
                  <br />
                  <br />
                  <br /> */}
            </div>
          </div>

          {/* <div className="row">
                <div className="col-lg-3">
                  <FormItem label="First Name">
                    {getFieldDecorator('firstName', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your first name!',
                        },
                      ],
                    })(<Input placeholder="First Name" />)}
                  </FormItem>
                </div>
                <div className="col-lg-3">
                  <FormItem label="Last Name">
                    {getFieldDecorator('lastName', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your last name!',
                        },
                      ],
                    })(<Input placeholder="Last Name" />)}
                  </FormItem>
                </div>
                <div className="col-lg-3">
                  <FormItem label="Email">
                    {getFieldDecorator('email', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your email!',
                        },
                      ],
                    })(<Input placeholder="Email" />)}
                  </FormItem>
                </div>
                <div className="col-lg-3">
                  <FormItem label="Nickname">
                    {getFieldDecorator('name', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your Nickname!',
                        },
                      ],
                    })(<Input placeholder="Nickname" />)}
                  </FormItem>
                </div>
              </div> */}

          {/* <div className="row">
                <div className="col-lg-12">
                  <FormItem label="Personal profile">
                    {getFieldDecorator('profile', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your personal profile!',
                        },
                      ],
                    })(<Input.TextArea placeholder="Brief introduction to yourself" rows={4} />)}
                  </FormItem>
                </div>
              </div> */}

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Timezone">
                {getFieldDecorator('timezone', {
                  rules: [
                    {
                      required: true,
                      message: 'Please select your timezone!',
                    },
                  ],
                })(
                  <Select style={{ maxWidth: 220 }} placeholder="Timezone">
                    {/* <Option value="China">China</Option> */}
                  </Select>,
                )}
              </FormItem>
            </div>

            <div className="col-lg-8">
              <FormItem label="Phone Number">
                {/* {getFieldDecorator('phone', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your phone!',
                    },
                    { validator: validatorPhone },
                  ],
                })(<PhoneView value={data.mobileNumber} />)} */}

                <PhoneView value={data.mobileNumber} />
              </FormItem>
            </div>
          </div>

          {/* <div className="row">
                <div className="col-lg-12">
                  <FormItem label="Phone Number">
                    {getFieldDecorator('phone', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your phone!',
                        },
                        { validator: validatorPhone },
                      ],
                    })(<PhoneView />)}
                  </FormItem>
                </div>
              </div> */}

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Language">
                {getFieldDecorator('language', {
                  rules: [
                    {
                      required: true,
                      message: 'Please select your language!',
                    },
                  ],
                })(
                  <Select style={{ maxWidth: 220 }} placeholder="Lanaguage">
                    <Option value="English">English</Option>
                    <Option value="Russian">Russian</Option>
                  </Select>,
                )}
              </FormItem>
            </div>
          </div>

          <div className="row">
            {/* <div className="col-lg-12">
              <FormItem label="Address">
                {getFieldDecorator('address', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your address!',
                    },
                  ],
                })(<Input placeholder="Address" />)}
              </FormItem>
            </div> */}

            <div className="col-lg-4">
              <FormItem label="Street Name">
                {getFieldDecorator('street', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your street name!',
                    },
                  ],
                })(<Input placeholder="Street Name" />)}
              </FormItem>
            </div>
            <div className="col-lg-4">
              <FormItem label="City">
                {getFieldDecorator('city', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your city name!',
                    },
                  ],
                })(<Input placeholder="City Name" />)}
              </FormItem>
            </div>
            <div className="col-lg-4">
              <FormItem label="PIN Code">
                {getFieldDecorator('pinCode', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your PIN Code!',
                    },
                  ],
                })(<Input type="number" placeholder="PIN Code" />)}
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Country">
                {getFieldDecorator('country', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your country name!',
                    },
                  ],
                })(<Input placeholder="Country Name" />)}
              </FormItem>
            </div>
            <div className="col-lg-4">
              <FormItem label="Landmark (Optional)">
                {getFieldDecorator('landmark', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your landmark!',
                    },
                  ],
                })(<Input placeholder="Landmark" />)}
              </FormItem>
            </div>
          </div>

          <Button type="primary">Update Information</Button>
        </div>
      </Form>
    )
  }
}

export default withRouter(BasicProfile)

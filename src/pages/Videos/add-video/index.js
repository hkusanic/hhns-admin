import React from 'react'
import {
  Switch,
  Form,
  Button,
  Input,
  Icon,
  Select,
  DatePicker,
  Checkbox,
  Upload,
  notification,
} from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { EditorState, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import $ from 'jquery'
import moment from 'moment'
import styles from './style.module.scss'

const FormItem = Form.Item
const { Option } = Select
const { Dragger } = Upload

@Form.create()
@connect(({ kirtan }) => ({ kirtan }))
class AddVideo extends React.Component {
  render() {
    const { form } = this.props
    // const { language, audioLink, translationRequired, editorState } = this.state
    const dateFormat = 'YYYY/MM/DD'
    return (
      <React.Fragment>
        <div>
          <Helmet title="Add Video" />
          <section className="card">
            <div className="card-header mb-2">
              <div className="utils__title">
                <strong>Video Add/Edit</strong>
                {/* <Switch
                                defaultChecked
                                checkedChildren={language ? 'en' : 'ru'}
                                unCheckedChildren={language ? 'en' : 'ru'}
                                onChange={this.handleLanguage}
                                className="toggle"
                                style={{ width: '100px', marginLeft: '10px' }}
                                /> */}
              </div>
              <div className="card-body">
                <div className={styles.addPost}>
                  <Form className="mt-3">
                    <div className="form-group">
                      <FormItem label={'Title'}>
                        {' '}
                        {/*change here once stae has been set*/}
                        {form.getFieldDecorator('title', {
                          rules: [
                            {
                              required: true,
                              message: 'Title is required',
                            },
                          ],
                          initialValue: '',
                        })(<Input placeholder="Video Title" />)}
                      </FormItem>
                    </div>

                    <div className="form-group">
                      <FormItem label="Language">
                        {/* {form.getFieldDecorator('language')(
                                                <Select
                                                    id="product-edit-colors"
                                                    showSearch
                                                    style={{ width: '100%' }}
                                                    placeholder="Select language"
                                                    onChange={this.handleKirtanLanguage}
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) =>
                                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                    >
                                                        <Option value="english">English</Option>
                                                        <Option value="russian">Russian</Option>
                                                </Select>,
                                                )} */}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Type">
                        {form.getFieldDecorator('type')(
                          <Select
                            id="product-edit-colors"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select Type"
                            optionFilterProp="children"
                            onChange={this.handleSelectType}
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            <Option value="Kirtan">Kirtan</Option>
                            <Option value="Bhajan">Bhajan</Option>
                          </Select>,
                        )}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Date">
                        {form.getFieldDecorator('create_date', {
                          rules: [
                            {
                              required: true,
                              message: 'Create Date is required',
                            },
                          ],
                          initialValue: moment(new Date().toLocaleDateString(), dateFormat),
                        })(<DatePicker onChange={this.handleCreateDate} />)}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Event">
                        {form.getFieldDecorator('event')(
                          <Select
                            id="product-edit-colors"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select Event"
                            optionFilterProp="children"
                            onChange={this.handleSelectEvent}
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            <Option value="Aditi Dukhaha Prabhu">Festival</Option>
                            <Option value="Amala Harinama Dasa">Guru Purinma</Option>
                          </Select>,
                        )}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Location">
                        {form.getFieldDecorator('location')(
                          <Select
                            id="product-edit-colors"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select Location"
                            optionFilterProp="children"
                            onChange={this.handleSelectLocation}
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            <Option value="Aditi Dukhaha Prabhu">Bangalore</Option>
                            <Option value="Amala Harinama Dasa">Pune</Option>
                          </Select>,
                        )}
                      </FormItem>
                    </div>
                    <div className="form-group">
                      <FormItem label="Youtube">
                        {form.getFieldDecorator('youtube', {
                          rules: [
                            {
                              required: true,
                              message: 'Url is required',
                            },
                          ],
                          initialValue: '',
                        })(<Input placeholder="Youtube Url" />)}
                      </FormItem>
                      <FormItem>
                        <div className={styles.submit}>
                          <span className="mr-3">
                            <Button type="default" icon="plus-circle" htmlType="submit">
                              Add Another Item
                            </Button>
                          </span>
                        </div>
                      </FormItem>
                    </div>
                    <FormItem>
                      <div className={styles.submit}>
                        <span className="mr-3">
                          <Button type="primary" htmlType="submit">
                            Save and Post
                          </Button>
                        </span>
                        <Button type="danger">Discard</Button>
                      </div>
                    </FormItem>
                  </Form>
                </div>
              </div>
            </div>
          </section>
        </div>
      </React.Fragment>
    )
  }
}
export default AddVideo

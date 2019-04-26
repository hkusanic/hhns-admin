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
  AutoComplete,
} from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import moment from 'moment'
import styles from './style.module.scss'

const FormItem = Form.Item
const { Option } = Select

@Form.create()
@connect(({ video }) => ({ video }))
class AddVideo extends React.Component {
  state = {
    autoCompleteDataSource: '',
    language: true,
    createDate: '',
    publishDate: '',
    event: '',
    location: '',
    type: '',
    videoReference: '',
    videoUrlFields: [],
    videoUrl: [],
    showReference: false,
    tempUrl: '',
  }
  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }
  handlePublishDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        publishDate: dateString,
      })
    }, 0)
  }
  handleCreateDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        createDate: dateString,
      })
    }, 0)
  }
  handleSelectEvent = event => {
    this.setState({
      event,
    })
  }
  handleSelectLocation = location => {
    this.setState({
      location,
    })
  }
  handleSelectType = type => {
    if (type !== 'other') {
      this.setState({ showReference: true, type })
    } else {
      this.setState({ showReference: false, type })
    }
  }
  handleLanguage = checked => {
    this.setState({
      language: checked,
    })
  }
  handleVideoReferenceSelect = reference => {
    this.setState({
      videoReference: reference,
    })
  }
  handleVideoReferenceSearch = reference => {
    const { form, dispatch } = this.props
    const type = form.getFieldValue('type')
    const body = {
      type: type,
      parameter: reference,
    }
    dispatch({
      type: 'video/GET_SUGGESTIONS',
      payload: body,
    })
    let ar = []
    if (this.props.video.suggestions) {
      if (this.state.language) {
        this.props.video.suggestions.map(a => {
          ar.push(a.en.title)
        })
      } else {
        this.props.video.suggestions.map(a => {
          ar.push(a.ru.title)
        })
      }
      this.setState({ autoCompleteDataSource: ar })
    }
  }
  handleAddVideoUrl = () => {
    const { form } = this.props
    let ar = this.state.videoUrlFields
    let len = ar.length
    let arUrls = this.state.videoUrl
    let tempUrl = this.state.tempUrl
    if (tempUrl !== '') arUrls.push(tempUrl)

    ar.push(
      <Input key={++len} onChange={e => this.handleUrlValueChange(e)} placeholder="Youtube Url" />,
    )
    this.setState({ videoUrlFields: ar, videoUrl: arUrls })
  }
  handleUrlValueChange = e => {
    this.setState({ tempUrl: e.target.value })
  }
  uuidv4 = () => {
    // eslint-disable-next-line func-names
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      // eslint-disable-next-line no-bitwise
      const r = (Math.random() * 16) | 0

      // eslint-disable-next-line no-bitwise
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
  handleSubmitForm = () => {
    const { form, dispatch, english } = this.props
    const {
      language,
      createDate,
      publishDate,
      event,
      location,
      type,
      videoReference,
      videoUrl,
    } = this.state
    const titleVideo = form.getFieldValue('title');
    const author = form.getFieldValue('author');
    const videoLanguage = form.getFieldValue('language');
    form.validateFields(['title', 'create_date', 'youtube'], (err, values) => {
      videoUrl.push(form.getFieldValue('youtube'))
      console.info(values)
      if (!err) {
        const body = {
          uuid: this.uuidv4(),
          published_date: createDate,
          language: videoLanguage,
          reference: videoReference,
          type,
          location: location,
          event: event,
          urls: videoUrl,
          en: {},
          ru: {},
        }
        if (language) {
          body.en.title = titleVideo
          body.en.event = event
          body.en.location = location
          body.en.author = author
        } else {
          body.ru.title = titleVideo
          body.ru.event = event
          body.ru.location = location
          body.ru.author = author
        }
        
        dispatch({
          type: 'video/CREATE_VIDEO',
          payload: body,
        })
      }
    })
    this.handleReset();
  }
  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      language: true,
      createDate: '',
      publishDate: '',
      event: '',
      location: '',
      type: '',
      videoLanguage: '',
      videoReference: '',
      videoUrl: [],
      videoUrlFields: [],
      tempUrl: [],
      showReference: false,
    })
  }
  render() {
    const { form } = this.props
    const { language, audioLink, editorState } = this.state
    const dateFormat = 'YYYY/MM/DD'
    return (
      <React.Fragment>
        <div>
          <Helmet title="Add Video" />
          <section className="card">
            <div className="card-header mb-2">
              <div className="utils__title">
                <strong>Video Add/Edit</strong>
                <Switch
                  defaultChecked
                  checkedChildren={language ? 'en' : 'ru'}
                  unCheckedChildren={language ? 'en' : 'ru'}
                  onChange={this.handleLanguage}
                  className="toggle"
                  style={{ width: '100px', marginLeft: '10px' }}
                />
              </div>
              <div className="card-body">
                <div className={styles.addPost}>
                  <Form className="mt-3">
                    <div className="form-group">
                      <FormItem label={language ? 'Title' : 'Title'}>
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
                      <FormItem label="Author">
                        {form.getFieldDecorator('author')(
                          <Select
                            id="product-edit-colors"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select Author"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            <Option value="Niranjana Swami">Niranjana Swami</Option>
                            <Option value="Other">Other</Option>
                          </Select>,
                        )}
                      </FormItem>
                </div>
                    <div className="form-group">
                      <FormItem label="Language">
                        {form.getFieldDecorator('language')(
                          <Select
                            id="product-edit-colors"
                            showSearch
                            style={{ width: '100%' }}
                            placeholder="Select language"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                          >
                            <Option value="english">English</Option>
                            <Option value="russian">Russian</Option>
                          </Select>,
                        )}
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
                            <Option value="kirtan">Kirtan</Option>
                            <Option value="lecture">Lecture</Option>
                            <Option value="other">Other</Option>
                          </Select>,
                        )}
                      </FormItem>
                    </div>
                    {this.state.showReference ? (
                      <div className="form-group">
                        <FormItem label="Reference">
                          {form.getFieldDecorator('reference')(
                            <AutoComplete
                              id="product-edit-colors"
                              dataSource={this.state.autoCompleteDataSource}
                              style={{ width: '100%' }}
                              placeholder="Reference"
                              optionFilterProp="children"
                              onSelect={this.handleVideoReferenceSelect}
                              onSearch={this.handleVideoReferenceSearch}
                            />,
                          )}
                        </FormItem>
                      </div>
                    ) : (
                      ''
                    )}
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
                      <FormItem label="Publish Date">
                        {form.getFieldDecorator('publish_date', {
                          rules: [
                            {
                              required: true,
                              message: 'Create Date is required',
                            },
                          ],
                          initialValue: moment(new Date().toLocaleDateString(), dateFormat),
                        })(<DatePicker onChange={this.handlePublishDate} disabled/>)}
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
                      {this.state.videoUrlFields.map(input => {
                        return input
                      })}
                      <FormItem>
                        <div className={styles.submit}>
                          <span className="mr-3">
                            <Button
                              type="default"
                              icon="plus-circle"
                              onClick={this.handleAddVideoUrl}
                              htmlType="submit"
                            >
                              Add Another Item
                            </Button>
                          </span>
                        </div>
                      </FormItem>
                    </div>
                    <FormItem>
                      <div className={styles.submit}>
                        <span className="mr-3">
                          <Button type="primary" htmlType="submit" onClick={this.handleSubmitForm}>
                            Save and Post
                          </Button>
                        </span>
                        <Button type="danger" onClick={this.handleReset}>
                          Discard
                        </Button>
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

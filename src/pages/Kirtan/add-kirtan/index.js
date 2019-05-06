/* eslint-disable no-underscore-dangle */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
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
  Tabs,
  Upload,
  notification,
} from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import $ from 'jquery'
import moment from 'moment'
import AuditTimeline from '../../../components/CleanUIComponents/AuditTimeline'
import BackNavigation from '../../../common/BackNavigation/index'
import { uuidv4 } from '../../../services/custom'
import styles from './style.module.scss'
import serverAddress from '../../../services/config'

const FormItem = Form.Item
const { TabPane } = Tabs
const { Option } = Select
const { Dragger } = Upload

@Form.create()
@connect(({ kirtan, lecture, router }) => ({ kirtan, lecture, router }))
class AddKirtan extends React.Component {
  state = {
    language: true,
    audioLink: '',
    createDate: new Date(),
    publishDate: new Date(),
    translationRequired: false,
    editingKirtan: '',
    editorState: EditorState.createEmpty(),
  }

  componentDidMount() {
    const { dispatch, router } = this.props
    const { location } = router
    const uuid = location.state
    if (uuid !== undefined) {
      const body = {
        uuid,
      }

      dispatch({
        type: 'kirtan/GET_KIRTAN_BY_ID',
        payload: body,
      })
    }
    dispatch({
      type: 'lecture/GET_EVENTS',
    })
    dispatch({
      type: 'lecture/GET_LOCATIONS',
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.kirtan.isKirtanCreated) {
      this.handleReset()
    }
    if (nextProps.kirtan.editKirtan !== '') {
      const { kirtan } = nextProps
      const { editKirtan } = kirtan
      const { language } = this.state
      this.handleUpdateBody(language, editKirtan)
      this.setState({
        editingKirtan: editKirtan,
        audioLink: editKirtan ? editKirtan.audio_link : '',
        createDate: editKirtan ? editKirtan.created_date : '',
        publishDate: editKirtan && editKirtan.published_date ? editKirtan.published_date : '',
        translationRequired: editKirtan ? editKirtan.translation_required : false,
      })
    }
  }

  componentWillUnmount() {
    this.handleReset()
  }

  handleUpdateBody = (language, editKirtan) => {
    const html = editKirtan ? (language ? editKirtan.en.body : editKirtan.ru.body) : ''
    let editorState = ''
    if (html && html.length > 0) {
      const contentBlock = htmlToDraft(html)
      if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
        editorState = EditorState.createWithContent(contentState)
      }
      this.setState({
        editorState,
      })
    }
  }

  handleLanguage = () => {
    const { language, editingKirtan } = this.state
    if (editingKirtan !== '') {
      this.handleUpdateBody(!language, editingKirtan)
    }
    this.setState({
      language: !language,
    })
  }

  handleCheckbox = event => {
    setTimeout(() => {
      this.setState({
        translationRequired: event.target.checked,
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

  handlePublishDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        publishDate: dateString,
      })
    }, 0)
  }

  onEditorStateChange: Function = editorState => {
    this.setState({
      editorState,
    })
  }

  handleUploading = info => {
    if (info.file.status === 'uploading') {
      notification.success({
        message: 'Uploading Started',
        description: 'File uploading is started',
      })
    }
    if (info.file.status === 'done') {
      this.uploads3(info.file)
    }
  }

  uploads3 = file => {
    const fileName = file.name
    const fileType = file.type
    $.ajax({
      type: 'GET',
      url: `${serverAddress}/api/blog/generateUploadUrl?name=folder1/${fileName}&type=${fileType}`,
      success: data => {
        const temp = data.presignedUrl.toString()
        const finalUrl = temp.substr(0, temp.lastIndexOf('?'))
        this.setUploadedFiles(finalUrl)
        this.uploadFileToS3UsingPresignedUrl(data.presignedUrl, file)
      },
      error() {
        notification.error({
          message: 'Error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  uploadFileToS3UsingPresignedUrl = (presignedUrl, file) => {
    $.ajax({
      type: 'PUT',
      url: presignedUrl,
      data: file.originFileObj,
      headers: {
        'Content-Type': file.type,
        reportProgress: true,
      },
      processData: false,
      success: data => {
        console.info(data)
        notification.success({
          message: 'Success',
          description: 'file has been uploaded successfully',
        })
      },
      error() {
        notification.warning({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  deleteFile = item => {
    const fileName = item.substr(item.lastIndexOf('.com/') + 5)
    $.ajax({
      type: 'GET',
      url: `${serverAddress}/api/blog/deleteFile/?filename=${fileName}`,
      success: data => {
        console.info(data)
        notification.success({
          message: 'File Deleted',
          description: 'File has been successfully deleted',
        })
        this.handelDeleteSetFiles()
      },
      error() {
        notification.error({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  beforeUploadAudio = file => {
    const isJPG = file.type === 'audio/mp3'
    if (!isJPG) {
      notification.error({
        message: 'error',
        description: 'You can only upload MP3 file!',
      })
    }
    return isJPG
  }

  handelDeleteSetFiles = () => {
    this.setState({ audioLink: '' })
  }

  setUploadedFiles = finalUrl => {
    this.setState({
      audioLink: finalUrl,
    })
  }

  dummyRequest = ({ file, onSuccess }) => {
    console.info(file)
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  handleSubmitForm = () => {
    const { form, dispatch, router } = this.props
    const uuid = router.location.state
    const {
      language,
      audioLink,
      createDate,
      publishDate,
      translationRequired,
      editorState,
      editingKirtan,
    } = this.state
    const titlekirtan = form.getFieldValue('title')
    const kirtanBody = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    const locationKirtan = form.getFieldValue('location')
    const event = form.getFieldValue('event')
    const type = form.getFieldValue('type')
    const artist = form.getFieldValue('artist')
    const kirtanLanguage = form.getFieldValue('language')
    form.validateFields(['title', 'create_date'], (err, values) => {
      console.info(values)
      if (!err) {
        const body = {
          uuid: uuid || uuidv4(),
          created_date: createDate,
          published_date: publishDate,
          language: kirtanLanguage,
          audio_link: audioLink,
          translation_required: translationRequired,
          artist,
          type,
          en: {
            title: language ? titlekirtan : editingKirtan ? editingKirtan.en.title : '',
            event: language ? event : editingKirtan ? editingKirtan.en.event : '',
            topic: '',
            location: language ? locationKirtan : editingKirtan ? editingKirtan.en.location : '',
            body: language ? kirtanBody : editingKirtan ? editingKirtan.en.body : '',
          },
          ru: {
            title: language ? (editingKirtan ? editingKirtan.ru.title : '') : titlekirtan,
            event: language ? (editingKirtan ? editingKirtan.ru.event : '') : event,
            topic: '',
            location: language ? (editingKirtan ? editingKirtan.ru.location : '') : locationKirtan,
            body: language ? (editingKirtan ? editingKirtan.en.body : '') : kirtanBody,
          },
        }

        if (editingKirtan !== '' && uuid) {
          body.audit = editingKirtan.audit
          const payload = {
            body,
            uuid,
          }
          dispatch({
            type: 'kirtan/UPDATE_KIRTAN',
            payload,
          })
        } else {
          dispatch({
            type: 'kirtan/CREATE_KIRTAN',
            payload: body,
          })
        }
      }
    })
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      language: true,
      audioLink: '',
      createDate: '',
      publishDate: '',
      translationRequired: false,
      editorState: EditorState.createEmpty(),
    })
  }

  render() {
    const { form, lecture, kirtan } = this.props
    const { events, locations } = lecture
    const { language, audioLink, translationRequired, editorState, editingKirtan } = this.state
    const dateFormat = 'YYYY/MM/DD'
    return (
      <React.Fragment>
        <div>
          <BackNavigation link="/kirtan/list" title="Kirtan List" />
          {editingKirtan && editingKirtan.en && editingKirtan.ru ? (
            <div style={{ paddingTop: '10px' }}>
              <div>
                <strong>Title :</strong>
                &nbsp;&nbsp;
                <span>{language ? editingKirtan.en.title : editingKirtan.ru.title}</span>
              </div>
            </div>
          ) : null}
          <Helmet title="Add Kirtan" />
          <Tabs defaultActiveKey="1">
            <TabPane tab="Kirtan" key="1">
              <section className="card">
                <div className="card-header mb-2">
                  <div className="utils__title">
                    <strong>Kirtan Add/Edit</strong>
                    <Switch
                      defaultChecked
                      checkedChildren={language ? 'en' : 'ru'}
                      unCheckedChildren={language ? 'en' : 'ru'}
                      onChange={this.handleLanguage}
                      className="toggle"
                      style={{ width: '100px', marginLeft: '10px' }}
                    />
                  </div>
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
                            initialValue:
                              editingKirtan && editingKirtan.en && editingKirtan.ru
                                ? language
                                  ? editingKirtan.en.title
                                  : editingKirtan.ru.title
                                : '',
                          })(<Input placeholder="Kirtan Title" />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Language">
                          {form.getFieldDecorator('language', {
                            initialValue: editingKirtan ? editingKirtan.language : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select language"
                              onChange={this.handleKirtanLanguage}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
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
                          {form.getFieldDecorator('type', {
                            initialValue: editingKirtan ? editingKirtan.type : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Type"
                              optionFilterProp="children"
                              onChange={this.handleSelectType}
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              <Option value="Kirtan">Kirtan</Option>
                              <Option value="Bhajan">Bhajan</Option>
                            </Select>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Artist">
                          {form.getFieldDecorator('artist', {
                            initialValue: editingKirtan ? editingKirtan.artist : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Artist"
                              onChange={this.handleSelectArtist}
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              <Option value="Aditi Dukhaha Prabhu">Aditi Dukhaha Prabhu</Option>
                              <Option value="Amala Harinama Dasa"> Amala Harinama Dasa</Option>
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
                            initialValue:
                              editingKirtan && editingKirtan.created_date
                                ? moment(editingKirtan.created_date, dateFormat)
                                : moment(new Date(), dateFormat),
                          })(<DatePicker onChange={this.handleCreateDate} />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Publish Date">
                          {form.getFieldDecorator('publish_date', {
                            rules: [
                              {
                                required: true,
                                message: 'Publish Date is required',
                              },
                            ],
                            initialValue:
                              editingKirtan && editingKirtan.published_date
                                ? moment(editingKirtan.published_date, dateFormat)
                                : moment(new Date(), dateFormat),
                          })(<DatePicker onChange={this.handlePublishDate} disabled />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem>
                          {form.getFieldDecorator('translation', {
                            rules: [
                              {
                                required: true,
                                message: 'Need Translation is required',
                              },
                            ],
                            initialValue: editingKirtan ? editingKirtan.translation_required : '',
                          })(
                            <Checkbox checked={translationRequired} onChange={this.handleCheckbox}>
                              &nbsp; Need Translation ?
                            </Checkbox>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Location">
                          {form.getFieldDecorator('location', {
                            initialValue:
                              editingKirtan && editingKirtan.en && editingKirtan.ru
                                ? language
                                  ? editingKirtan.en.location
                                  : editingKirtan.ru.location
                                : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Location"
                              optionFilterProp="children"
                              onChange={this.handleSelectLocation}
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              {locations && locations.length > 0
                                ? locations.map(item => {
                                    return (
                                      <Option key={item._id} value={item.title}>
                                        {item.title}
                                      </Option>
                                    )
                                  })
                                : null}
                            </Select>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Event">
                          {form.getFieldDecorator('event', {
                            initialValue:
                              editingKirtan && editingKirtan.en && editingKirtan.ru
                                ? language
                                  ? editingKirtan.en.event
                                  : editingKirtan.ru.event
                                : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Event"
                              optionFilterProp="children"
                              onChange={this.handleSelectEvent}
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              {events && events.length > 0
                                ? events.map(item => {
                                    return (
                                      <Option key={item._id} value={item.title}>
                                        {item.title}
                                      </Option>
                                    )
                                  })
                                : null}
                            </Select>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Body">
                          {form.getFieldDecorator('content', {
                            initialValue: editorState || '',
                          })(
                            <div className={styles.editor}>
                              <Editor
                                editorState={editorState}
                                onEditorStateChange={this.onEditorStateChange}
                              />
                            </div>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Attachment">
                          {audioLink ? (
                            <ul>
                              <li className="filesList">
                                {audioLink}
                                &nbsp;&nbsp;
                                <i
                                  className="fa fa-close closeIcon"
                                  onClick={() => {
                                    this.deleteFile(audioLink, 'audio')
                                  }}
                                />
                              </li>
                            </ul>
                          ) : (
                            ''
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem>
                          {form.getFieldDecorator('Files')(
                            <Dragger
                              beforeUpload={this.beforeUploadAudio}
                              multiple={false}
                              showUploadList={false}
                              customRequest={this.dummyRequest}
                              onChange={this.handleUploading}
                            >
                              <p className="ant-upload-drag-icon">
                                <Icon type="inbox" />
                              </p>
                              <p className="ant-upload-text">
                                Click or drag file to this area to upload
                              </p>
                              <p className="ant-upload-hint">
                                Support for a single or bulk upload. Strictly prohibit from
                                uploading company data or other band files
                              </p>
                            </Dragger>,
                          )}
                        </FormItem>
                      </div>
                      <FormItem>
                        <div className={styles.submit}>
                          <span className="mr-3">
                            <Button
                              type="primary"
                              htmlType="submit"
                              onClick={this.handleSubmitForm}
                            >
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
              </section>
            </TabPane>
            <TabPane tab="Audit" key="2">
              <section className="card">
                <div className="card-body">
                  <AuditTimeline
                    audit={editingKirtan.audit ? editingKirtan.audit : kirtan.kirtanAudit}
                  />
                </div>
              </section>
            </TabPane>
          </Tabs>
        </div>
      </React.Fragment>
    )
  }
}

export default AddKirtan

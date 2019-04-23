/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-unused-vars */
import React from 'react'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import {
  Form,
  Input,
  Checkbox,
  Button,
  Select,
  Upload,
  Switch,
  Icon,
  notification,
  Tabs,
  DatePicker,
} from 'antd'
import { connect } from 'react-redux'
import $ from 'jquery'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import styles from './style.module.scss'

const { TabPane } = Tabs
const { Option } = Select
const FormItem = Form.Item
const { Dragger } = Upload

@Form.create()
@connect(({ lecture, router }) => ({ lecture, router }))
class AddLecture extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      date: new Date(),
      audioLink: '',
      transcriptionFiles: [],
      summaryFiles: [],
      editorState: EditorState.createEmpty(),
      editorStateSummary: EditorState.createEmpty(),
      editorStateTranscription: EditorState.createEmpty(),
      editinglecture: '',
      editedBody: '',
      language: true,
      uploading: true,
      audioUploading: false,
      transcriptionUploading: false,
      summaryUploading: false,
      translationRequired: false,
    }
  }

  componentDidMount() {
    const { router, dispatch } = this.props
    const { location } = router
    const uuid = location.state
    if (uuid !== undefined) {
      const body = {
        uuid,
      }
      dispatch({
        type: 'lecture/GET_LECTURE_BY_ID',
        payload: body,
      })
    }
    dispatch({
      type: 'lecture/GET_TOPICS',
    })
    dispatch({
      type: 'lecture/GET_EVENTS',
    })
    dispatch({
      type: 'lecture/GET_LOCATIONS',
    })
  }

  componentWillReceiveProps(nextProps) {
    const { uploading } = this.state
    if (nextProps.lecture.editLecture !== '' && uploading) {
      const { lecture } = nextProps
      const { language } = this.state
      this.setState({
        editinglecture: lecture.editLecture,
        audioLink: lecture.editLecture.audio_link,
        summaryFiles: lecture.editLecture.ru.summary.attachment_link,
        transcriptionFiles: lecture.editLecture.en.transcription.attachment_link,
        translationRequired: lecture.editLecture.translation_required,
      })

      const htmlTranscription = lecture.editLecture ? lecture.editLecture.en.transcription.text : ''
      let editorStateTranscription = ''
      if (htmlTranscription.length > 0) {
        const contentBlock = htmlToDraft(htmlTranscription)
        if (contentBlock) {
          const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
          editorStateTranscription = EditorState.createWithContent(contentState)
        }

        const htmlSummary = lecture.editLecture ? lecture.editLecture.ru.summary.text : ''
        let editorStateSummary = ''
        if (htmlSummary.length > 0) {
          const contentBlockSummary = htmlToDraft(htmlSummary)
          if (contentBlockSummary) {
            const contentState = ContentState.createFromBlockArray(
              contentBlockSummary.contentBlocks,
            )
            editorStateSummary = EditorState.createWithContent(contentState)
          }

          this.setState({
            editorStateTranscription,
            editorStateSummary,
          })
        }
      }
    }
    if (nextProps.lecture.isLectureCreated) {
      this.handleReset()
    }
  }

  componentWillUnmount() {
    this.setState({
      editinglecture: '',
    })
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

  handleLanguage = checked => {
    this.setState({
      language: checked,
    })
  }

  handleFormBody = e => {
    e.preventDefault()
    const { form, dispatch, router, english } = this.props
    const {
      audioLink,
      editorState,
      editorStateSummary,
      editorStateTranscription,
      editinglecture,
      transcriptionFiles,
      summaryFiles,
      translationRequired,
      language,
    } = this.state
    const { location } = router
    const uuid = location.state
    const title = form.getFieldValue('title')
    const date = form.getFieldValue('date')
    const tag = form.getFieldValue('tag')
    // const language = form.getFieldValue('language')
    const bodylecture = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    const author = form.getFieldValue('author')
    const locationlecture = form.getFieldValue('location')
    const event = form.getFieldValue('event')
    const topic = form.getFieldValue('topic')
    const parts = form.getFieldValue('parts')
    const chapter = form.getFieldValue('chapter')
    const verse = form.getFieldValue('verse')
    const editorSummary = draftToHtml(convertToRaw(editorStateSummary.getCurrentContent()))
    const editorTranscription = draftToHtml(
      convertToRaw(editorStateTranscription.getCurrentContent()),
    )

    const body = {
      uuid: uuid || this.uuidv4(),
      parts,
      verse,
      chapter,
      author,
      tags: tag,
      created_date: date,
      audio_link: audioLink,
      translation_required: translationRequired,
      counters: {
        ru_summary_view: 0,
        ru_transcription_view: 0,
        en_summary_view: 0,
        en_transcription_view: 0,
        video_page_view: 0,
        downloads: 0,
        audio_play_count: 0,
        audio_page_view: 0,
      },
      en: {
        location: locationlecture,
        topic,
        event,
        title: language ? title : editinglecture.en.title,
        summary: {
          attachment_link: '',
          attachment_name: '',
          text: '',
        },
        transcription: {
          attachment_name: '',
          attachment_link: transcriptionFiles,
          text: editorTranscription,
        },
      },
      ru: {
        location: locationlecture,
        topic,
        event,
        title: language ? editinglecture.ru.title : title,
        summary: {
          attachment_link: summaryFiles,
          attachment_name: '',
          text: editorSummary,
        },
        transcription: {
          attachment_name: '',
          attachment_link: '',
          text: '',
        },
      },
    }
    if (editinglecture !== '') {
      const payload = {
        body,
        uuid,
      }
      dispatch({
        type: 'lecture/UPDATE_LECTURE',
        payload,
      })
    } else {
      dispatch({
        type: 'lecture/CREATE_LECTURE',
        body,
      })
    }
  }

  onEditorStateChange: Function = editorState => {
    this.setState({
      editorState,
    })
  }

  onEditorChangeStateSummary: Function = editorStateSummary => {
    this.setState({
      editorStateSummary,
    })
  }

  onEditorChangeStateTranscription: Function = editorStateTranscription => {
    this.setState({
      editorStateTranscription,
    })
  }

  getBase64 = (img, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
  }

  handleFileChange = info => {
    this.setState(
      {
        audioUploading: true,
        uploading: false,
      },
      () => {
        this.handleUploading(info)
      },
    )
  }

  handleSummaryFileChange = info => {
    this.setState(
      {
        summaryUploading: true,
        uploading: false,
      },
      () => {
        this.handleUploading(info)
      },
    )
  }

  handleTranscriptionFileChange = info => {
    this.setState(
      {
        transcriptionUploading: true,
        uploading: false,
      },
      () => {
        this.handleUploading(info)
      },
    )
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
      url: `http://localhost:3000/api/blog/generateUploadUrl?name=folder1/${fileName}&type=${fileType}`,
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

  setUploadedFiles = finalUrl => {
    const {
      transcriptionFiles,
      summaryFiles,
      audioUploading,
      transcriptionUploading,
      summaryUploading,
    } = this.state
    if (audioUploading) {
      this.setState({
        audioLink: finalUrl,
        transcriptionUploading: false,
        summaryUploading: false,
        audioUploading: false,
      })
    } else if (transcriptionUploading) {
      const array = [...transcriptionFiles]
      array.push(finalUrl)
      this.setState({
        transcriptionFiles: array,
        transcriptionUploading: false,
        summaryUploading: false,
        audioUploading: false,
      })
    } else if (summaryUploading) {
      const newArray = [...summaryFiles]
      newArray.push(finalUrl)
      this.setState({
        summaryFiles: newArray,
        transcriptionUploading: false,
        summaryUploading: false,
        audioUploading: false,
      })
    }
  }

  dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  deleteFile = (item, type) => {
    const fileName = item.substr(item.lastIndexOf('.com/') + 5)
    $.ajax({
      type: 'GET',
      url: `http://localhost:3000/api/blog/deleteFile/?filename=${fileName}`,
      success: data => {
        notification.success({
          message: 'File Deleted',
          description: 'File has been successfully deleted',
        })
        this.handelDeleteSetFiles(item, type)
      },
      error() {
        notification.error({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  handelDeleteSetFiles = (item, type) => {
    const { transcriptionFiles, summaryFiles } = this.state
    if (type === 'audio') {
      this.setState({ audioLink: '' })
    }
    if (type === 'transcription') {
      for (let i = 0; i < transcriptionFiles.length; i += 1) {
        if (transcriptionFiles[i] === item) {
          transcriptionFiles.splice(i, 1)
          break
        }
      }
      this.setState({
        transcriptionFiles,
      })
    }
    if (type === 'summary') {
      for (let i = 0; i < summaryFiles.length; i += 1) {
        if (summaryFiles[i] === item) {
          summaryFiles.splice(i, 1)
          break
        }
      }
      this.setState({
        summaryFiles,
      })
    }
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

  beforeUpload = file => {
    const isJPG = file.type === 'application/pdf'
    if (!isJPG) {
      notification.error({
        message: 'error',
        description: 'You can only upload Pdf file!',
      })
    }
    return isJPG
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      editinglecture: '',
      audioLink: '',
      editorState: EditorState.createEmpty(),
      editorStateSummary: EditorState.createEmpty(),
      editorStateTranscription: EditorState.createEmpty(),
      transcriptionUploading: false,
      summaryUploading: false,
      audioUploading: false,
      transcriptionFiles: [],
      summaryFiles: [],
      language: true,
      translationRequired: false,
    })
  }

  onChange = (date, dateString) => {
    console.log(date, dateString)
    this.setState({
      date: dateString,
    })
  }

  handleCheckbox = event => {
    setTimeout(() => {
      this.setState({
        translationRequired: event.target.checked,
      })
    }, 0)
  }

  render() {
    const { form, english, lecture } = this.props
    const { topics, events, locations } = lecture
    const {
      date,
      editinglecture,
      editedBody,
      editorState,
      language,
      files,
      editorStateSummary,
      editorStateTranscription,
      audioLink,
      transcriptionFiles,
      summaryFiles,
      translationRequired,
    } = this.state
    const dateFormat = 'YYYY/MM/DD'
    return (
      <React.Fragment>
        {editinglecture && editinglecture.en && editinglecture.ru ? (
          <div>
            <div>
              <strong>Title :</strong>
              &nbsp;&nbsp;
              <span>{language ? editinglecture.en.title : editinglecture.ru.title}</span>
            </div>
          </div>
        ) : null}
        <Tabs defaultActiveKey="1">
          <TabPane tab="Lecture" key="1">
            <div>
              <Helmet title="Add Blog Post" />
              <section className="card">
                <div className="card-header mb-2">
                  <div className="utils__title">
                    <strong>Lecture Add/Edit</strong>
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
                            initialValue:
                              editinglecture && editinglecture.en && editinglecture.ru
                                ? language
                                  ? editinglecture.en.title
                                  : editinglecture.ru.title
                                : '',
                          })(<Input placeholder="Post title" />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Author">
                          {form.getFieldDecorator('author', {
                            initialValue: editinglecture ? editinglecture.author : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Author"
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              <Option value="english">Niranjana Swami</Option>
                              <Option value="russian">Other</Option>
                            </Select>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Language">
                          {form.getFieldDecorator('language', {
                            initialValue: editinglecture ? editinglecture.language : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select a color"
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
                        <FormItem label="Date">
                          {form.getFieldDecorator('date', {
                            initialValue: editinglecture
                              ? moment(editinglecture.created_date, dateFormat)
                              : '',
                          })(<DatePicker onChange={this.onChange} />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem>
                          {form.getFieldDecorator('translation', {
                            initialValue: translationRequired,
                          })(
                            <Checkbox checked={translationRequired} onChange={this.handleCheckbox}>
                              Need Translation ?
                            </Checkbox>,
                          )}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Location' : 'Location'}>
                          {form.getFieldDecorator('location', {
                            initialValue:
                              editinglecture && editinglecture.en && editinglecture.ru
                                ? language
                                  ? editinglecture.en.location
                                  : editinglecture.ru.location
                                : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Location"
                              optionFilterProp="children"
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
                        <FormItem label={language ? 'Event' : 'Event'}>
                          {form.getFieldDecorator('event', {
                            initialValue:
                              editinglecture && editinglecture.en && editinglecture.ru
                                ? language
                                  ? editinglecture.en.event
                                  : editinglecture.ru.event
                                : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Event"
                              optionFilterProp="children"
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
                        <FormItem label={language ? 'Topic' : 'Topic'}>
                          {form.getFieldDecorator('topic', {
                            initialValue:
                              editinglecture && editinglecture.en && editinglecture.ru
                                ? language
                                  ? editinglecture.en.topic
                                  : editinglecture.ru.topic
                                : '',
                          })(
                            <Select
                              id="product-edit-colors"
                              showSearch
                              style={{ width: '100%' }}
                              placeholder="Select Topic"
                              optionFilterProp="children"
                              filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                0
                              }
                            >
                              {topics && topics.length > 0
                                ? topics.map(item => {
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
                        <FormItem label="Part">
                          {form.getFieldDecorator('parts', {
                            initialValue: editinglecture ? editinglecture.parts : '',
                          })(<Input type="Number" placeholder="parts/songs" />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Chapter">
                          {form.getFieldDecorator('chapter', {
                            initialValue: editinglecture ? editinglecture.chapter : '',
                          })(<Input type="Number" placeholder="Chapter" />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label="Verse">
                          {form.getFieldDecorator('verse', {
                            initialValue: editinglecture ? editinglecture.verse : '',
                          })(<Input type="Number" placeholder="Verse/Text" />)}
                        </FormItem>
                      </div>
                      <div className="form-group">
                        <FormItem label={language ? 'Body' : 'Body'}>
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
                              onChange={this.handleFileChange}
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
                    </Form>
                  </div>
                </div>
              </section>
            </div>
          </TabPane>
          <TabPane tab="Summary" key="2">
            <section className="card">
              <div className="card-body">
                <Form className="mt-3">
                  <div className="form-group">
                    <FormItem label={language ? 'Summary' : 'Summary'}>
                      {form.getFieldDecorator('summary', {
                        initialValue: editorStateSummary,
                      })(
                        <div className={styles.editor} style={{ backgroundColor: '#fff' }}>
                          <Editor
                            editorState={editorStateSummary}
                            onEditorStateChange={this.onEditorChangeStateSummary}
                          />
                        </div>,
                      )}
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label="Attachment">
                      <ul>
                        {summaryFiles && summaryFiles.length > 0
                          ? summaryFiles.map(item => {
                              if (item !== '') {
                                return (
                                  <li className="filesList">
                                    {item} &nbsp;&nbsp;
                                    <i
                                      className="fa fa-close closeIcon"
                                      onClick={() => {
                                        this.deleteFile(item, 'summary')
                                      }}
                                    />
                                  </li>
                                )
                              }
                            })
                          : null}
                      </ul>
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem>
                      {form.getFieldDecorator('Files1')(
                        <Dragger
                          beforeUpload={this.beforeUpload}
                          showUploadList={false}
                          customRequest={this.dummyRequest}
                          onChange={this.handleSummaryFileChange}
                        >
                          <p className="ant-upload-drag-icon">
                            <Icon type="inbox" />
                          </p>
                          <p className="ant-upload-text">
                            Click or drag file to this area to upload
                          </p>
                          <p className="ant-upload-hint">
                            Support for a single or bulk upload. Strictly prohibit from uploading
                            company data or other band files
                          </p>
                        </Dragger>,
                      )}
                    </FormItem>
                  </div>
                </Form>
              </div>
            </section>
          </TabPane>
          <TabPane tab="Transcription" key="3">
            <section className="card">
              <div className="card-body">
                {' '}
                <div className="form-group">
                  <FormItem label={language ? 'Transcription' : 'Transcription'}>
                    {form.getFieldDecorator('transcription', {
                      initialValue: editorStateTranscription,
                    })(
                      <div className={styles.editor} style={{ backgroundColor: '#fff' }}>
                        <Editor
                          editorState={editorStateTranscription}
                          onEditorStateChange={this.onEditorChangeStateTranscription}
                        />
                      </div>,
                    )}
                  </FormItem>
                </div>
                <div className="form-group">
                  <FormItem label="Attachment">
                    <ul>
                      {transcriptionFiles && transcriptionFiles.length > 0
                        ? transcriptionFiles.map(item => {
                            if (item !== '') {
                              return (
                                <li className="filesList">
                                  {item} &nbsp;&nbsp;
                                  <i
                                    className="fa fa-close closeIcon"
                                    onClick={() => {
                                      this.deleteFile(item, 'transcription')
                                    }}
                                  />
                                </li>
                              )
                            }
                          })
                        : null}
                    </ul>
                  </FormItem>
                </div>
                <div className="form-group">
                  <FormItem>
                    {form.getFieldDecorator('Files2')(
                      <Dragger
                        beforeUpload={this.beforeUpload}
                        showUploadList={false}
                        customRequest={this.dummyRequest}
                        onChange={this.handleTranscriptionFileChange}
                      >
                        <p className="ant-upload-drag-icon">
                          <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">
                          Support for a single or bulk upload. Strictly prohibit from uploading
                          company data or other band files
                        </p>
                      </Dragger>,
                    )}
                  </FormItem>
                </div>
              </div>
            </section>
          </TabPane>
        </Tabs>
        <div className={styles.submit}>
          <span className="mr-3">
            <Button type="primary" onClick={this.handleFormBody}>
              Save and Post
            </Button>
          </span>
          <Button type="danger" onClick={this.handleReset}>
            Discard
          </Button>
        </div>
      </React.Fragment>
    )
  }
}

export default AddLecture

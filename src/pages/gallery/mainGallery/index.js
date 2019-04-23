/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { Form, Input, Button, Table, Switch } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import styles from './style.module.scss'

const FormItem = Form.Item

@Form.create()
@connect(({ galleryList }) => ({ galleryList }))
class MainGallery extends React.Component {
  state = {
    language: true,
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'galleryListing/GET_MAIN_GALLERY_LIST',
    })
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = nextProps
    if (nextProps.galleryList.isCreated) {
      this.handleReset()
      dispatch({
        type: 'galleryListing/GET_MAIN_GALLERY_LIST',
      })
    }
    if (nextProps.galleryList.isDeleted) {
      dispatch({
        type: 'galleryListing/GET_MAIN_GALLERY_LIST',
      })
    }
  }

  handleDeleteMainGallery = uuid => {
    const { dispatch } = this.props
    dispatch({
      type: 'galleryListing/REMOVE_MAIN_GALLERY',
      uuid,
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

  handleFormBody = event => {
    event.preventDefault()
    const { form, dispatch } = this.props
    const { language } = this.state
    const name = form.getFieldValue('title')
    form.validateFields(['title'], (err, values) => {
      console.info(values)
      if (!err) {
        const body = {
          uuid: this.uuidv4(),
          date: new Date().toLocaleDateString(),
          name_en: language ? name : '',
          name_ru: language ? '' : name,
        }
        dispatch({
          type: 'galleryListing/CREATE_MAIN_GALLERY',
          body,
        })
      }
    })
  }

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
  }

  sortNumber = (a, b) => {
    return a - b
  }

  render() {
    const { form, galleryList } = this.props
    const { mainGallery, totalmainGallery } = galleryList
    const { language } = this.state
    const mainGallery1 = mainGallery.sort(this.sortNumber)
    console.log('mainGallery1======>>>>', mainGallery1)

    const columns = [
      {
        title: 'Title',
        dataIndex: language ? 'name_en' : 'name_ru',
        key: language ? 'name_en' : 'name_ru',
        render: title => <span>{title}</span>,
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <span>
            <i
              className="fa fa-trash mr-2"
              onClick={() => {
                this.handleDeleteMainGallery(record.uuid)
              }}
            />
          </span>
        ),
      },
    ]

    return (
      <div>
        <Helmet title="Main Gallery" />
        <section className="card">
          <div className="card-header mb-2">
            <div className="utils__title">
              <strong>Create Main Gallery</strong>
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
                  <FormItem label="Title">
                    {form.getFieldDecorator('title', {
                      rules: [
                        {
                          required: true,
                          message: 'Title is required',
                        },
                      ],
                    })(<Input placeholder="Enter Title" />)}
                  </FormItem>
                </div>
              </Form>
            </div>
            <div className={styles.submit}>
              <span className="mr-3">
                <Button type="primary" onClick={this.handleFormBody}>
                  Add
                </Button>
              </span>
              <Button type="danger" onClick={this.handleReset}>
                Discard
              </Button>
            </div>
          </div>
        </section>
        <div className="card">
          <div className="card-header">
            <div className="utils__title">
              <strong>Main Gallery List</strong>
            </div>
            <div className="card-body">
              <Table
                className="utils__scrollTable"
                scroll={{ x: '100%' }}
                columns={columns}
                dataSource={mainGallery1}
                pagination={{
                  pageSize: 5,
                  total: totalmainGallery,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MainGallery
